import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign } from "lucide-react";
import { UnitMasteryReportButton } from "@/components/teacher/reports/UnitMasteryReportButton";
import { TeacherVocabInsightCard } from "@/components/teacher/TeacherVocabInsightCard";
import TeacherVocabGamesReportCard from "@/components/teacher/TeacherVocabGamesReportCard";
import TeacherQuestReviewCard from "@/components/teacher/TeacherQuestReviewCard";
import TeacherUnitReportsBrowser from "@/components/teacher/TeacherUnitReportsBrowser";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";


interface DashboardTabProps {
  teacherName: string;
  teacherId: string;
}

export const DashboardTab = ({ teacherName, teacherId }: DashboardTabProps) => {
  const { students } = useTeacherStudents();
  const rosterForReport = (students ?? []).map((s: any) => ({ id: s.id, name: s.name }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome, {teacherName}!</h2>
        <p className="text-muted-foreground">Manage your classes and students</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 DZD</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TeacherVocabInsightCard hub="academy" />
        <TeacherVocabInsightCard hub="success" />
        <TeacherVocabInsightCard hub="playground" />
      </div>

      {rosterForReport.length > 0 && (
        <TeacherVocabGamesReportCard students={rosterForReport} />
      )}

      {rosterForReport.length > 0 && (
        <TeacherQuestReviewCard students={rosterForReport} />
      )}

      {rosterForReport.length > 0 && (
        <TeacherUnitReportsBrowser students={rosterForReport} />
      )}





      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">📄 Unit Mastery Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Generate Professional Flat 2.0 diagnostic reports for completed units.
          </p>
          <UnitMasteryReportButton
            studentName="Noah Rodriguez"
            unitName="Animals — Island 1"
            score={95}
          />
        </CardContent>
      </Card>
    </div>
  );
};
