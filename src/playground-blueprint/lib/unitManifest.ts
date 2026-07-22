// Tier-2 manifest types. Every unit manifest must satisfy `UnitManifest`.
// Generators emit JSON in src/playground-blueprint/manifests/<id>.unit.json
// and the loader below converts that JSON into typed lesson configs.

export interface PhonicSeed {
  letter: string;
  sound: string;
  words: string[];
}

export interface LessonSeed {
  vocab?: string[];
  sentence_frame?: string;
  rules?: string;
  phonic?: PhonicSeed;
}

export interface StorybookScene {
  id: number;
  text: string;
  gap_word: string;
}

export interface StorybookSeed {
  title: string;
  signs: Record<string, string>;
  scenes: StorybookScene[];
}

export interface UnitManifest {
  unit_id: string;
  unit_title: string;
  meta: {
    primary_color: string;
    accent_color: string;
    container_theme: string;
    brain_break_emojis: string[];
  };
  lessons: {
    l1_core: LessonSeed;
    l2_expansion: LessonSeed;
    l3_complex: LessonSeed;
    l4_storybook: StorybookSeed;
    [key: string]: LessonSeed | StorybookSeed;
  };
}
