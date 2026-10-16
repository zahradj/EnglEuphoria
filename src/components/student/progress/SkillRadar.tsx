import React from 'react';

export interface RadarAxis { key: string; label: string; pct: number }

/**
 * A small, dependency-free radar chart. The numbers are also listed as text by the page, so the
 * picture is a summary for sighted users and is announced as one sentence for screen readers.
 */
export const SkillRadar: React.FC<{ axes: RadarAxis[]; ariaLabel: string; color?: string; size?: number }> = ({
  axes,
  ariaLabel,
  color = '#6366f1',
  size = 260,
}) => {
  const n = axes.length;
  const c = size / 2;
  const r = size / 2 - 46; // leave room for the labels
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, frac: number) => [c + Math.cos(angle(i)) * r * frac, c + Math.sin(angle(i)) * r * frac] as const;
  const polygon = (frac: number) => axes.map((_, i) => point(i, frac).join(',')).join(' ');
  const shape = axes.map((a, i) => point(i, Math.max(0.04, a.pct / 100)).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel} className="w-full max-w-[320px] mx-auto">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={polygon(f)} fill="none" stroke="currentColor" strokeOpacity={0.15} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.15} />;
      })}
      <polygon points={shape} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = point(i, a.pct / 100 < 0.04 ? 0.04 : a.pct / 100);
        return <circle key={a.key} cx={x} cy={y} r={3.5} fill={color} />;
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1.2);
        const anchor = Math.abs(x - c) < 6 ? 'middle' : x > c ? 'start' : 'end';
        return (
          <text key={a.key} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize={11} fill="currentColor" fillOpacity={0.8}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
};
