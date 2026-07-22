import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PhonemeScore {
  phoneme: string;
  masteryLevel: string;
  accuracy: number; // 0-100
  attempts: number;
}

interface PhoneticMasteryMatrixProps {
  phonemeScores: PhonemeScore[];
  studentName?: string;
}

const getBarColor = (accuracy: number) => {
  if (accuracy >= 85) return 'bg-[#2E7D32]';
  if (accuracy >= 70) return 'bg-[#4CAF50]';
  if (accuracy >= 50) return 'bg-amber-500';
  return 'bg-[#EF5350]';
};

const getStatusLabel = (accuracy: number) => {
  if (accuracy >= 85) return 'Mastered';
  if (accuracy >= 70) return 'Proficient';
  if (accuracy >= 50) return 'Developing';
  return 'Needs Recovery';
};

const getStatusColor = (accuracy: number) => {
  if (accuracy >= 85) return 'border-[#2E7D32]/30 bg-[#2E7D32]/5 text-[#2E7D32]';
  if (accuracy >= 70) return 'border-[#4CAF50]/30 bg-[#4CAF50]/5 text-[#4CAF50]';
  if (accuracy >= 50) return 'border-amber-500/30 bg-amber-500/5 text-amber-600';
  return 'border-[#EF5350]/30 bg-[#EF5350]/5 text-[#EF5350]';
};

export const PhoneticMasteryMatrix: React.FC<PhoneticMasteryMatrixProps> = ({
  phonemeScores,
  studentName,
}) => {
  const sorted = [...phonemeScores].sort((a, b) => a.accuracy - b.accuracy);
  const weakPhonemes = sorted.filter(p => p.accuracy < 70);
  const avgAccuracy = phonemeScores.length > 0
    ? Math.round(phonemeScores.reduce((s, p) => s + p.accuracy, 0) / phonemeScores.length)
    : 0;

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
            🎯 Phonetic Accuracy Pulse
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Avg:</span>
            <Badge variant="outline" className={getStatusColor(avgAccuracy)}>
              {avgAccuracy}%
            </Badge>
          </div>
        </div>
        {studentName && (
          <p className="text-xs text-muted-foreground mt-1">{studentName}'s phoneme accuracy breakdown</p>
        )}
      </CardHeader>
      <CardContent>
        {phonemeScores.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No phonetic data available yet</p>
        ) : (
          <TooltipProvider>
            <div className="space-y-2">
              {sorted.map((phoneme) => (
                <Tooltip key={phoneme.phoneme}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 group cursor-default">
                      <span className="w-10 text-sm font-mono font-semibold text-[#6B21A8] text-right shrink-0">
                        /{phoneme.phoneme}/
                      </span>
                      <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden relative">
                        <div
                          className={`h-full rounded-md transition-all duration-500 ${getBarColor(phoneme.accuracy)}`}
                          style={{ width: `${phoneme.accuracy}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium text-foreground/70">
                          {phoneme.accuracy}%
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] w-20 justify-center shrink-0 ${getStatusColor(phoneme.accuracy)}`}
                      >
                        {getStatusLabel(phoneme.accuracy)}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      <strong>/{phoneme.phoneme}/</strong> — {phoneme.attempts} attempts, {phoneme.masteryLevel}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}

        {weakPhonemes.length > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-[#EF5350]/15 bg-[#EF5350]/3">
            <p className="text-xs font-medium text-[#EF5350] mb-1.5">
              ⚠ Areas Requiring Recovery ({weakPhonemes.length} sounds)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {weakPhonemes.map(p => (
                <Badge key={p.phoneme} variant="outline" className="text-[10px] border-[#EF5350]/20 text-[#EF5350]">
                  /{p.phoneme}/ — {p.accuracy}%
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
