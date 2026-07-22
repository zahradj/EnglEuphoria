// Radar chart visualizing the QA scorecard (10 domains, 0-100).
// Renders inside the CreatorShell publish sidebar.

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface ScorecardEntry {
  score: number;
  passing: boolean;
}

interface Props {
  scorecard: Record<string, ScorecardEntry> | undefined;
  size?: number;
}

export function QualityRadarChart({ scorecard, size = 240 }: Props) {
  if (!scorecard || Object.keys(scorecard).length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No scorecard available yet — run quality check.
      </div>
    );
  }

  const data = Object.entries(scorecard).map(([domain, v]) => ({
    domain,
    score: Math.max(0, Math.min(100, v.score)),
    passing: v.passing,
  }));

  const anyFailing = data.some((d) => !d.passing);

  return (
    <div style={{ width: '100%', height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
          />
          <Radar
            dataKey="score"
            stroke={anyFailing ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
            fill={anyFailing ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
