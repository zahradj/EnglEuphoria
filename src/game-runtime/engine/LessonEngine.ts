/**
 * LessonEngine — the ONLY bridge between React lesson JSON and Phaser scenes.
 *
 * Hierarchy enforced: Lesson → Moments → Scenes → Blocks.
 *
 * Rules:
 *  • React must call LessonEngine.compile() before booting Phaser.
 *  • Phaser scenes must never import this module or parse raw JSON.
 */
import { lessonSchema } from './lessonSchema';
import { buildSceneConfig } from './sceneConfigBuilders';
import type { CompiledLesson, CompiledMoment, LessonJSON } from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export class LessonEngine {
  static validate(json: unknown): ValidationResult {
    const parsed = lessonSchema.safeParse(json);
    if (parsed.success) return { ok: true, errors: [] };
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    };
  }

  static compile(json: unknown): CompiledLesson {
    const parsed = lessonSchema.parse(json);
    return LessonEngine.compileValidated(parsed);
  }

  static compileValidated(lesson: Pick<LessonJSON, 'id' | 'title' | 'cefr' | 'hub' | 'moments'>): CompiledLesson {
    const total = lesson.moments.reduce((n, m) => n + m.blocks.length, 0);
    let cursor = 0;
    const moments: CompiledMoment[] = lesson.moments.map((m) => {
      const scenes = m.blocks.map((block) => {
        const cfg = buildSceneConfig(block, cursor, total, { id: m.id, kind: m.kind });
        cursor += 1;
        return cfg;
      });
      return Object.freeze({ id: m.id, kind: m.kind, title: m.title, scenes });
    });
    const sequence = moments.flatMap((m) => m.scenes);
    const compiled: CompiledLesson = {
      lessonId: lesson.id,
      title: lesson.title,
      cefr: lesson.cefr,
      hub: lesson.hub,
      moments,
      sequence,
    };
    Object.freeze(compiled);
    Object.freeze(compiled.moments);
    Object.freeze(compiled.sequence);
    // eslint-disable-next-line no-console
    console.info(
      `[LessonEngine] compiled ${moments.length} moments / ${sequence.length} scenes for "${lesson.title}"`,
    );
    return compiled;
  }
}
