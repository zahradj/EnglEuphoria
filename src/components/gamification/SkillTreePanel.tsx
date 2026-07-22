import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SkillTree, SkillTreeNode } from '@/gamification/types';

interface SkillTreePanelProps {
  tree: SkillTree;
  title?: string;
}

/**
 * Mastery visualization. Shows growth per domain (vocabulary, grammar,
 * pronunciation, fluency, reading). Mastery rule (≥85% over ≥3 exposures
 * + ≥1 communicative use) is owned by the adaptive layer.
 */
export function SkillTreePanel({ tree, title = 'Your Skill Growth' }: SkillTreePanelProps) {
  if (!tree.roots.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground text-sm">
        Start your first lesson to see your skills grow.
      </Card>
    );
  }
  return (
    <Card className="p-6 bg-card border-border rounded-2xl">
      <h3 className="font-bold text-base mb-4">{title}</h3>
      <div className="space-y-4">
        {tree.roots.map((root) => (
          <DomainRow key={root.id} node={root} />
        ))}
      </div>
    </Card>
  );
}

function DomainRow({ node }: { node: SkillTreeNode }) {
  const masteredCount = (node.children ?? []).filter((c) => c.status === 'mastered').length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-foreground">{node.label}</span>
        <span className="text-xs text-muted-foreground">
          {masteredCount}/{node.children?.length ?? 0} mastered
        </span>
      </div>
      <Progress value={node.masteryPct} className="h-2" />
    </div>
  );
}
