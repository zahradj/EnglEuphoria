
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

// Define types for layout options
export type LayoutType = "gallery" | "spotlight" | "sidebar" | "default" | "material" | "video";

export function useClassroomState() {
  const [studentName, setStudentName] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [layout, setLayout] = useState<LayoutType>("default");
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTeacherView, setIsTeacherView] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { languageText } = useLanguage();
  const { user, loading } = useAuth();

  useEffect(() => {
    // SECURITY: Use server-validated role from AuthContext
    if (loading) return;
    
    if (!user) {
      navigate("/login");
      return;
    }


    // Set state based on server-validated user role
    if (user.role === "teacher" || user.role === "admin") {
      setStudentName(user.email?.split('@')[0] || "Teacher");
      setPoints(0); // Teachers don't have points
      setIsTeacherView(true);
    } else {
      setStudentName(user.email?.split('@')[0] || "Student");
      // Load points from a secure source if needed
      const storedPoints = localStorage.getItem("points");
      setPoints(storedPoints ? parseInt(storedPoints) : 0);
      setIsTeacherView(false);
    }
  }, [user, loading, navigate]);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    
    toast({
      title: languageText.layoutChanged,
      description: `${languageText.switchedTo} ${newLayout} ${languageText.view}`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    toast({
      title: isMuted ? languageText.microphoneEnabled : languageText.microphoneDisabled,
      description: isMuted ? languageText.youCanNowSpeak : languageText.youAreMuted,
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    
    toast({
      title: isVideoOff ? languageText.cameraEnabled : languageText.cameraDisabled,
      description: isVideoOff ? languageText.youAreNowVisible : languageText.youAreNowHidden,
    });
  };

  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
    
    toast({
      title: isHandRaised ? languageText.handLowered : languageText.handRaised,
      description: isHandRaised ? languageText.handLoweredDesc : languageText.teacherNotified,
    });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleQuizComplete = (score: number, total: number) => {
    const newPoints = points + score;
    setPoints(newPoints);
    localStorage.setItem("points", newPoints.toString());
    
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score} out of ${total} and earned ${score} points!`,
    });
  };

  return {
    studentName,
    points,
    layout,
    isMuted,
    isVideoOff,
    isHandRaised,
    isChatOpen,
    isTeacherView,
    handleLayoutChange,
    toggleMute,
    toggleVideo,
    toggleHand,
    toggleChat,
    handleQuizComplete,
    setPoints
  };
}
