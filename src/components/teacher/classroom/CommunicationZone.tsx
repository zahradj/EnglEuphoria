import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Send, Mic, MicOff, Video, VideoOff, BookOpen } from 'lucide-react';
import { getClassroomHubTheme, type ClassroomHubKey } from './hubClassroomTheme';
import { DictionaryPopover } from '@/components/classroom/DictionaryPopover';
import { whiteboardService, type ChatBroadcastPayload } from '@/services/whiteboardService';


interface CommunicationZoneProps {
  studentName: string;
  teacherName: string;
  onGiveStar: () => void;
  onOpenTimer: () => void;
  onRollDice: () => void;
  /** Send a sticker reaction emoji to the student. */
  onSendSticker: (emoji: string) => void;
  studentCanDraw?: boolean;
  onToggleStudentDrawing?: () => void;
  onShareScreen?: () => void;
  onEmbedLink?: () => void;
  isScreenSharing?: boolean;
  onStopScreenShare?: () => void;
  screenShareStream?: MediaStream | null;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isVideoConnected?: boolean;
  isLocalCameraOff?: boolean;
  isLocalMicMuted?: boolean;
  onToggleLocalMic?: () => void;
  onToggleLocalCamera?: () => void;
  isRemoteConnected?: boolean;
  studentMicMuted?: boolean;
  studentCameraOff?: boolean;
  onToggleStudentMic?: () => void;
  onToggleStudentCamera?: () => void;
  hubType?: ClassroomHubKey;
  /** Realtime room/user — required for live chat sync with the student. */
  roomId?: string;
  userId?: string;
}

