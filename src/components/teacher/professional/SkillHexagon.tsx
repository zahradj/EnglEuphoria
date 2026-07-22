import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillScore {
  label: string;
  value: number; // 0-100
}

interface SkillHexagonProps {
  skills: SkillScore[];
  studentName?: string;
}

const COLORS = {
  fill: 'rgba(26, 35, 126, 0.12)',
  stroke: '#6B21A8',
  gridStroke: '#E2E8F0',
  text: '#64748B',
  accent: '#2E7D32',
};

export const SkillHexagon: React.FC<SkillHexagonProps> = ({ skills, studentName }) => {
  const defaultSkills: SkillScore[] = [
    { label: 'Reading', value: 0 },
    { label: 'Writing', value: 0 },
    { label: 'Listening', value: 0 },
    { label: 'Speaking', value: 0 },
    { label: 'Grammar', value: 0 },
    { label: 'Phonics', value: 0 },
  ];

  const data = skills.length >= 6 ? skills : defaultSkills;
  const n = data.length;
  const cx = 120;
  const cy = 120;
  const maxR = 90;

  const angleOf = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointAt = (i: number, r: number) => {
    const a = angleOf(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const polygon = (r: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = pointAt(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');

  const dataPolygon = data
    .map((s, i) => {
      const p = pointAt(i, (s.value / 100) * maxR);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / n);

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center justify-between">
          <span>Skill Hexagon</span>
          {studentName && (
            <span className="text-xs font-normal text-muted-foreground">{studentName}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg width={240} height={240} viewBox="0 0 240 240" className="overflow-visible">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map(scale => (
            <polygon
              key={scale}
              points={polygon(maxR * scale)}
              fill="none"
              stroke={COLORS.gridStroke}
              strokeWidth={1}
            />
          ))}
          {/* Spokes */}
          {data.map((_, i) => {
            const p = pointAt(i, maxR);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke={COLORS.gridStroke}
                strokeWidth={1}
              />
            );
          })}
          {/* Data area */}
          <polygon
            points={dataPolygon}
            fill={COLORS.fill}
            stroke={COLORS.stroke}
            strokeWidth={2}
          />
          {/* Data dots */}
          {data.map((s, i) => {
            const p = pointAt(i, (s.value / 100) * maxR);
            return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={COLORS.stroke} />;
          })}
          {/* Labels */}
          {data.map((s, i) => {
            const p = pointAt(i, maxR + 20);
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-medium"
                fill={COLORS.text}
              >
                {s.label}
              </text>
            );
          })}
          {/* Center score */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="text-lg font-bold"
            fill={COLORS.stroke}
          >
            {avg}%
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            className="text-[9px]"
            fill={COLORS.text}
          >
            Average
          </text>
        </svg>

        {/* Legend chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {data.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
              style={{
                borderColor: s.value >= 80 ? '#2E7D32' : s.value >= 50 ? '#6B21A8' : '#EF5350',
                color: s.value >= 80 ? '#2E7D32' : s.value >= 50 ? '#6B21A8' : '#EF5350',
                backgroundColor:
                  s.value >= 80
                    ? 'rgba(46,125,50,0.06)'
                    : s.value >= 50
                    ? 'rgba(26,35,126,0.06)'
                    : 'rgba(239,83,80,0.06)',
              }}
            >
              <span className="font-medium">{s.label}</span>
              <span className="font-bold">{s.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
