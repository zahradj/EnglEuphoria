import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  roomId?: string;
  userId?: string;
  targetUserId?: string;
  data?: any;
}

// Store active connections per room
const rooms = new Map<string, Map<string, WebSocket>>();

function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  room.forEach((ws, userId) => {
    if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

async function verifyToken(token: string): Promise<string | null> {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const upgrade = req.headers.get('upgrade') || '';
    if (upgrade.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    // Authenticate via Bearer token in Authorization header OR ?token= query param
    // (browsers cannot set headers on WebSocket upgrades, so a query token is acceptable).
    const url = new URL(req.url);
    const authHeader = req.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
    const queryToken = url.searchParams.get('token');
    const token = headerToken || queryToken;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const verifiedUserId = await verifyToken(token);
    if (!verifiedUserId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    // Bind to the verified JWT subject — never trust message.userId from the client.
    let currentUserId: string | null = verifiedUserId;
    let currentRoomId: string | null = null;

    socket.onopen = () => {
      console.log(`🔗 WebSocket connection opened for ${verifiedUserId}`);
    };

    socket.onmessage = (event) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);

        // Reject any message whose userId field doesn't match the verified JWT subject.
        if (message.userId && message.userId !== verifiedUserId) {
          socket.send(JSON.stringify({ type: 'error', error: 'userId mismatch with auth token' }));
          return;
        }
        // Always overwrite userId with the verified one so impersonation is impossible.
        message.userId = verifiedUserId;

        switch (message.type) {
          case 'join': {
            const { roomId, userId } = message;
            if (!roomId || !userId) break;

            currentUserId = userId;
            currentRoomId = roomId;

            // Create room if it doesn't exist
            if (!rooms.has(roomId)) {
              rooms.set(roomId, new Map());
            }

            const room = rooms.get(roomId)!;

            // Get existing participants before adding new user
            const existingParticipants = Array.from(room.keys());

            // Add user to room
            room.set(userId, socket);

            console.log(`✅ User ${userId} joined room ${roomId}. Total participants: ${room.size}`);

            // Send confirmation to the joining user
            socket.send(JSON.stringify({
              type: 'joined',
              roomId,
              userId,
              participantCount: room.size
            }));

            // Send existing participants list to the new user
            if (existingParticipants.length > 0) {
              socket.send(JSON.stringify({
                type: 'existing-participants',
                participants: existingParticipants
              }));
            }

            // Notify other participants about the new user
            broadcastToRoom(roomId, {
              type: 'user-joined',
              userId,
              participantCount: room.size
            }, userId);

            break;
          }

          case 'offer':
          case 'answer':
          case 'ice-candidate': {
            const { roomId, userId, targetUserId, data } = message;
            if (!roomId || !userId || !targetUserId) break;

            const room = rooms.get(roomId);
            if (!room) break;

            const targetSocket = room.get(targetUserId);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                type: message.type,
                fromUserId: userId,
                data
              }));
            }
            break;
          }

          case 'leave': {
            const { roomId, userId } = message;
            if (!roomId || !userId) break;

            const room = rooms.get(roomId);
            if (room) {
              room.delete(userId);

              // Notify other participants
              broadcastToRoom(roomId, {
                type: 'user-left',
                userId
              });

              // Clean up empty rooms
              if (room.size === 0) {
                rooms.delete(roomId);
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    };

    socket.onclose = () => {
      // Clean up user from room
      if (currentRoomId && currentUserId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.delete(currentUserId);

          broadcastToRoom(currentRoomId, {
            type: 'user-left',
            userId: currentUserId
          });

          if (room.size === 0) {
            rooms.delete(currentRoomId);
          }
        }
      }
    };

    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    return response;
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
