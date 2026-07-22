import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SlideRenderer, type Slide } from "@/pages/PlaygroundDemo";
import { derivePages } from "@/playground-blueprint/derivePages";
import type { PlaygroundBlock, PlaygroundLessonContent, PlaygroundPage, PlaygroundUnit } from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";

interface RealStudentPreviewOverlayProps {
  open: boolean;
  unit: PlaygroundUnit | null;
  lessonNumber: PlaygroundLessonNumber;
  cefr?: string;
  onLessonChange: (lessonNumber: PlaygroundLessonNumber) => void;
  onClose: () => void;
}

export function RealStudentPreviewOverlay({
  open,
  unit,
  lessonNumber,
  cefr,
  onLessonChange,
  onClose,
}: RealStudentPreviewOverlayProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  const lesson = useMemo(
    () => unit?.lessons.find((item) => item.lesson_number === lessonNumber) ?? null,
    [unit, lessonNumber],
  );

  const slides = useMemo(() => {
    if (!unit || !lesson) return [] as Slide[];
    return buildStudentSlides(unit, lesson);
  }, [unit, lesson]);

  useEffect(() => {
    if (open) setSlideIndex(Math.max(0, slides.findIndex((slide) => slide.type !== "intro")));
  }, [open, lessonNumber, slides]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setSlideIndex((value) => Math.min(slides.length - 1, value + 1));
      if (event.key === "ArrowLeft") setSlideIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, slides.length]);

  if (!open) return null;

  const activeSlide = slides[Math.min(slideIndex, slides.length - 1)];
  const hasSlides = slides.length > 0;

  return (
    <div className="fixed inset-0 z-[140] flex flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Student player</p>
          <h2 className="truncate text-lg font-black">
            {unit?.unit_topic || "Playground unit"} · Lesson {lessonNumber}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground">
            {cefr || "Pre-A1"} · {hasSlides ? `Slide ${slideIndex + 1} of ${slides.length}` : "No slides"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-border bg-muted p-1">
            {([1, 2, 3, 4, 5, 6, 7] as PlaygroundLessonNumber[]).map((number) => (
              <button
                key={number}
                onClick={() => onLessonChange(number)}
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${
                  number === lessonNumber ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background"
                }`}
                aria-label={`Preview lesson ${number}`}
              >
                {number}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden bg-muted/30">
        {!hasSlides ? (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <p className="text-xl font-black">Generate or edit a lesson first.</p>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">The student player will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="grid h-full grid-rows-[1fr_auto]">
            <section className="min-h-0 overflow-auto p-4 md:p-6">
              <div className="mx-auto flex min-h-[calc(100vh-190px)] max-w-5xl items-center justify-center rounded-2xl border border-border bg-background p-4 md:p-8">
                <div className="relative flex w-full flex-col items-center justify-center">
                  <SlideRenderer
                    key={`${lessonNumber}-${slideIndex}`}
                    slide={activeSlide}
                    lessonContext={{
                      lessonTitle: lesson?.story?.title || unit?.unit_topic,
                      level: cefr || "Pre-A1",
                      unitTitle: unit?.unit_topic,
                      lessonNumber,
                      hub: "playground",
                    }}
                  />
                </div>
              </div>
            </section>

            <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
              <button
                onClick={() => setSlideIndex((value) => Math.max(0, value - 1))}
                disabled={slideIndex === 0}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="min-w-0 flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((slideIndex + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setSlideIndex((value) => Math.min(slides.length - 1, value + 1))}
                disabled={slideIndex >= slides.length - 1}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

function buildStudentSlides(unit: PlaygroundUnit, lesson: PlaygroundLessonContent): Slide[] {
  const pages = derivePages(lesson);
  const slides: Slide[] = [];
  const title = lessonTitle(unit, lesson);

  if (lesson.vocab?.length) {
    slides.push({
      type: "vocab_grid",
      instruction: "New words",
      shape: "circle",
      cards: lesson.vocab.map((word) => ({
        word: word.toUpperCase(),
        definition: shortDefinition(word),
        image_url: lesson.vocab_media?.[word]?.imageUrl || lesson.vocab_media?.[word.toLowerCase()]?.imageUrl || word,
      })),
      voice: { text: `New words: ${lesson.vocab.join(", ")}`, autoPlay: false },
    } as Slide);
  }

  slides.unshift({
    type: "intro",
    title,
    text: String((lesson as any).communication_goal || (lesson as any).focus_label || `Let's learn ${unit.unit_topic}.`),
    voice: { text: title, autoPlay: false },
  });

  if (lesson.phonic) {
    slides.push({
      type: "phonics_focus",
      grapheme: lesson.phonic.letter,
      phoneme: lesson.phonic.sound,
      label: `Sound ${lesson.phonic.letter}`,
      example_words: lesson.phonic.words,
      voice: { text: `${lesson.phonic.letter}. ${lesson.phonic.words.join(", ")}`, autoPlay: false },
    } as Slide);
  }

  for (const page of pages.filter((item) => item.phase_id !== "intro")) {
    for (const block of page.blocks) {
      slides.push(...blockToSlides(block, page, lesson));
    }
  }

  if (lesson.story?.scenes?.length) {
    slides.push({
      type: "storybook",
      title: lesson.story.title,
      topic: unit.unit_topic,
      pages: lesson.story.scenes.map((scene, index) => ({
        page_number: index + 1,
        text: scene.text,
        image_prompt: scene.image_prompt,
      })),
      voice: { text: lesson.story.title, autoPlay: false },
    });
  }

  slides.push({
    type: "lesson_summary",
    title: "Great work!",
    vocab_recap: lesson.vocab?.slice(0, 6) ?? [],
    grammar_recap: String((lesson as any).grammar_target || ""),
    takeaway: "You finished the lesson.",
    voice: { text: "Great work!", autoPlay: false },
  });

  return slides.filter(Boolean).slice(0, 28);
}

function blockToSlides(block: PlaygroundBlock, page: PlaygroundPage, lesson: PlaygroundLessonContent): Slide[] {
  if (block.kind === "text") {
    return [{
      type: "intro",
      title: block.label || page.title || "Listen and learn",
      text: block.value,
      voice: { text: block.value.slice(0, 180), autoPlay: false },
    }];
  }

  if (block.kind === "image") {
    return [{
      type: "vocab_solo",
      word: block.label || block.subject || "Look",
      definition: block.prompt || block.subject,
      image_url: block.url || block.subject,
      voice: { text: block.subject || block.label || "Look", autoPlay: false },
    } as Slide];
  }

  if (block.kind === "audio") {
    return [{
      type: "vocab_solo",
      word: block.label || "Listen",
      definition: block.text || "Listen and repeat.",
      audio_url: block.url,
      voice: { text: block.text || block.label || "Listen", autoPlay: false },
    } as Slide];
  }

  if (block.kind === "video") {
    return [{
      type: "media_player",
      title: block.label || "Watch",
      media_url: block.url || "",
      media_kind: "video",
      transcript: "",
    }];
  }

  if (block.kind === "music") {
    return [{
      type: "intro",
      title: block.label || "Music",
      text: block.mood,
      voice: { text: block.mood, autoPlay: false },
    }];
  }

  if (block.kind === "language_engine_slot") {
    return [{
      type: "intro",
      title: block.title || block.label || "Language Engine",
      text: block.objective || "Immersive language quest",
      voice: { text: block.objective || "", autoPlay: false },
    }];
  }

  return [activityToSlide(block, lesson)];
}

function activityToSlide(block: Extract<PlaygroundBlock, { kind: "activity" }>, lesson: PlaygroundLessonContent): Slide {
  const config = block.config ?? {};
  const prompt = text(config.prompt, config.question, block.label, "Try it!");
  const answer = text(config.answer, (config.answers as string[] | undefined)?.[0], config.word, "");
  const options = activityWords(config, lesson);

  if (["match_pictures", "listen_and_match", "match_word"].includes(block.type)) {
    return {
      type: "match",
      instruction: prompt,
      pairs: activityPairs(config, lesson).slice(0, 6),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["listen_and_point", "hotspot"].includes(block.type)) {
    const words = options.length ? options : (lesson.vocab ?? []).slice(0, 6);
    return {
      type: "hotspot",
      instruction: prompt,
      parts: words.slice(0, 6).map((word) => ({ label: word, emoji: emojiFor(word) })),
      prompts: words.slice(0, 4),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["multiple", "quiz", "odd_one_out"].includes(block.type)) {
    const choices = options.length ? options : [answer, ...(lesson.vocab ?? [])].filter(Boolean).slice(0, 4);
    return {
      type: "multiple",
      question: prompt,
      options: Array.from(new Set(choices)).slice(0, 4),
      answer: answer || choices[0] || "",
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (block.type === "memory_match") {
    const words = options.length ? options : (lesson.vocab ?? []).slice(0, 6);
    return {
      type: "memory",
      instruction: prompt,
      pairs: words.slice(0, 6).map((word) => ({ id: word.toLowerCase(), label: word, emoji: emojiFor(word), image_url: imageForWord(lesson, word) })),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["drag_drop", "drag_word_to_picture", "word_to_picture"].includes(block.type)) {
    const pairs = activityPairs(config, lesson).slice(0, 6);
    if (pairs.length > 1) {
      return {
        type: "drag",
        instruction: prompt,
        pairs,
        voice: { text: prompt, autoPlay: false },
      } as Slide;
    }
    const word = answer || options[0] || (lesson.vocab ?? [])[0] || "cat";
    return {
      type: "drag",
      instruction: prompt,
      word: word.toUpperCase(),
      image_url: imageForWord(lesson, word) || text(config.image_url, config.target_image_url, word),
      distractors: options.filter((item) => item.toLowerCase() !== word.toLowerCase()).slice(0, 3),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["match"].includes(block.type)) {
    return {
      type: "match",
      instruction: prompt,
      pairs: activityPairs(config, lesson).slice(0, 6),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["sort_by_home", "sort", "grammar_sort"].includes(block.type)) {
    const words = options.length ? options : (lesson.vocab ?? []).slice(0, 6);
    const buckets = Array.isArray(config.buckets) && config.buckets.length
      ? (config.buckets as any[]).map((bucket, index) => ({ id: text(bucket?.id, bucket?.label, `bucket-${index}`), label: text(bucket?.label, bucket?.id, `Group ${index + 1}`), emoji: bucket?.emoji }))
      : [
          { id: "home-1", label: "Home 1", emoji: "🏠" },
          { id: "home-2", label: "Home 2", emoji: "🌳" },
        ];
    return {
      type: "sort",
      instruction: prompt,
      buckets,
      items: words.slice(0, 8).map((word, index) => ({ label: word, emoji: emojiFor(word), image_url: imageForWord(lesson, word), bucket: buckets[index % buckets.length].id })),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["sentence_builder", "sentence_scramble", "sequence"].includes(block.type)) {
    const sentence = text(config.sentence, prompt, "I see it");
    const words = stringList(config.lines).length ? stringList(config.lines) : sentence.split(/\s+/).filter(Boolean);
    return {
      type: "tap_order",
      instruction: prompt,
      items: words.map((word) => ({ label: word })),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["fill", "fill_blank"].includes(block.type)) {
    return {
      type: "fill",
      text: text(config.text, config.sentence, prompt),
      answer,
      options,
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  if (["word_builder", "spell_it"].includes(block.type)) {
    return {
      type: "word_builder",
      instruction: prompt,
      word: text(config.word, answer, (lesson.vocab ?? [])[0], "cat"),
      extras: stringList(config.extras),
      show_sounds: true,
      image_url: text(config.image_url, config.word, answer),
      voice: { text: prompt, autoPlay: false },
    } as Slide;
  }

  return {
    type: "intro",
    title: block.label || "Speaking mission",
    text: stringList(config.lines).length ? stringList(config.lines).join("\n") : prompt,
    voice: { text: prompt, autoPlay: false },
  };
}

function activityWords(config: Record<string, unknown>, lesson: PlaygroundLessonContent): string[] {
  const sources = [
    stringList(config.options),
    stringList(config.words),
    stringList(config.items),
    stringList(config.lines),
    stringList(config.answers),
    pairsToWords(config.pairs),
    pairsToWords(config.matches),
    lesson.vocab ?? [],
    ((lesson as any).review_targets ?? []) as string[],
  ];
  return Array.from(new Set(sources.flat().map((word) => word.trim()).filter(Boolean)));
}

function activityPairs(config: Record<string, unknown>, lesson: PlaygroundLessonContent): { word: string; image_url: string }[] {
  const explicit = Array.isArray(config.pairs) && config.pairs.length ? config.pairs : Array.isArray(config.matches) ? config.matches : [];
  const pairs = explicit
    .map((pair: any) => {
      const word = text(pair?.word, pair?.label, pair?.left, pair?.text, pair?.right);
      if (!word) return null;
      return {
        word: word.toUpperCase(),
        image_url: text(pair?.image_url, pair?.imageUrl, pair?.image, pair?.url, imageForWord(lesson, word), word),
      };
    })
    .filter(Boolean) as { word: string; image_url: string }[];
  if (pairs.length) return pairs;
  return activityWords(config, lesson).slice(0, 6).map((word) => ({
    word: word.toUpperCase(),
    image_url: imageForWord(lesson, word) || word,
  }));
}

function pairsToWords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((pair: any) => [pair?.word, pair?.label, pair?.left, pair?.right, pair?.text])
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function imageForWord(lesson: PlaygroundLessonContent, word: string): string {
  const key = word.toLowerCase().trim();
  const media = lesson.vocab_media?.[word] || lesson.vocab_media?.[key];
  return media?.imageUrl || "";
}

function lessonTitle(unit: PlaygroundUnit, lesson: PlaygroundLessonContent) {
  return String((lesson as any).title || (lesson as any).focus_label || `${unit.unit_topic} · Lesson ${lesson.lesson_number}`);
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => typeof item === "string" ? item : text((item as any)?.word, (item as any)?.label, (item as any)?.text))
    .filter(Boolean);
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function shortDefinition(word: string) {
  return `Say: ${word}`;
}

function emojiFor(word: string) {
  const key = word.toLowerCase();
  if (/cat/.test(key)) return "🐱";
  if (/dog/.test(key)) return "🐶";
  if (/cow/.test(key)) return "🐮";
  if (/pig/.test(key)) return "🐷";
  if (/duck|hen|bird/.test(key)) return "🐤";
  if (/apple/.test(key)) return "🍎";
  if (/sun/.test(key)) return "☀️";
  return "⭐";
}