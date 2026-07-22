import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SkillHexagon } from './SkillHexagon';
import { MapOfSounds } from '@/components/student/curriculum/MapOfSounds';
import {
  User,
  Search,
  BookOpen,
  Star,
  ChevronRight,
  Loader2,
  GraduationCap,
} from 'lucide-react';

interface StudentEntityDashboardProps {
  teacherId: string;
}

export const StudentEntityDashboard: React.FC<StudentEntityDashboardProps> = ({ teacherId }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['entity-students', teacherId],
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

  // Fetch selected student's skill data
  const { data: studentData } = useQuery({
    queryKey: ['student-entity', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;

      // Latest milestone for skill scores
      const { data: milestones } = await supabase
        .from('mastery_milestone_results')
        .select('score, passed, skill_scores, weakest_skill, completed_at, unit_id')
        .eq('student_id', selectedStudentId)
        .order('completed_at', { ascending: false })
        .limit(5);

      // Vocabulary progress
      const { data: vocab } = await supabase
        .from('student_vocabulary_progress')
        .select('word, mastery_level, unit_id, first_seen_at')
        .eq('student_id', selectedStudentId)
        .order('first_seen_at', { ascending: false });

      // Phonics progress
      const { data: phonics } = await supabase
        .from('student_phonics_progress')
        .select('phoneme, mastery_level')
        .eq('student_id', selectedStudentId);

      // Build skill hexagon from latest milestone
      const latest = milestones?.[0];
      const skillScores = (latest?.skill_scores as Record<string, number>) || {};
      const skills = [
        { label: 'Reading', value: Math.round(Number(skillScores.reading || 0)) },
        { label: 'Writing', value: Math.round(Number(skillScores.writing || 0)) },
        { label: 'Listening', value: Math.round(Number(skillScores.listening || 0)) },
        { label: 'Speaking', value: Math.round(Number(skillScores.speaking || 0)) },
        { label: 'Grammar', value: Math.round(Number(skillScores.grammar || 0)) },
        { label: 'Phonics', value: Math.round(Number(skillScores.phonics || 0)) },
      ];

      const masteredWords = (vocab || []).filter(v => v.mastery_level === 'mastered');
      const recognizedWords = (vocab || []).filter(v => v.mastery_level !== 'mastered');
      const masteredPhonemes = (phonics || []).filter(p => p.mastery_level === 'mastered').length;
      const totalPhonemes = (phonics || []).length;

      return {
        skills,
        milestones: milestones || [],
        masteredWords,
        recognizedWords,
        masteredPhonemes,
        totalPhonemes,
        allVocab: vocab || [],
      };
    },
    enabled: !!selectedStudentId,
  });

  const filteredStudents = students.filter((s: any) =>
    (s.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = students.find((s: any) => s.user_id === selectedStudentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B21A8] font-inter tracking-tight">
          Diagnostic Lab
        </h1>
        <p className="text-sm text-[#9E9E9E] mt-1">
          Student entity view — skills, vocabulary, and phonics mastery
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

      {selectedStudentId && studentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Skill Hexagon */}
          <div className="lg:col-span-1 space-y-6">
            <SkillHexagon
              skills={studentData.skills}
              studentName={selectedStudent?.display_name}
            />

            {/* Phonics snapshot */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#6B21A8]">
                  Phonics Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2E7D32] transition-all"
                        style={{
                          width: `${
                            studentData.totalPhonemes > 0
                              ? (studentData.masteredPhonemes / studentData.totalPhonemes) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {studentData.masteredPhonemes}/{studentData.totalPhonemes}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {studentData.masteredPhonemes} phonemes mastered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Vocabulary Vault + Phonics Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vocabulary Vault */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Vocabulary Vault
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {studentData.allVocab.length} total words
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mastered */}
                  <div className="p-4 rounded-lg border border-[#2E7D32]/15 bg-[#2E7D32]/3">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-[#2E7D32]" />
                      <span className="text-sm font-medium text-[#2E7D32]">
                        Mastered ({studentData.masteredWords.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {studentData.masteredWords.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No mastered words yet</p>
                      ) : (
                        studentData.masteredWords.map((w: any, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-[#2E7D32]/30 text-[#2E7D32]"
                          >
                            {w.word}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recognized */}
                  <div className="p-4 rounded-lg border border-[#6B21A8]/10 bg-[#6B21A8]/3">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-[#6B21A8]" />
                      <span className="text-sm font-medium text-[#6B21A8]">
                        Recognized ({studentData.recognizedWords.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {studentData.recognizedWords.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No words yet</p>
                      ) : (
                        studentData.recognizedWords.map((w: any, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-[#6B21A8]/20 text-[#6B21A8]/70"
                          >
                            {w.word}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phonics Mastery Grid (Map of Sounds) */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#6B21A8]">
                  Phonics Mastery Grid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapOfSounds hub="academy" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
