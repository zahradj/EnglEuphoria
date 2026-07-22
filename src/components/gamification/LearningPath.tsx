
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, Lock, Play } from "lucide-react";
import { ClayCard, ClayIcon, ClayProgress, ClayBadge, type ClaySubject } from "@/components/ui/clay";

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  isCompleted: boolean;
  isLocked: boolean;
  points: number;
  activities: {
    id: string;
    title: string;
    type: "quiz" | "game" | "video" | "reading" | "practice";
    isCompleted: boolean;
    duration: number;
  }[];
}

interface LearningPathProps {
  path: {
    title: string;
    description: string;
    milestones: LearningMilestone[];
  };
  onStartActivity: (milestoneId: string, activityId: string) => void;
  className?: string;
}

const activitySubject: Record<string, ClaySubject> = {
  quiz: 'grammar',
  game: 'phonics',
  video: 'vocab',
  reading: 'grammar',
  practice: 'phonics',
};

const activityIcons: Record<string, string> = {
  quiz: '🧩',
  game: '🎮',
  video: '🎬',
  reading: '📖',
  practice: '✏️',
};

export function LearningPath({ path, onStartActivity, className = "" }: LearningPathProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const { languageText } = useLanguage();

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestone(expandedMilestone === milestoneId ? null : milestoneId);
  };

  const completionPct = (m: LearningMilestone) => {
    if (!m.activities.length) return 0;
    return Math.round((m.activities.filter(a => a.isCompleted).length / m.activities.length) * 100);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{path.title}</CardTitle>
        <p className="text-muted-foreground text-sm">{path.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {path.milestones.map((milestone, index) => {
            const subject: ClaySubject = milestone.isCompleted ? 'vocab' : milestone.isLocked ? 'neutral' : 'grammar';
            const pct = completionPct(milestone);

            return (
              <ClayCard
                key={milestone.id}
                subject={subject}
                className={`${milestone.isLocked ? 'opacity-60' : ''}`}
                onClick={() => !milestone.isLocked && toggleMilestone(milestone.id)}
              >
                <div className="flex items-center gap-3">
                  <ClayIcon subject={subject} size="md">
                    {milestone.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : milestone.isLocked ? (
                      <Lock className="h-5 w-5 text-slate-500" />
                    ) : (
                      <span className="font-bold text-white text-sm">{index + 1}</span>
                    )}
                  </ClayIcon>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`font-semibold text-sm ${milestone.isLocked ? 'text-muted-foreground' : ''}`}>
                        {milestone.title}
                      </h3>
                      <ClayBadge subject="gold" label={`${milestone.points} ${languageText.points}`} />
                    </div>

                    <p className={`text-xs mt-0.5 ${milestone.isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                      {milestone.description}
                    </p>

                    {!milestone.isLocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>{pct}% {languageText.complete}</span>
                          <span>
                            {milestone.activities.filter(a => a.isCompleted).length}/{milestone.activities.length} {languageText.activities}
                          </span>
                        </div>
                        <ClayProgress value={pct} subject={subject} height={6} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities list */}
                {!milestone.isLocked && expandedMilestone === milestone.id && (
                  <div className="mt-3 pt-3 border-t border-black/5 space-y-2">
                    {milestone.activities.map(activity => {
                      const actSubject = activitySubject[activity.type] || 'neutral';
                      return (
                        <div
                          key={activity.id}
                          className="clay flex items-center justify-between px-3 py-2"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <ClayIcon subject={actSubject} size="sm">
                              <span className="text-xs">{activityIcons[activity.type] || '📝'}</span>
                            </ClayIcon>
                            <div>
                              <h4 className="text-xs font-medium">{activity.title}</h4>
                              <p className="text-[10px] text-muted-foreground">
                                {activity.type} • {activity.duration} {languageText.min}
                              </p>
                            </div>
                          </div>

                          {activity.isCompleted ? (
                            <ClayIcon subject="vocab" size="sm">
                              <CheckCircle className="h-3.5 w-3.5 text-white" />
                            </ClayIcon>
                          ) : (
                            <Button
                              size="sm"
                              className="h-7 gap-1 text-xs clay-grammar border-none text-blue-900"
                              onClick={() => onStartActivity(milestone.id, activity.id)}
                            >
                              <Play className="h-3 w-3" />
                              {languageText.start}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ClayCard>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
