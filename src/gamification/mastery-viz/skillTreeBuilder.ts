import type { Hub, SkillTree, SkillTreeNode } from '../types';
import { projectMasteryToNodes, type MasteryItem } from './masteryProjector';

/**
 * Builds a hub-themed skill tree from raw mastery items.
 * Tree structure groups by domain → individual items.
 */
export function buildSkillTree(args: {
  studentId: string;
  hub: Hub;
  items: MasteryItem[];
}): SkillTree {
  const nodes = projectMasteryToNodes(args.items);
  const byDomain = new Map<SkillTreeNode['domain'], SkillTreeNode[]>();
  for (const n of nodes) {
    const arr = byDomain.get(n.domain) ?? [];
    arr.push(n);
    byDomain.set(n.domain, arr);
  }

  const roots: SkillTreeNode[] = Array.from(byDomain.entries()).map(([domain, children]) => {
    const avg = children.length
      ? Math.round(children.reduce((s, c) => s + c.masteryPct, 0) / children.length)
      : 0;
    return {
      id: `root:${domain}`,
      label: domainLabel(domain),
      domain,
      masteryPct: avg,
      exposures: children.reduce((s, c) => s + c.exposures, 0),
      status: avg >= 85 ? 'mastered' : avg > 0 ? 'in_progress' : 'locked',
      children,
    };
  });

  return {
    hub: args.hub,
    studentId: args.studentId,
    roots,
    updatedAt: new Date().toISOString(),
  };
}

function domainLabel(d: SkillTreeNode['domain']): string {
  switch (d) {
    case 'vocabulary': return 'Vocabulary';
    case 'grammar': return 'Grammar';
    case 'pronunciation': return 'Pronunciation';
    case 'fluency': return 'Fluency';
    case 'reading': return 'Reading';
  }
}
