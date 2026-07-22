// Parsed Produce unit — derived from manifests/produce.unit.json so the
// linguistic data layer stays decoupled from any UI route file.

import manifest from "../manifests/produce.unit.json";
import type { UnitManifest } from "./unitManifest";

export const PRODUCE_MANIFEST = manifest as UnitManifest;

export interface ProduceItem {
  id: string;
  name: string;
  image: string;
  category: "core" | "expansion" | "complex";
}

const toItems = (
  words: string[] | undefined,
  category: ProduceItem["category"],
  offset: number,
): ProduceItem[] =>
  (words ?? []).map((name, i) => ({
    id: `p${offset + i + 1}`,
    name,
    image: `/src/assets/produce/${name}.png`,
    category,
  }));

const core = (PRODUCE_MANIFEST.lessons.l1_core as { vocab?: string[] }).vocab;
const expansion = (PRODUCE_MANIFEST.lessons.l2_expansion as { vocab?: string[] }).vocab;
const complex = (PRODUCE_MANIFEST.lessons.l3_complex as { vocab?: string[] }).vocab;

export const PRODUCE_VOCAB: ProduceItem[] = [
  ...toItems(core, "core", 0),
  ...toItems(expansion, "expansion", (core?.length ?? 0)),
  ...toItems(complex, "complex", (core?.length ?? 0) + (expansion?.length ?? 0)),
];

// OSASCOMP: article is chosen by the FIRST descriptor's leading sound
// (the size adjective), never by the noun. Color is irrelevant to a/an.
export function getProduceArticle(size: string, _color?: string): string {
  const first = size.toLowerCase().trim().split(/\s+/)[0] ?? "";
  return /^[aeiou]/.test(first) ? "an" : "a";
}

// Build a full OSASCOMP-compliant phrase, e.g. ("big","green","watermelon")
// → "a big green watermelon".
export function buildProducePhrase(size: string, color: string, noun: string): string {
  return `${getProduceArticle(size, color)} ${size} ${color} ${noun}`.trim();
}
