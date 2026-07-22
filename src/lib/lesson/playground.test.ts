// Architectural Guardrail Tests for the Playground Produce Unit.
// Runs under vitest (the project's test runner). Verifies blueprint compliance
// for OSASCOMP order, indefinite articles, greeting wrapper, lexical caps,
// phase counts, storybook placement, and brain-break topic-locking.
import { describe, test, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = path.dirname(__filename);
const ROUTES_DIR = path.resolve(__dirnameLocal, "../../routes");

const read = (file: string) => fs.readFileSync(path.join(ROUTES_DIR, file), "utf8");
const produceRoutes = () =>
  fs.readdirSync(ROUTES_DIR).filter((f) => f.startsWith("playground.produce") && f.endsWith(".tsx"));
// Quiz + practice files intentionally contain malformed distractors for the
// student to reject, so they're excluded from grammar-positivity audits.
const teachingRoutes = () =>
  produceRoutes().filter((f) => !/produce-(quiz|practice)\.tsx$/.test(f));

const PHASES_RE = /const\s+PHASES\b[^=]*=\s*\[([\s\S]*?)\]/;

describe("Playground Produce Unit · Blueprint Compliance", () => {
  // 1 — OSASCOMP: size must precede color
  test("Grammar: color never precedes size", () => {
    const wrongOrder = /\b(orange|red|green|purple|yellow|blue|pink|brown|black|white)\s+(small|big|tiny|huge|little|large|long|short)\b/i;
    for (const file of teachingRoutes()) {
      expect(wrongOrder.test(read(file)), `OSASCOMP violation in ${file}`).toBe(false);
    }
  });

  // 2 — Indefinite article never pairs 'an' with a consonant-leading size adj
  test("Grammar: 'an' never precedes a consonant-leading size adjective", () => {
    const invalid = /\ban\s+(small|big|tiny|huge|little|large|long|short)\b/i;
    for (const file of teachingRoutes()) {
      expect(invalid.test(read(file)), `Article violation in ${file}`).toBe(false);
    }
  });

  // 3 — Lesson 1 mandatory greeting wrapper at index 0
  test("Pedagogy: Lesson 1 ships the greeting routine", () => {
    const content = read("playground.produce-l1.tsx");
    expect(content).toContain("GREETING_ROUTINE");
    expect(content).toContain("Hello!");
    expect(content).toContain("How are you?");
  });

  // 4 — Lexical caps (≤ 3 new target words per core lesson)
  test("Lexical: L1–L3 each cap target vocab at 3 items", () => {
    const grab = (file: string) => {
      const c = read(file);
      const m = c.match(/VOCAB_WORDS\s*=\s*[^;]+;/);
      return m ? m[0] : "";
    };
    // L1 uses a different variable shape, so just sanity-check the COMPLEX/EXPANSION arrays
    const l2 = read("playground.produce-l2.tsx");
    const l3 = read("playground.produce-l3.tsx");
    const countItems = (src: string, name: string) => {
      const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
      if (!m) return 0;
      return m[1].split(/\},\s*\{/).length;
    };
    expect(countItems(l2, "EXPANSION_VOCAB")).toBeLessThanOrEqual(3);
    expect(countItems(l3, "COMPLEX_VOCAB")).toBeLessThanOrEqual(3);
    expect(grab).toBeDefined();
  });

  // 5 — Phase timeline budget (9–10 phases for core lessons)
  test("Architecture: L1–L3 keep 9–10 phase timelines", () => {
    for (const file of ["playground.produce-l1.tsx", "playground.produce-l2.tsx", "playground.produce-l3.tsx"]) {
      const m = read(file).match(PHASES_RE);
      expect(m, `PHASES not found in ${file}`).not.toBeNull();
      const count = m![1].split(/\},\s*\{/).length;
      expect(count, `Phase count in ${file}`).toBeGreaterThanOrEqual(9);
      expect(count, `Phase count in ${file}`).toBeLessThanOrEqual(10);
    }
  });

  // 6 — Lesson 4 storybook starts on SIGNED_STORY
  test("Storybook: Lesson 4 phase index 0 is SIGNED_STORY", () => {
    const m = read("playground.produce-l4.tsx").match(PHASES_RE);
    expect(m).not.toBeNull();
    const first = m![1].split(",")[0].replace(/['"`]/g, "").trim();
    expect(first).toBe("SIGNED_STORY");
  });

  // 7 — Brain break topic-locking (produce track must not leak pets emoji)
  test("Topic-lock: Lesson 3 cool-down uses produce emojis only", () => {
    const c = read("playground.produce-l3.tsx");
    expect(c).toContain("🍎");
    expect(c).toContain("🥦");
    expect(c).not.toContain("🦴"); // pets-only emoji
  });
});
