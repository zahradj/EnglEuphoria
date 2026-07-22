import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WizardDiagnosticCardProps {
  studentName: string;
  weakPhonemes: { phoneme: string; accuracy: number }[];
  weakestSkill?: string;
  avgScore?: number;
  vocabMastered?: number;
  vocabTotal?: number;
}

export const WizardDiagnosticCard: React.FC<WizardDiagnosticCardProps> = ({
  studentName,
  weakPhonemes,
  weakestSkill,
  avgScore,
  vocabMastered = 0,
  vocabTotal = 0,
}) => {
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateDiagnosis = async () => {
    setLoading(true);
    try {
      const prompt = `You are the II Wizard, a pedagogical AI assistant for Engleuphoria. Generate a brief, professional diagnostic summary (3-4 sentences) for a parent/teacher report about this student:

Student: ${studentName}
${weakPhonemes.length > 0 ? `Weak phonemes (accuracy below 70%): ${weakPhonemes.map(p => `/${p.phoneme}/ at ${p.accuracy}%`).join(', ')}` : 'All phonemes are at proficient level.'}
${weakestSkill ? `Weakest skill area: ${weakestSkill}` : ''}
${avgScore ? `Average milestone score: ${avgScore}%` : ''}
Vocabulary: ${vocabMastered}/${vocabTotal} words mastered.

Focus on:
1. What the student is doing well
2. The specific phonetic challenge and WHY (tongue position, mouth shape)
3. A concrete recommendation for practice

Use a warm, professional tone. Do not use jargon.`;

      const { data, error } = await supabase.functions.invoke('ai-lesson-agent', {
        body: {
          action: 'generate',
          prompt,
          maxTokens: 300,
        },
      });

      if (error) throw error;
      setDiagnosis(data?.content || data?.text || 'Unable to generate diagnosis at this time.');
    } catch (err) {
      console.error('Wizard diagnosis error:', err);
      // Fallback to deterministic summary
      const weakList = weakPhonemes.map(p => `/${p.phoneme}/`).join(', ');
      setDiagnosis(
        `${studentName} is making steady progress with ${vocabMastered} words mastered. ` +
        (weakPhonemes.length > 0
          ? `The primary area for improvement is phonetic accuracy for the sounds ${weakList}. These sounds require focused practice on tongue placement and airflow. `
          : 'All phoneme targets are at proficient level. ') +
        (weakestSkill ? `The weakest skill area is ${weakestSkill}, which will be targeted in upcoming sessions.` : '')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-[#6B21A8]/10 bg-gradient-to-br from-[#6B21A8]/[0.02] to-transparent shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6B21A8]" />
          II Wizard's Perspective
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!diagnosis && !loading && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-3">
              The II Wizard will analyze {studentName}'s diagnostic data and provide a professional summary.
            </p>
            <Button
              size="sm"
              onClick={generateDiagnosis}
              className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Diagnosis
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-4 w-4 animate-spin text-[#6B21A8]" />
            <span className="text-xs text-muted-foreground">Wizard is analyzing...</span>
          </div>
        )}

        {diagnosis && !loading && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white border border-[#6B21A8]/10">
              <p className="text-sm text-foreground leading-relaxed">{diagnosis}</p>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] border-[#6B21A8]/20 text-[#6B21A8]">
                Wizard's Prescription
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateDiagnosis}
                className="h-7 text-xs gap-1 text-muted-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
