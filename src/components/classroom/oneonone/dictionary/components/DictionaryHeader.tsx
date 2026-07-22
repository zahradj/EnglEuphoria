
import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Minimize2, Maximize2, X } from "lucide-react";

interface DictionaryHeaderProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function DictionaryHeader({ 
  isMinimized, 
  onToggleMinimize, 
  onClose, 
  onMouseDown 
}: DictionaryHeaderProps) {
  return (
    <CardHeader 
      className="pb-2 cursor-move bg-blue-50 rounded-t-lg"
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-blue-600" />
          <span className="font-medium text-sm">Dictionary</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
