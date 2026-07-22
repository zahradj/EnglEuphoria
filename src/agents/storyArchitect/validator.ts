// StoryPlan validator — HARD-blocks malformed plans, returns repair hints.

import type { StoryPlan, StoryArchitectInput } from "./contract";

export interface ValidationIssue {
  code: string;
  severity: "error" | "warn";
  message: string;
}

export function validateStoryPlan(
  plan: StoryPlan,
  input: StoryArchitectInput,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!plan?.title?.trim()) issues.push({ code: "MISSING_TITLE", severity: "error", message: "Story has no title." });
  if (!plan?.logline?.trim()) issues.push({ code: "MISSING_LOGLINE", severity: "error", message: "Story has no logline." });
  if (!plan?.backdrop?.setting?.trim()) {
    issues.push({ code: "MISSING_BACKDROP", severity: "error", message: "Backdrop is not set." });
  }
  if (!plan?.cover?.illustration_prompt?.trim() || !plan?.cover?.title?.trim()) {
    issues.push({ code: "MISSING_COVER", severity: "error", message: "Cover (front-page) illustration_prompt and title are required." });
  }

  const beats = plan?.beats ?? [];
  const minBeats = input.hub === "playground" ? 3 : 5;
  if (beats.length < minBeats) {
    issues.push({
      code: "TOO_FEW_BEATS",
      severity: "error",
      message: `Hub ${input.hub} requires >= ${minBeats} beats (got ${beats.length}).`,
    });
  }

  const castNames = new Set((plan?.characters ?? []).map((c) => c.name.toLowerCase()));
  const inputCastNames = new Set(input.cast.map((c) => c.name.toLowerCase()));
  for (const c of plan?.characters ?? []) {
    if (!inputCastNames.has(c.name.toLowerCase())) {
      issues.push({
        code: "INVENTED_CHARACTER",
        severity: "error",
        message: `Character "${c.name}" was invented — must come from supplied cast.`,
      });
    }
  }

  // Each beat must have dialogue, blocking, and an illustration prompt.
  const worldKey = (plan?.backdrop?.world ?? plan?.backdrop?.setting ?? "").toLowerCase().slice(0, 10);
  const theme = (input.lesson.unit_theme ?? "").toLowerCase().trim();
  const themeAnchors = theme
    ? theme.split(/[^a-z0-9]+/).filter((t) => t.length >= 4)
    : [];
  beats.forEach((b, i) => {
    if (!b.dialogue?.length) {
      issues.push({ code: "BEAT_NO_DIALOGUE", severity: "error", message: `Beat ${i + 1} has no dialogue.` });
    }
    if (!b.illustration_prompt?.trim()) {
      issues.push({ code: "BEAT_NO_ILLUSTRATION", severity: "error", message: `Beat ${i + 1} has no illustration prompt.` });
    } else if (worldKey && !b.illustration_prompt.toLowerCase().includes(worldKey)) {
      issues.push({
        code: "BEAT_WORLD_DRIFT",
        severity: "warn",
        message: `Beat ${i + 1} illustration prompt does not reference the story world.`,
      });
    }
    if (themeAnchors.length > 0) {
      const haystack = `${b.illustration_prompt ?? ""} ${b.narration ?? ""} ${b.setting_variation ?? ""}`.toLowerCase();
      const themeHit = themeAnchors.some((a) => haystack.includes(a));
      if (!themeHit) {
        issues.push({
          code: "BEAT_THEME_DRIFT",
          severity: "error",
          message: `Beat ${i + 1} drifts out of unit_theme "${input.lesson.unit_theme}" — narration/illustration must stay inside the theme world.`,
        });
      }
    }
    if (!Array.isArray((b as any).blocking) || (b as any).blocking.length === 0) {
      issues.push({ code: "BEAT_NO_BLOCKING", severity: "error", message: `Beat ${i + 1} is missing character blocking (positions/poses).` });
    }
    (b.dialogue ?? []).forEach((d, j) => {
      if (!castNames.has(d.speaker.toLowerCase())) {
        issues.push({
          code: "DIALOGUE_UNKNOWN_SPEAKER",
          severity: "error",
          message: `Beat ${i + 1} line ${j + 1} speaker "${d.speaker}" is not in the cast.`,
        });
      }
    });
  });

  // Every dialogue line should have a matching audio_plan entry.
  const audioCount = plan?.audio_plan?.length ?? 0;
  const dialogueCount = beats.reduce((n, b) => n + (b.dialogue?.length ?? 0), 0);
  if (audioCount < dialogueCount) {
    issues.push({
      code: "AUDIO_PLAN_INCOMPLETE",
      severity: "warn",
      message: `Audio plan has ${audioCount} entries but story has ${dialogueCount} dialogue lines.`,
    });
  }

  return issues;
}

export function hasErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.severity === "error");
}
