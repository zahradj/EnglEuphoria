import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_LANGUAGE_VARIANT,
  DEFAULT_VISUAL_THEME,
  LANGUAGE_VARIANT_OPTIONS,
  VISUAL_THEME_OPTIONS,
  type LanguageVariant,
  type VisualTheme,
} from './blueprintTypes';
import {
  IMAGE_STYLES_BY_HUB,
  DEFAULT_IMAGE_STYLE_ID,
} from './imageStyleOptions';
import { listCharactersForHub } from '@/services/characterService';
import type { CustomCharacter, StarringCharacterPayload } from '@/types/character';
import { toStarringPayload } from '@/types/character';
import { resolveStarringCharacter } from '@/constants/defaultCharacters';
import { A1_UNIT_BLUEPRINT, type A1EsaShape } from '@/planning/a1Blueprint';

export type Hub = 'playground' | 'academy' | 'success';

export interface GenerateLessonPayload {
  topic: string;
  level: string;
  vocabulary: string[]; // length 5 (or 3-4 for Pre-A1)
  grammar: string;
  target_phonics: string;
  interests: string;
  specific_needs: string;
  language_variant: LanguageVariant;
  visual_theme: VisualTheme;
  /** Hub-specific Image Style id, e.g. "claymation". Always present. */
  image_style: string;
  learning_objective?: string;
  final_output_task?: string;
  /** Optional cast member the AI must feature in the lesson. */
  starring_character?: StarringCharacterPayload;
  /**
   * A1 Blueprint (Playground only) — ESA shape + lexical chunk budget.
   * Present only when hub=playground; the QA gate blocks Playground publishes
   * without these (see PG_ESA_SHAPE_UNDECLARED / PG_CHUNKS_UNDECLARED).
   */
  esa_shape?: A1EsaShape;
  chunk_targets?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  hub: Hub;
  defaultTopic: string;
  defaultLevel: string;
  defaultVocabulary?: string[];
  defaultGrammar?: string;
  defaultPhonics?: string;
  defaultInterests?: string;
  defaultNeeds?: string;
  defaultLanguageVariant?: LanguageVariant;
  defaultVisualTheme?: VisualTheme;
  defaultLearningObjective?: string;
  defaultFinalOutputTask?: string;
  /** Optional lesson number (1–6) — seeds A1 Blueprint defaults for Playground. */
  defaultLessonNumber?: number;
  busy: boolean;
  /** Optional live status text shown while busy (e.g. "Planning blueprint…"). */
  busyLabel?: string;
  onGenerate: (payload: GenerateLessonPayload) => Promise<void> | void;
}

const HUB_SLIDE_TARGETS: Record<Hub, { min: number; max: number; minutes: number }> = {
  playground: { min: 18, max: 22, minutes: 30 },
  academy: { min: 26, max: 30, minutes: 60 },
  success: { min: 26, max: 30, minutes: 60 },
};

/**
 * Mirrors the deterministic slide counts in
 * `supabase/functions/generate-ppp-slides/index.ts` so the chip preview matches
 * what the pipeline will actually emit.
 *
 * Playground is fully deterministic (intro + optional phonics + vocab + practice
 * + grammar + production + summary). Academy / Success target a 26–30 range and
 * we show the midpoint as the estimate.
 */
function computeExpectedSlides(
  hub: Hub,
  level: string,
  vocabCount: number,
  hasPhonics: boolean,
): { estimate: number; min: number; max: number; minutes: number; deterministic: boolean } {
  if (hub === 'playground') {
    const v = Math.max(0, vocabCount);
    const isPreA1 = level === 'Pre-A1';
    const phase2 = hasPhonics ? 7 : isPreA1 ? 6 : 5;
    const grammar = isPreA1 ? 0 : 3;
    const production = isPreA1 ? 0 : 1;
    const total =
      1 /* intro */ +
      (hasPhonics ? 1 : 0) +
      v +
      phase2 +
      grammar +
      production +
      1; /* summary */
    return { estimate: total, min: total, max: total, minutes: 30, deterministic: true };
  }
  return { estimate: 28, min: 26, max: 30, minutes: 60, deterministic: false };
}

const PROGRESS_STEPS = [
  'Planning blueprint',
  'Drafting slides',
  'Aligning to CEFR',
  'Generating visuals',
  'Running quality check',
];