export const CommunicationZone: React.FC<CommunicationZoneProps> = ({
  studentName,
  teacherName,
  onGiveStar,
  onOpenTimer,
  onRollDice,
  onSendSticker,
  studentCanDraw = false,
  onToggleStudentDrawing,
  onShareScreen,
  onEmbedLink,
  isScreenSharing = false,
  onStopScreenShare,
  screenShareStream,
  localStream,
  remoteStream,
  isVideoConnected = false,
  isLocalCameraOff = false,
  isLocalMicMuted = false,
  onToggleLocalMic,
  onToggleLocalCamera,
  isRemoteConnected = false,
  studentMicMuted = false,
  studentCameraOff = false,
  onToggleStudentMic,
  onToggleStudentCamera,
  hubType = 'academy',
  roomId,
  userId,
}) => {
  const theme = getClassroomHubTheme(hubType);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'teacher' | 'student' | 'system'; senderName?: string; text: string }>>([
    { id: 'sys-start', sender: 'system', text: 'Class session started' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (screenShareVideoRef.current && screenShareStream) {
      screenShareVideoRef.current.srcObject = screenShareStream;
    }
  }, [screenShareStream]);

  useEffect(() => {
    if (teacherVideoRef.current && localStream) {
      teacherVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (studentVideoRef.current && remoteStream) {
      studentVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Subscribe to incoming chat from the student.
  useEffect(() => {
    if (!roomId) return;
    const unsub = whiteboardService.subscribeToChatMessages(roomId, (payload: ChatBroadcastPayload) => {
      if (payload.senderId === userId) return; // ignore our own echoes
      setChatMessages((prev) => [...prev, {
        id: payload.id,
        sender: payload.senderRole,
        senderName: payload.senderName,
        text: payload.text,
      }]);
    });
    return () => { unsub(); };
  }, [roomId, userId]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;
    const id = `${userId ?? 'teacher'}-${Date.now()}`;
    setChatMessages((prev) => [...prev, { id, sender: 'teacher', senderName: teacherName, text }]);
    setNewMessage('');
    if (roomId && userId) {
      void whiteboardService.sendChatMessage(roomId, {
        id,
        senderId: userId,
        senderName: teacherName,
        senderRole: 'teacher',
        text,
      }).catch((err) => console.warn('[chat] broadcast failed:', err));
    }
  };

  return (
    <div className={`w-[224px] ${theme.panelBg} border-r ${theme.panelBorder} flex flex-col shrink-0`}>
      <div className={`flex items-center px-3 py-2 border-b ${theme.panelBorder}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.accentText}`}>Live</span>
      </div>
      {/* Video Containers */}
      <div className="p-3 space-y-3">
        {/* Screen Share Preview (if active) */}
        {isScreenSharing && screenShareStream && (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-indigo-400/50">
            <video
              ref={screenShareVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 left-2 bg-indigo-600/80 px-2 py-1 rounded text-xs text-white">
              Screen Share
            </div>
          </div>
        )}

        {/* Student Video Container — enhanced hub-tinted frame */}
        <div
          className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_8px_28px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-all hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]"
          style={{ background: theme.hexGradient }}
        >
          <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-gray-900">
            {remoteStream ? (
              <video
                ref={studentVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-2">
                  <div className={`w-20 h-20 rounded-full ${theme.accentSoftBg} flex items-center justify-center mx-auto shadow-inner`}>
                    <User className={`w-10 h-10 ${theme.accentText}`} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Waiting for student…</p>
                </div>
              </div>
            )}

            {/* Bottom gradient scrim for label legibility */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />

            {/* Name pill */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-semibold text-gray-800 shadow-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${isRemoteConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {studentName}
            </div>

            {/* Connection dot */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
              <span className={`h-1.5 w-1.5 rounded-full ${isRemoteConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[9px] font-medium text-white uppercase tracking-wider">
                {isRemoteConnected ? 'Live' : 'Off'}
              </span>
            </div>

            {/* Teacher remote-control over student mic & camera */}
            {(onToggleStudentMic || onToggleStudentCamera) && (
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {onToggleStudentMic && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleStudentMic}
                    title={studentMicMuted ? 'Unmute student' : 'Mute student'}
                    className={`h-7 w-7 rounded-full shadow-md backdrop-blur-sm ${studentMicMuted ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                  >
                    {studentMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </Button>
                )}
                {onToggleStudentCamera && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleStudentCamera}
                    title={studentCameraOff ? 'Turn on student camera' : 'Turn off student camera'}
                    className={`h-7 w-7 rounded-full shadow-md backdrop-blur-sm ${studentCameraOff ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                  >
                    {studentCameraOff ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Teacher Video Container — same dimensions as student tile */}
        <div
          className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_8px_28px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-all hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] w-full"
          style={{ background: theme.hexGradient }}
        >
          <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-gray-900">
            {isVideoConnected && localStream && !isLocalCameraOff ? (
              <video
                ref={teacherVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-2">
                  <div className={`w-20 h-20 rounded-full ${theme.accentSoftBg} flex items-center justify-center mx-auto shadow-inner`}>
                    <User className={`w-10 h-10 ${theme.accentText}`} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">{teacherName} (You)</p>
                </div>
              </div>
            )}

            {/* Bottom gradient scrim */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />

            {/* "You" pill */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-semibold text-gray-800 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              You
            </div>

            {/* Local mic/camera self-controls (moved from top bar) */}
            {(onToggleLocalMic || onToggleLocalCamera) && (
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {onToggleLocalMic && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleLocalMic}
                    title={isLocalMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                    className={`h-7 w-7 rounded-full shadow-md backdrop-blur-sm ${isLocalMicMuted ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                  >
                    {isLocalMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </Button>
                )}
                {onToggleLocalCamera && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleLocalCamera}
                    title={isLocalCameraOff ? 'Turn camera on' : 'Turn camera off'}
                    className={`h-7 w-7 rounded-full shadow-md backdrop-blur-sm ${isLocalCameraOff ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                  >
                    {isLocalCameraOff ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tools moved to bottom Control Dock — left sidebar is now strictly Video Feeds + Chat */}

      {/* Mini Chat Box */}
      <div className="flex-1 flex flex-col border-t border-gray-200 mt-2">
        <div className="px-3 py-2 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase">Chat</span>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          <div ref={chatScrollRef} className="space-y-2 max-h-full">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs rounded-lg px-2 py-1.5 ${
                  msg.sender === 'teacher'
                    ? `${theme.accentSoftBg} ${theme.accentText} ml-4`
                    : msg.sender === 'system'
                    ? 'bg-gray-100 text-gray-500 text-center italic'
                    : 'bg-gray-100 text-gray-700 mr-4'
                }`}
              >
                {msg.sender !== 'system' && (
                  <span className="font-medium block text-[10px] text-gray-500">
                    {msg.sender === 'teacher' ? 'You' : msg.senderName || studentName}
                  </span>
                )}
                {msg.text}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-gray-200">
          <div className="flex gap-1.5 items-center">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="text-xs bg-gray-50 border-gray-200 h-8 flex-1 min-w-0"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button size="icon" className={`h-8 w-8 shrink-0 ${theme.buttonPrimary}`} onClick={handleSendMessage}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dictionary — standalone section, visually separate from Chat */}
      <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50/60 shrink-0">
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
  );
};