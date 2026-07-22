import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function CoolDownPhase() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 animate-lesson-bounce items-center justify-center rounded-full text-white shadow-playground"
        style={{ background: "var(--playground-primary)" }}>
        <Sparkles className="h-12 w-12" />
      </div>
      <h2 className="mt-4 text-4xl font-black text-[color:var(--playground-ink)] sm:text-5xl">
        Amazing work! 🌟
      </h2>
      <p className="mt-2 text-lg text-[color:var(--playground-ink)]/70">
        Let's cool down with a fun animal song
      </p>

      <div className="mx-auto mt-6 aspect-video max-w-2xl overflow-hidden rounded-3xl shadow-playground-soft">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/_6HzoUcx3eo"
          title="Old MacDonald Had a Farm"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="mx-auto mt-8 inline-flex flex-col items-center gap-1 rounded-3xl border-4 border-dashed border-[color:var(--playground-primary)] bg-white/60 px-8 py-6">
        <span className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
          Sticker earned
        </span>
        <span className="text-3xl font-black text-[color:var(--playground-ink)]">🐾 Animal Star</span>
        <span className="text-base text-[color:var(--playground-ink)]/70">
          You learned 6 animals & the /c/ sound!
        </span>
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="shadow-playground inline-flex rounded-2xl px-8 py-4 text-lg font-extrabold text-white transition hover:scale-105"
          style={{ background: "var(--playground-primary)" }}
        >
          Back to Playground
        </Link>
      </div>
    </div>
  );
}
