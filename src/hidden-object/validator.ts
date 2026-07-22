import { getHiddenObjectProfile } from "./hubProfiles";
import type { HiddenObjectScene } from "./types";

export interface HiddenObjectIssue {
  code: string;
  message: string;
  severity: "hard" | "soft";
}

export interface HiddenObjectValidation {
  ok: boolean;
  issues: HiddenObjectIssue[];
}

const IMAGE_URL_LEAK = /^(ai:|prompt:|generate:|\{|\[|<)/i;

function isNormalised(n: unknown): boolean {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

export function validateHiddenObjectScene(
  scene: HiddenObjectScene,
): HiddenObjectValidation {
  const issues: HiddenObjectIssue[] = [];
  const profile = getHiddenObjectProfile(scene.hub);

  if (!scene.image_prompt || scene.image_prompt.trim().length < 12) {
    issues.push({
      code: "HO_IMAGE_PROMPT_MISSING",
      message: "Scene image_prompt is missing or too short.",
      severity: "hard",
    });
  }

  if (scene.image_url && IMAGE_URL_LEAK.test(scene.image_url.trim())) {
    issues.push({
      code: "HO_IMAGE_URL_PROMPT_LEAK",
      message: "image_url must be a URL or null — never a prompt string.",
      severity: "hard",
    });
  }

  const n = scene.targets?.length ?? 0;
  if (n < profile.minTargets || n > profile.maxTargets) {
    issues.push({
      code: "HO_TARGET_COUNT_OUT_OF_RANGE",
      message: `Hub ${scene.hub} expects ${profile.minTargets}-${profile.maxTargets} targets (got ${n}).`,
      severity: "hard",
    });
  }

  const seen = new Set<string>();
  scene.targets?.forEach((t, i) => {
    const key = t.label?.trim().toLowerCase();
    if (!key) {
      issues.push({
        code: "HO_TARGET_LABEL_EMPTY",
        message: `Target #${i + 1} is missing a label.`,
        severity: "hard",
      });
    } else if (seen.has(key)) {
      issues.push({
        code: "HO_TARGET_DUPLICATE",
        message: `Duplicate target label "${t.label}".`,
        severity: "hard",
      });
    } else {
      seen.add(key);
    }

    if (!t.prompt || t.prompt.trim().length === 0) {
      issues.push({
        code: "HO_TARGET_PROMPT_MISSING",
        message: `Target "${t.label}" has no prompt line.`,
        severity: "hard",
      });
    } else if (t.prompt.trim().split(/\s+/).length > profile.maxPromptWords) {
      issues.push({
        code: "HO_TARGET_PROMPT_TOO_LONG",
        message: `Target "${t.label}" prompt exceeds ${profile.maxPromptWords} words for ${scene.hub}.`,
        severity: "hard",
      });
    }

    if (!isNormalised(t.x) || !isNormalised(t.y)) {
      issues.push({
        code: "HO_TARGET_COORDS_INVALID",
        message: `Target "${t.label}" x/y must be normalised (0-1).`,
        severity: "hard",
      });
    }
    if (!isNormalised(t.radius) || t.radius < 0.03 || t.radius > 0.2) {
      issues.push({
        code: "HO_TARGET_RADIUS_INVALID",
        message: `Target "${t.label}" radius must be 0.03-0.20 (got ${t.radius}).`,
        severity: "hard",
      });
    }

    if (!t.reinforces?.id) {
      issues.push({
        code: "HO_TARGET_MISSING_REINFORCEMENT",
        message: `Target "${t.label}" is not bound to a ReinforcementTarget.`,
        severity: "hard",
      });
    }

    if (profile.requirePreposition && !t.preposition) {
      issues.push({
        code: "HO_TARGET_PREPOSITION_MISSING",
        message: `Target "${t.label}" needs a preposition for ${scene.hub}.`,
        severity: "soft",
      });
    }
    if (profile.requireDefinition && !t.definition) {
      issues.push({
        code: "HO_TARGET_DEFINITION_MISSING",
        message: `Target "${t.label}" needs a short definition for ${scene.hub}.`,
        severity: "soft",
      });
    }
  });

  // Overlap check: any two targets whose centres are closer than the sum of their radii
  const t = scene.targets ?? [];
  for (let i = 0; i < t.length; i++) {
    for (let j = i + 1; j < t.length; j++) {
      const dx = t[i].x - t[j].x;
      const dy = t[i].y - t[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (t[i].radius + t[j].radius) * 0.9) {
        issues.push({
          code: "HO_TARGET_HITBOX_OVERLAP",
          message: `Targets "${t[i].label}" and "${t[j].label}" overlap — hitboxes ambiguous.`,
          severity: "hard",
        });
      }
    }
  }

  const ok = !issues.some((i) => i.severity === "hard");
  return { ok, issues };
}
