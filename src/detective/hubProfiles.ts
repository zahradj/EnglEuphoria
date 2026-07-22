import type { Hub, QuestionKind } from './types';

export interface DetectiveHubProfile {
  suspects: number;
  question_pool_size: number;
  question_budget: number;
  allowed_kinds: QuestionKind[];
  briefing_max_sentences: number;
}

export const DETECTIVE_HUB_PROFILES: Record<Hub, DetectiveHubProfile> = {
  playground: { suspects: 3, question_pool_size: 6,  question_budget: 4, allowed_kinds: ['yes_no'],                                              briefing_max_sentences: 2 },
  academy:    { suspects: 4, question_pool_size: 10, question_budget: 6, allowed_kinds: ['yes_no', 'wh', 'past_simple'],                          briefing_max_sentences: 3 },
  success:    { suspects: 5, question_pool_size: 12, question_budget: 6, allowed_kinds: ['wh', 'past_simple', 'modal_speculation'],               briefing_max_sentences: 4 },
};