const THEME: Record<Hub, {
  border: string; headerGrad: string; footerBg: string; footerBorder: string;
  primaryBtn: string; chipBg: string; chipText: string; levels: string[]; title: string; subtitle: string;
}> = {
  playground: {
    border: 'border-4 border-orange-300',
    headerGrad: 'from-fuchsia-500 to-orange-500',
    footerBg: 'bg-orange-50',
    footerBorder: 'border-orange-200',
    primaryBtn: 'bg-gradient-to-r from-fuchsia-500 to-orange-500',
    chipBg: 'bg-orange-50',
    chipText: 'text-orange-700',
    levels: ['Pre-A1', 'A1', 'A2', 'B1', 'B2'],
    title: 'Generate Playground Lesson',
    subtitle: 'AI will craft a kid-friendly interactive deck.',
  },
  academy: {
    border: 'border border-indigo-200',
    headerGrad: 'from-indigo-500 to-purple-600',
    footerBg: 'bg-slate-50',
    footerBorder: 'border-slate-200',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-500',
    chipBg: 'bg-indigo-50',
    chipText: 'text-indigo-700',
    levels: ['A1', 'A2', 'B1', 'B2'],
    title: 'Generate Academy Lesson',
    subtitle: 'A 60-min, 7-block TEFL deck for teens.',
  },
  success: {
    border: 'border border-emerald-200',
    headerGrad: 'from-emerald-500 to-teal-600',
    footerBg: 'bg-slate-50',
    footerBorder: 'border-slate-200',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    levels: ['A2', 'B1', 'B2', 'C1'],
    title: 'Generate Success Lesson',
    subtitle: 'A 60-min, 7-block Business English deck for adults.',
  },
};

const inputCls =
  'mt-1 w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-400 outline-none text-sm';
const smallInputCls =
  'w-full px-2 py-2 rounded-lg border-2 border-slate-200 focus:border-slate-400 outline-none text-sm';
const labelCls = 'text-xs font-bold text-slate-600 uppercase tracking-wider';

function ensureFive(arr?: string[]): string[] {
  const base = Array.isArray(arr) ? [...arr] : [];
  while (base.length < 5) base.push('');
  return base.slice(0, 5);
}

