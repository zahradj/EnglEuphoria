
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface ClassScheduleItemProps {
  title: string;
  day: string;
  time: string;
  students: number;
  onStart: () => void;
}

export const ClassScheduleItem = ({ title, day, time, students, onStart }: ClassScheduleItemProps) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{day}, {time}</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 text-sm">
        <Users className="h-4 w-4" />
        <span>{students}</span>
      </div>
      <Button size="sm" onClick={onStart}>Start</Button>
    </div>
  </div>
);
