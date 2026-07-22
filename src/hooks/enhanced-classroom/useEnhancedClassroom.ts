import { useState, useEffect } from 'react';
import { useVideoServiceManager } from './useVideoServiceManager';
import { useEnhancedMediaControls } from './useEnhancedMediaControls';
import { useClassroomActions } from './useClassroomActions';
import { UseEnhancedClassroomProps, ClassroomSession } from './types';
import { useSecurityAudit } from '@/components/security/SecurityAuditLogger';
import { useAdvancedSecurity } from '@/hooks/useAdvancedSecurity';

export function useEnhancedClassroom({
  roomId,
  userId,
  displayName,
  userRole
}: UseEnhancedClassroomProps) {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [isClassroomActive, setIsClassroomActive] = useState(false);
  const { logSecurityEvent } = useSecurityAudit();
  const { evaluateSecurityRules, reportSecurityIncident } = useAdvancedSecurity();

  // Video service management
  const {
    videoService,
    participants,
    isConnected,
    isRecording,
    connectionQuality,
    error: videoError,
    updateParticipants
  } = useVideoServiceManager({
    roomId,
    displayName,
    userRole
  });

  // Media controls
  const {
    localStream,
    isMuted,
    isCameraOff,
    mediaError,
    enhancedToggleMicrophone,
    enhancedToggleCamera,
    initializeLocalMedia
  } = useEnhancedMediaControls({
    videoService,
    isConnected,
    updateParticipants
  });

  // Classroom actions
  const {
    joinRoom,
    leaveRoom,
    startRecording,
    stopRecording,
    raiseHand,
    startScreenShare
  } = useClassroomActions({
    videoService,
    isConnected,
    userRole,
    roomId,
    userId,
    session,
    setSession,
    isRecording,
    updateParticipants
  });

  // Initialize session
  useEffect(() => {
    if (roomId && userId) {
      const newSession: ClassroomSession = {
        id: `session-${Date.now()}`,
        roomId,
        teacherId: userRole === 'teacher' ? userId : '',
        studentId: userRole === 'student' ? userId : '',
        startTime: new Date(),
        isRecording: false,
        status: 'waiting'
      };
      setSession(newSession);

      // Log classroom access with security monitoring
      logSecurityEvent('classroom_session_started', {
        resource: 'classroom',
        resourceId: roomId,
        metadata: {
          userRole,
          userId,
          displayName,
          timestamp: new Date().toISOString()
        }
      });

      // Evaluate security rules for classroom access
      evaluateSecurityRules({
        eventType: 'classroom_access',
        roomId,
        userId,
        userRole,
        timestamp: Date.now()
      });
    }
  }, [roomId, userId, userRole, logSecurityEvent, evaluateSecurityRules]);

  // Monitor for suspicious classroom activity
  useEffect(() => {
    if (isClassroomActive && participants.length > 10) {
      reportSecurityIncident({
        type: 'unusual_participant_count',
        description: `Classroom ${roomId} has unusually high participant count: ${participants.length}`,
        severity: 'medium',
        metadata: {
          roomId,
          participantCount: participants.length,
          userRole,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [participants.length, isClassroomActive, roomId, userRole, reportSecurityIncident]);

  // Set classroom as active when connected
  useEffect(() => {
    setIsClassroomActive(isConnected);
    
    if (session && isConnected) {
      setSession(prev => prev ? { ...prev, status: 'active' } : null);
    }
  }, [isConnected, session]);

  return {
    // Session management
    session,
    isClassroomActive,
    
    // Video service
    videoService,
    participants,
    isConnected,
    isRecording,
    connectionQuality,
    videoError,
    updateParticipants,
    
    // Media controls
    localStream,
    isMuted,
    isCameraOff,
    mediaError,
    toggleMicrophone: enhancedToggleMicrophone,
    toggleCamera: enhancedToggleCamera,
    initializeLocalMedia,
    
    // Classroom actions
    joinRoom,
    leaveRoom,
    startRecording,
    stopRecording,
    raiseHand,
    startScreenShare
  };
}