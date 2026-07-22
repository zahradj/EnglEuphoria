
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface StudentInteractionsProps {
  students: Array<{
    id: string;
    name: string;
    avatar: string;
    status: string;
    isCurrentUser: boolean;
  }>;
  onMessageStudent: (studentId: string) => void;
  onToggleSpotlight: (studentId: string) => void;
}

export function StudentInteractions({
  students,
  onMessageStudent,
  onToggleSpotlight
}: StudentInteractionsProps) {
  const { toast } = useToast();
  const { languageText } = useLanguage();

  const handleMessageStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    onMessageStudent(studentId);
    
    toast({
      title: `Messaging ${student?.name}`,
      description: "Private chat opened",
    });
  };

  const handleToggleSpotlight = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    onToggleSpotlight(studentId);
    
    toast({
      title: `Spotlighting ${student?.name}`,
      description: "Student is now in spotlight view",
    });
  };

  return null; // This is just a logic component, no UI needed
}
