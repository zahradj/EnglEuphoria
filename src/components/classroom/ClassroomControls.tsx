
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Mic, MicOff, Video, VideoOff, Hand, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClassroomControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleHand: () => void;
  toggleChat: () => void;
}

export function ClassroomControls({
  isMuted,
  isVideoOff,
  isHandRaised,
  isChatOpen,
  toggleMute,
  toggleVideo,
  toggleHand,
  toggleChat,
}: ClassroomControlsProps) {
  const navigate = useNavigate();
  const { languageText } = useLanguage();
  const { user } = useAuth();
  
  // SECURITY: Use server-validated role from database
  const dashboardPath = user?.role === 'teacher' ? '/teacher' : user?.role === 'admin' ? '/super-admin' : '/student';
  
  return (
    <div className="bg-white rounded-lg p-3 flex flex-wrap justify-center gap-2 shadow-sm">
      <button
        onClick={toggleMute}
        className={`p-3 rounded-full transition-colors ${
          isMuted ? "bg-destructive text-white" : "bg-muted hover:bg-muted/70"
        }`}
      >
        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
      
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full transition-colors ${
          isVideoOff ? "bg-destructive text-white" : "bg-muted hover:bg-muted/70"
        }`}
      >
        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
      </button>
      
      <button
        onClick={toggleHand}
        className={`p-3 rounded-full transition-colors ${
          isHandRaised ? "bg-yellow text-yellow-dark" : "bg-muted hover:bg-muted/70"
        }`}
      >
        <Hand size={24} />
      </button>
      
      <button
        onClick={toggleChat}
        className={`p-3 rounded-full transition-colors ${
          isChatOpen ? "bg-purple text-white" : "bg-muted hover:bg-muted/70"
        }`}
      >
        <MessageCircle size={24} />
      </button>
      
      <button
        className="px-4 py-2 bg-destructive text-white rounded-full ml-2 hover:bg-destructive/90 transition-colors"
        onClick={() => navigate(dashboardPath)}
      >
        {languageText.leaveClass}
      </button>
    </div>
  );
}
