
import { LearningPath } from "@/components/gamification/LearningPath";

interface LearningPathTabProps {
  learningPath: any;
  onStartActivity: (milestoneId: string, activityId: string) => void;
}

export function LearningPathTab({ learningPath, onStartActivity }: LearningPathTabProps) {
  return (
    <LearningPath
      path={learningPath}
      onStartActivity={onStartActivity}
    />
  );
}
