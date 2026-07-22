/**
 * Playground Unit Context — channel between the AI-generated
 * `PlaygroundUnit` (built + validated in PlaygroundCreator) and the
 * 7 lesson pages rendered through `PHASE_REGISTRY`.
 *
 * Phase pages call `usePlaygroundUnit()` and may fall back to bundled
 * reference content when the value is `null` (e.g. the standalone
 * /playground demo routes that don't have an AI unit yet).
 *
 * The provider supports an OPTIONAL mutable mode (when an `onChange`
 * handler is passed) so the new CreatorShell editor can update pages
 * and homework and have the preview re-render live, while the player
 * stays read-only by default.
 */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type {
  PlaygroundHomework,
  PlaygroundLessonContent,
  PlaygroundPage,
  PlaygroundUnit,
} from "./types";
import type { PlaygroundLessonNumber } from "./unitTemplate";

interface PlaygroundUnitContextValue {
  unit: PlaygroundUnit | null;
  updatePage?: (lessonNumber: PlaygroundLessonNumber, pageId: string, patch: Partial<PlaygroundPage>) => void;
  updatePageAndVocabMedia?: (
    lessonNumber: PlaygroundLessonNumber,
    pageId: string,
    patch: Partial<PlaygroundPage>,
    vocabPatch: { word: string; media: { imageUrl?: string; audioUrl?: string } },
  ) => void;
  setHomework?: (lessonNumber: PlaygroundLessonNumber, homework: PlaygroundHomework | undefined) => void;
  setVocabMedia?: (lessonNumber: PlaygroundLessonNumber, word: string, media: { imageUrl?: string; audioUrl?: string }) => void;
  setLessonField?: (lessonNumber: PlaygroundLessonNumber, patch: Partial<PlaygroundLessonContent>) => void;
  setLessonPages?: (lessonNumber: PlaygroundLessonNumber, pages: PlaygroundPage[]) => void;
}

const PlaygroundUnitContext = createContext<PlaygroundUnitContextValue>({ unit: null });

function vocabKey(word: string): string {
  return word.toLowerCase().trim();
}

function mergeVocabMedia(
  current: Record<string, { imageUrl?: string; audioUrl?: string }> | undefined,
  word: string,
  media: { imageUrl?: string; audioUrl?: string },
) {
  const key = vocabKey(word);
  const exactKey = Object.keys(current ?? {}).find((k) => vocabKey(k) === key) ?? key;
  return { ...(current ?? {}), [exactKey]: { ...(current?.[exactKey] ?? {}), ...media } };
}

export function PlaygroundUnitProvider({
  unit,
  onChange,
  children,
}: {
  unit: PlaygroundUnit | null;
  /** Optional. When supplied, edits flow through this callback. */
  onChange?: (next: PlaygroundUnit) => void;
  children: ReactNode;
}) {
  const updatePage = useCallback<NonNullable<PlaygroundUnitContextValue["updatePage"]>>(
    (lessonNumber, pageId, patch) => {
      if (!unit || !onChange) return;
      const lessons = unit.lessons.map((l) => {
        if (l.lesson_number !== lessonNumber) return l;
        const pages = (l.pages ?? []).map((p) =>
          p.id === pageId ? { ...p, ...patch } : p,
        );
        return { ...l, pages };
      });
      onChange({ ...unit, lessons });
    },
    [unit, onChange],
  );

  const updatePageAndVocabMedia = useCallback<NonNullable<PlaygroundUnitContextValue["updatePageAndVocabMedia"]>>(
    (lessonNumber, pageId, patch, vocabPatch) => {
      if (!unit || !onChange) return;
      const lessons = unit.lessons.map((l) => {
        if (l.lesson_number !== lessonNumber) return l;
        const pages = (l.pages ?? []).map((p) =>
          p.id === pageId ? { ...p, ...patch } : p,
        );
        return {
          ...l,
          pages,
          vocab_media: mergeVocabMedia(l.vocab_media, vocabPatch.word, vocabPatch.media),
        };
      });
      onChange({ ...unit, lessons });
    },
    [unit, onChange],
  );

  const setHomework = useCallback<NonNullable<PlaygroundUnitContextValue["setHomework"]>>(
    (lessonNumber, homework) => {
      if (!unit || !onChange) return;
      const lessons = unit.lessons.map((l) =>
        l.lesson_number === lessonNumber ? { ...l, homework } : l,
      );
      onChange({ ...unit, lessons });
    },
    [unit, onChange],
  );

  const setVocabMedia = useCallback<NonNullable<PlaygroundUnitContextValue["setVocabMedia"]>>(
    (lessonNumber, word, media) => {
      if (!unit || !onChange) return;
      const lessons = unit.lessons.map((l) => {
        if (l.lesson_number !== lessonNumber) return l;
        return {
          ...l,
          vocab_media: mergeVocabMedia(l.vocab_media, word, media),
        };
      });
      onChange({ ...unit, lessons });
    },
    [unit, onChange],
  );

  const setLessonField = useCallback<NonNullable<PlaygroundUnitContextValue["setLessonField"]>>(
    (lessonNumber, patch) => {
      if (!unit || !onChange) return;
      const lessons = unit.lessons.map((l) =>
        l.lesson_number === lessonNumber ? ({ ...l, ...patch } as PlaygroundLessonContent) : l,
      );
      onChange({ ...unit, lessons });
    },
    [unit, onChange],
  );

  const setLessonPages = useCallback<NonNullable<PlaygroundUnitContextValue["setLessonPages"]>>(
    (lessonNumber, pages) => {
      if (!unit || !onChange) return;
      const lessons = unit.lessons.map((l) =>
        l.lesson_number === lessonNumber ? { ...l, pages } : l,
      );
      onChange({ ...unit, lessons });
    },
    [unit, onChange],
  );

  const value = useMemo<PlaygroundUnitContextValue>(
    () => ({
      unit,
      updatePage: onChange ? updatePage : undefined,
      updatePageAndVocabMedia: onChange ? updatePageAndVocabMedia : undefined,
      setHomework: onChange ? setHomework : undefined,
      setVocabMedia: onChange ? setVocabMedia : undefined,
      setLessonField: onChange ? setLessonField : undefined,
      setLessonPages: onChange ? setLessonPages : undefined,
    }),
    [unit, onChange, updatePage, updatePageAndVocabMedia, setHomework, setVocabMedia, setLessonField, setLessonPages],
  );

  return (
    <PlaygroundUnitContext.Provider value={value}>
      {children}
    </PlaygroundUnitContext.Provider>
  );
}

export function usePlaygroundUnit(): PlaygroundUnit | null {
  return useContext(PlaygroundUnitContext).unit;
}

export function usePlaygroundUnitMutators() {
  const { updatePage, updatePageAndVocabMedia, setHomework, setVocabMedia, setLessonField, setLessonPages } = useContext(PlaygroundUnitContext);
  return { updatePage, updatePageAndVocabMedia, setHomework, setVocabMedia, setLessonField, setLessonPages };
}

export function usePlaygroundLesson(
  lessonNumber: PlaygroundLessonNumber,
): PlaygroundLessonContent | null {
  const unit = usePlaygroundUnit();
  if (!unit) return null;
  return unit.lessons.find((l) => l.lesson_number === lessonNumber) ?? null;
}
