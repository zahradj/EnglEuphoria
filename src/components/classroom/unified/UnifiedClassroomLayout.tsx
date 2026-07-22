
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video, Wifi } from "lucide-react";
import { ConnectionManager } from "./components/ConnectionManager";
import { useConnectionRecovery } from "@/hooks/enhanced-classroom/useConnectionRecovery";
import { ClassStatusBar } from "./components/ClassStatusBar";

interface UnifiedClassroomLayoutProps {
  children: React.ReactNode;
  classTime: number;
  enhancedClassroom: any;
}

export function UnifiedClassroomLayout({ 
  children, 
  classTime, 
  enhancedClassroom 
}: UnifiedClassroomLayoutProps) {
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced connection recovery
  const { retryCount, isRecovering, manualRetry } = useConnectionRecovery({
    isConnected: enhancedClassroom?.isConnected || false,
    error: enhancedClassroom?.error || null,
    onReconnect: async () => {
      if (enhancedClassroom?.videoService) {
        try {
          // Attempt to reconnect the video service
          await enhancedClassroom.videoService.initialize();
          if (!enhancedClassroom.isConnected) {
            await enhancedClassroom.joinRoom();
          }
        } catch (error) {
          console.error('Reconnection failed:', error);
          throw error;
        }
      }
    },
    maxRetries: 5,
    retryDelay: 3000
  });

  return (
    <div className="h-dvh bg-gradient-to-br from-background via-surface-2 to-surface-3 overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary-100 opacity-30 animate-float-slow"
        />
        <div 
          className="absolute top-20 right-20 w-24 h-24 rounded-full bg-accent-200 opacity-25 animate-bounce-light animation-delay-500"
        />
        <div 
          className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-primary-50 opacity-20 animate-pulse-subtle animation-delay-700"
        />
      </div>

      {/* Full-screen grid layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main content area */}
        <main className="flex-1 bg-transparent">
          {children}
        </main>
      </div>

      {/* Recovery Status Indicator - Non-blocking */}
      {isRecovering && (
        <div className="fixed top-4 right-4 z-30 pointer-events-none">
          <Card className="p-3 bg-surface/95 backdrop-blur-sm border border-primary-200 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-text font-medium">
                Reconnecting... ({retryCount}/5)
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-100/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent-100/10 to-transparent pointer-events-none" />
    </div>
  );
}
