/**
 * ReinforcementTargetPicker — small dropdown letting the teacher pin a
 * homework task or game round to a specific vocab word / grammar target /
 * phonic from the lesson. Stored as `reinforcement_key`:
 *   vocab:<word> | grammar:<key> | phonic:<letter>
 * Consumed downstream by the coherence engine when building the pack.
 */
import { Target } from "lucide-react";
import type { PlaygroundLessonContent } from "@/playground-blueprint/types";

interface Props {
  lesson: PlaygroundLessonContent;
  value?: string;
  onChange: (next: string | undefined) => void;
}

interface Option {
  value: string;
  label: string;
  group: string;
}

function buildOptions(lesson: PlaygroundLessonContent): Option[] {
  const options: Option[] = [];
  for (const word of lesson.vocab ?? []) {
    options.push({ value: `vocab:${word}`, label: word, group: "Vocab" });
  }
  const grammar = (lesson as { grammar_target?: string }).grammar_target;
  if (grammar) options.push({ value: `grammar:${grammar}`, label: grammar, group: "Grammar" });
  const sentenceFrame = (lesson as { sentence_frame?: string }).sentence_frame;
  if (sentenceFrame) options.push({ value: `grammar:${sentenceFrame}`, label: sentenceFrame, group: "Grammar" });
  if (lesson.phonic?.letter) {
    options.push({
      value: `phonic:${lesson.phonic.letter}`,
      label: `${lesson.phonic.letter} ${lesson.phonic.sound}`,
      group: "Phonic",
    });
  }
  return options;
}

export function ReinforcementTargetPicker({ lesson, value, onChange }: Props) {
  const options = buildOptions(lesson);
  if (!options.length) return null;

  const groups = Array.from(new Set(options.map((o) => o.group)));

  return (
    <label className="flex items-center gap-1 text-[11px] text-orange-800">
      <Target className="h-3 w-3 text-orange-600" />
      <span>Target</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="rounded-md border border-orange-200 bg-white px-1 py-0.5 text-[11px]"
      >
        <option value="">Auto</option>
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {options.filter((o) => o.group === g).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
