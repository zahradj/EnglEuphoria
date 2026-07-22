import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Send, Sparkles, Loader2, CheckCircle } from 'lucide-react';

interface DiagnosticReportGeneratorProps {
  teacherId: string;
}

export const DiagnosticReportGenerator: React.FC<DiagnosticReportGeneratorProps> = ({
  teacherId,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['report-students', teacherId],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('student_id')
        .eq('teacher_id', teacherId);
      const ids = [...new Set((bookings || []).map(b => b.student_id))];
      if (!ids.length) return [];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name, parent_email')
        .in('user_id', ids);
      return profiles || [];
    },
  });

  const selectedStudent = students.find((s: any) => s.user_id === selectedStudentId);

  const generateReport = async () => {
    if (!selectedStudentId) return;
    setGenerating(true);
    try {
      // Fetch diagnostic data
      const [phonicsRes, vocabRes, milestonesRes, profileRes] = await Promise.all([
        supabase.from('student_phonics_progress').select('phoneme, mastery_level').eq('student_id', selectedStudentId),
        supabase.from('student_vocabulary_progress').select('word, mastery_level').eq('student_id', selectedStudentId),
        supabase.from('mastery_milestone_results').select('score, passed, skill_scores, weakest_skill').eq('student_id', selectedStudentId).order('completed_at', { ascending: false }).limit(5),
        supabase.from('student_profiles').select('mistake_history').eq('user_id', selectedStudentId).single(),
      ]);

      const phonics = phonicsRes.data || [];
      const vocab = vocabRes.data || [];
      const milestones = milestonesRes.data || [];
      const mistakes = (profileRes.data?.mistake_history as any[]) || [];

      const mastered = phonics.filter((p: any) => p.mastery_level === 'mastered').length;
      const vocabMastered = vocab.filter((v: any) => v.mastery_level === 'mastered').length;
      const avgScore = milestones.length > 0
        ? Math.round(milestones.reduce((s: number, m: any) => s + Number(m.score), 0) / milestones.length)
        : 0;
      const weakSkills = milestones.filter((m: any) => m.weakest_skill).map((m: any) => m.weakest_skill);
      const teacherObs = mistakes.filter((m: any) => m.context?.startsWith('Teacher observation:'));

      // Generate AI summary
      const prompt = `Generate a professional parent-facing diagnostic report for ${selectedStudent?.display_name}:

Phonics: ${mastered}/${phonics.length} phonemes mastered
Vocabulary: ${vocabMastered}/${vocab.length} words mastered  
Average milestone score: ${avgScore}%
Weak areas: ${weakSkills.join(', ') || 'None identified'}
Teacher observations: ${teacherObs.map((t: any) => t.context).join('; ') || 'None recorded'}
Recent pronunciation mistakes: ${mistakes.slice(0, 5).map((m: any) => m.word).join(', ') || 'None'}

Format the report with:
1. "Progress Summary" — 2-3 sentences of positive progress
2. "Areas for Growth" — specific phonetic/vocabulary targets  
3. "Wizard's Prescription" — actionable home practice recommendations
4. "Next Steps" — what the next sessions will focus on

Use warm, professional language suitable for parents. No jargon.`;

      const { data, error } = await supabase.functions.invoke('ai-lesson-agent', {
        body: { action: 'generate', prompt, maxTokens: 500 },
      });

      if (error) throw error;
      setReportSummary(data?.content || data?.text || 'Report generation failed.');
    } catch (err) {
      console.error('Report generation error:', err);
      setReportSummary(
        `Progress Report for ${selectedStudent?.display_name}\n\n` +
        'Your child is making steady progress in their English learning journey. ' +
        'Phonetic accuracy and vocabulary retention are key focus areas for upcoming sessions.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const sendReport = async () => {
    if (!selectedStudent?.parent_email || !reportSummary) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          to: selectedStudent.parent_email,
          subject: `Engleuphoria Progress Report — ${selectedStudent.display_name}`,
          template: 'parent_report',
          data: {
            studentName: selectedStudent.display_name,
            reportContent: reportSummary,
          },
        },
      });

      if (error) throw error;
      toast.success('Report sent to parent successfully');
    } catch (err) {
      console.error('Send report error:', err);
      toast.error('Failed to send report');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Teacher-Parent Diagnostic Bridge
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Generate a hybrid report combining AI phonetic data with teacher observations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s: any) => (
              <SelectItem key={s.user_id} value={s.user_id}>
                {s.display_name || 'Unnamed'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedStudentId && (
          <>
            <Button
              onClick={generateReport}
              disabled={generating}
              className="w-full bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white gap-1.5"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Diagnostic Report</>
              )}
            </Button>

            {reportSummary && (
              <>
                <Textarea
                  value={reportSummary}
                  onChange={e => setReportSummary(e.target.value)}
                  className="min-h-[200px] text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {selectedStudent?.parent_email
                      ? `Will send to: ${selectedStudent.parent_email}`
                      : '⚠ No parent email on file'}
                  </p>
                  <Button
                    size="sm"
                    onClick={sendReport}
                    disabled={sending || !selectedStudent?.parent_email}
                    className="bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white gap-1"
                  >
                    {sending ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="h-3.5 w-3.5" /> Send to Parent</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
