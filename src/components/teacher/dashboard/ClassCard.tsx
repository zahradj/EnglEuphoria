import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target } from "lucide-react";

interface ClassCardProps {
  title: string;
  time: string;
  students: number;
  buttonText: string;
  onButtonClick: () => void;
  /** Phase 2 roster strip props */
  studentName?: string | null;
  hubType?: 'playground' | 'academy' | 'professional' | string | null;
  cefrLevel?: string | null;
  goal?: string | null;
}

const HUB_LABEL: Record<string, string> = {
  playground: 'Playground',
  academy: 'Academy',
  professional: 'Success',
};

const HUB_CHIP: Record<string, string> = {
  // Hub-color chips per workspace branding
  playground: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  academy: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  professional: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
};

export const ClassCard = ({
  title,
  time,
  students,
  buttonText,
  onButtonClick,
  studentName,
  hubType,
  cefrLevel,
  goal,
}: ClassCardProps) => (
  <Card className="overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-700/50 shadow-md hover:shadow-lg transition-all">
    <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/50 dark:via-pink-900/50 dark:to-blue-900/50 p-4 border-b border-purple-200/50">
      <h3 className="font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">📚 {title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <Clock className="h-4 w-4 text-purple-500" />
        <p className="text-sm text-purple-600 dark:text-purple-400">⏰ {time}</p>
      </div>
    </div>
    <CardContent className="p-4 space-y-3">
      {studentName && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-medium text-foreground truncate">{studentName}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hubType && (
              <Badge variant="outline" className={`text-xs ${HUB_CHIP[hubType] ?? ''}`}>
                {HUB_LABEL[hubType] ?? hubType}
              </Badge>
            )}
            {cefrLevel && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                {cefrLevel}
              </Badge>
            )}
          </div>
          {goal && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{goal}</span>
            </div>
          )}
        </div>
      )}
      {!studentName && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-500" />
          <p className="text-sm text-purple-700 dark:text-purple-300">👥 {students} students</p>
        </div>
      )}
      <Button className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white shadow-md" size="sm" onClick={onButtonClick}>
        {buttonText} ✨
      </Button>
    </CardContent>
  </Card>
);
