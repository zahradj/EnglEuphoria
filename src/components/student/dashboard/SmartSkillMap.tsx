import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  TrendingUp,
  Target,
  Trophy,
  Brain,
  BookOpen,
  Mic,
  MessageCircle,
  Glasses,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useSmartSkillMap } from '@/hooks/useSmartSkillMap';
import type { SkillTreeNode } from '@/gamification/types';

type Hub = 'playground' | 'academy' | 'professional';

interface SmartSkillMapProps {
  hub: Hub;
  /** Compact = condensed view for the dashboard front page. Full = standalone tab. */
  variant?: 'compact' | 'full';
}

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  vocabulary: BookOpen,
  grammar: Brain,
  pronunciation: Mic,
  fluency: MessageCircle,
  reading: Glasses,
};

const HUB_ACCENT: Record<Hub, { ring: string; chip: string; bar: string; glow: string; text: string }> = {
  playground: {
    ring: 'ring-orange-200/60 dark:ring-orange-400/20',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    bar: '[&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-amber-400',
    glow: 'shadow-[0_10px_40px_-12px_rgba(254,106,47,0.35)]',
    text: 'text-orange-700 dark:text-orange-300',
  },
  academy: {
    ring: 'ring-indigo-200/60 dark:ring-indigo-400/20',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    bar: '[&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500',
    glow: 'shadow-[0_10px_40px_-12px_rgba(99,102,241,0.35)]',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  professional: {
    ring: 'ring-emerald-200/60 dark:ring-emerald-400/20',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    bar: '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-400',
    glow: 'shadow-[0_10px_40px_-12px_rgba(16,185,129,0.4)]',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
};

export const SmartSkillMap: React.FC<SmartSkillMapProps> = ({ hub, variant = 'compact' }) => {
  const navigate = useNavigate();
  const accent = HUB_ACCENT[hub];
  const { data, isLoading } = useSmartSkillMap(hub);

  if (isLoading) {
    return (
      <Card className={`p-6 rounded-2xl backdrop-blur-xl bg-card/70 border border-border ring-1 ${accent.ring}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Building your skill map…
        </div>
      </Card>
    );
  }

  const tree = data?.tree;
  const insights = data?.insights;
  const isEmpty = !tree || data?.isEmpty;

  return (
    <Card
      className={`
        relative overflow-hidden p-5 md:p-6 rounded-2xl
        backdrop-blur-xl bg-card/75 border border-border ring-1 ${accent.ring} ${accent.glow}
      `}
    >
      {/* Subtle hub-tinted mesh */}
      <div
        aria-hidden
        className="absolute -top-20 -right-16 w-64 h-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            hub === 'professional'
              ? 'radial-gradient(circle, rgba(16,185,129,0.45), transparent 70%)'
              : hub === 'academy'
                ? 'radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)'
                : 'radial-gradient(circle, rgba(254,106,47,0.45), transparent 70%)',
        }}
      />

      <div className="relative flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`w-4 h-4 ${accent.text}`} />
            <h3 className="font-bold text-base md:text-lg tracking-tight">Your Skill Map</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Live mastery across vocabulary, grammar, pronunciation, fluency &amp; reading.
          </p>
        </div>
        {insights && !isEmpty && (
          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${accent.chip}`}>
            {insights.overallPct}% overall
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="relative text-center py-8">
          <Trophy className={`w-10 h-10 mx-auto mb-2 opacity-60 ${accent.text}`} />
          <p className="text-sm text-muted-foreground mb-4">
            Finish your first lesson to start growing your skills.
          </p>
          <Button
            onClick={() => navigate('/dashboard/hub?tab=lessons')}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Start a lesson
          </Button>
        </div>
      ) : (
        <>
          {/* Domain bars */}
          <div className="relative space-y-3">
            {tree!.roots.map((root) => (
              <DomainRow key={root.id} node={root} accent={accent} />
            ))}
          </div>

          {/* Smart insights */}
          {insights && (
            <div className="relative mt-5 grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <InsightChip
                icon={Trophy}
                label="Mastered"
                value={`${insights.masteredItems}/${insights.totalItems}`}
                tone="success"
              />
              <InsightChip
                icon={TrendingUp}
                label="Building"
                value={`${insights.inProgressItems} skills`}
                tone="info"
              />
              <InsightChip
                icon={Target}
                label="Next to master"
                value={insights.nextToMaster?.label ?? '—'}
                tone="accent"
              />
            </div>
          )}

          {/* AI recommendation */}
          {insights && (
            <div
              className={`
                relative mt-4 flex items-start gap-3 p-3.5 rounded-xl
                bg-gradient-to-br from-background/60 to-muted/40 border border-border/60
              `}
            >
              <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${accent.text}`} />
              <div className="text-sm leading-snug">
                <span className="font-semibold mr-1">Smart tip:</span>
                <span className="text-muted-foreground">{insights.recommendation}</span>
              </div>
            </div>
          )}

          {variant === 'compact' && (
            <button
              onClick={() => navigate('/dashboard/hub?tab=skill-map')}
              className={`relative mt-4 w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium
                hover:bg-muted/60 transition ${accent.text}`}
            >
              <span>Open full skill map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {variant === 'full' && (
            <div className="relative mt-6 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Skill breakdown
              </h4>
              {tree!.roots.map((root) => (
                <DomainBreakdown key={root.id} node={root} accent={accent} />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

function DomainRow({
  node,
  accent,
}: {
  node: SkillTreeNode;
  accent: (typeof HUB_ACCENT)[Hub];
}) {
  const Icon = DOMAIN_ICONS[node.domain] ?? BookOpen;
  const masteredCount = (node.children ?? []).filter((c) => c.status === 'mastered').length;
  const total = node.children?.length ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent.text}`} />
          <span className="text-sm font-semibold">{node.label}</span>
          {node.status === 'mastered' && (
            <Badge variant="secondary" className={`text-[10px] ${accent.chip} border-0`}>
              Mastered
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {masteredCount}/{total} · {node.masteryPct}%
        </span>
      </div>
      <Progress value={node.masteryPct} className={`h-2 ${accent.bar}`} />
    </div>
  );
}

function DomainBreakdown({
  node,
  accent,
}: {
  node: SkillTreeNode;
  accent: (typeof HUB_ACCENT)[Hub];
}) {
  const children = node.children ?? [];
  if (!children.length) return null;
  return (
    <div className="rounded-xl border border-border/60 p-4 bg-background/40">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold ${accent.text}`}>{node.label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{node.masteryPct}%</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {children
          .sort((a, b) => b.masteryPct - a.masteryPct)
          .slice(0, 24)
          .map((leaf) => (
            <span
              key={leaf.id}
              title={`${leaf.label} · ${leaf.masteryPct}% · ${leaf.exposures} exposures`}
              className={`
                px-2 py-1 rounded-md text-[11px] font-medium border
                ${
                  leaf.status === 'mastered'
                    ? 'bg-emerald-100/80 text-emerald-700 border-emerald-300/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30'
                    : leaf.status === 'in_progress'
                      ? 'bg-amber-100/70 text-amber-800 border-amber-300/60 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/30'
                      : 'bg-muted text-muted-foreground border-border'
                }
              `}
            >
              {leaf.label}
            </span>
          ))}
        {children.length > 24 && (
          <span className="px-2 py-1 text-[11px] text-muted-foreground">
            +{children.length - 24} more
          </span>
        )}
      </div>
    </div>
  );
}

function InsightChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'success' | 'info' | 'accent';
}) {
  const toneCls =
    tone === 'success'
      ? 'text-emerald-700 dark:text-emerald-300'
      : tone === 'info'
        ? 'text-sky-700 dark:text-sky-300'
        : 'text-violet-700 dark:text-violet-300';
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
      <Icon className={`w-4 h-4 shrink-0 ${toneCls}`} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

export default SmartSkillMap;
