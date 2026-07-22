
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";

export interface ClassInfo {
  id: string;
  title: string;
  teacher: string;
  time: string;
  students: number;
  color: string;
}

interface ClassCardProps {
  classInfo: ClassInfo;
  onJoin: (classId: string) => void;
}

export function ClassCard({ classInfo, onJoin }: ClassCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div 
        className="h-2"
        style={{ backgroundColor: classInfo.color }}
      />
      <CardHeader className="pb-2">
        <h3 className="text-lg font-bold">{classInfo.title}</h3>
        <p className="text-sm text-muted-foreground">Teacher: {classInfo.teacher}</p>
      </CardHeader>
      <CardContent className="space-y-1 pb-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-muted-foreground" />
          <span>{classInfo.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-muted-foreground" />
          <span>{classInfo.students} students</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onJoin(classInfo.id)} 
          className="w-full" 
          variant="default"
        >
          Join Class
        </Button>
      </CardFooter>
    </Card>
  );
}
