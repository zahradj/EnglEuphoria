import React from 'react';
import { Card } from '@/components/ui/card';
import type { CurriculumMetrics } from '@/curriculum';

interface Props {
  metrics: CurriculumMetrics;
}

const Score: React.FC<{ label: string; value: number; invert?: boolean }> = ({ label, value, invert }) => {
  const good = invert ? value <= 30 : value >= 70;
  const warn = invert ? value <= 60 : value >= 50;
  const tone = good ? 'text-emerald-600' : warn ? 'text-amber-600' : 'text-rose-600';
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${tone}`}>{value}</span>
    </div>
  );
};

export const CurriculumMetricsPanel: React.FC<Props> = ({ metrics }) => {
  return (
    <Card className="p-4 border border-border">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Curriculum Quality</h3>
        <div className="text-2xl font-bold tabular-nums text-primary">{metrics.finalScore}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Curriculum</div>
          <Score label="CEFR alignment" value={metrics.curriculum.cefrAlignment} />
          <Score label="Vocab diversity" value={metrics.curriculum.vocabDiversity} />
          <Score label="Gameplay diversity" value={metrics.curriculum.gameplayDiversity} />
          <Score label="Thematic diversity" value={metrics.curriculum.thematicDiversity} />
          <Score label="Emotional variety" value={metrics.curriculum.emotionalVariety} />
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Engagement</div>
          <Score label="Replayability" value={metrics.engagement.replayability} />
          <Score label="Engagement prediction" value={metrics.engagement.engagementPrediction} />
          <Score label="Boredom risk" value={metrics.engagement.boredomRisk} invert />
          <Score label="Novelty" value={metrics.engagement.novelty} />
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Structure</div>
          <Score label="Progression consistency" value={metrics.structure.progressionConsistency} />
          <Score label="Adaptive readiness" value={metrics.structure.adaptiveReadiness} />
          <Score label="Modularity" value={metrics.structure.modularity} />
          <Score label="Scalability" value={metrics.structure.scalability} />
        </div>
      </div>
    </Card>
  );
};
