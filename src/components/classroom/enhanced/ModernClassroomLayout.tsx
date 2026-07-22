import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video, Wifi, Sparkles } from "lucide-react";

interface ModernClassroomLayoutProps {
  children: React.ReactNode;
  classTime: number;
  participantsCount: number;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export function ModernClassroomLayout({ 
  children, 
  classTime, 
  participantsCount,
  isConnected,
  connectionQuality
}: ModernClassroomLayoutProps) {
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-info';
      case 'poor': return 'text-warning';
      case 'disconnected': return 'text-error';
      default: return 'text-text-muted';
    }
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden relative">
      {/* Modern glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/30 to-purple-100/40 backdrop-blur-sm"></div>
      
      {/* Enhanced floating elements with glassmorphism */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-20 right-20 w-24 h-24 rounded-full bg-blue-200/30 backdrop-blur-sm border border-blue-300/20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, -180],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-purple-200/20 backdrop-blur-lg border border-purple-300/20"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 45, 90],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-gradient-to-r from-pink-300/30 to-yellow-300/30 backdrop-blur-sm"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Enhanced Top Status Bar with Glassmorphism */}
      <motion.div 
        className="relative z-10 p-4 flex items-center justify-between bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-2 text-primary-700"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-6 h-6" />
            <span className="font-bold text-lg">ESL Classroom</span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/30 backdrop-blur-sm text-slate-700 border-white/30 shadow-sm">
              <Clock className="w-4 h-4" />
              {formatTime(classTime)}
            </Badge>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge variant="outline" className="flex items-center gap-1 bg-white/30 backdrop-blur-sm border-white/30 text-slate-700">
              <Users className="w-4 h-4" />
              {participantsCount}
            </Badge>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 bg-white/30 backdrop-blur-sm border-white/30 ${getConnectionColor()}`}
            >
              <Wifi className="w-4 h-4" />
              {connectionQuality}
            </Badge>
          </motion.div>

          {isConnected && (
            <motion.div
              className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </motion.div>

      {/* Enhanced Main Content Area */}
      <motion.div 
        className="flex-1 h-[calc(100vh-80px)] overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Enhanced decorative corner elements with glassmorphism */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-300/30 to-transparent pointer-events-none backdrop-blur-sm" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-300/30 to-transparent pointer-events-none backdrop-blur-sm" />
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-r from-pink-300/20 to-transparent pointer-events-none backdrop-blur-sm rounded-full transform -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-gradient-to-l from-yellow-300/20 to-transparent pointer-events-none backdrop-blur-sm rounded-full" />
    </div>
  );
}