import trailMap from "@/assets/success-trail/trail-map.jpg";
import { PrimaryButton, QuestShell } from "./QuestShell";
import { TRACK_LABEL, type Track } from "./levels";

const STOPS: Record<Track, { emoji: string; title: string; time: string; desc: string }[]> = {
  professionals: [
    { emoji: "💬", title: "Warm-Up", time: "3 min", desc: "Talk about your role and week." },
    { emoji: "🗺️", title: "Vocabulary", time: "5 min", desc: "Workplace terms — match the meaning." },
    { emoji: "🧩", title: "Grammar", time: "5 min", desc: "Pick the form that fits the sentence." },
    { emoji: "📖", title: "Reading", time: "6 min", desc: "Short business article + question." },
    { emoji: "🎧", title: "Listening", time: "5 min", desc: "Hear a meeting clip, answer it." },
    { emoji: "🎤", title: "Speaking", time: "6 min", desc: "Pitch a project out loud." },
  ],
  college: [
    { emoji: "💬", title: "Warm-Up", time: "3 min", desc: "Talk about what you're studying." },
    { emoji: "🗺️", title: "Vocabulary", time: "5 min", desc: "Academic words — match the meaning." },
    { emoji: "🧩", title: "Grammar", time: "5 min", desc: "Choose the form that fits." },
    { emoji: "📖", title: "Reading", time: "6 min", desc: "Short research blurb + question." },
    { emoji: "🎧", title: "Listening", time: "5 min", desc: "Hear a class announcement, answer it." },
    { emoji: "🎤", title: "Speaking", time: "6 min", desc: "Explain a topic from your major." },
  ],
  adults: [
    { emoji: "💬", title: "Warm-Up", time: "3 min", desc: "Tell me about your everyday life." },
    { emoji: "🗺️", title: "Vocabulary", time: "5 min", desc: "Real-life words — match the meaning." },
    { emoji: "🧩", title: "Grammar", time: "5 min", desc: "Pick the form that fits." },
    { emoji: "📖", title: "Reading", time: "6 min", desc: "Short everyday article + question." },
    { emoji: "🎧", title: "Listening", time: "5 min", desc: "Hear a phone message, answer it." },
    { emoji: "🎤", title: "Speaking", time: "6 min", desc: "Talk about a place you'd love to visit." },
  ],
};

export function RoadmapCard({ onStart, track }: { onStart: () => void; track: Track }) {
  const stops = STOPS[track];
  return (
    <QuestShell
      emoji="🗺️"
      title="Your 30-minute trail"
      subtitle={`Tailored for ${TRACK_LABEL[track]}. Tap Start to begin Stop 1.`}
      footer={<PrimaryButton onClick={onStart}>Start Stop 1 🚀</PrimaryButton>}
    >
      <div className="rounded-2xl overflow-hidden border-2 border-brand-emerald/30 mb-5 relative">
        <img
          src={trailMap}
          alt="Illustrated trail with six lesson stops"
          width={1280}
          height={768}
          loading="lazy"
          className="w-full h-48 sm:h-60 object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklch, var(--brand-emerald-deep) 0%, transparent) 40%, color-mix(in oklch, var(--brand-emerald-deep) 35%, transparent) 100%)",
          }}
        />
      </div>
      <ol className="grid sm:grid-cols-2 gap-3">
        {stops.map((s, i) => (
          <li
            key={s.title}
            className="flex items-start gap-3 rounded-2xl border-2 border-border bg-secondary/40 p-3"
          >
            <div className="grid place-items-center w-10 h-10 rounded-full bg-brand-emerald text-primary-foreground font-display font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-brand-emerald-deep flex items-center gap-2">
                <span aria-hidden>{s.emoji}</span> {s.title}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-brand-emerald">{s.time}</span> · {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </QuestShell>
  );
}
