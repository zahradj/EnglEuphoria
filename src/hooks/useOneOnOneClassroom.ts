
import { useClassroomTimer } from "./classroom/useClassroomTimer";
import { useClassroomState } from "./classroom/useClassroomState";
import { useClassroomActions } from "./classroom/useClassroomActions";
import { useRewardNotifications } from "./classroom/useRewardNotifications";

export function useOneOnOneClassroom() {
  
  const { classTime } = useClassroomTimer();
  const {
    isRecording,
    isMuted,
    isCameraOff,
    activeRightTab,
    activeCenterTab,
    studentXP,
    studentLevel,
    showRewardPopup,
    setIsRecording,
    setIsMuted,
    setIsCameraOff,
    setActiveRightTab,
    setActiveCenterTab,
    setStudentXP,
    setShowRewardPopup
  } = useClassroomState();

  const { 
    showRewardNotification, 
    celebration, 
    hideCelebration 
  } = useRewardNotifications();

  const { toggleRecording, awardPoints: originalAwardPoints } = useClassroomActions({
    isRecording,
    setIsRecording,
    setStudentXP,
    setShowRewardPopup,
    onShowCelebration: showRewardNotification
  });

  // Create a wrapper function that matches the expected signature
  const awardPoints = (points: number, reason?: string) => {
    originalAwardPoints(points, reason);
  };

  
  return {
    isRecording,
    isMuted,
    isCameraOff,
    classTime,
    activeRightTab,
    activeCenterTab,
    studentXP,
    studentLevel,
    showRewardPopup,
    celebration,
    setIsMuted,
    setIsCameraOff,
    setActiveRightTab,
    setActiveCenterTab,
    toggleRecording,
    awardPoints,
    hideCelebration
  };
}
