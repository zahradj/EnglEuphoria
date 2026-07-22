
import React, { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Hand, 
  Circle, 
  Users,
  Wifi,
  WifiOff,
  Signal,
  Sparkles
} from "lucide-react";
import { ParticipantData } from '@/services/enhancedVideoService';

interface EnhancedVideoPanelProps {
  participants: ParticipantData[];
  isConnected: boolean;
  isRecording: boolean;
  connectionQuality: string;
  userRole: 'teacher' | 'student';
  localStream?: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onRaiseHand: () => void;
  onToggleRecording?: () => void;
  onStartScreenShare?: () => void;
}

export function EnhancedVideoPanel({
  participants,
  isConnected,
  isRecording,
  connectionQuality,
  userRole,
  localStream,
  isMuted,
  isCameraOff
}: EnhancedVideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update video element when localStream changes
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Get connection quality color and signal strength
  const getConnectionIndicator = () => {
    switch (connectionQuality) {
      case 'excellent':
        return { color: 'text-green-500', bars: 4, label: 'Excellent' };
      case 'good':
        return { color: 'text-green-400', bars: 3, label: 'Good' };
      case 'fair':
        return { color: 'text-yellow-500', bars: 2, label: 'Fair' };
      case 'poor':
        return { color: 'text-red-500', bars: 1, label: 'Poor' };
      default:
        return { color: 'text-gray-400', bars: 0, label: 'Unknown' };
    }
  };

  const connectionInfo = getConnectionIndicator();

  return (
    <Card className="h-full flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      {/* Enhanced Header with Gradient and Connection Status */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Wifi className="h-5 w-5 text-green-500" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-semibold text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-gray-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-600">Connecting...</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Signal className={`h-4 w-4 ${connectionInfo.color}`} />
              <Badge variant={connectionQuality === 'good' || connectionQuality === 'excellent' ? 'default' : 'destructive'} className="text-xs">
                {connectionInfo.label}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span className="font-medium">{participants.length + 1}</span>
            </div>
            
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse shadow-lg">
                <Circle className="h-3 w-3 mr-1 fill-current animate-pulse" />
                RECORDING
              </Badge>
            )}
            
            {userRole === 'teacher' && (
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Teacher
              </Badge>
            )}
          </div>
        </div>

        {/* Connection Quality Progress Bar */}
        {isConnected && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Connection Quality</span>
              <span>{connectionInfo.label}</span>
            </div>
            <Progress 
              value={connectionInfo.bars * 25} 
              className="h-1.5"
            />
          </div>
        )}
      </div>

      {/* Enhanced Video Area */}
      <div className="flex-1 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
          {localStream && !isCameraOff ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
              
              {/* Enhanced Local User Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">You ({userRole})</span>
                {isMuted && <MicOff className="h-3 w-3" />}
              </div>

              {/* Enhanced Connection Status Overlay */}
              {isConnected && (
                <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-white animate-fade-in">
              {isCameraOff ? (
                <>
                  <div className="bg-gray-700/50 p-6 rounded-full mb-4 mx-auto w-fit">
                    <VideoOff className="h-12 w-12" />
                  </div>
                  <p className="text-lg font-medium">Camera Off</p>
                  <p className="text-sm text-gray-300 mt-1">Your camera is disabled</p>
                </>
              ) : localStream ? (
                <>
                  <div className="bg-gray-700/50 p-6 rounded-full mb-4 mx-auto w-fit animate-pulse">
                    <Video className="h-12 w-12" />
                  </div>
                  <p className="text-lg font-medium">Camera Loading...</p>
                  <p className="text-sm text-gray-300 mt-1">Please wait while we set up your camera</p>
                </>
              ) : (
                <>
                  <div className="bg-gray-700/50 p-6 rounded-full mb-4 mx-auto w-fit">
                    <VideoOff className="h-12 w-12" />
                  </div>
                  <p className="text-lg font-medium">No Camera Access</p>
                  <p className="text-sm text-gray-300 mt-1">Please allow camera permissions</p>
                </>
              )}
            </div>
          )}

          {/* Enhanced Participants Overlay */}
          {participants.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="flex flex-wrap gap-2 max-w-48">
                {participants.slice(0, 3).map((participant) => (
                  <Badge 
                    key={participant.id}
                    variant={participant.role === 'teacher' ? 'default' : 'secondary'}
                    className="text-xs bg-black/70 text-white border-white/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${participant.role === 'teacher' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                      <span>{participant.displayName}</span>
                      {participant.isMuted && <MicOff className="h-2 w-2" />}
                      {participant.isHandRaised && <Hand className="h-2 w-2 text-yellow-400" />}
                    </div>
                  </Badge>
                ))}
                {participants.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-black/70 text-white border-white/20">
                    +{participants.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
