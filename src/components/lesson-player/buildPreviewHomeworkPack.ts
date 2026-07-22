/**
 * Lightweight fallback HomeworkPack builder used by the hub creator preview
 * when the real coherence engine hasn't produced one yet. This is preview-only —
 * the production pipeline (`runCoherence`) is still the source of truth at publish time.
 */
import type { HomeworkPack, HomeworkTask } from '@/coherence/types';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

type AnySlide = Record<string, any>;

const HUB_MAP: Record<HubType, 'playground' | 'academy' | 'success'> = {
  playground: 'playground',
  academy: 'academy',
  professional: 'success',
};

function pickVocab(slides: AnySlide[]): string[] {
  const out = new Set<string>();
  for (const s of slides) {
    const kw = Array.isArray(s?.keywords) ? s.keywords : [];
    kw.forEach((k: string) => { if (typeof k === 'string' && k.trim()) out.add(k.trim()); });
    const word = s?.word ?? s?.content?.word ?? s?.content?.vocabulary_word;
    if (typeof word === 'string' && word.trim()) out.add(word.trim());
    if (out.size >= 6) break;
  }
  return Array.from(out).slice(0, 6);
}

export function buildPreviewHomeworkPack(
  hub: HubType,
  lessonTitle: string,
  slides: AnySlide[] | undefined,
): HomeworkPack {
  const coherenceHub = HUB_MAP[hub] ?? 'academy';
  const vocab = pickVocab(slides ?? []);
  const lessonAnchor = lessonTitle || 'today\'s lesson';

  const baseTasks: Array<Omit<HomeworkTask, 'id' | 'reinforcement_target_id' | 'bound_to_lesson' | 'educational_value'>> = (() => {
    if (coherenceHub === 'playground') {
      return [
        {
          type: 'parent_script',
          template_key: 'pg_parent_recall',
          estimated_minutes: 3,
          modality: 'speaking',
          prompt: `Tell a grown-up 3 things you learned about “${lessonAnchor}”. Use ${vocab.slice(0, 3).join(', ') || 'the new words'}.`,
        },
        {
          type: 'mini_recording',
          template_key: 'pg_record_word',
          estimated_minutes: 2,
          modality: 'speaking',
          prompt: `Record yourself saying each new word out loud: ${vocab.slice(0, 4).join(', ') || 'the new words from class'}.`,
        },
        {
          type: 'vocab_recall',
          template_key: 'pg_match_picture',
          estimated_minutes: 3,
          modality: 'mixed',
          prompt: `Match each word to the right picture in the practice deck.`,
        },
      ];
    }
    if (coherenceHub === 'academy') {
      return [
        {
          type: 'sentence_build',
          template_key: 'ac_sentence_build',
          estimated_minutes: 5,
          modality: 'writing',
          prompt: `Write 4 sentences using these words: ${vocab.slice(0, 4).join(', ') || 'today\'s key vocabulary'}.`,
        },
        {
          type: 'mini_recording',
          template_key: 'ac_voice_journal',
          estimated_minutes: 4,
          modality: 'speaking',
          prompt: `Record a 60-second voice note about “${lessonAnchor}” using the target grammar.`,
        },
        {
          type: 'peer_message',
          template_key: 'ac_peer_dm',
          estimated_minutes: 4,
          modality: 'writing',
          prompt: `DM a classmate a 3-message exchange about “${lessonAnchor}”.`,
        },
        {
          type: 'listening_recap',
          template_key: 'ac_listen_recap',
          estimated_minutes: 4,
          modality: 'listening',
          prompt: `Listen to the lesson audio replay and write 2 things you remembered and 1 question you still have.`,
        },
      ];
    }
    // success
    return [
      {
        type: 'email_draft',
        template_key: 'su_email_pro',
        estimated_minutes: 6,
        modality: 'writing',
        prompt: `Draft a professional email applying “${lessonAnchor}” to a real work situation. Use ${vocab.slice(0, 4).join(', ') || 'the target vocabulary'}.`,
      },
      {
        type: 'mini_recording',
        template_key: 'su_voice_pitch',
        estimated_minutes: 5,
        modality: 'speaking',
        prompt: `Record a 90-second self-introduction or pitch using today\'s target structures.`,
      },
      {
        type: 'micro_reading',
        template_key: 'su_article_recap',
        estimated_minutes: 6,
        modality: 'reading',
        prompt: `Read one short article on “${lessonAnchor}” and summarise the main idea in 3 sentences.`,
      },
    ];
  })();

  const tasks: HomeworkTask[] = baseTasks.map((t, i) => ({
    ...t,
    id: `preview-hw-${i + 1}`,
    reinforcement_target_id: `preview-target-${i + 1}`,
    bound_to_lesson: true,
    educational_value: 0.72,
  }));

  const total_minutes = tasks.reduce((sum, t) => sum + t.estimated_minutes, 0);

  return {
    lessonId: 'preview',
    studentId: 'preview',
    hub: coherenceHub,
    tasks,
    total_minutes,
    coherence_score: 0.7,
  };
}
