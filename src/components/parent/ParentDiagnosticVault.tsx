import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Loader2, AlertTriangle, CheckCircle2,
  TrendingUp, Download, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 44 English phonemes for the heatmap
const PHONEMES = [
  '/p/', '/b/', '/t/', '/d/', '/k/', '/g/', '/f/', '/v/',
  '/θ/', '/ð/', '/s/', '/z/', '/ʃ/', '/ʒ/', '/h/', '/m/',
  '/n/', '/ŋ/', '/l/', '/r/', '/w/', '/j/', '/tʃ/', '/dʒ/',
  '/iː/', '/ɪ/', '/e/', '/æ/', '/ɑː/', '/ɒ/', '/ɔː/', '/ʊ/',
  '/uː/', '/ʌ/', '/ɜː/', '/ə/', '/eɪ/', '/aɪ/', '/ɔɪ/', '/aʊ/',
  '/əʊ/', '/ɪə/', '/eə/', '/ʊə/',
];

interface Props {
  studentId: string;
  studentName?: string;
}

export const ParentDiagnosticVault: React.FC<Props> = ({ studentId, studentName = 'Your Child' }) => {
  const { user } = useAuth();

  // Vocabulary progress
  const { data: vocabData = [], isLoading: loadingVocab } = useQuery({
    queryKey: ['parent-vocab', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_vocabulary_progress')
        .select('word, mastery_level, mastered, times_reviewed, phoneme_tag, unit_id')
        .eq('student_id', studentId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
  });

  // Phonics progress
  const { data: phonicsData = [], isLoading: loadingPhonics } = useQuery({
    queryKey: ['parent-phonics', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_phonics_progress')
        .select('phoneme, mastery_level');
      if (error) return [];
      return data || [];
    },
    enabled: !!studentId,
  });

  const totalWords = vocabData.length;
  const masteredWords = vocabData.filter((w: any) => w.mastered).length;
  const strugglingWords = vocabData.filter((w: any) => w.mastery_level <= 1 && w.times_reviewed >= 2);
  const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  // Build phonics map
  const phonicsMap: Record<string, string> = {};
  phonicsData.forEach((p: any) => {
    phonicsMap[p.phoneme] = p.mastery_level;
  });

  const getPhonemeColor = (phoneme: string) => {
    const level = phonicsMap[phoneme];
    if (level === 'mastered') return 'bg-emerald-500 text-white';
    if (level === 'practiced' || level === 'introduced') return 'bg-amber-400 text-amber-950';
    return 'bg-gray-200 dark:bg-gray-700 text-muted-foreground';
  };

  const getPhonemeLabel = (phoneme: string) => {
    const level = phonicsMap[phoneme];
    if (level === 'mastered') return 'Mastered';
    if (level === 'practiced') return 'Learning';
    if (level === 'introduced') return 'Started';
    return 'Not started';
  };

  const phonicsMastered = Object.values(phonicsMap).filter(l => l === 'mastered').length;
  const phonicsLearning = Object.values(phonicsMap).filter(l => l === 'practiced' || l === 'introduced').length;

  if (loadingVocab || loadingPhonics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#6B21A8]/20 bg-white dark:bg-gray-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-[#6B21A8] dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {studentName}'s Language Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
              <p className="text-2xl font-black text-[#6B21A8] dark:text-blue-300">{totalWords}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Words Learned</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-2xl font-black text-emerald-600">{masteredWords}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Mastered</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <p className="text-2xl font-black text-amber-600">{strugglingWords.length}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Needs Practice</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30">
              <p className="text-2xl font-black text-violet-600">{masteryRate}%</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Mastery Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Struggle Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Needs More Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strugglingWords.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>All words are progressing well!</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strugglingWords.map((word: any) => (
                <Badge
                  key={word.word}
                  variant="outline"
                  className="bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:border-amber-600 dark:text-amber-300 rounded-lg px-3 py-1"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {word.word}
                  <span className="ml-1 text-[10px] opacity-70">
                    ({word.times_reviewed}× reviewed)
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phonics Mastery Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#6B21A8]" />
            Phonics Mastery — 44 English Sounds
            <div className="flex gap-2 ml-auto text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Mastered ({phonicsMastered})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Learning ({phonicsLearning})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> Not started
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-11 gap-1.5">
            {PHONEMES.map((phoneme) => (
              <div
                key={phoneme}
                className={cn(
                  'flex items-center justify-center rounded-lg p-1.5 text-[10px] font-mono font-bold transition-colors',
                  getPhonemeColor(phoneme)
                )}
                title={`${phoneme}: ${getPhonemeLabel(phoneme)}`}
              >
                {phoneme}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* II Wizard Smart Advice */}
      <Card className="border-violet-200/40 bg-gradient-to-r from-violet-50/50 to-blue-50/50 dark:from-violet-950/10 dark:to-blue-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <Brain className="h-4 w-4" />
            🧙 Teacher's Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strugglingWords.length > 0 ? (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {studentName} is making excellent progress overall! However, the Wizard has noticed
              some difficulty with the word{strugglingWords.length > 1 ? 's' : ''}{' '}
              <strong>
                {strugglingWords.slice(0, 3).map((w: any) => `"${w.word}"`).join(', ')}
              </strong>.
              {strugglingWords[0]?.phoneme_tag && (
                <> The <strong>{strugglingWords[0].phoneme_tag}</strong> sound needs extra attention. </>
              )}
              We recommend practicing these words using the Playground Hub activities this evening.
            </p>
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {studentName} is doing wonderfully! All vocabulary words are progressing at a healthy rate.
              Keep up the great work with the daily missions! 🌟
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
