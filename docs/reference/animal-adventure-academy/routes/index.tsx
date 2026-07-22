import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, PlayCircle } from "lucide-react";
import catImg from "@/assets/animals/cat.png";
import cowImg from "@/assets/animals/cow.png";
import dogImg from "@/assets/animals/dog.png";
import duckImg from "@/assets/animals/duck.png";
import monkeyImg from "@/assets/animals/monkey.png";
import snakeImg from "@/assets/animals/snake.png";
import tigerImg from "@/assets/animals/tiger.png";
import oceanFishImg from "@/assets/animals/ocean-fish.png";
import octopusImg from "@/assets/animals/octopus.png";
import crabImg from "@/assets/animals/crab.png";
import storyPetsImg from "@/assets/story/scene-pets.jpg";
import storyJungleImg from "@/assets/story/scene-jungle.jpg";
import storyOceanImg from "@/assets/story/scene-ocean.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Playground Hub · Engleuphoria" },
      {
        name: "description",
        content:
          "Playful English lessons for true beginners ages 4–9. Pets, jungle friends and ocean animals — vocabulary, phonics, and games in the Playground Hub.",
      },
      { property: "og:title", content: "Playground Hub · Engleuphoria" },
      {
        property: "og:description",
        content: "Playful English lessons for true beginners ages 4–9.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-playground-mesh">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)] backdrop-blur">
            <Sparkles className="h-4 w-4" /> Playground Hub
          </span>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-[color:var(--playground-ink)] sm:text-6xl">
            Let's learn English the fun way!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[color:var(--playground-ink)]/70 sm:text-xl">
            Pre-A · A1 · A2 lessons for ages 4 to 9. Each lesson builds on the last.
          </p>
        </header>

        <section className="mt-12">
          <span className="block text-center text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
            🐾 Unit: Animal friends
          </span>
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <LessonCard
              number={1}
              title="Pets 🐾"
              blurb="6 pets · sentence builder · /c/ phonic sound · CVC blending · scrambled spelling."
              bullets={["Vocabulary", "Modeling", "Build: It is a ___", "Phonics /c/", "Spell"]}
              images={[catImg, cowImg, dogImg, duckImg]}
              to="/playground/animals"
            />
            <LessonCard
              number={2}
              title="Jungle friends 🌴"
              blurb="3 NEW jungle animals · describe with colors: 'It is a tiger. It is orange and black.'"
              bullets={["Minimised vocab (3)", "Describe with colors", "Listen & choose", "Spell"]}
              images={[monkeyImg, snakeImg, tigerImg]}
              to="/playground/jungle"
            />
            <LessonCard
              number={3}
              title="Ocean animals 🌊"
              blurb="3 sea animals · stack color + size: 'It is a small orange fish.'"
              bullets={["Review L1 frame", "Review L2 colors", "Add size adjective", "Build long sentence"]}
              images={[oceanFishImg, octopusImg, crabImg]}
              to="/playground/ocean"
            />
            <LessonCard
              number={4}
              title="Storybook 📖"
              blurb="Cat and Dog's Big Day · read · fill the gaps · Pre-A1, A1 & A2 questions."
              bullets={["Assigned before class", "Re-read with gaps", "Leveled questions", "Uses L1-L3 words"]}
              images={[storyPetsImg, storyJungleImg, storyOceanImg, catImg]}
              to="/playground/storybook"
            />
            <LessonCard
              number={5}
              title="Big Review 🔁"
              blurb="All 12 animals · colours · sentence mixer · listening sprint."
              bullets={["12-card flashcards", "Colour review", "Sort by home", "Listening sprint"]}
              images={[catImg, tigerImg, oceanFishImg, monkeyImg]}
              to="/playground/review"
            />
            <LessonCard
              number={6}
              title="Unit Quiz 🏆"
              blurb="10 mixed questions · pictures, colours, sentences · stars at the end."
              bullets={["10 questions", "Picture & text mix", "Score & stars", "Try again"]}
              images={[dogImg, snakeImg, octopusImg, crabImg]}
              to="/playground/quiz"
            />
          </div>

          <div className="mt-8">
            <span className="block text-center text-xs font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/60">
              Optional booster
            </span>
            <div className="mx-auto mt-3 max-w-3xl">
              <Link
                to="/playground/practice"
                className="glass-card shadow-playground flex flex-col items-start gap-3 rounded-[2rem] p-6 transition hover:scale-[1.01] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--playground-primary)]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
                    💪 Booster · not numbered
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-[color:var(--playground-ink)]">
                    Extra Practice
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--playground-ink)]/70">
                    A gentle safety net — phonics, core words and easy frames. Suggested when the
                    Review or Quiz felt hard. Loops back to the Quiz when done.
                  </p>
                </div>
                <span
                  className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
                  style={{ background: "var(--playground-primary)" }}
                >
                  <PlayCircle className="h-4 w-4" /> Open Booster
                </span>
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-sm text-[color:var(--playground-ink)]/50">
          More units coming soon — Colors, Food, Family.
        </footer>
      </div>
    </div>
  );
}

function LessonCard({
  number, title, blurb, bullets, images, to,
}: {
  number: number;
  title: string;
  blurb: string;
  bullets: string[];
  images: string[];
  to:
    | "/playground/animals"
    | "/playground/jungle"
    | "/playground/ocean"
    | "/playground/storybook"
    | "/playground/review"
    | "/playground/quiz"
    | "/playground/practice";
}) {
  return (
    <div className="glass-card-strong shadow-playground rounded-[2rem] p-6 sm:p-8">
      <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
        Lesson {number}
      </span>
      <h2 className="mt-2 text-3xl font-black text-[color:var(--playground-ink)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 text-base text-[color:var(--playground-ink)]/70">{blurb}</p>
      <ul className="mt-3 grid gap-1.5 text-sm text-[color:var(--playground-ink)]/80">
        {bullets.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--playground-primary)]" />
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {images.slice(0, 4).map((src, i) => (
          <div key={i} className="glass-card flex aspect-square items-center justify-center rounded-2xl p-2">
            <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
          </div>
        ))}
      </div>
      <Link
        to={to}
        className="shadow-playground mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white transition hover:scale-105"
        style={{ background: "var(--playground-primary)" }}
      >
        <PlayCircle className="h-5 w-5" />
        Start lesson {number}
      </Link>
    </div>
  );
}
