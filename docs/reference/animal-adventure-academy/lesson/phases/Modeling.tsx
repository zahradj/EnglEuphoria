import { useEffect, useState } from "react";
import { ANIMALS } from "@/lib/lesson/animals";
import { speak } from "@/lib/lesson/speech";

export function ModelingPhase({ onComplete }: { onComplete: () => void }) {
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const done = heard.size === ANIMALS.length;

  useEffect(() => {
    if (done) {
      const id = setTimeout(onComplete, 600);
      return () => clearTimeout(id);
    }
  }, [done, onComplete]);

  const tap = (name: string) => {
    speak(`It is a ${name}`);
    setHeard((s) => new Set(s).add(name));
  };

  return (
    <div>
      <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Tap each friend in the forest to hear: <em>"It is a ___"</em>
      </p>

      <div
        className="relative mx-auto overflow-hidden rounded-[2rem] p-4 sm:p-6"
        style={{
          background:
            "radial-gradient(circle at 20% 90%, #6dd56d 0%, transparent 55%), radial-gradient(circle at 85% 95%, #4fb86b 0%, transparent 60%), linear-gradient(180deg, #bfeaff 0%, #d6f5d6 60%, #8ed18e 100%)",
          minHeight: "420px",
        }}
      >
        {/* Sun */}
        <div className="absolute right-6 top-4 h-16 w-16 rounded-full bg-yellow-300 shadow-[0_0_30px_10px_rgba(253,224,71,0.5)]" />
        {/* Trees (decorative) */}
        <div className="absolute left-2 top-8 text-5xl select-none">🌲</div>
        <div className="absolute right-10 top-24 text-4xl select-none">🌳</div>
        <div className="absolute left-1/2 top-2 text-4xl select-none">🌲</div>

        <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ANIMALS.map((a) => {
            const isHeard = heard.has(a.name);
            return (
              <button
                key={a.name}
                onClick={() => tap(a.name)}
                className="group relative flex flex-col items-center gap-2 rounded-3xl p-2 transition hover:scale-105 active:scale-95"
              >
                {/* Speech bubble */}
                <div
                  className="relative rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-[color:var(--playground-ink)] shadow-md sm:text-base"
                  style={{
                    outline: isHeard ? "3px solid var(--playground-primary)" : "none",
                  }}
                >
                  It is a <span className="capitalize text-[color:var(--playground-primary)]">{a.name}</span>!
                  <span
                    className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white"
                    aria-hidden
                  />
                </div>
                <img
                  src={a.image}
                  alt={a.name}
                  className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                />
                {isHeard && (
                  <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--playground-primary)] text-sm text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-base font-medium text-[color:var(--playground-ink)]/60">
        {heard.size} / {ANIMALS.length} heard
      </p>
    </div>
  );
}
