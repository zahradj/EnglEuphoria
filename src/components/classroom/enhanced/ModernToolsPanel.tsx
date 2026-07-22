import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand,
  MessageSquare,
  Gift,
  Languages,
  LogOut,
  Settings,
  Sparkles
} from "lucide-react";

interface ModernToolsPanelProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  isTeacher: boolean;
  studentLevel?: string;
  studentPoints?: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleHand: () => void;
  onOpenChat: () => void;
  onOpenRewards: () => void;
  onOpenTranslator: () => void;
  onLeaveClass: () => void;
}

export function ModernToolsPanel({
  isMuted,
  isCameraOff,
  isHandRaised,
  isTeacher,
  studentLevel,
  studentPoints,
  onToggleMute,
  onToggleCamera,
  onToggleHand,
  onOpenChat,
  onOpenRewards,
  onOpenTranslator,
  onLeaveClass
}: ModernToolsPanelProps) {
  
  const tools = [
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'Chat',
      color: 'bg-info hover:bg-info/90',
      onClick: onOpenChat
    },
    {
      id: 'rewards',
      icon: Gift,
      label: 'Rewards',
      color: 'bg-accent-500 hover:bg-accent-600',
      onClick: onOpenRewards,
      show: !isTeacher
    },
    {
      id: 'translator',
      icon: Languages,
      label: 'Translate',
      color: 'bg-primary-500 hover:bg-primary-600',
      onClick: onOpenTranslator
    }
  ];

  const mediaControls = [
    {
      id: 'mic',
      icon: isMuted ? MicOff : Mic,
      isActive: !isMuted,
      activeColor: 'bg-success hover:bg-success/90',
      inactiveColor: 'bg-error hover:bg-error/90',
      onClick: onToggleMute
    },
    {
      id: 'camera',
      icon: isCameraOff ? VideoOff : Video,
      isActive: !isCameraOff,
      activeColor: 'bg-success hover:bg-success/90',
      inactiveColor: 'bg-error hover:bg-error/90',
      onClick: onToggleCamera
    },
    {
      id: 'hand',
      icon: Hand,
      isActive: isHandRaised,
      activeColor: 'bg-warning hover:bg-warning/90',
      inactiveColor: 'bg-neutral-400 hover:bg-neutral-500',
      onClick: onToggleHand,
      show: !isTeacher
    }
  ];

  return (
    <Card className="p-4 bg-surface/90 backdrop-blur-xl border border-primary-200 shadow-xl">
      {/* Student Info Section */}
      {!isTeacher && (studentLevel || studentPoints !== undefined) && (
        <motion.div 
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-accent-100 to-primary-100 border border-accent-200"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            {studentLevel && (
              <Badge variant="secondary" className="bg-white/80 text-accent-700 font-medium">
                Level: {studentLevel}
              </Badge>
            )}
            {studentPoints !== undefined && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge className="bg-accent-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {studentPoints} XP
                </Badge>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Media Controls */}
      <div className="space-y-3 mb-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
          Media Controls
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {mediaControls.filter(control => control.show !== false).map((control, index) => (
            <motion.div
              key={control.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                size="lg"
                onClick={control.onClick}
                className={`
                  w-full h-12 flex items-center justify-center gap-2 text-white font-medium
                  transition-all duration-300 hover:scale-105 hover:shadow-lg
                  ${control.isActive ? control.activeColor : control.inactiveColor}
                  ${control.id === 'hand' && isHandRaised ? 'animate-pulse' : ''}
                `}
              >
                <control.icon className="w-5 h-5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div className="space-y-3 mb-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
          Classroom Tools
        </h3>
        <div className="space-y-2">
          {tools.filter(tool => tool.show !== false).map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                size="sm"
                onClick={tool.onClick}
                className={`
                  w-full justify-start gap-3 text-white font-medium h-10
                  transition-all duration-300 hover:scale-105 hover:shadow-md
                  ${tool.color}
                `}
              >
                <tool.icon className="w-4 h-4" />
                {tool.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leave Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Button
          variant="destructive"
          size="sm"
          onClick={onLeaveClass}
          className="w-full justify-start gap-3 font-medium h-10 transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <LogOut className="w-4 h-4" />
          Leave Class
        </Button>
      </motion.div>
    </Card>
  );
}