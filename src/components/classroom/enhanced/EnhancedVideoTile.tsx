import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  Star,
  Crown,
  GraduationCap
} from "lucide-react";

interface EnhancedVideoTileProps {
  stream?: MediaStream | null;
  name: string;
  isTeacher: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised?: boolean;
  isCurrentUser?: boolean;
  quality?: 'excellent' | 'good' | 'poor';
  level?: string;
  points?: number;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onRaiseHand?: () => void;
}

export function EnhancedVideoTile({
  stream,
  name,
  isTeacher,
  isMuted,
  isCameraOff,
  isHandRaised = false,
  isCurrentUser = false,
  quality = 'good',
  level,
  points,
  onToggleMute,
  onToggleCamera,
  onRaiseHand
}: EnhancedVideoTileProps) {
  
  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return 'border-success';
      case 'good': return 'border-info';
      case 'poor': return 'border-warning';
      default: return 'border-border';
    }
  };

  const getRoleIcon = () => {
    if (isTeacher) return <Crown className="w-4 h-4 text-primary-600" />;
    return <GraduationCap className="w-4 h-4 text-accent-600" />;
  };

  const getAvatarBg = () => {
    if (isTeacher) return 'bg-gradient-to-br from-primary-500 to-primary-600';
    return 'bg-gradient-to-br from-accent-500 to-accent-600';
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className={`
        relative overflow-hidden bg-surface border-2 ${getQualityColor()}
        ${isCurrentUser ? 'ring-2 ring-primary-400 ring-offset-2' : ''}
        ${isHandRaised ? 'ring-2 ring-warning ring-offset-2 animate-pulse' : ''}
      `}>
        {/* Video or Avatar */}
        <div className="aspect-video relative bg-gradient-to-br from-surface-2 to-surface-3">
          {!isCameraOff && stream ? (
            <video
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              ref={(video) => {
                if (video && stream) {
                  video.srcObject = stream;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div 
                className={`w-16 h-16 rounded-full ${getAvatarBg()} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                whileHover={{ scale: 1.1 }}
                animate={isTeacher ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {name.charAt(0).toUpperCase()}
              </motion.div>
            </div>
          )}

          {/* Floating badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge 
              variant="secondary" 
              className="bg-surface/90 backdrop-blur-sm flex items-center gap-1"
            >
              {getRoleIcon()}
              <span className="text-xs font-medium">
                {isTeacher ? 'Teacher' : 'Student'}
              </span>
            </Badge>
            
            {level && !isTeacher && (
              <Badge variant="outline" className="bg-surface/90 backdrop-blur-sm text-xs">
                {level}
              </Badge>
            )}
          </div>

          {/* Points display for students */}
          {points !== undefined && !isTeacher && (
            <motion.div 
              className="absolute top-2 right-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-accent-500 text-white flex items-center gap-1">
                <Star className="w-3 h-3" />
                {points}
              </Badge>
            </motion.div>
          )}

          {/* Hand raised indicator */}
          {isHandRaised && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-warning/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Hand className="w-8 h-8 text-warning" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">{name}</p>
              {quality !== 'good' && (
                <p className="text-xs text-text-muted">
                  {quality} connection
                </p>
              )}
            </div>

            {isCurrentUser && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={onToggleMute}
                  className="w-8 h-8 p-0"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={isCameraOff ? "destructive" : "secondary"}
                  onClick={onToggleCamera}
                  className="w-8 h-8 p-0"
                >
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </Button>

                {!isTeacher && (
                  <Button
                    size="sm"
                    variant={isHandRaised ? "default" : "outline"}
                    onClick={onRaiseHand}
                    className="w-8 h-8 p-0"
                  >
                    <Hand className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status indicators */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {isMuted && (
            <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {isCameraOff && (
            <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}