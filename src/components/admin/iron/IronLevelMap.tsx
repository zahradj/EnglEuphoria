import React from 'react';
import { cn } from '@/lib/utils';
import { LEVEL_NAMES, IronLevel } from './types';
import { Check, Lock, ChevronRight } from 'lucide-react';

interface IronLevelMapProps {
  levels: IronLevel[];
  selectedLevel: number | null;
  onSelectLevel: (levelNumber: number) => void;
  generatedLevels: number[];
}

export const IronLevelMap: React.FC<IronLevelMapProps> = ({
  levels,
  selectedLevel,
  onSelectLevel,
  generatedLevels
}) => {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {[1, 2, 3, 4, 5].map((levelNum, index) => {
        const levelInfo = LEVEL_NAMES[levelNum];
        const isGenerated = generatedLevels.includes(levelNum);
        const isSelected = selectedLevel === levelNum;
        const levelData = levels.find(l => l.levelNumber === levelNum);

        return (
          <React.Fragment key={levelNum}>
            <button
              onClick={() => isGenerated && onSelectLevel(levelNum)}
              disabled={!isGenerated}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300',
                'min-w-[100px] border-2',
                isGenerated
                  ? isSelected
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted cursor-pointer'
                  : 'border-dashed border-muted-foreground/30 bg-muted/30 cursor-not-allowed opacity-60'
              )}
            >
              {/* Level Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                  isGenerated
                    ? `bg-gradient-to-br ${levelInfo.color} shadow-md`
                    : 'bg-muted'
                )}
              >
                {isGenerated ? levelInfo.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>

              {/* Level Name */}
              <div className="text-center">
                <p className={cn(
                  'text-xs font-medium',
                  isGenerated ? 'text-muted-foreground' : 'text-muted-foreground/50'
                )}>
                  Level {levelNum}
                </p>
                <p className={cn(
                  'font-bold',
                  isGenerated ? 'text-foreground' : 'text-muted-foreground/50'
                )}>
                  {levelInfo.name}
                </p>
              </div>

              {/* Generated checkmark */}
              {isGenerated && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Lesson count */}
              {levelData && (
                <span className="text-xs text-muted-foreground">
                  {levelData.lessons.length} lessons
                </span>
              )}
            </button>

            {/* Arrow between levels */}
            {index < 4 && (
              <ChevronRight className={cn(
                'w-5 h-5',
                isGenerated && generatedLevels.includes(levelNum + 1)
                  ? 'text-primary'
                  : 'text-muted-foreground/30'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
