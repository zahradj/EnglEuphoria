import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const systems = [
  { id: "kids", label: "🛝 Playground", description: "Kids/Foundation • Cartoon & Vibrant" },
  { id: "teen", label: "🏫 The Academy", description: "Teens/Structure • Realistic & Modern" },
  { id: "adult", label: "🏢 The Hub", description: "Adults/Pro • Corporate & Minimalist" },
];

export const SystemSelector = ({ value, onChange }: SystemSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="system">Target System</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="system">
          <SelectValue placeholder="Select target audience" />
        </SelectTrigger>
        <SelectContent>
          {systems.map((system) => (
            <SelectItem key={system.id} value={system.id}>
              <div className="flex flex-col">
                <span>{system.label}</span>
                <span className="text-xs text-muted-foreground">{system.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
