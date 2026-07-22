import questMap from "@/assets/quest-map.jpg";
import { PrimaryButton, QuestShell } from "./QuestShell";

const STOPS = [
  { emoji: "💬", title: "Warm-Up Chat", time: "3 min", desc: "Quick hellos to get talking." },
  { emoji: "🗺️", title: "Vocabulary Treasure", time: "5 min", desc: "Match words to pictures." },
  { emoji: "🧩", title: "Grammar Quest", time: "6 min", desc: "Pick the chip that fits." },
  { emoji: "🏝️", title: "Reading Island", time: "5 min", desc: "Read a story, answer questions." },
  { emoji: "🎧", title: "Listening Lab", time: "5 min", desc: "Hear it, pick the sentence." },
  { emoji: "🎤", title: "Speaking Challenge", time: "6 min", desc: "Talk about you out loud." },
];

export function RoadmapCard({ onStart }: { onStart: () => void }) {
  return (
    <QuestShell
      emoji="🗺️"
      title="Your Adventure Map"
      subtitle="Here's where we're going today. Tap Start to begin Quest 1!"
      footer={<PrimaryButton onClick={onStart}>Start Quest 1 🚀</PrimaryButton>}
    >
      <div className="rounded-2xl overflow-hidden border-2 border-brand-purple/30 mb-5">
        <img
          src={questMap}
          alt="Illustrated map of the 6 lesson quests"
          width={1024}
          height={1024}
          loading="lazy"
          className="w-full h-48 sm:h-60 object-cover"
        />
      </div>
      <ol className="grid sm:grid-cols-2 gap-3">
        {STOPS.map((s, i) => (
          <li
            key={s.title}
            className="flex items-start gap-3 rounded-2xl border-2 border-border bg-secondary/40 p-3"
          >
            <div className="grid place-items-center w-10 h-10 rounded-full bg-brand-purple text-primary-foreground font-display font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-brand-purple-deep flex items-center gap-2">
                <span aria-hidden>{s.emoji}</span> {s.title}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-brand-purple">{s.time}</span> · {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </QuestShell>
  );
}
