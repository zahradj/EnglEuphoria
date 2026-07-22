import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { GameMode } from "@/types/ironLMS";

interface GameModeSelectorProps {
  value: GameMode;
  onChange: (value: GameMode) => void;
}

const modes: { value: GameMode; label: string; icon: string; desc: string }[] = [
  {
    value: "mechanic",
    label: "Mechanic (Drill)",
    icon: "⚙️",
    desc: "Multiple choice practice with instant feedback",
  },
  {
    value: "context",
    label: "Context (Reading)",
    icon: "📖",
    desc: "Story-based learning with clickable vocabulary",
  },
  {
    value: "application",
    label: "Application (Scenario)",
    icon: "🎭",
    desc: "Real-world situations with response choices",
  },
];

export const GameModeSelector = ({ value, onChange }: GameModeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Game Mode</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as GameMode)}>
        <div className="space-y-2">
          {modes.map((mode) => (
            <label
              key={mode.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                value === mode.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={mode.value} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{mode.icon}</span>
                  <span className="font-medium">{mode.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
