import { useRef, useEffect } from 'react';
import { VideoPlayer } from './components/VideoPlayer';

interface DualVideoLayoutProps {
  teacherStream: MediaStream | null;
  studentStream: MediaStream | null;
  teacherName: string;
  studentName: string;
  teacherControls: {
    isMuted: boolean;
    isCameraOff: boolean;
  };
  studentControls: {
    isMuted: boolean;
    isCameraOff: boolean;
  };
  isTeacher: boolean;
}

export function DualVideoLayout({
  teacherStream,
  studentStream,
  teacherName,
  studentName,
  teacherControls,
  studentControls,
  isTeacher
}: DualVideoLayoutProps) {
  // Main video is the other person, PIP is yourself
  const mainStream = isTeacher ? studentStream : teacherStream;
  const mainLabel = isTeacher ? studentName : teacherName;
  const mainControls = isTeacher ? studentControls : teacherControls;
  const mainIsTeacher = !isTeacher;

  const pipStream = isTeacher ? teacherStream : studentStream;
  const pipLabel = isTeacher ? teacherName : studentName;
  const pipControls = isTeacher ? teacherControls : studentControls;
  const pipIsTeacher = isTeacher;

  return (
    <div className="relative h-full w-full bg-slate-900 rounded-xl overflow-hidden">
      {/* Main video (other person - larger) */}
      <div className="absolute inset-0">
        <VideoPlayer
          stream={mainStream}
          hasVideo={!!mainStream && !mainControls.isCameraOff}
          isTeacher={mainIsTeacher}
          userLabel={mainLabel}
          isCameraOff={mainControls.isCameraOff}
        />
      </div>

      {/* Picture-in-picture (yourself - smaller, bottom-right) */}
      <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-2xl z-10">
        <VideoPlayer
          stream={pipStream}
          hasVideo={!!pipStream && !pipControls.isCameraOff}
          isTeacher={pipIsTeacher}
          userLabel={pipLabel}
          isCameraOff={pipControls.isCameraOff}
        />
      </div>
    </div>
  );
}
