import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { buildSkillTree } from '@/gamification/mastery-viz/skillTreeBuilder';
import type { MasteryItem } from '@/gamification/mastery-viz/masteryProjector';
import type { Hub, SkillTree, SkillTreeNode } from '@/gamification/types';

export interface SkillInsight {
  strongest?: SkillTreeNode;
  weakest?: SkillTreeNode;
  nextToMaster?: SkillTreeNode;
  recentlyImproved: number;
  totalItems: number;
  masteredItems: number;
  inProgressItems: number;
  overallPct: number;
  recommendation: string;
}

export interface SmartSkillMap {
  tree: SkillTree;
  insights: SkillInsight;
  isEmpty: boolean;
}

/** Normalize hub keys so 'professional' (DB / app routing) maps to 'success' (gamification). */
function hubKeysFor(hub: 'playground' | 'academy' | 'professional' | 'success'): string[] {
  if (hub === 'professional' || hub === 'success') return ['success', 'professional', 'Success', 'Professional'];
  if (hub === 'academy') return ['academy', 'Academy'];
  return ['playground', 'Playground', 'kids', 'Kids'];
}

const ALLOWED_DOMAINS = new Set([
  'vocabulary',
  'grammar',
  'pronunciation',
  'fluency',
  'reading',
]);

function normalizeDomain(raw: string): MasteryItem['itemType'] | null {
  const v = (raw || '').toLowerCase();
  if (ALLOWED_DOMAINS.has(v)) return v as MasteryItem['itemType'];
  if (v.startsWith('vocab')) return 'vocabulary';
  if (v.startsWith('gram')) return 'grammar';
  if (v.startsWith('phon') || v.startsWith('pron')) return 'pronunciation';
  if (v.startsWith('speak') || v.startsWith('flu')) return 'fluency';
  if (v.startsWith('read')) return 'reading';
  return null;
}

function buildInsights(tree: SkillTree): SkillInsight {
  const allLeaves: SkillTreeNode[] = tree.roots.flatMap((r) => r.children ?? []);
  const mastered = allLeaves.filter((n) => n.status === 'mastered');
  const inProgress = allLeaves.filter((n) => n.status === 'in_progress');

  const overallPct = tree.roots.length
    ? Math.round(tree.roots.reduce((s, r) => s + r.masteryPct, 0) / tree.roots.length)
    : 0;

  const sortedRoots = [...tree.roots].sort((a, b) => b.masteryPct - a.masteryPct);
  const strongest = sortedRoots[0];
  const weakest = sortedRoots[sortedRoots.length - 1];

  // Next-to-master: in-progress item closest to 85% threshold with most exposures.
  const nextToMaster = [...inProgress]
    .sort((a, b) => {
      const distA = Math.abs(85 - a.masteryPct);
      const distB = Math.abs(85 - b.masteryPct);
      if (distA !== distB) return distA - distB;
      return b.exposures - a.exposures;
    })[0];

  let recommendation = 'Keep going — every lesson moves your skill map.';
  if (allLeaves.length === 0) {
    recommendation = 'Finish your first lesson to unlock your skill map.';
  } else if (weakest && weakest.masteryPct < 40) {
    recommendation = `Focus on ${weakest.label.toLowerCase()} — it needs the most love right now.`;
  } else if (nextToMaster) {
    recommendation = `One more strong session on "${nextToMaster.label}" and you'll master it.`;
  } else if (overallPct >= 85) {
    recommendation = 'You\'re crushing it. Time for a stretch challenge.';
  } else if (strongest) {
    recommendation = `Your ${strongest.label.toLowerCase()} is leading — build on that momentum.`;
  }

  return {
    strongest,
    weakest,
    nextToMaster,
    recentlyImproved: inProgress.filter((n) => n.masteryPct >= 50).length,
    totalItems: allLeaves.length,
    masteredItems: mastered.length,
    inProgressItems: inProgress.length,
    overallPct,
    recommendation,
  };
}

export function useSmartSkillMap(hub: 'playground' | 'academy' | 'professional' | 'success') {
  const { user } = useAuth();
  const gamificationHub: Hub = hub === 'professional' ? 'success' : (hub as Hub);

  return useQuery({
    queryKey: ['smart-skill-map', user?.id, gamificationHub],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<SmartSkillMap> => {
      const hubKeys = hubKeysFor(hub);

      // 1) Live raw mastery (preferred — always fresh).
      const { data: rawRows } = await (supabase as any)
        .from('student_mastery')
        .select('item_key,item_type,hub,mastery_score,times_correct,times_incorrect')
        .eq('user_id', user!.id)
        .in('hub', hubKeys);

      const items: MasteryItem[] = (rawRows ?? [])
        .map((r: any) => {
          const domain = normalizeDomain(r.item_type);
          if (!domain) return null;
          const exposures = (r.times_correct ?? 0) + (r.times_incorrect ?? 0);
          return {
            itemKey: r.item_key,
            itemType: domain,
            masteryPct: Math.max(0, Math.min(100, Number(r.mastery_score) || 0)),
            exposures,
          };
        })
        .filter(Boolean) as MasteryItem[];

      // 2) Augment with adaptive skill_mastery (skill_domain / mastery 0–1).
      const { data: adaptiveRows } = await (supabase as any)
        .from('skill_mastery')
        .select('skill_key,skill_domain,mastery,exposures,communicative_uses')
        .eq('student_id', user!.id);

      for (const row of adaptiveRows ?? []) {
        const domain = normalizeDomain(row.skill_domain);
        if (!domain) continue;
        const key = `${domain}:${row.skill_key}`;
        if (items.some((i) => `${i.itemType}:${i.itemKey}` === key)) continue;
        items.push({
          itemKey: row.skill_key,
          itemType: domain,
          masteryPct: Math.round((Number(row.mastery) || 0) * 100),
          exposures: row.exposures ?? 0,
        });
      }

      const tree = buildSkillTree({
        studentId: user!.id,
        hub: gamificationHub,
        items,
      });

      const insights = buildInsights(tree);
      return { tree, insights, isEmpty: items.length === 0 };
    },
  });
}
