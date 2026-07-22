import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Send, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnitMasteryReportProps {
  teacherId: string;
}

export const UnitMasteryReport: React.FC<UnitMasteryReportProps> = ({ teacherId }) => {
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [summary, setSummary] = useState('');
  const [teacherWin, setTeacherWin] = useState('');
  const [teacherWork, setTeacherWork] = useState('');
  const [homeActivity, setHomeActivity] = useState('');
  const [realWorldWin, setRealWorldWin] = useState('');

  // Fetch students assigned to teacher
  const { data: students = [] } = useQuery({
    queryKey: ['teacher-students-for-report', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_bookings')
        .select('student_id')
        .eq('teacher_id', teacherId);
      if (error) throw error;
      const uniqueIds = [...new Set((data || []).map((b: any) => b.student_id))];
      if (!uniqueIds.length) return [];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name, parent_email')
        .in('user_id', uniqueIds);
      return profiles || [];
    },
  });

  // Fetch completed milestones for selected student
  const { data: milestones = [] } = useQuery({
    queryKey: ['student-milestones', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const { data, error } = await supabase
        .from('mastery_milestone_results')
        .select('id, unit_id, score, passed, skill_scores, weakest_skill, completed_at')
        .eq('student_id', selectedStudentId)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedStudentId,
  });

  // Fetch unit details for milestones
  const { data: units = [] } = useQuery({
    queryKey: ['units-for-milestones', milestones.map((m: any) => m.unit_id)],
    queryFn: async () => {
      const unitIds = milestones.map((m: any) => m.unit_id);
      if (!unitIds.length) return [];
      const { data } = await supabase
        .from('curriculum_units')
        .select('id, title, cefr_level')
        .in('id', unitIds);
      return data || [];
    },
    enabled: milestones.length > 0,
  });

  // Selected milestone data
  const selectedMilestone = milestones.find((m: any) => m.unit_id === selectedUnitId);
  const selectedUnit = units.find((u: any) => u.id === selectedUnitId);
  const selectedStudent = students.find((s: any) => s.user_id === selectedStudentId);

  // Fetch vocabulary for the unit
  const { data: vocabData = [] } = useQuery({
    queryKey: ['report-vocab', selectedStudentId, selectedUnitId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_vocabulary_progress')
        .select('word, mastery_level')
        .eq('student_id', selectedStudentId)
        .eq('unit_id', selectedUnitId);
      return data || [];
    },
    enabled: !!selectedStudentId && !!selectedUnitId,
  });

  // AI summary generation
  const generateSummary = useMutation({
    mutationFn: async () => {
      const skillScores = selectedMilestone?.skill_scores as Record<string, number> | null;
      const prompt = `Generate a 2-3 sentence professional diagnostic summary for a parent about their child ${selectedStudent?.display_name || 'the student'}.
Unit: ${selectedUnit?.title || 'Unknown'}, Score: ${selectedMilestone?.score}%.
Skill scores: ${JSON.stringify(skillScores || {})}.
Vocabulary learned: ${vocabData.map((v: any) => v.word).join(', ')}.
Weakest skill: ${selectedMilestone?.weakest_skill || 'none'}.
Write in a warm, encouraging, professional tone.`;

      const { data, error } = await supabase.functions.invoke('curriculum-expert-agent', {
        body: {
          mode: 'generate_report_summary',
          prompt,
          ageGroup: '5-7',
          cefrLevel: selectedUnit?.cefr_level || 'A1',
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.summary) {
        setSummary(data.summary);
      } else if (typeof data === 'string') {
        setSummary(data);
      }
    },
    onError: () => {
      toast({ title: 'Could not generate summary', description: 'Please write one manually.', variant: 'destructive' });
    },
  });

  // Send report to parent
  const sendReport = useMutation({
    mutationFn: async () => {
      if (!selectedStudent?.parent_email) throw new Error('No parent email');
      const skillScoresRaw = selectedMilestone?.skill_scores as Record<string, number> | null;
      const skillScores = skillScoresRaw
        ? Object.entries(skillScoresRaw).map(([name, score]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            score: Math.round(Number(score)),
            status: Number(score) >= 90 ? 'mastered' : Number(score) >= 80 ? 'excellent' : Number(score) >= 60 ? 'developing' : 'needs_review',
            observation: summary || 'See detailed report.',
          }))
        : [];

      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'unit-mastery-report',
          recipientEmail: selectedStudent.parent_email,
          idempotencyKey: `teacher-report-${selectedMilestone?.id}-${Date.now()}`,
          templateData: {
            studentName: selectedStudent.display_name || 'Your child',
            unitName: selectedUnit?.title || 'Unit',
            overallScore: Math.round(Number(selectedMilestone?.score || 0)),
            phonicsSummary: '',
            vocabularyCount: vocabData.length,
            vocabularyWords: vocabData.map((v: any) => v.word),
            grammarPattern: '',
            realWorldWin,
            homeActivity,
            skillScores,
            teacherWin,
            teacherWork,
          },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: '✅ Report sent!', description: `Mastery report emailed to ${selectedStudent?.parent_email}` });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to send report', description: err.message, variant: 'destructive' });
    },
  });

  const skillScores = selectedMilestone?.skill_scores as Record<string, number> | null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Unit Mastery Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Student</label>
              <Select value={selectedStudentId} onValueChange={(v) => { setSelectedStudentId(v); setSelectedUnitId(''); }}>
                <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.user_id} value={s.user_id}>
                      {s.display_name || 'Unnamed Student'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Completed Unit</label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={!selectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
                <SelectContent>
                  {milestones.map((m: any) => {
                    const u = units.find((u: any) => u.id === m.unit_id);
                    return (
                      <SelectItem key={m.unit_id} value={m.unit_id}>
                        {u?.title || m.unit_id} — {Math.round(m.score)}%
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Preview */}
          {selectedMilestone && selectedUnit && (
            <div className="space-y-4 pt-4 border-t">
              {/* Score banner */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-primary">{Math.round(Number(selectedMilestone.score))}%</div>
                <div>
                  <p className="font-semibold text-foreground">{selectedUnit.title}</p>
                  <Badge variant={selectedMilestone.passed ? 'default' : 'destructive'} className="mt-1">
                    {selectedMilestone.passed ? '✅ Passed' : '❌ Needs Review'}
                  </Badge>
                </div>
              </div>

              {/* Skill breakdown */}
              {skillScores && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(skillScores).map(([skill, score]) => (
                    <div key={skill} className="p-3 rounded-lg border bg-card">
                      <p className="text-xs text-muted-foreground capitalize">{skill}</p>
                      <p className="text-lg font-bold text-foreground">{Math.round(Number(score))}%</p>
                      {Number(score) >= 80 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Vocabulary */}
              {vocabData.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium text-foreground mb-2">Vocabulary Learned ({vocabData.length} words)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vocabData.map((v: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{v.word}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Executive Summary</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSummary.mutate()}
                    disabled={generateSummary.isPending}
                  >
                    {generateSummary.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    AI Draft
                  </Button>
                </div>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Overall, the student has shown strong mastery of this unit..."
                  rows={3}
                />
              </div>

              {/* Teacher notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">🎉 The Win</label>
                  <Textarea value={teacherWin} onChange={(e) => setTeacherWin(e.target.value)} placeholder="What made you proud..." rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">📝 Next Focus</label>
                  <Textarea value={teacherWork} onChange={(e) => setTeacherWork(e.target.value)} placeholder="Area to continue developing..." rows={2} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">🌟 Real-World Win</label>
                <Textarea value={realWorldWin} onChange={(e) => setRealWorldWin(e.target.value)} placeholder='e.g. "They can now ask: What is it? in English!"' rows={2} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">🏠 Home Activity Mission</label>
                <Textarea value={homeActivity} onChange={(e) => setHomeActivity(e.target.value)} placeholder="Activity for parent and child to do together..." rows={2} />
              </div>

              {/* Send button */}
              <Button
                className="w-full"
                onClick={() => sendReport.mutate()}
                disabled={sendReport.isPending || !selectedStudent?.parent_email}
              >
                {sendReport.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {selectedStudent?.parent_email
                  ? `Approve & Send to ${selectedStudent.parent_email}`
                  : 'No parent email on file'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
