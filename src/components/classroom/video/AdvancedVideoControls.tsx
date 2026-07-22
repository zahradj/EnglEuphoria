
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  MonitorOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Phone,
  Settings,
  Users,
  Pin,
  Focus,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AdvancedVideoControlsProps {
  // Basic controls
  isMuted: boolean;
  isCameraOff: boolean;
  isConnected: boolean;
  
  // Advanced features
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingDuration: number;
  
  // Permissions
  canRecord: boolean;
  canControlParticipants: boolean;
  
  // Callbacks
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onLeaveCall: () => void;
  onShowSettings: () => void;
  onShowParticipants: () => void;
}

export function AdvancedVideoControls({
  isMuted,
  isCameraOff,
  isConnected,
  isScreenSharing,
  isRecording,
  recordingDuration,
  canRecord,
  canControlParticipants,
  onToggleMicrophone,
  onToggleCamera,
  onToggleScreenShare,
  onToggleRecording,
  onLeaveCall,
  onShowSettings,
  onShowParticipants
}: AdvancedVideoControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatRecordingTime = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-black/80 rounded-lg backdrop-blur-sm">
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          REC {formatRecordingTime(recordingDuration)}
        </div>
      )}

      {/* Basic controls */}
      <Button
        variant={isMuted ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleMicrophone}
        className="bg-black/20 hover:bg-black/40 border-white/30"
      >
        {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
      </Button>

      <Button
        variant={isCameraOff ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleCamera}
        className="bg-black/20 hover:bg-black/40 border-white/30"
      >
        {isCameraOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
      </Button>

      {/* Screen sharing */}
      <Button
        variant={isScreenSharing ? "default" : "outline"}
        size="icon"
        onClick={onToggleScreenShare}
        className={`${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-black/20 hover:bg-black/40'} border-white/30`}
      >
        {isScreenSharing ? <Monitor size={20} className="text-white" /> : <MonitorOff size={20} className="text-white" />}
      </Button>

      {/* Recording controls (only for teachers/hosts) */}
      {canRecord && (
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={onToggleRecording}
          className="bg-black/20 hover:bg-black/40 border-white/30"
        >
          <div className={`w-4 h-4 ${isRecording ? 'bg-white' : 'border-2 border-white'} rounded-sm`}></div>
        </Button>
      )}

      {/* Advanced controls dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/20 hover:bg-black/40 border-white/30"
          >
            <Settings size={20} className="text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem onClick={onShowParticipants}>
            <Users className="mr-2 h-4 w-4" />
            Participants
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onShowSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Video Settings
          </DropdownMenuItem>
          
          {canControlParticipants && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Pin className="mr-2 h-4 w-4" />
                Pin Participant
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Focus className="mr-2 h-4 w-4" />
                Focus View
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Leave call */}
      <Button
        variant="destructive"
        size="icon"
        onClick={onLeaveCall}
      >
        <Phone size={20} />
      </Button>

      {/* Connection status */}
      <div className="flex items-center gap-1 ml-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-white text-xs">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}
