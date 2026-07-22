import fish from "@/assets/animals/ocean-fish.png";
import octopus from "@/assets/animals/octopus.png";
import crab from "@/assets/animals/crab.png";

export type OceanAnimal = {
  name: string;
  image: string;
  letters: string[];
  /** Default size descriptor used in modeled sentences. */
  size: "big" | "small";
  /** Single primary color used for the "It is a [size] [color] [animal]" frame. */
  color: string;
  /** Two valid colors the child can pick from in the Describe phase. */
  colors: string[];
};

// Lesson 3 builds on Lessons 1–2:
// frame: "It is a [size] [color] [animal]" e.g. "It is a big orange fish"
export const OCEAN_ANIMALS: OceanAnimal[] = [
  {
    name: "fish",
    image: fish,
    letters: ["f", "i", "s", "h"],
    size: "small",
    color: "orange",
    colors: ["orange", "white"],
  },
  {
    name: "octopus",
    image: octopus,
    letters: ["o", "c", "t", "o", "p", "u", "s"],
    size: "big",
    color: "purple",
    colors: ["purple", "pink"],
  },
  {
    name: "crab",
    image: crab,
    letters: ["c", "r", "a", "b"],
    size: "small",
    color: "red",
    colors: ["red", "orange"],
  },
];

export const OCEAN_COLORS: { name: string; hex: string }[] = [
  { name: "orange", hex: "#FB923C" },
  { name: "purple", hex: "#A855F7" },
  { name: "red", hex: "#EF4444" },
  { name: "white", hex: "#F8FAFC" },
  { name: "pink", hex: "#F472B6" },
  { name: "blue", hex: "#3B82F6" },
];

export const SIZES: { name: "big" | "small"; label: string }[] = [
  { name: "big", label: "Big" },
  { name: "small", label: "Small" },
];

/** "a" vs "an" for the article in front of a color word. */
export function article(word: string): "a" | "an" {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}
