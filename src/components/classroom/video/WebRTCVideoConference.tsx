import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import { VideoTile } from '@/components/classroom/unified/components/VideoTile';
import { ConnectionQualityIndicator } from './ConnectionQualityIndicator';
import { realTimeVideoService } from '@/services/video/realTimeVideoService';
import { ConnectionQualityMetrics } from '@/services/video/connectionQualityMonitor';
import { useToast } from '@/hooks/use-toast';

interface WebRTCVideoConferenceProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  isTeacher: boolean;
  autoConnect?: boolean;
  onLeave?: () => void;
}

export function WebRTCVideoConference({
  roomId,
  currentUserId,
  currentUserName,
  isTeacher,
  autoConnect = true,
  onLeave
}: WebRTCVideoConferenceProps) {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQualityMetrics | null>(null);

  // Initialize local media
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to access media devices';
        setError(message);
        console.error('Media error:', err);
      }
    };

    initMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Set up participants listener
  useEffect(() => {
    realTimeVideoService.onParticipantsChange((newParticipants) => {
      setParticipants(newParticipants);
    });
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && localStream && !isConnected && !isConnecting) {
      handleConnect();
    }
  }, [autoConnect, localStream, isConnected, isConnecting]);

  const handleConnect = async () => {
    if (!localStream || isConnecting) return;

    setIsConnecting(true);
    try {
      realTimeVideoService.setRoomConfig(roomId, currentUserId, localStream);
      await realTimeVideoService.joinRoom();
      setIsConnected(true);
      
      // Start quality monitoring
      realTimeVideoService.startQualityMonitoring((metrics) => {
        setConnectionQuality(metrics);
      });
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      console.error('Connection error:', err);
      toast({
        title: "Connection Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    realTimeVideoService.stopQualityMonitoring();
    await realTimeVideoService.leaveRoom();
    setIsConnected(false);
    setParticipants([]);
    setConnectionQuality(null);
    onLeave?.();
  };

  const toggleMicrophone = async () => {
    await realTimeVideoService.toggleMicrophone();
    setIsMuted(!localStream?.getAudioTracks()[0]?.enabled || false);
  };

  const toggleCamera = async () => {
    await realTimeVideoService.toggleCamera();
    setIsCameraOff(!localStream?.getVideoTracks()[0]?.enabled || false);
  };

  if (error && !localStream) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <VideoOff className="h-5 w-5" />
            Media Access Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Combine local user and remote participants
  const allParticipants = [
    {
      id: currentUserId,
      name: currentUserName,
      isTeacher,
      isMuted,
      isCameraOff,
      stream: localStream,
      isLocal: true
    },
    ...participants.map(p => ({
      id: p.id,
      name: p.name,
      isTeacher: false,
      isMuted: false,
      isCameraOff: false,
      stream: p.stream,
      isLocal: false
    }))
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <Video size={18} className="text-primary" />
          <span className="font-medium text-sm">Live Video</span>
          <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
            {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && connectionQuality && (
            <ConnectionQualityIndicator quality={connectionQuality} />
          )}
          <div className="flex items-center gap-1 text-sm">
            <Users size={14} />
            <span>{allParticipants.length}</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-2 overflow-hidden min-h-0">
        <div
          className={`grid gap-2 h-full ${
            allParticipants.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {allParticipants.map((participant) => (
            <div key={participant.id} className="relative h-full min-h-0">
              <VideoTile
                stream={participant.stream}
                hasVideo={participant.stream !== null && !participant.isCameraOff}
                isTeacher={participant.isTeacher}
                userLabel={participant.name}
                isCameraOff={participant.isCameraOff}
              />

              <div className="absolute bottom-1 left-1 flex items-center gap-1 z-10">
                <Badge variant={participant.isLocal ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {participant.isLocal ? "You" : participant.name}
                  {participant.isTeacher && " (Teacher)"}
                </Badge>
                {participant.isMuted && (
                  <div className="bg-red-500 rounded-full p-1">
                    <MicOff size={10} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={toggleMicrophone}
            disabled={!isConnected}
            className="flex items-center gap-1"
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </Button>
          
          <Button
            variant={isCameraOff ? "destructive" : "outline"}
            size="sm"
            onClick={toggleCamera}
            disabled={!isConnected}
            className="flex items-center gap-1"
          >
            {isCameraOff ? <VideoOff size={14} /> : <Video size={14} />}
          </Button>
          
          {isConnected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              className="flex items-center gap-1"
            >
              <PhoneOff size={14} />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
