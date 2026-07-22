import { useToast } from "@/hooks/use-toast";
import { audioService } from "@/services/audioService";
import { soundEffectsService } from "@/services/soundEffectsService";

interface UseClassroomActionsProps {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  setStudentXP: (xp: number | ((prev: number) => number)) => void;
  setShowRewardPopup: (show: boolean) => void;
  onShowCelebration?: (points: number, reason?: string) => void;
}

export function useClassroomActions({
  isRecording,
  setIsRecording,
  setStudentXP,
  setShowRewardPopup,
  onShowCelebration
}: UseClassroomActionsProps) {
  const { toast } = useToast();

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Session recording has been stopped." : "Session recording has started.",
    });
  };

  const awardPoints = (points: number, reason?: string) => {
    setStudentXP(prev => {
      const newXP = prev + points;
      const oldLevel = Math.floor(prev / 100);
      const newLevel = Math.floor(newXP / 100);
      
      // Level-up detected!
      if (newLevel > oldLevel) {
        // Play epic victory anthem
        soundEffectsService.playLevelUpAnthem();
        
        // Show special level-up celebration
        if (onShowCelebration) {
          onShowCelebration(points, `LEVEL UP! You're now Level ${newLevel + 1}! 🏆`);
        }
        
        toast({
          title: "🏆 LEVEL UP! 🏆",
          description: `Amazing! You've reached Level ${newLevel + 1}!`,
          duration: 5000
        });
      } else {
        // Regular reward
        // Play game-like sound effects based on reward amount
        if (points >= 40) {
          soundEffectsService.playLevelComplete(); // Large rewards - victory fanfare
        } else if (points >= 20) {
          soundEffectsService.playCelebration(); // Medium rewards - celebration melody
        } else {
          soundEffectsService.playStarEarned(); // Small rewards - star chime
        }
        
        // Show center-screen celebration
        if (onShowCelebration) {
          onShowCelebration(points, reason);
        }
        
        toast({
          title: "Points Awarded! 🎉",
          description: `Student earned ${points} XP${reason ? ` for ${reason}` : ''}`,
        });
      }
      
      return newXP;
    });
    
    setShowRewardPopup(true);

    // Hide reward popup after 3 seconds
    setTimeout(() => {
      setShowRewardPopup(false);
    }, 3000);
  };

  return {
    toggleRecording,
    awardPoints
  };
}
