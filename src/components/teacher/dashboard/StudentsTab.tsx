
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentItem } from "./StudentItem";
import { Filter, PlusCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudentsTabProps {
  onFilter: () => void;
  onAddStudent: () => void;
  onViewStudentDetails: (studentName: string) => void;
}

export const StudentsTab = ({ onFilter, onAddStudent, onViewStudentDetails }: StudentsTabProps) => {
  const { languageText } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/50 dark:via-indigo-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-700/50 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent">👥 {languageText.students}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-100/50 dark:text-purple-400 dark:border-purple-700" onClick={onFilter}>
            <Filter className="mr-2 h-4 w-4" />
            {languageText.filter}
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white shadow-md" onClick={onAddStudent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            ➕ {languageText.addStudent}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StudentItem
            name="Alex Johnson"
            level={languageText.intermediate}
            lastClass="2025-05-20"
            progress={78}
            onViewDetails={() => onViewStudentDetails("Alex Johnson")}
          />
          <StudentItem
            name="Maria Garcia"
            level={languageText.beginner}
            lastClass="2025-05-21"
            progress={45}
            onViewDetails={() => onViewStudentDetails("Maria Garcia")}
          />
          <StudentItem
            name="Li Wei"
            level={languageText.advanced}
            lastClass="2025-05-19"
            progress={92}
            onViewDetails={() => onViewStudentDetails("Li Wei")}
          />
          <StudentItem
            name="Sophia Ahmed"
            level={languageText.intermediate}
            lastClass="2025-05-21"
            progress={65}
            onViewDetails={() => onViewStudentDetails("Sophia Ahmed")}
          />
        </div>
      </CardContent>
    </Card>
  );
};
