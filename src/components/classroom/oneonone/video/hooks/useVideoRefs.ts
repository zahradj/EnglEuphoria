
import { useRef, useEffect } from "react";
import { VideoRefs } from "../types";

export function useVideoRefs(media: any, isTeacher: boolean) {
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const studentVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Clear streams if no media stream or not connected
    if (!media.stream || !media.isConnected) {
      if (teacherVideoRef.current) {
        teacherVideoRef.current.srcObject = null;
      }
      if (studentVideoRef.current) {
        studentVideoRef.current.srcObject = null;
      }
      return;
    }

    // Assign stream to the current user's video element
    const currentUserVideoRef = isTeacher ? teacherVideoRef : studentVideoRef;
    const currentUserLabel = isTeacher ? "teacher" : "student";

    if (currentUserVideoRef.current && media.stream.active) {
      // Only assign if not already assigned
      if (currentUserVideoRef.current.srcObject !== media.stream) {
        currentUserVideoRef.current.srcObject = media.stream;
        
        // Ensure video plays
        currentUserVideoRef.current.play().catch(error => {
          console.warn(`🎥 Failed to auto-play ${currentUserLabel} video:`, error);
        });
      }
    }

    // Cleanup function
    return () => {
      if (teacherVideoRef.current) {
        teacherVideoRef.current.srcObject = null;
      }
      if (studentVideoRef.current) {
        studentVideoRef.current.srcObject = null;
      }
    };
  }, [media.stream, media.isConnected, media.isCameraOff, isTeacher]);

  return { teacherVideoRef, studentVideoRef } as VideoRefs;
}
