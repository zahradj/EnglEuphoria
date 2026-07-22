
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WheelConfig } from "./types";

interface WheelConfigSelectorProps {
  wheelConfigs: WheelConfig[];
  currentConfig: WheelConfig;
  onConfigChange: (config: WheelConfig) => void;
}

export function WheelConfigSelector({ wheelConfigs, currentConfig, onConfigChange }: WheelConfigSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {wheelConfigs.map((config) => (
        <Button
          key={config.id}
          variant={currentConfig.id === config.id ? "default" : "outline"}
          size="sm"
          onClick={() => onConfigChange(config)}
          className="text-xs"
        >
          {config.name}
          <Badge variant="secondary" className="ml-1 text-xs">
            {config.segments}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
