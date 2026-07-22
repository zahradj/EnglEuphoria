// ---------------------------------------------------------------------------
// Playground ESA + lexical-chunks QA gate (Wave 2 — HARD).
// ---------------------------------------------------------------------------
// Mirror of the planner-side PG_ESA_SHAPE_UNDECLARED / PG_CHUNKS_UNDECLARED
// checks (see `src/planning/planValidator.ts`). This mirror runs on the
// finalized lesson so an assembled artifact cannot ship without the ESA
// blueprint declared — the planner check catches missing spec pre-generation;
// this check catches loss-in-transit before publish.
//
// Non-Playground lessons are a no-op.
// ---------------------------------------------------------------------------

import type { QAIssue, QALesson } from '../types';

const VALID_SHAPES = new Set(['straight_arrow', 'boomerang', 'patchwork']);

export function validateEsaChunks(lesson: QALesson): QAIssue[] {
  if (String(lesson.hub).toLowerCase() !== 'playground') return [];

  const issues: QAIssue[] = [];
  const meta = lesson.meta ?? {};
  const shape = meta.esa_shape;
  const chunks = (meta as { chunk_targets?: number; chunks?: unknown[] });

  if (!shape || !VALID_SHAPES.has(String(shape))) {
    issues.push({
      code: 'PG_ESA_SHAPE_UNDECLARED',
      domain: 'structural',
      severity: 'block',
      message:
        'Playground lesson must persist meta.esa_shape (straight_arrow | boomerang | patchwork). Planner declared it — carry it through to the final lesson artifact.',
      auto_repairable: true,
      suggestion: 'Copy plan.esa.shape onto lesson.meta.esa_shape before publish.',
    });
  }

  const chunkTargets =
    typeof chunks.chunk_targets === 'number'
      ? chunks.chunk_targets
      : Array.isArray(chunks.chunks)
        ? chunks.chunks.length
        : undefined;

  if (chunkTargets === undefined) {
    issues.push({
      code: 'PG_CHUNKS_UNDECLARED',
      domain: 'structural',
      severity: 'block',
      message:
        'Playground lesson must persist meta.chunk_targets (number of new lexical chunks introduced this lesson).',
      auto_repairable: true,
      suggestion: 'Copy plan.chunks.length (or blueprint.chunk_targets) onto lesson.meta.chunk_targets.',
    });
  }

  return issues;
}
