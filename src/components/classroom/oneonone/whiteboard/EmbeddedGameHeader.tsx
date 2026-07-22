
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

interface EmbeddedGameHeaderProps {
  title: string;
  showError: boolean;
  onRetry: () => void;
  onOpenInNewTab: () => void;
  onRemove: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function EmbeddedGameHeader({
  title,
  showError,
  onRetry,
  onOpenInNewTab,
  onRemove,
  onToggleFullscreen,
  isFullscreen = false
}: EmbeddedGameHeaderProps) {
  return (
    <div className="h-10 bg-blue-500 text-white px-3 py-1 flex items-center justify-between cursor-move">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        {showError && (
          <Badge variant="destructive" className="text-xs">
            Error
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {showError && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="h-6 w-6 p-0 text-white hover:bg-blue-600"
          >
            <RotateCcw size={12} />
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onOpenInNewTab();
          }}
          className="h-6 w-6 p-0 text-white hover:bg-blue-600"
        >
          <ExternalLink size={12} />
        </Button>

        {onToggleFullscreen && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullscreen();
            }}
            className="h-6 w-6 p-0 text-white hover:bg-blue-600"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="h-6 w-6 p-0 text-white hover:bg-red-600"
        >
          <X size={12} />
        </Button>
      </div>
    </div>
  );
}
