import type { StoryGraph } from './types';
import { STORY_HUB_PROFILES } from './hubProfiles';

export interface StoryIssue { code: string; message: string; node_id?: string; severity: 'hard' | 'soft' }
export interface StoryReport { verdict: 'publish' | 'repair' | 'block'; issues: StoryIssue[] }

export function validateStoryGraph(graph: StoryGraph): StoryReport {
  const issues: StoryIssue[] = [];
  const profile = STORY_HUB_PROFILES[graph.hub];
  const nodeIds = Object.keys(graph.nodes);

  if (nodeIds.length === 0) {
    issues.push({ code: 'STORY_EMPTY', message: 'Graph has no nodes', severity: 'hard' });
  }
  if (nodeIds.length > profile.max_nodes) {
    issues.push({ code: 'STORY_OVER_CAP', message: `Hub ${graph.hub} allows max ${profile.max_nodes} nodes`, severity: 'hard' });
  }
  if (!graph.nodes[graph.start_node]) {
    issues.push({ code: 'STORY_MISSING_START', message: 'start_node not found in nodes', severity: 'hard' });
  }
  if (!graph.target_skill || graph.target_ref_ids.length === 0) {
    issues.push({ code: 'STORY_UNBOUND_TARGET', message: 'Story must bind to a ReinforcementTarget', severity: 'hard' });
  }

  const endings = new Set(['end_success', 'end_retry']);
  for (const [id, node] of Object.entries(graph.nodes)) {
    if (node.choices.length !== profile.choices_per_node) {
      issues.push({
        code: 'STORY_CHOICE_COUNT',
        message: `${id}: expected ${profile.choices_per_node} choices, got ${node.choices.length}`,
        node_id: id,
        severity: 'hard',
      });
    }
    const correctCount = node.choices.filter((c) => c.correct).length;
    if (correctCount !== 1) {
      issues.push({ code: 'STORY_CORRECT_COUNT', message: `${id}: exactly one correct choice required`, node_id: id, severity: 'hard' });
    }
    for (const c of node.choices) {
      if (!endings.has(c.next) && !graph.nodes[c.next]) {
        issues.push({ code: 'STORY_DEAD_LINK', message: `${id} → ${c.next} does not exist`, node_id: id, severity: 'hard' });
      }
      if (!c.target_ref) {
        issues.push({ code: 'STORY_CHOICE_UNBOUND', message: `${id}/${c.id} missing target_ref`, node_id: id, severity: 'hard' });
      }
    }
    if (node.image_url !== null) {
      issues.push({ code: 'STORY_IMAGE_URL_LEAK', message: `${id}: image_url must be null at generation`, node_id: id, severity: 'hard' });
    }
    if (!node.image_prompt || node.image_prompt.length < 20) {
      issues.push({ code: 'STORY_IMAGE_PROMPT_MISSING', message: `${id}: image_prompt required`, node_id: id, severity: 'hard' });
    }
  }

  const hard = issues.some((i) => i.severity === 'hard');
  return { verdict: hard ? 'block' : 'publish', issues };
}
