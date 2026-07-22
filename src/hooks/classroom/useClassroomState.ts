
import { useState } from "react";

export function useClassroomState() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState("chat");
  const [activeCenterTab, setActiveCenterTab] = useState("whiteboard");
  const [studentXP, setStudentXP] = useState(1250);
  const [studentLevel, setStudentLevel] = useState("Intermediate");
  const [showRewardPopup, setShowRewardPopup] = useState(false);

  return {
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
  };
}
