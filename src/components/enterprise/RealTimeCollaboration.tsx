import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share, 
  MessageSquare, 
  Users,
  Settings,
  PhoneOff,
  ScreenShare,
  Hand
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'observer';
  avatar?: string;
  isOnline: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  isPresenting: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

export const RealTimeCollaboration = ({ roomId }: { roomId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Video call state
  const [isConnected, setIsConnected] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId) {
      initializeCollaboration();
    }
    
    return () => {
      cleanup();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeCollaboration = async () => {
    try {
      // Initialize WebRTC connection
      await initializeMedia();
      
      // Set up real-time subscriptions
      setupRealtimeSubscriptions();
      
      // Join the room
      await joinRoom();
      
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Successfully joined the collaboration session"
      });
    } catch (error) {
      console.error('Error initializing collaboration:', error);
      toast({
        title: "Connection Error",
        description: "Failed to join the collaboration session",
        variant: "destructive"
      });
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // In a real implementation, you would set up WebRTC connections here
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Access Error",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to chat messages
    const chatChannel = supabase
      .channel(`chat_${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    // Subscribe to presence for participant tracking
    const presenceChannel = supabase
      .channel(`presence_${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const participantData = Object.values(presenceState)
          .flat()
          .filter((p: any) => p && typeof p === 'object' && p.id)
          .map((p: any) => ({
            id: p.id,
            name: p.name || 'Unknown',
            role: p.role || 'student',
            avatar: p.avatar,
            isOnline: p.isOnline || true,
            hasAudio: p.hasAudio || false,
            hasVideo: p.hasVideo || false,
            isPresenting: p.isPresenting || false
          })) as Participant[];
        setParticipants(participantData);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(presenceChannel);
    };
  };

  const joinRoom = async () => {
    if (!user) return;

    // Track presence
    const presence = supabase.channel(`presence_${roomId}`);
    await presence.track({
      id: user.id,
      name: user.user_metadata?.full_name || user.email || 'User',
      role: user.role,
      isOnline: true,
      hasAudio,
      hasVideo,
      isPresenting: false
    });

    // Load existing messages
    const { data: existingMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (existingMessages) {
      setMessages(existingMessages);
    }

    // Send join system message
    await sendSystemMessage(`${user.user_metadata?.full_name || user.email || 'User'} joined the session`);
  };

  const toggleAudio = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setHasAudio(audioTrack.enabled);
        
        // Update presence
        await updatePresence({ hasAudio: audioTrack.enabled });
      }
    }
  };

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasVideo(videoTrack.enabled);
        
        // Update presence
        await updatePresence({ hasVideo: videoTrack.enabled });
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setIsPresenting(true);
      await updatePresence({ isPresenting: true });
      
      // In a real implementation, you would replace the video track in WebRTC connections
      
      toast({
        title: "Screen Sharing",
        description: "You are now sharing your screen"
      });
      
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing",
        variant: "destructive"
      });
    }
  };

  const stopScreenShare = async () => {
    setIsPresenting(false);
    await updatePresence({ isPresenting: false });
    
    // Return to camera
    await initializeMedia();
    
    toast({
      title: "Screen Sharing Stopped",
      description: "Returned to camera view"
    });
  };

  const updatePresence = async (updates: Partial<Participant>) => {
    if (!user) return;
    
    const presence = supabase.channel(`presence_${roomId}`);
    await presence.track({
      id: user.id,
      name: user.user_metadata?.full_name || user.email || 'User',
      role: user.role,
      isOnline: true,
      hasAudio,
      hasVideo,
      isPresenting,
      ...updates
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await supabase
        .from('chat_messages')
        .insert([{
          room_id: roomId,
          sender_id: user.id,
          sender_name: user.user_metadata?.full_name || user.email || 'User',
          sender_role: user.role,
          content: newMessage,
          message_type: 'text'
        }]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const sendSystemMessage = async (content: string) => {
    try {
      await supabase
        .from('chat_messages')
        .insert([{
          room_id: roomId,
          sender_id: 'system',
          sender_name: 'System',
          sender_role: 'system',
          content,
          message_type: 'system'
        }]);
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  const leaveSession = async () => {
    await sendSystemMessage(`${user?.user_metadata?.full_name || user?.email || 'User'} left the session`);
    cleanup();
    setIsConnected(false);
    
    toast({
      title: "Session Ended",
      description: "You have left the collaboration session"
    });
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  if (!isConnected && roomId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Video className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Joining Session...</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connecting to the collaboration room
          </p>
          <Button onClick={initializeCollaboration}>
            Join Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {/* Video Area */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Live Session
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
                <Badge variant="outline">
                  {participants.length} participants
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Main video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  You {!hasVideo && '(Camera Off)'}
                </div>
              </div>

              {/* Remote participants */}
              {participants.filter(p => p.id !== user?.id).slice(0, 3).map((participant) => (
                <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {participant.name}
                    {participant.isPresenting && ' (Presenting)'}
                    {!participant.hasVideo && ' (Camera Off)'}
                  </div>
                  {!participant.hasAudio && (
                    <div className="absolute top-4 right-4">
                      <MicOff className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant={hasAudio ? "default" : "destructive"}
                size="sm"
                onClick={toggleAudio}
              >
                {hasAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={hasVideo ? "default" : "destructive"}
                size="sm"
                onClick={toggleVideo}
              >
                {hasVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={isPresenting ? "secondary" : "outline"}
                size="sm"
                onClick={isPresenting ? stopScreenShare : startScreenShare}
              >
                <ScreenShare className="h-4 w-4" />
              </Button>
              
              <Button variant="destructive" size="sm" onClick={leaveSession}>
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat and Participants */}
      <div className="space-y-4">
        <Tabs defaultValue="chat" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4 h-full">
            <Card className="h-[500px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`p-2 rounded ${
                      message.type === 'system' 
                        ? 'bg-muted text-center text-sm text-muted-foreground'
                        : message.senderId === user?.id
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}>
                      {message.type !== 'system' && (
                        <div className="font-medium text-xs mb-1">{message.senderName}</div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{participant.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {participant.role}
                          {participant.isPresenting && ' • Presenting'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!participant.hasAudio && <MicOff className="h-3 w-3 text-red-500" />}
                        {!participant.hasVideo && <VideoOff className="h-3 w-3 text-red-500" />}
                        {participant.isPresenting && <Share className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};