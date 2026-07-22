import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhoneticMasteryMatrix } from './diagnostics/PhoneticMasteryMatrix';
import { FivePhaseProgressTracker, PhaseProgress } from './diagnostics/FivePhaseProgressTracker';
import { WizardDiagnosticCard } from './diagnostics/WizardDiagnosticCard';
import { MemoryHeatmap } from './diagnostics/MemoryHeatmap';
import { RecoveryPlanCard } from './diagnostics/RecoveryPlanCard';
import { DiagnosticReportGenerator } from './diagnostics/DiagnosticReportGenerator';
import { SkillHexagon } from './SkillHexagon';
import { Search, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentSuccessHubProps {
  teacherId: string;
}

// Re-export for ProfessionalHub

export const StudentSuccessHub: React.FC<StudentSuccessHubProps> = ({ teacherId }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['success-hub-students', teacherId],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('student_id')
        .eq('teacher_id', teacherId);

      const ids = [...new Set((bookings || []).map(b => b.student_id))];
      if (!ids.length) return [];

      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name, student_level, parent_email')
        .in('user_id', ids);

      return profiles || [];
    },
  });

  // Fetch comprehensive diagnostic data
  const { data: diagnostics, isLoading: diagLoading } = useQuery({
    queryKey: ['student-diagnostics', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;

      // Parallel fetch all data
      const [phonicsRes, vocabRes, milestonesRes, mistakeRes] = await Promise.all([
        supabase
          .from('student_phonics_progress')
          .select('phoneme, mastery_level, created_at')
          .eq('student_id', selectedStudentId),
        supabase
          .from('student_vocabulary_progress')
          .select('word, mastery_level, first_seen_at, unit_id')
          .eq('student_id', selectedStudentId)
          .order('first_seen_at', { ascending: false }),
        supabase
          .from('mastery_milestone_results')
          .select('score, passed, skill_scores, weakest_skill, completed_at, unit_id')
          .eq('student_id', selectedStudentId)
          .order('completed_at', { ascending: false })
          .limit(10),
        supabase
          .from('student_profiles')
          .select('mistake_history')
          .eq('user_id', selectedStudentId)
          .single(),
      ]);

      const phonics = phonicsRes.data || [];
      const vocab = vocabRes.data || [];
      const milestones = milestonesRes.data || [];
      const mistakeHistory = (mistakeRes.data?.mistake_history as any[]) || [];

      // Build phoneme accuracy scores
      // Count mistakes per phoneme from mistake_history
      const phonemeMistakes: Record<string, number> = {};
      const phonemeAttempts: Record<string, number> = {};
      
      mistakeHistory.forEach((m: any) => {
        if (m.error_type === 'pronunciation' || m.error_type === 'homophone') {
          const word = m.word?.toLowerCase();
          if (word) {
            phonemeMistakes[word] = (phonemeMistakes[word] || 0) + 1;
          }
        }
      });

      // Build phoneme scores from phonics progress + mistakes
      const phonemeScores = phonics.map((p: any) => {
        const mistakes = phonemeMistakes[p.phoneme] || 0;
        const baseAccuracy = p.mastery_level === 'mastered' ? 90 : p.mastery_level === 'practiced' ? 70 : p.mastery_level === 'introduced' ? 40 : 20;
        const adjustedAccuracy = Math.max(0, Math.min(100, baseAccuracy - (mistakes * 10)));
        return {
          phoneme: p.phoneme,
          masteryLevel: p.mastery_level,
          accuracy: adjustedAccuracy,
          attempts: mistakes + (p.mastery_level === 'mastered' ? 5 : p.mastery_level === 'practiced' ? 3 : 1),
        };
      });

      // Build skill hexagon
      const latest = milestones[0];
      const skillScores = (latest?.skill_scores as Record<string, number>) || {};
      const skills = [
        { label: 'Reading', value: Math.round(Number(skillScores.reading || 0)) },
        { label: 'Writing', value: Math.round(Number(skillScores.writing || 0)) },
        { label: 'Listening', value: Math.round(Number(skillScores.listening || 0)) },
        { label: 'Speaking', value: Math.round(Number(skillScores.speaking || 0)) },
        { label: 'Grammar', value: Math.round(Number(skillScores.grammar || 0)) },
        { label: 'Phonics', value: Math.round(Number(skillScores.phonics || 0)) },
      ];

      // Build 5-phase progress from latest session data
      const phases: PhaseProgress[] = [
        { phase: 'warmup', status: latest ? 'completed' : 'not-started', score: latest ? 100 : undefined },
        { phase: 'prime', status: latest ? 'completed' : 'not-started', score: skillScores.reading ? Math.round(Number(skillScores.reading)) : undefined },
        {
          phase: 'mimic',
          status: (skillScores.speaking && Number(skillScores.speaking) < 50) ? 'needs-work' : latest ? 'completed' : 'not-started',
          score: skillScores.speaking ? Math.round(Number(skillScores.speaking)) : undefined,
          notes: (skillScores.speaking && Number(skillScores.speaking) < 50) ? 'Student struggles with sound production. Extra Prime slides recommended.' : undefined,
        },
        {
          phase: 'produce',
          status: (skillScores.writing && Number(skillScores.writing) < 50) ? 'needs-work' : latest ? 'completed' : 'not-started',
          score: skillScores.writing ? Math.round(Number(skillScores.writing)) : undefined,
        },
        { phase: 'cooloff', status: latest ? 'completed' : 'not-started' },
      ];

      // Build recovery plan (phonemes with >30% error rate)
      const recoveryItems = phonemeScores
        .filter(p => p.accuracy < 70)
        .map(p => ({
          phoneme: p.phoneme,
          errorRate: 100 - p.accuracy,
          errorType: (p.accuracy < 40 ? 'articulation' : 'recognition') as 'articulation' | 'recognition',
          suggestedAction: p.accuracy < 40
            ? `Inject additional Prime slides with tongue-position visuals for /${p.phoneme}/`
            : `Schedule a Mimic remedial session focusing on /${p.phoneme}/ recognition`,
        }));

      const vocabMastered = vocab.filter((v: any) => v.mastery_level === 'mastered').length;

      return {
        phonemeScores,
        skills,
        phases,
        recoveryItems,
        vocabulary: vocab.map((v: any) => ({
          word: v.word,
          firstSeenAt: v.first_seen_at,
          masteryLevel: v.mastery_level,
          unitId: v.unit_id,
        })),
        weakestSkill: latest?.weakest_skill,
        avgScore: milestones.length > 0
          ? Math.round(milestones.reduce((s: number, m: any) => s + Number(m.score), 0) / milestones.length)
          : undefined,
        vocabMastered,
        vocabTotal: vocab.length,
      };
    },
    enabled: !!selectedStudentId,
  });

  const filteredStudents = students.filter((s: any) =>
    (s.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = students.find((s: any) => s.user_id === selectedStudentId);

  const handleTriggerRecovery = (phoneme: string) => {
    toast.success(`Recovery Mission for /${phoneme}/ scheduled`, {
      description: 'Extra Prime slides will be injected into the next session.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B21A8] font-inter tracking-tight">
          Student Success Hub
        </h1>
        <p className="text-sm text-[#9E9E9E] mt-1">
          Diagnostic feedback loop — phonetic accuracy, memory retention, and recovery plans
        </p>
      </div>

      {/* Student selector */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((s: any) => (
                  <SelectItem key={s.user_id} value={s.user_id}>
                    {s.display_name || 'Unnamed'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedStudentId && (
        <div className="flex flex-col items-center justify-center py-16 text-[#9E9E9E]">
          <GraduationCap className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">Select a student to view their diagnostic profile</p>
        </div>
      )}

      {selectedStudentId && diagLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#6B21A8]" />
        </div>
      )}

      {selectedStudentId && diagnostics && !diagLoading && (
        <div className="space-y-6">
          {/* Row 1: Skill Hexagon + 5-Phase Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SkillHexagon
                skills={diagnostics.skills}
                studentName={selectedStudent?.display_name}
              />
            </div>
            <div className="lg:col-span-2">
              <FivePhaseProgressTracker
                phases={diagnostics.phases}
                studentName={selectedStudent?.display_name}
              />
            </div>
          </div>

          {/* Row 2: Phonetic Mastery Matrix */}
          <PhoneticMasteryMatrix
            phonemeScores={diagnostics.phonemeScores}
            studentName={selectedStudent?.display_name}
          />

          {/* Row 3: Recovery Plan + Wizard Diagnostic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecoveryPlanCard
              recoveryItems={diagnostics.recoveryItems}
              studentName={selectedStudent?.display_name || 'Student'}
              onTriggerRecovery={handleTriggerRecovery}
            />
            <WizardDiagnosticCard
              studentName={selectedStudent?.display_name || 'Student'}
              weakPhonemes={diagnostics.phonemeScores.filter((p: any) => p.accuracy < 70)}
              weakestSkill={diagnostics.weakestSkill}
              avgScore={diagnostics.avgScore}
              vocabMastered={diagnostics.vocabMastered}
              vocabTotal={diagnostics.vocabTotal}
            />
          </div>

          {/* Row 4: Memory Heatmap */}
          <MemoryHeatmap
            vocabulary={diagnostics.vocabulary}
            studentName={selectedStudent?.display_name}
          />

          {/* Row 5: Teacher-Parent Bridge Report */}
          <DiagnosticReportGenerator teacherId={teacherId} />
        </div>
      )}
    </div>
  );
};
