
import { useState } from 'react';
import { UseEnhancedClassroomProps, ClassroomSession } from './enhanced-classroom/types';
import { useClassroomActions } from './enhanced-classroom/useClassroomActions';
import { useRoleManager } from './enhanced-classroom/useRoleManager';
import { useVideoServiceManager } from './enhanced-classroom/useVideoServiceManager';
import { useEnhancedMediaControls } from './enhanced-classroom/useEnhancedMediaControls';
import { useSessionInitializer } from './enhanced-classroom/useSessionInitializer';

export function useEnhancedClassroom({
  roomId,
  userId,
  displayName,
  userRole
}: UseEnhancedClassroomProps) {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  // Video service management
  const {
    videoService,
    participants,
    isConnected,
    isRecording,
    connectionQuality,
    error: videoError,
    updateParticipants
  } = useVideoServiceManager({ roomId, displayName, userRole });

  // Enhanced media controls
  const {
    localStream,
    isMuted,
    isCameraOff,
    mediaError,
    enhancedToggleMicrophone,
    enhancedToggleCamera
  } = useEnhancedMediaControls({
    videoService,
    isConnected,
    updateParticipants
  });

  // Session and sync initialization
  const { sessionManager, realTimeSync } = useSessionInitializer({
    roomId,
    userId,
    userRole
  });

  // Role management
  const roleManager = useRoleManager({ 
    initialRole: userRole, 
    userId, 
    userName: displayName 
  });

  // Get classroom actions
  const actions = useClassroomActions({
    videoService,
    isConnected,
    isRecording,
    userRole,
    roomId,
    userId,
    session,
    setSession,
    updateParticipants,
    localStream
  });

  return {
    // Connection state
    isConnected,
    connectionQuality,
    error: videoError || mediaError,
    
    // Media state
    isMuted,
    isCameraOff,
    localStream,
    
    // Session data
    session: sessionManager.session,
    participants,
    isRecording,
    
    // Enhanced features
    roleManager,
    sessionManager,
    realTimeSync,
    
    // Actions
    ...actions,
    toggleMicrophone: enhancedToggleMicrophone,
    toggleCamera: enhancedToggleCamera,
    
    // Utility
    updateParticipants
  };
}
