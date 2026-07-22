import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { useTeacherAnalytics } from "@/hooks/useTeacherAnalytics";
import { EngagementMetrics } from "./analytics/EngagementMetrics";
import { StudentProgressChart } from "./analytics/StudentProgressChart";
import { ClassOverview } from "./analytics/ClassOverview";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const ReportsTab = () => {
  const [levelFilter, setLevelFilter] = useState('all');
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { studentStats, classMetrics, sessionData, isLoading } = useTeacherAnalytics(user?.id);

  const filteredStudents = useMemo(() => {
    if (levelFilter === 'all') return studentStats;
    return studentStats.filter(s => s.cefr_level.toLowerCase() === levelFilter.toLowerCase());
  }, [studentStats, levelFilter]);

  const exportCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['Name', 'Email', 'CEFR Level', 'Lessons Completed', 'Avg Score', 'HW Completion %', 'Sessions', 'Last Active'];
    const rows = filteredStudents.map(s => [
      s.student_name, s.email, s.cefr_level, s.lessons_completed, s.avg_score,
      s.homework_completion_rate, s.total_sessions, s.last_active || 'N/A'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Exported ${filteredStudents.length} student records.` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="a1">A1</SelectItem>
              <SelectItem value="a2">A2</SelectItem>
              <SelectItem value="b1">B1</SelectItem>
              <SelectItem value="b2">B2</SelectItem>
              <SelectItem value="c1">C1</SelectItem>
              <SelectItem value="c2">C2</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV} disabled={!filteredStudents.length}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <EngagementMetrics metrics={classMetrics} upcoming={sessionData?.upcoming || 0} />
      <StudentProgressChart students={filteredStudents} />
      <ClassOverview students={filteredStudents} />
    </div>
  );
};
