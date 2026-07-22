
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiceConfig } from "./types";

interface DiceConfigSelectorProps {
  configs: DiceConfig[];
  currentConfig: DiceConfig;
  onConfigChange: (config: DiceConfig) => void;
}

export function DiceConfigSelector({ configs, currentConfig, onConfigChange }: DiceConfigSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {configs.map((config) => (
        <Button
          key={config.id}
          variant={currentConfig.id === config.id ? "default" : "outline"}
          size="sm"
          onClick={() => onConfigChange(config)}
          className="text-xs"
        >
          {config.name}
          <Badge variant="secondary" className="ml-1 text-xs">
            {config.diceCount}🎲
          </Badge>
        </Button>
      ))}
    </div>
  );
}