export default function GenerateLessonModal({
  open,
  onClose,
  hub,
  defaultTopic,
  defaultLevel,
  defaultVocabulary,
  defaultGrammar,
  defaultPhonics,
  defaultInterests,
  defaultNeeds,
  defaultLanguageVariant,
  defaultVisualTheme,
  defaultLearningObjective,
  defaultFinalOutputTask,
  defaultLessonNumber,
  busy,
  busyLabel,
  onGenerate,
}: Props) {
  const theme = THEME[hub];
  const slideTarget = HUB_SLIDE_TARGETS[hub];

  const [topic, setTopic] = useState(defaultTopic);
  const [level, setLevel] = useState(defaultLevel);
  const [vocab, setVocab] = useState<string[]>(ensureFive(defaultVocabulary));
  const [grammar, setGrammar] = useState(defaultGrammar || '');
  const [phonics, setPhonics] = useState(defaultPhonics || '');
  const [interests, setInterests] = useState(defaultInterests || '');
  const [needs, setNeeds] = useState(defaultNeeds || '');
  const [languageVariant, setLanguageVariant] = useState<LanguageVariant>(
    defaultLanguageVariant ?? DEFAULT_LANGUAGE_VARIANT,
  );
  const [visualTheme, setVisualTheme] = useState<VisualTheme>(
    defaultVisualTheme ?? DEFAULT_VISUAL_THEME,
  );
  const [learningObjective, setLearningObjective] = useState(defaultLearningObjective || '');
  const [finalOutputTask, setFinalOutputTask] = useState(defaultFinalOutputTask || '');
  const [imageStyle, setImageStyle] = useState<string>(DEFAULT_IMAGE_STYLE_ID[hub]);
  // ── A1 Blueprint (Playground only) ──────────────────────────────
  const a1Spec = A1_UNIT_BLUEPRINT.find((s) => s.lesson_number === defaultLessonNumber) ?? A1_UNIT_BLUEPRINT[0];
  const [esaShape, setEsaShape] = useState<A1EsaShape>(a1Spec.esa_shape);
  const [chunkTargets, setChunkTargets] = useState<number>(a1Spec.chunk_targets);
  const [expanded, setExpanded] = useState(false);
  const [autoFillBusy, setAutoFillBusy] = useState(false);
  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [starringId, setStarringId] = useState<string>('');
  const [stepIdx, setStepIdx] = useState(0);

  // Cycle the progress steps while generating so the bar feels alive.
  useEffect(() => {
    if (!busy) { setStepIdx(0); return; }
    setStepIdx(0);
    const id = setInterval(() => {
      setStepIdx((i) => (i + 1) % PROGRESS_STEPS.length);
    }, 2400);
    return () => clearInterval(id);
  }, [busy]);


  const isPreA1 = level === 'Pre-A1';
  const imageStyleOptions = IMAGE_STYLES_BY_HUB[hub];
  const filledVocabCountLive = vocab.filter((v) => v.trim().length > 0).length;
  const expectedSlides = computeExpectedSlides(
    hub,
    level,
    filledVocabCountLive,
    Boolean(phonics.trim()),
  );

  // Re-sync defaults whenever modal opens
  useEffect(() => {
    if (!open) return;
    setTopic(defaultTopic);
    setLevel(defaultLevel);
    setVocab(ensureFive(defaultVocabulary));
    setGrammar(defaultGrammar || '');
    setPhonics(defaultPhonics || '');
    setInterests(defaultInterests || '');
    setNeeds(defaultNeeds || '');
    setLanguageVariant(defaultLanguageVariant ?? DEFAULT_LANGUAGE_VARIANT);
    setVisualTheme(defaultVisualTheme ?? DEFAULT_VISUAL_THEME);
    setLearningObjective(defaultLearningObjective || '');
    setFinalOutputTask(defaultFinalOutputTask || '');
    setImageStyle(DEFAULT_IMAGE_STYLE_ID[hub]);
    const spec = A1_UNIT_BLUEPRINT.find((s) => s.lesson_number === defaultLessonNumber) ?? A1_UNIT_BLUEPRINT[0];
    setEsaShape(spec.esa_shape);
    setChunkTargets(spec.chunk_targets);
    setStarringId('');
    listCharactersForHub(hub).then(setCharacters).catch(() => setCharacters([]));
    setExpanded(Boolean(
      (defaultVocabulary && defaultVocabulary.some((v) => v?.trim())) ||
      defaultGrammar?.trim() ||
      defaultPhonics?.trim() ||
      defaultInterests?.trim() ||
      defaultNeeds?.trim(),
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Pre-A1 only needs 3 vocab + phonics; grammar may be empty.
  const filledVocabCount = vocab.filter((v) => v.trim().length > 0).length;
  const canGenerate = isPreA1
    ? Boolean(topic.trim() && phonics.trim() && filledVocabCount >= 3 && !busy)
    : Boolean(topic.trim() && grammar.trim() && filledVocabCount === 5 && !busy);

  // CEFR-tiered phonics tier hint, mirrors plan-lesson-blueprint.
  const phonicsTier: 'A' | 'B' | 'C' =
    ['Pre-A1', 'A1'].includes(level) ? 'A' :
    ['A2', 'B1'].includes(level) ? 'B' : 'C';
  const phonicsTierHint =
    phonicsTier === 'A'
      ? `PHONICS RULE (Tier A — Pre-A1/A1): pick a single-phoneme focus, CVC blend, or simple digraph (sh, ch, th). e.g. "Short A: /æ/", "Digraph /ʃ/".`
      : phonicsTier === 'B'
      ? `PHONICS RULE (Tier B — A2/B1): pick a minimal pair, tricky consonant cluster, or silent letter. e.g. "Minimal pair /ɪ/ vs /iː/ (ship/sheep)", "Silent K (knee)".`
      : `PHONICS RULE (Tier C — B2/C1+): pick a suprasegmental — word stress, intonation, linking, elision, or weak forms. e.g. "Noun↔verb stress (RE-cord vs re-CORD)", "Elision in connected speech".`;

  const handleAutoFill = async () => {
    if (!topic.trim() || autoFillBusy) return;
    setAutoFillBusy(true);
    try {
      const variantRule = `LANGUAGE VARIANT: ${languageVariant}. ALL spelling, vocabulary choices, examples and idioms MUST match this regional variant (e.g. British "colour"/"chips", American "color"/"fries", Global/Neutral = avoid region-specific slang).`;
      const swbatRule = `Also produce:
  • "learning_objective": ONE sentence beginning with "Student will be able to ..." — observable, functional, level-appropriate.
  • "final_output_task": ONE sentence describing the FINAL production task (roleplay, debate, free-speak or show-and-tell) that proves mastery of the chosen vocabulary AND grammar.`;
      const system = isPreA1
        ? `You are an expert Early-Years Phonics Designer. Audience: 4-5 year-old true beginners and pre-readers. ` +
          `DO NOT propose grammar rules or full sentences. Pick EXACTLY 3 phonetically decodable CVC words ` +
          `(or ultra-basic single-syllable nouns) tied to ONE phonics focus. ${phonicsTierHint} ` +
          `target_phonics is REQUIRED — never empty. ${variantRule} ${swbatRule}`
        : `You are an expert ESL Curriculum Designer. Hub: ${hub}. ` +
          `Pick exactly 5 target vocabulary items, 1 grammar focus, 1 phonics focus, ` +
          `2-3 likely student interests for this topic, and 1 short specific-needs hint ` +
          `that suit the topic and CEFR level. Keep vocab short (1-3 words each), age-appropriate, and high-frequency. ` +
          `${phonicsTierHint} target_phonics is REQUIRED — never empty. ${variantRule} ${swbatRule}`;
      const prompt = isPreA1
        ? `TOPIC: ${topic.trim()}\nCEFR LEVEL: Pre-A1 (ages 4-5)\nLANGUAGE VARIANT: ${languageVariant}\n\n` +
          `Return ONLY JSON in this exact shape (grammar MUST be empty string, target_phonics MUST be non-empty):\n` +
          `{ "vocabulary": ["w1","w2","w3"], "grammar": "", "target_phonics": "string", "interests": "string", "specific_needs": "string", "learning_objective": "string", "final_output_task": "string" }`
        : `TOPIC: ${topic.trim()}\nCEFR LEVEL: ${level}\nLANGUAGE VARIANT: ${languageVariant}\n\n` +
          `Return ONLY JSON in this exact shape (target_phonics MUST be non-empty and follow the tier rule above):\n` +
          `{ "vocabulary": ["w1","w2","w3","w4","w5"], "grammar": "string", "target_phonics": "string", "interests": "string", "specific_needs": "string", "learning_objective": "string", "final_output_task": "string" }`;
      const { data, error } = await supabase.functions.invoke('generate-gemini', {
        body: { prompt, system, responseMimeType: 'application/json', temperature: 0.7 },
      });
      if (error) throw error;
      const parsed = (data?.json ?? data) as any;
      if (isPreA1) {
        const list = Array.isArray(parsed?.vocabulary) ? parsed.vocabulary.slice(0, 4) : [];
        const padded = ensureFive(list); // we still keep 5 slots; teacher can leave extras blank
        setVocab(padded);
        setGrammar('');
      } else {
        setVocab(ensureFive(parsed?.vocabulary));
        setGrammar(String(parsed?.grammar || '').trim());
      }
      setPhonics(String(parsed?.target_phonics || '').trim());
      // Don't overwrite if teacher already typed something
      if (!interests.trim()) setInterests(String(parsed?.interests || '').trim());
      if (!needs.trim()) setNeeds(String(parsed?.specific_needs || '').trim());
      setLearningObjective(String(parsed?.learning_objective || '').trim());
      setFinalOutputTask(String(parsed?.final_output_task || '').trim());
      setExpanded(true);
      toast.success('Blueprint suggested — review and edit before generating.');
    } catch (e: any) {
      console.error('Auto-fill failed', e);
      const msg = e?.message || 'Auto-fill failed';
      toast.error(msg);
    } finally {
      setAutoFillBusy(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    const starring = characters.find((c) => c.id === starringId);
    // Active Character Fallback: never send an empty character context.
    const starringPayload = resolveStarringCharacter(
      starring ? toStarringPayload(starring) : undefined,
      hub as any,
    );
    await onGenerate({
      topic: topic.trim(),
      level,
      vocabulary: vocab.map((v) => v.trim()).filter((v) => v.length > 0),
      grammar: grammar.trim(),
      target_phonics: phonics.trim(),
      interests: interests.trim(),
      specific_needs: needs.trim(),
      language_variant: languageVariant,
      visual_theme: visualTheme,
      image_style: imageStyle,
      learning_objective: learningObjective.trim() || undefined,
      final_output_task: finalOutputTask.trim() || undefined,
      starring_character: starringPayload,
      // A1 Blueprint (Playground only) — QA gate requires these persisted on the lesson.
      esa_shape: hub === 'playground' ? esaShape : undefined,
      chunk_targets: hub === 'playground' ? chunkTargets : undefined,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4"
        >
          <div className={`bg-white rounded-3xl w-full max-w-lg shadow-2xl ${theme.border} overflow-hidden`}>
            <div className={`relative bg-gradient-to-r ${theme.headerGrad} p-5 text-white overflow-hidden`}>
              {/* Hub-themed visual orbs */}
              <div className="pointer-events-none absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="text-xl font-extrabold">{theme.title}</h3>
                  </div>
                  <p className="text-sm opacity-90 mt-1">{theme.subtitle}</p>
                </div>
                <div className="shrink-0 rounded-2xl bg-white/20 backdrop-blur px-3 py-2 text-right border border-white/30">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">Expected deck</div>
                  <div className="text-sm font-extrabold leading-tight">
                    {expectedSlides.deterministic
                      ? `${expectedSlides.estimate} slides`
                      : `≈ ${expectedSlides.min}–${expectedSlides.max} slides`}
                  </div>
                  <div className="text-[11px] opacity-90">~{expectedSlides.minutes} min lesson</div>
                </div>
              </div>

              {busy && (
                <div className="relative mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-90">
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {busyLabel || PROGRESS_STEPS[stepIdx]}
                    </span>
                    <span>Step {stepIdx + 1} / {PROGRESS_STEPS.length}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                    <motion.div
                      key={stepIdx}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.4, ease: 'linear' }}
                      className="h-full bg-white/90"
                    />
                  </div>
                </div>
              )}
            </div>


            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Topic + Auto-Fill */}
              <div>
                <span className={labelCls}>Topic</span>
                <div className="mt-1 flex flex-col sm:flex-row gap-2">
                  <input
                    autoFocus
                    className={`${inputCls} mt-0 flex-1`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Animals, Colors, Greetings"
                    disabled={busy || autoFillBusy}
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={!topic.trim() || autoFillBusy || busy}
                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold ${theme.chipText} hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap`}
                    title="Let AI suggest vocab, grammar and phonics"
                  >
                    {autoFillBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* CEFR */}
              <label className="block">
                <span className={labelCls}>CEFR Level</span>
                <select
                  className={inputCls}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={busy}
                >
                  {theme.levels.map((l) => (
                    <option key={l} value={l}>
                      {l === 'Pre-A1' ? 'Pre-A1 — Ages 4-5 (Phonics)' : l}
                    </option>
                  ))}
                </select>
              </label>

              {/* Language Variant + Visual Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelCls}>🌐 Language Variant</span>
                  <select
                    className={inputCls}
                    value={languageVariant}
                    onChange={(e) => setLanguageVariant(e.target.value as LanguageVariant)}
                    disabled={busy}
                  >
                    {LANGUAGE_VARIANT_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelCls}>🎨 Visual Theme</span>
                  <select
                    className={inputCls}
                    value={visualTheme}
                    onChange={(e) => setVisualTheme(e.target.value as VisualTheme)}
                    disabled={busy}
                  >
                    {VISUAL_THEME_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Hub Image-Style Matrix */}
              <label className="block">
                <span className={labelCls}>🖼 Image Style ({hub})</span>
                <select
                  className={inputCls}
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  disabled={busy}
                >
                  {imageStyleOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Strictly enforced on every AI image in this lesson.
                </p>
              </label>

              {/* A1 Blueprint — Playground only (Wave 2 ESA + chunks HARD gate) */}
              {hub === 'playground' && (
                <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={labelCls}>🧩 A1 Blueprint (ESA + Chunks)</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 rounded-full px-2 py-0.5">
                      L{a1Spec.lesson_number} · {a1Spec.focus.split('—')[0].trim()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className={labelCls}>ESA Shape</span>
                      <select
                        className={inputCls}
                        value={esaShape}
                        onChange={(e) => setEsaShape(e.target.value as A1EsaShape)}
                        disabled={busy}
                      >
                        <option value="straight_arrow">Straight Arrow (E→S→A)</option>
                        <option value="boomerang">Boomerang (E→A→S→A)</option>
                        <option value="patchwork">Patchwork (mixed)</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={labelCls}>New Lexical Chunks</span>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        className={inputCls}
                        value={chunkTargets}
                        onChange={(e) => setChunkTargets(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
                        disabled={busy}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Defaults from the A1 unit blueprint. Both fields are persisted on the lesson and
                    HARD-blocked by QA (<code>PG_ESA_SHAPE_UNDECLARED</code> / <code>PG_CHUNKS_UNDECLARED</code>).
                  </p>
                </div>
              )}

              <label className="block">
                <span className={labelCls}>🎭 Starring Character (optional)</span>
                <select
                  className={inputCls}
                  value={starringId}
                  onChange={(e) => setStarringId(e.target.value)}
                  disabled={busy}
                >
                  <option value="">— No featured character —</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  When set, the AI will write {hub === 'playground' ? 'the kid-friendly' : 'the'} story and images around this character.
                </p>
              </label>

              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded((x) => !x)}
                  className={`w-full flex items-center justify-between px-4 py-3 ${theme.chipBg} ${theme.chipText} font-bold text-sm`}
                >
                  <span>Blueprint Details {canGenerate ? '✓' : '(auto-filled by AI)'}</span>
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expanded && (
                  <div className="p-4 space-y-4 bg-white">
                    <label className="block">
                      <span className={labelCls}>🎯 Learning Objective (SWBAT)</span>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        value={learningObjective}
                        onChange={(e) => setLearningObjective(e.target.value)}
                        placeholder="Auto-filled by AI — e.g. Student will be able to order food at a restaurant using polite requests."
                        disabled={busy}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>🏁 Final Output Task</span>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        value={finalOutputTask}
                        onChange={(e) => setFinalOutputTask(e.target.value)}
                        placeholder="Auto-filled by AI — e.g. Roleplay: order a 3-course meal with a partner using all 5 target words."
                        disabled={busy}
                      />
                    </label>
                    <div>
                      <span className={labelCls}>
                        {isPreA1 ? 'Target Vocabulary (3-4 CVC words)' : 'Target Vocabulary (5 words)'}
                      </span>
                      <div className="mt-1 grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {vocab.map((w, i) => (
                          <input
                            key={i}
                            className={smallInputCls}
                            value={w}
                            onChange={(e) => {
                              const next = [...vocab];
                              next[i] = e.target.value;
                              setVocab(next);
                            }}
                            placeholder={isPreA1 && i >= 4 ? '(optional)' : `Word ${i + 1}`}
                            disabled={busy}
                          />
                        ))}
                      </div>
                    </div>
                    {!isPreA1 && (
                      <label className="block">
                        <span className={labelCls}>Grammar Focus</span>
                        <input
                          className={inputCls}
                          value={grammar}
                          onChange={(e) => setGrammar(e.target.value)}
                          placeholder="e.g. Present simple"
                          disabled={busy}
                        />
                      </label>
                    )}
                    <label className="block">
                      <span className={labelCls}>
                        {hub === 'success'
                          ? '🎙 Pronunciation / Intonation Focus'
                          : hub === 'academy'
                          ? '🔊 Pronunciation Focus'
                          : '🔊 Target Phonics / Sound'}
                      </span>
                      <input
                        className={inputCls}
                        value={phonics}
                        onChange={(e) => setPhonics(e.target.value)}
                        placeholder={isPreA1 ? 'e.g. Short A: /æ/, Consonant M: /m/' : 'e.g. Short /a/, Word stress'}
                        disabled={busy}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>🎯 Student Interests (creative anchor)</span>
                      <input
                        className={inputCls}
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="e.g. football, Pokemon, dinosaurs"
                        disabled={busy}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>🛠 Specific Needs / Goals</span>
                      <input
                        className={inputCls}
                        value={needs}
                        onChange={(e) => setNeeds(e.target.value)}
                        placeholder="e.g. shy speaker, exam prep, dyslexic"
                        disabled={busy}
                      />
                    </label>
                  </div>
                )}
              </div>

              {!canGenerate && !busy && (
                <p className="text-xs text-slate-500">
                  Click <strong>Auto-Fill</strong> or fill in {isPreA1 ? '3 CVC words plus a phonics focus' : 'all 5 vocabulary words and a grammar focus'} to generate slides.
                </p>
              )}
            </div>

            <div className={`p-4 ${theme.footerBg} border-t ${theme.footerBorder} flex justify-end gap-2`}>
              <button
                disabled={busy}
                onClick={onClose}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={!canGenerate}
                onClick={handleGenerate}
                className={`px-5 py-2 rounded-xl ${theme.primaryBtn} text-white font-bold shadow-md disabled:opacity-50 inline-flex items-center gap-2`}
              >
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Slides</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
