import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhonemeCard } from './PhonemeCard';
import { useStudentPhonicsProgress } from '@/hooks/useStudentPhonicsProgress';
import { PHONEME_MAP, CATEGORY_LABELS, MasteryLevel } from '@/data/phonemeMap';
import { Volume2, Loader2, Sun, Moon } from 'lucide-react';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { cn } from '@/lib/utils';

interface MapOfSoundsProps {
  hub?: 'academy' | 'playground' | 'professional';
}

export const MapOfSounds: React.FC<MapOfSoundsProps> = ({ hub = 'academy' }) => {
  const { data: progress = [], isLoading } = useStudentPhonicsProgress();
  const { isDaytime } = useTimeOfDay();

  const progressMap = new Map<string, MasteryLevel>();
  progress.forEach((p) => progressMap.set(p.phoneme, p.mastery_level as MasteryLevel));

  const getMastery = (symbol: string): MasteryLevel =>
    progressMap.get(symbol) || 'unseen';

  const totalPhonemes = PHONEME_MAP.length;
  const masteredCount = progress.filter((p) => p.mastery_level === 'mastered').length;
  const progressPercent = totalPhonemes > 0 ? Math.round((masteredCount / totalPhonemes) * 100) : 0;

  const grouped = {
    short_vowel: PHONEME_MAP.filter((p) => p.category === 'short_vowel'),
    long_vowel: PHONEME_MAP.filter((p) => p.category === 'long_vowel'),
    consonant: PHONEME_MAP.filter((p) => p.category === 'consonant'),
    digraph: PHONEME_MAP.filter((p) => p.category === 'digraph'),
  };

  // Hub-aware palette
  const isNight = !isDaytime;
  const isPlayground = hub === 'playground';

  const palette = {
    cardBg: isNight
      ? 'bg-gradient-to-b from-indigo-950 to-slate-900 border-indigo-500/20'
      : isPlayground
        ? 'bg-white/80 border-sky-200/50'
        : 'bg-white border-slate-200',
    title: isNight ? 'text-indigo-100' : isPlayground ? 'text-sky-800' : 'text-[#6B21A8]',
    icon: isNight ? 'text-indigo-400' : isPlayground ? 'text-sky-500' : 'text-[#6B21A8]',
    sectionTitle: isNight ? 'text-indigo-200' : isPlayground ? 'text-sky-700' : 'text-slate-700',
    progressTrack: isNight ? 'bg-indigo-800/40' : isPlayground ? 'bg-sky-100' : 'bg-slate-100',
    progressBar: isNight
      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
      : isPlayground
        ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
        : 'bg-[#4CAF50]',
    muted: isNight ? 'text-indigo-300' : 'text-slate-500',
    legendBorder: isNight ? 'border-indigo-700/50' : 'border-slate-200',
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden transition-colors duration-500 shadow-sm', palette.cardBg)}
      style={{ borderRadius: isPlayground ? '24px' : '8px' }}
    >
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2 text-base font-semibold transition-colors duration-500', palette.title)}>
          <Volume2 className={cn('h-4 w-4', palette.icon)} />
          {isNight ? '✨ Constellation of Sounds' : 'Map of Sounds'}
          <span className="ml-auto">
            {isDaytime ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-300" />}
          </span>
        </CardTitle>
        <div className="space-y-1.5 mt-2">
          <div className={cn('flex justify-between text-sm', palette.muted)}>
            <span>{masteredCount} of {totalPhonemes} sounds mastered</span>
            <span>{progressPercent}%</span>
          </div>
          <div className={cn('h-2 rounded-full overflow-hidden', palette.progressTrack)}>
            <div
              className={cn('h-full rounded-full transition-all duration-700', palette.progressBar)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => (
          <div key={category}>
            <h3 className={cn('text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-500', palette.sectionTitle)}>
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5">
              {grouped[category].map((phoneme) => {
                const mastery = getMastery(phoneme.symbol);
                return (
                  <div
                    key={phoneme.symbol}
                    className={cn(
                      'transition-all duration-500',
                      isNight && mastery === 'mastered' && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    )}
                  >
                    <PhonemeCard phoneme={phoneme} mastery={mastery} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className={cn(
          'flex flex-wrap gap-3 pt-3 border-t text-xs',
          palette.legendBorder, palette.muted
        )}>
          <span className="flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded border', isNight ? 'bg-indigo-900/50 border-indigo-700' : 'bg-slate-50 border-slate-300')} />
            Unseen
          </span>
          <span className="flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded border', isNight ? 'bg-blue-900/40 border-blue-600' : 'bg-blue-50 border-blue-300')} />
            Introduced
          </span>
          <span className="flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded border', isNight ? 'bg-slate-800/50 border-slate-500' : 'bg-slate-100 border-slate-400')} />
            Practiced
          </span>
          <span className="flex items-center gap-1">
            <span className={cn(
              'w-3 h-3 rounded border',
              isNight
                ? 'bg-amber-900/40 border-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                : 'bg-amber-100 border-amber-400'
            )} />
            ⭐ Mastered
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
