
import { ClassroomStudents } from "@/components/classroom/ClassroomStudents";

interface StudentsTabProps {
  students: any[];
  onMessageStudent: (studentId: string) => void;
  onToggleSpotlight: (studentId: string) => void;
}

export function StudentsTab({ 
  students, 
  onMessageStudent, 
  onToggleSpotlight 
}: StudentsTabProps) {
  return (
    <ClassroomStudents
      students={students}
      onMessageStudent={onMessageStudent}
      onToggleSpotlight={onToggleSpotlight}
    />
  );
}
