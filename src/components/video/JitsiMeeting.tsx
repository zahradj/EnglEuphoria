import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  userRole: 'teacher' | 'student';
  onApiReady?: (api: any) => void;
  onReadyToClose?: () => void;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
  className?: string;
}

export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName,
  displayName,
  userRole,
  onApiReady,
  onReadyToClose,
  onParticipantJoined,
  onParticipantLeft,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Jitsi Meet External API script
    const loadJitsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!containerRef.current || !window.JitsiMeetExternalAPI) {
          throw new Error('Container or Jitsi API not available');
        }

        // Clean room name (alphanumeric and underscores only)
        const cleanRoomName = roomName.replace(/[^a-zA-Z0-9_]/g, '_');

        // Configure interface based on role
        const isTeacher = userRole === 'teacher';
        
        const interfaceConfigOverwrite: Record<string, any> = {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
          TOOLBAR_BUTTONS: isTeacher 
            ? [
                'microphone', 'camera', 'closedcaptions', 'desktop', 
                'fullscreen', 'fodeviceselection', 'hangup', 'chat',
                'recording', 'settings', 'raisehand', 'videoquality',
                'filmstrip', 'tileview', 'whiteboard', 'participants-pane'
              ]
            : [
                'microphone', 'camera', 'closedcaptions', 'fullscreen',
                'fodeviceselection', 'chat', 'raisehand', 'videoquality',
                'filmstrip', 'tileview'
                // Note: 'hangup' is intentionally excluded for students
              ],
          HIDE_INVITE_MORE_HEADER: true,
          DISABLE_FOCUS_INDICATOR: false,
          DEFAULT_BACKGROUND: '#1a1a2e',
          VIDEO_QUALITY_LABEL_DISABLED: false,
        };

        const configOverwrite: Record<string, any> = {
          startWithAudioMuted: !isTeacher, // Students start muted
          startWithVideoMuted: false,
          enableWelcomePage: false,
          enableClosePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          disableInviteFunctions: true,
          hideConferenceSubject: false,
          hideConferenceTimer: false,
          subject: `Live Class: ${roomName}`,
          defaultLanguage: 'en',
          // Moderator settings for teachers
          disableRemoteMute: !isTeacher,
          remoteVideoMenu: {
            disableKick: !isTeacher,
            disableGrantModerator: !isTeacher,
          },
          // Quality settings
          resolution: 720,
          constraints: {
            video: {
              height: { ideal: 720, max: 720, min: 180 },
              width: { ideal: 1280, max: 1280, min: 320 }
            }
          },
          // Disable some features for cleaner interface
          enableNoisyMicDetection: true,
          enableNoAudioDetection: true,
          enableTalkWhileMuted: true,
        };

        // Create the Jitsi Meet instance
        apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: cleanRoomName,
          parentNode: containerRef.current,
          userInfo: {
            displayName: displayName,
          },
          configOverwrite,
          interfaceConfigOverwrite,
        });

        // Set up event listeners
        apiRef.current.addListener('videoConferenceJoined', () => {
          setIsLoading(false);
          
          // Grant moderator rights to teachers
          if (isTeacher) {
            // Teachers are automatically moderators in their own rooms
          }
        });

        apiRef.current.addListener('videoConferenceLeft', () => {
          onReadyToClose?.();
        });

        apiRef.current.addListener('participantJoined', (participant: any) => {
          onParticipantJoined?.(participant);
        });

        apiRef.current.addListener('participantLeft', (participant: any) => {
          onParticipantLeft?.(participant);
        });

        apiRef.current.addListener('readyToClose', () => {
          onReadyToClose?.();
        });

        // Notify parent component
        onApiReady?.(apiRef.current);

      } catch (err) {
        console.error('[Jitsi] Error initializing:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize video conference');
        setIsLoading(false);
      }
    };

    initJitsi();

    // Cleanup on unmount
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, userRole]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-xl ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 font-medium mb-2">Video Conference Error</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Connecting to video conference...</p>
            <p className="text-gray-500 text-sm mt-1">Room: {roomName}</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default JitsiMeeting;
