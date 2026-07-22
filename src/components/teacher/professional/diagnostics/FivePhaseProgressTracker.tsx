import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Circle, Music, Eye, Mic, Brain, Wind } from 'lucide-react';

export interface PracticeLayerScore {
  phonics?: number;
  vocabulary?: number;
  grammar?: number;
}

export interface PhaseProgress {
  phase: 'warmup' | 'prime' | 'mimic' | 'produce' | 'cooloff';
  status: 'completed' | 'needs-work' | 'not-started';
  score?: number;
  notes?: string;
  layerScores?: PracticeLayerScore;
}

interface FivePhaseProgressTrackerProps {
  phases: PhaseProgress[];
  studentName?: string;
  unitTitle?: string;
}

const PHASE_CONFIG = {
  warmup: { label: 'Warm-Up', icon: Music, color: '#F59E0B', bgColor: 'bg-amber-500' },
  prime: { label: 'Prime', icon: Eye, color: '#3B82F6', bgColor: 'bg-blue-500' },
  mimic: { label: 'Mimic', icon: Mic, color: '#10B981', bgColor: 'bg-emerald-500' },
  produce: { label: 'Produce', icon: Brain, color: '#8B5CF6', bgColor: 'bg-violet-500' },
  cooloff: { label: 'Cool-Off', icon: Wind, color: '#06B6D4', bgColor: 'bg-cyan-500' },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />;
    case 'needs-work': return <AlertCircle className="h-4 w-4 text-[#EF5350]" />;
    default: return <Circle className="h-4 w-4 text-muted-foreground/40" />;
  }
};

const LayerSubBar: React.FC<{ label: string; score?: number; color: string }> = ({ label, score, color }) => {
  if (score === undefined) return null;
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[8px] font-medium text-muted-foreground w-12 text-right shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className={`text-[8px] font-bold w-8 ${
        score >= 80 ? 'text-[#2E7D32]' : score >= 50 ? 'text-amber-600' : 'text-[#EF5350]'
      }`}>
        {score}%
      </span>
    </div>
  );
};

export const FivePhaseProgressTracker: React.FC<FivePhaseProgressTrackerProps> = ({
  phases,
  studentName,
  unitTitle,
}) => {
  const breakingPoint = phases.find(p => p.status === 'needs-work');

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#6B21A8]">
          📐 5-Phase Mastery Sequence
        </CardTitle>
        {(studentName || unitTitle) && (
          <p className="text-xs text-muted-foreground">
            {studentName && <span>{studentName}</span>}
            {studentName && unitTitle && <span> — </span>}
            {unitTitle && <span>{unitTitle}</span>}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Phase pipeline */}
        <div className="flex items-center gap-1 mb-4">
          {phases.map((phase, i) => {
            const config = PHASE_CONFIG[phase.phase];
            const Icon = config.icon;
            const isActive = phase.status !== 'not-started';
            const isFailed = phase.status === 'needs-work';
            const hasLayers = phase.layerScores && (phase.phase === 'mimic' || phase.phase === 'produce');

            return (
              <React.Fragment key={phase.phase}>
                <div
                  className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    isFailed
                      ? 'border-[#EF5350]/30 bg-[#EF5350]/5'
                      : isActive
                      ? 'border-[#2E7D32]/20 bg-[#2E7D32]/[0.03]'
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isActive ? config.bgColor : 'bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground">{config.label}</span>
                  {getStatusIcon(phase.status)}
                  {phase.score !== undefined && (
                    <span className={`text-[10px] font-semibold ${
                      phase.score >= 85 ? 'text-[#2E7D32]' : phase.score >= 50 ? 'text-amber-600' : 'text-[#EF5350]'
                    }`}>
                      {phase.score}%
                    </span>
                  )}

                  {/* Practice Layer Sub-Bars */}
                  {hasLayers && phase.layerScores && (
                    <div className="w-full space-y-0.5 mt-1">
                      <LayerSubBar label="Phonics" score={phase.layerScores.phonics} color="#10B981" />
                      <LayerSubBar label="Vocab" score={phase.layerScores.vocabulary} color="#3B82F6" />
                      <LayerSubBar label="Grammar" score={phase.layerScores.grammar} color="#8B5CF6" />
                    </div>
                  )}
                </div>
                {i < phases.length - 1 && (
                  <div className={`w-4 h-0.5 shrink-0 ${
                    phase.status === 'completed' ? 'bg-[#2E7D32]' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Breaking point indicator */}
        {breakingPoint && (
          <div className="p-3 rounded-lg border border-[#EF5350]/15 bg-[#EF5350]/[0.03]">
            <p className="text-xs font-medium text-[#EF5350]">
              ⛓️ Learning chain broke at: <strong>{PHASE_CONFIG[breakingPoint.phase].label}</strong>
            </p>
            {breakingPoint.notes && (
              <p className="text-[10px] text-[#EF5350]/80 mt-1">{breakingPoint.notes}</p>
            )}
            {breakingPoint.layerScores && (
              <div className="mt-2 space-y-0.5">
                {breakingPoint.layerScores.phonics !== undefined && breakingPoint.layerScores.phonics < 70 && (
                  <p className="text-[10px] text-[#EF5350]/70">🎤 Phonics: {breakingPoint.layerScores.phonics}% — needs drill repetition</p>
                )}
                {breakingPoint.layerScores.vocabulary !== undefined && breakingPoint.layerScores.vocabulary < 70 && (
                  <p className="text-[10px] text-[#EF5350]/70">📖 Vocabulary: {breakingPoint.layerScores.vocabulary}% — needs visual reinforcement</p>
                )}
                {breakingPoint.layerScores.grammar !== undefined && breakingPoint.layerScores.grammar < 70 && (
                  <p className="text-[10px] text-[#EF5350]/70">📝 Grammar: {breakingPoint.layerScores.grammar}% — needs block practice</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
