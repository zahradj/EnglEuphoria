import monkey from "@/assets/animals/monkey.png";
import snake from "@/assets/animals/snake.png";
import tiger from "@/assets/animals/tiger.png";

export type JungleAnimal = {
  name: string;
  image: string;
  letters: string[];
  colors: string[]; // descriptive colors for "It is ___ and ___"
};

// Minimised vocabulary for Lesson 2 — only 3 new animals.
export const JUNGLE_ANIMALS: JungleAnimal[] = [
  {
    name: "monkey",
    image: monkey,
    letters: ["m", "o", "n", "k", "e", "y"],
    colors: ["brown", "yellow"],
  },
  { name: "snake", image: snake, letters: ["s", "n", "a", "k", "e"], colors: ["green", "yellow"] },
  { name: "tiger", image: tiger, letters: ["t", "i", "g", "e", "r"], colors: ["orange", "black"] },
];

export const COLORS: { name: string; hex: string }[] = [
  { name: "brown", hex: "#8B5A2B" },
  { name: "yellow", hex: "#FACC15" },
  { name: "green", hex: "#22C55E" },
  { name: "orange", hex: "#FB923C" },
  { name: "black", hex: "#1F2937" },
  { name: "white", hex: "#F8FAFC" },
];
