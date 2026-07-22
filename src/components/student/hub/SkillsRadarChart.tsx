import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target, Loader2, Eye, EyeOff, TrendingUp, Sparkles } from 'lucide-react';
import { useStudentSkills } from '@/hooks/useStudentSkills';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SkillsRadarChartProps {
  isDarkMode?: boolean;
}

// Dark-green Success palette (replaces purple/secondary tokens).
const GREEN_PRIMARY = '#047857';      // emerald-700
const GREEN_PRIMARY_SOFT = '#10B981'; // emerald-500
const GREEN_TARGET = '#065F46';       // emerald-800
const GREEN_TARGET_SOFT = '#34D399';  // emerald-400

const CustomTooltip = ({ active, payload, isDarkMode }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl shadow-xl text-sm border backdrop-blur-md',
        isDarkMode
          ? 'bg-[hsl(160,40%,8%)/90] border-emerald-500/30 text-gray-100'
          : 'bg-card/90 border-emerald-200 text-foreground'
      )}
    >
      <p className="font-bold mb-1">{data.skillLabel}</p>
      <p>
        Current Level:{' '}
        <span className="font-semibold" style={{ color: GREEN_PRIMARY }}>
          {data.cefrEquivalent}
        </span>{' '}
        ({data.current}/10)
      </p>
      <p className="text-xs mt-0.5 text-muted-foreground">
        Target: {data.target}/10
      </p>
      {data.nextFocus && (
        <p className="text-xs mt-1 text-muted-foreground">
          Focus on &ldquo;{data.nextFocus}&rdquo; to reach next level.
        </p>
      )}
    </div>
  );
};

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  isDarkMode = false,
}) => {
  const { skills, loading, hub, overallCefr, percentToNext, plan } = useStudentSkills();
  const [showGlobalAvg, setShowGlobalAvg] = useState(false);
  const [globalAvgs, setGlobalAvgs] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!showGlobalAvg) return;
    const fetchAvgs = async () => {
      const { data } = await supabase.rpc('get_global_skill_averages');
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((r: any) => { map[r.skill_name] = Number(r.avg_score); });
        setGlobalAvgs(map);
      }
    };
    fetchAvgs();
  }, [showGlobalAvg]);

  const chartData = skills.map((s) => ({
    skill: s.skillLabel,
    current: s.current,
    target: s.target,
    globalAvg: globalAvgs[s.skill] || 0,
    skillLabel: s.skillLabel,
    cefrEquivalent: s.cefrEquivalent,
    nextFocus: s.nextFocus,
    isMastered: s.current >= 10,
  }));

  const hubTitle =
    hub === 'playground' ? 'Playground Skills Radar'
      : hub === 'academy' ? 'Academy Skills Radar'
        : 'Success Skills Radar';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.2 }}
      className={cn(
        'rounded-2xl p-5',
        isDarkMode
          ? 'bg-[hsl(160,40%,8%)/80] border border-emerald-800/40'
          : 'bg-card border border-emerald-200/60 shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: GREEN_PRIMARY }} />
          <h3 className="font-semibold tracking-tight text-foreground">
            {hubTitle}
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Level badge (synced from placement test) */}
          {!loading && overallCefr && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
                isDarkMode
                  ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-100'
                  : 'bg-emerald-50 border-emerald-300/70 text-emerald-900'
              )}
              title="Your current overall CEFR level, synced from your placement test and lesson mastery."
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: GREEN_PRIMARY }} />
              <span>Level</span>
              <span className="font-bold" style={{ color: GREEN_PRIMARY }}>{overallCefr}</span>
              <span className="text-muted-foreground">· {percentToNext}% to next</span>
            </div>
          )}

          {/* Global avg toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGlobalAvg(!showGlobalAvg)}
            className="text-xs gap-1.5 h-7 rounded-lg"
          >
            {showGlobalAvg ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            Global Avg
          </Button>

          {/* Legend */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: GREEN_PRIMARY }} />
              <span className="text-muted-foreground text-xs">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full opacity-60" style={{ background: GREEN_TARGET_SOFT }} />
              <span className="text-muted-foreground text-xs">Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN_PRIMARY }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
              <defs>
                <linearGradient id="auroraGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={GREEN_PRIMARY} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={GREEN_PRIMARY_SOFT} stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={GREEN_TARGET} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={GREEN_TARGET_SOFT} stopOpacity={0.06} />
                </linearGradient>
              </defs>

              <PolarGrid stroke={isDarkMode ? 'rgba(16,185,129,0.18)' : 'rgba(6,95,70,0.18)'} />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
              />

              {/* Global average (grey, behind everything) */}
              {showGlobalAvg && (
                <Radar
                  name="Global Average"
                  dataKey="globalAvg"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.08}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}

              {/* Target Area — dark green dashed */}
              <Radar
                name="Target"
                dataKey="target"
                stroke={GREEN_TARGET}
                fill="url(#targetGradient)"
                fillOpacity={0.2}
                strokeWidth={1.5}
                strokeDasharray="5 5"
              />

              {/* Current Area — emerald gradient */}
              <Radar
                name="Current Level"
                dataKey="current"
                stroke={GREEN_PRIMARY}
                fill="url(#auroraGradient)"
                fillOpacity={0.35}
                strokeWidth={2}
                style={{
                  filter: isDarkMode ? `drop-shadow(0 0 6px ${GREEN_PRIMARY_SOFT}66)` : 'none',
                }}
              />

              <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Skills Summary */}
      {!loading && skills.length > 0 && (
        <div className={cn('grid gap-2 mt-4', skills.length >= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-5')}>
          {skills.map((skill) => (
            <div
              key={skill.skill}
              className={cn(
                'text-center p-2 rounded-lg relative overflow-hidden border',
                isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-800/40'
                  : 'bg-emerald-50/70 border-emerald-200/60'
              )}
            >
              {/* Ripple animation for mastered skills */}
              {skill.current >= 10 && (
                <div className="absolute inset-0 animate-pulse bg-emerald-500/10 rounded-lg" />
              )}
              <p className="text-[10px] leading-tight text-muted-foreground relative z-10">
                {skill.skillLabel}
              </p>
              <p
                className="text-sm font-bold mt-0.5 relative z-10"
                style={{ color: GREEN_PRIMARY }}
              >
                {skill.cefrEquivalent}
              </p>
              <p className="text-[9px] text-muted-foreground relative z-10">
                {skill.current}/{skill.target}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Strategic Plan — derived from placement test + current vs target gap */}
      {!loading && plan.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: GREEN_PRIMARY }} />
            <h4 className="text-sm font-semibold text-foreground">Your Strategic Plan</h4>
            <span className="text-[10px] text-muted-foreground">
              · auto-strategized from your placement test
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {plan.map((step) => (
              <div
                key={step.skill}
                className={cn(
                  'rounded-xl p-3 border flex flex-col gap-1',
                  isDarkMode
                    ? 'bg-emerald-950/30 border-emerald-800/40'
                    : 'bg-emerald-50/60 border-emerald-200/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ background: GREEN_PRIMARY, color: 'white' }}
                  >
                    Focus #{step.priority}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    gap {step.gap.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {step.skillLabel}
                </p>
                <p className="text-xs text-foreground/80 leading-snug">
                  {step.focus}
                </p>
                <p className="text-[10px] text-muted-foreground italic mt-0.5">
                  {step.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
