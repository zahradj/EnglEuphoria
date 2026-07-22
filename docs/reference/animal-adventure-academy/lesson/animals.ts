import cat from "@/assets/animals/cat.png";
import cow from "@/assets/animals/cow.png";
import dog from "@/assets/animals/dog.png";
import duck from "@/assets/animals/duck.png";
import pig from "@/assets/animals/pig.png";
import fish from "@/assets/animals/fish.png";
import car from "@/assets/animals/car.png";

export type Animal = {
  name: string;
  image: string;
  letters: string[]; // letters of the word for spelling/blending
};

export const ANIMALS: Animal[] = [
  { name: "cat", image: cat, letters: ["c", "a", "t"] },
  { name: "cow", image: cow, letters: ["c", "o", "w"] },
  { name: "dog", image: dog, letters: ["d", "o", "g"] },
  { name: "duck", image: duck, letters: ["d", "u", "c", "k"] },
  { name: "pig", image: pig, letters: ["p", "i", "g"] },
  { name: "fish", image: fish, letters: ["f", "i", "s", "h"] },
];

export const PHONIC_C_WORDS = [
  { name: "cat", image: cat },
  { name: "cow", image: cow },
  { name: "car", image: car },
];
