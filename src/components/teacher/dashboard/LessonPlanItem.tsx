
import { Button } from "@/components/ui/button";
import { Eye, PlusCircle } from "lucide-react";

interface LessonPlanItemProps {
  title: string;
  subject: string;
  grade: string;
  lastModified: string;
  onView: () => void;
  onUse: () => void;
}

export const LessonPlanItem = ({ title, subject, grade, lastModified, onView, onUse }: LessonPlanItemProps) => (
  <div className="flex items-center justify-between py-3 border-b">
    <div>
      <h3 className="font-medium">{title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{subject}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{grade}</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <p className="text-sm text-muted-foreground">Modified: {lastModified}</p>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onView}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onUse}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);
