import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Send, Video, Mic, MicOff, VideoOff, BookOpen, PictureInPicture2, Pin, X } from 'lucide-react';
import { getClassroomHubTheme, type ClassroomHubKey } from '@/components/teacher/classroom/hubClassroomTheme';
import { DictionaryPopover } from '@/components/classroom/DictionaryPopover';
import { whiteboardService, type ChatBroadcastPayload } from '@/services/whiteboardService';

interface StudentCommunicationSidebarProps {
  studentName: string;
  teacherName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isRemoteConnected?: boolean;
  hubType?: ClassroomHubKey;
  /** Realtime room/user — required for live chat sync with the teacher. */
  roomId?: string;
  userId?: string;
  /** When true, the video tiles are floating over the lesson content instead of docked here. */
  videosFloating?: boolean;
  onToggleVideosFloating?: () => void;
  /** Below the md breakpoint this panel renders as an off-canvas drawer instead of a docked column — open state and close handle are controlled by the caller. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'teacher' | 'system';
  senderName?: string;
  text: string;
}

export const StudentCommunicationSidebar: React.FC<StudentCommunicationSidebarProps> = ({
  studentName,
  teacherName,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  localStream,
  remoteStream,
  isRemoteConnected = false,
  hubType = 'academy',
  roomId,
  userId,
  videosFloating = false,
  onToggleVideosFloating,
  mobileOpen = false,
  onMobileClose,
}) => {
  const theme = getClassroomHubTheme(hubType);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'sys-start', sender: 'system', text: 'Class session started' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teacherVideoRef.current && remoteStream) {
      teacherVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (studentVideoRef.current && localStream) {
      studentVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Subscribe to live chat broadcast from the teacher and other listeners.
  useEffect(() => {
    if (!roomId) return;
    const unsub = whiteboardService.subscribeToChatMessages(roomId, (payload: ChatBroadcastPayload) => {
      // Ignore echoes of our own messages (already added optimistically).
      if (payload.senderId === userId) return;
      setChatMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          sender: payload.senderRole,
          senderName: payload.senderName,
          text: payload.text,
        },
      ]);
    });
    return () => { unsub(); };
  }, [roomId, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;
    const id = `${userId ?? 'student'}-${Date.now()}`;
    setChatMessages((prev) => [...prev, { id, sender: 'student', senderName: studentName, text }]);
    setNewMessage('');
    if (roomId && userId) {
      void whiteboardService.sendChatMessage(roomId, {
        id,
        senderId: userId,
        senderName: studentName,
        senderRole: 'student',
        text,
      }).catch((err) => console.warn('[chat] broadcast failed:', err));
    }
  };

  return (
    <>
      {/* Backdrop — mobile only, dismisses the drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[74] bg-black/40 md:hidden" onClick={onMobileClose} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-[75] w-[280px] transition-transform duration-200 md:transition-none md:static md:z-auto md:w-[224px] md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme.panelBg} border-r ${theme.panelBorder} flex flex-col shrink-0`}
      >
      {/* Section header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${theme.panelBorder}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.accentText}`}>Live</span>
        <div className="flex items-center gap-1">
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close"
            className="p-1 rounded-md hover:bg-black/5 text-gray-500 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {onToggleVideosFloating && (
          <button
            type="button"
            onClick={onToggleVideosFloating}
            title={videosFloating ? 'Dock videos back to sidebar' : 'Float videos over the lesson'}
            className={`p-1 rounded-md hover:bg-black/5 ${theme.accentText}`}
          >
            {videosFloating ? <Pin className="w-3.5 h-3.5" /> : <PictureInPicture2 className="w-3.5 h-3.5" />}
          </button>
        )}
        </div>
      </div>

      {/* Video Containers — enhanced hub-tinted frames (matches teacher) */}
      <div className="p-3 space-y-3">
        {videosFloating && (
          <button
            type="button"
            onClick={onToggleVideosFloating}
            className="w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-6 text-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <PictureInPicture2 className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-tight px-2">Videos are floating over the lesson<br />Click to dock</span>
          </button>
        )}

        {/* Teacher Video Container */}
        <div
          className={`group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_8px_28px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-all hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] ${videosFloating ? 'hidden' : ''}`}
          style={{ background: theme.hexGradient }}
        >
          <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-gray-900">
            {remoteStream ? (
              <video
                ref={teacherVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-2">
                  <div className={`w-20 h-20 rounded-full ${theme.accentSoftBg} flex items-center justify-center mx-auto shadow-inner`}>
                    <span className="text-3xl">👩‍🏫</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Waiting for teacher…</p>
                </div>
              </div>
            )}

            {/* Bottom gradient scrim */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />

            {/* Name pill */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-semibold text-gray-800 shadow-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${isRemoteConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {teacherName}
            </div>

            {/* Connection pill */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
              <span className={`h-1.5 w-1.5 rounded-full ${isRemoteConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[9px] font-medium text-white uppercase tracking-wider">
                {isRemoteConnected ? 'Live' : 'Off'}
              </span>
            </div>
          </div>
        </div>

        {/* Student Video Container (self) */}
        <div
          className={`group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_8px_28px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-all hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] ${videosFloating ? 'hidden' : ''}`}
          style={{ background: theme.hexGradient }}
        >
          <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-gray-900">
            {localStream && !isCameraOff ? (
              <video
                ref={studentVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className={`w-16 h-16 rounded-full ${theme.accentSoftBg} flex items-center justify-center shadow-inner`}>
                  <User className={`w-8 h-8 ${theme.accentText}`} />
                </div>
              </div>
            )}

            {/* Bottom gradient scrim */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />

            {/* "You" pill */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-semibold text-gray-800 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {studentName} (You)
            </div>

            {/* Self controls */}
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className={`h-7 w-7 rounded-full shadow-md backdrop-blur-sm ${isMuted ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
              >
                {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCamera}
                title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                className={`h-7 w-7 rounded-full shadow-md backdrop-blur-sm ${isCameraOff ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
              >
                {isCameraOff ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Box */}
      <div className={`flex-1 flex flex-col border-t ${theme.panelBorder}`}>
        <div className={`px-3 py-2 border-b ${theme.panelBorder}`}>
          <span className="text-xs font-medium text-gray-500 uppercase">Chat</span>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          <div ref={scrollRef} className="space-y-2 max-h-full">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs rounded px-2 py-1 ${
                  msg.sender === 'student'
                    ? `${theme.accentSoftBg} ${theme.accentText} ml-4`
                    : msg.sender === 'teacher'
                    ? 'bg-primary/10 text-gray-800 mr-4'
                    : 'bg-gray-100 text-gray-500 text-center italic'
                }`}
              >
                {msg.sender !== 'system' && (
                  <span className="font-medium block text-[10px] text-gray-500">
                    {msg.sender === 'student' ? 'You' : msg.senderName || teacherName}
                  </span>
                )}
                {msg.text}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className={`p-2 border-t ${theme.panelBorder}`}>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="text-xs bg-gray-50 border-gray-200 h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button size="icon" className={`h-8 w-8 shrink-0 ${theme.buttonPrimary}`} onClick={handleSendMessage}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dictionary — standalone section (matches teacher) */}
      <div className={`border-t ${theme.panelBorder} px-3 py-2 flex items-center justify-between bg-gray-50/60 shrink-0`}>
        <div className="flex items-center gap-1.5">
          <BookOpen className={`h-3.5 w-3.5 ${theme.accentText}`} />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dictionary</span>
        </div>
        <DictionaryPopover
          side="top"
          align="end"
          buttonClass={`${theme.accentSoftBg} ${theme.accentText} hover:opacity-80`}
        />
      </div>
      </div>
    </>
  );
};
