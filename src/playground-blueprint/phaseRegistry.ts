/**
 * Phase Registry — maps each lesson_number to its full UI component.
 *
 * The ported reference pages (src/playground-blueprint/lessons/) already
 * contain the LessonShell + phase strip + content for each lesson.
 * This registry just dispatches by lesson_number.
 *
 * In a follow-up, these pages will read content from the AI-generated
 * PlaygroundUnit instead of hardcoded ANIMALS/JUNGLE_ANIMALS/etc.
 * For now they render the canonical reference content so the player
 * works end-to-end while the AI contract is still being wired.
 */
import { lazy, type ComponentType } from "react";
import type { PlaygroundLessonNumber } from "./unitTemplate";

const Animals = lazy(() => import("./lessons/playground.animals"));
const Jungle = lazy(() => import("./lessons/playground.jungle"));
const Ocean = lazy(() => import("./lessons/playground.ocean"));
const Storybook = lazy(() => import("./lessons/playground.storybook"));
const Review = lazy(() => import("./lessons/playground.review"));
const Quiz = lazy(() => import("./lessons/playground.quiz"));
const Practice = lazy(() => import("./lessons/playground.practice"));

export const PHASE_REGISTRY: Record<PlaygroundLessonNumber, ComponentType> = {
  1: Animals,
  2: Jungle,
  3: Ocean,
  4: Storybook,
  5: Review,
  6: Quiz,
  7: Practice,
};
