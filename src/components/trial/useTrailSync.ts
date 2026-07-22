import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Lightweight teacher→student sync for the self-contained Trail lessons
 * (Playground / Academy / Success). Uses a Supabase Realtime broadcast
 * channel keyed by bookingId so both sides render the same stage without
 * needing a dedicated DB table.
 *
 * - Teacher: call `broadcast(state)` whenever local state changes.
 * - Student: incoming payloads are applied via the `onRemote` callback.
 * - When `roomId` / `role` are undefined (e.g. Creator preview) the hook
 *   is a no-op so the component behaves like the original standalone one.
 */
export function useTrailSync<T extends Record<string, any>>(opts: {
  roomId?: string;
  role?: "teacher" | "student";
  hub: "academy" | "success" | "playground";
  state: T;
  onRemote?: (state: T) => void;
}) {
  const { roomId, role, hub, state, onRemote } = opts;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef<string>("");
  const onRemoteRef = useRef(onRemote);
  onRemoteRef.current = onRemote;

  // Subscribe once per room.
  useEffect(() => {
    if (!roomId || !role) return;
    const channel = supabase.channel(`trail_sync_${hub}_${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "state" }, (msg) => {
      const incoming = (msg.payload ?? {}) as T & { __from?: string };
      if (role === "student" && onRemoteRef.current) {
        onRemoteRef.current(incoming);
      }
    });

    // Student → ask teacher to resend current state on join.
    channel.on("broadcast", { event: "request_state" }, () => {
      if (role === "teacher" && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "state",
          payload: state,
        });
      }
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED" && role === "student") {
        channel.send({ type: "broadcast", event: "request_state", payload: {} });
      }
    });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, role, hub]);

  // Teacher broadcasts on state change.
  useEffect(() => {
    if (!roomId || role !== "teacher" || !channelRef.current) return;
    const serialized = JSON.stringify(state);
    if (serialized === lastSentRef.current) return;
    lastSentRef.current = serialized;
    channelRef.current.send({
      type: "broadcast",
      event: "state",
      payload: state,
    });
  }, [roomId, role, state]);

  return { isFollower: role === "student" && !!roomId };
}
