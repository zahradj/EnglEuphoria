import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TargetGroup } from "@/types/ironLMS";

interface TargetGroupSelectorProps {
  value: TargetGroup;
  onChange: (value: TargetGroup) => void;
}

const groups: { value: TargetGroup; label: string; icon: string; desc: string }[] = [
  { value: "playground", label: "Playground", icon: "🎮", desc: "Kids (5-10)" },
  { value: "academy", label: "Academy", icon: "📚", desc: "Teens (11-17)" },
  { value: "hub", label: "Hub", icon: "💼", desc: "Adults (18+)" },
];

export const TargetGroupSelector = ({ value, onChange }: TargetGroupSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Target Group</Label>
      <div className="grid grid-cols-3 gap-2">
        {groups.map((group) => (
          <button
            key={group.value}
            type="button"
            onClick={() => onChange(group.value)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              value === group.value
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border bg-card"
            )}
          >
            <span className="text-2xl mb-1">{group.icon}</span>
            <span className="font-medium text-sm">{group.label}</span>
            <span className="text-xs text-muted-foreground">{group.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
