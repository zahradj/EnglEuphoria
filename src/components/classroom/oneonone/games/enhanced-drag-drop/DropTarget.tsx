
import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { MatchItem } from "./types";

interface DropTargetProps {
  item: MatchItem;
  isTarget: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export function DropTarget({ item, isTarget, onDragOver, onDrop }: DropTargetProps) {
  return (
    <Card
      className={`p-3 min-h-[60px] transition-all border-2 border-dashed ${
        isTarget 
          ? 'bg-green-100 border-green-300' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, item.id)}
    >
      <div className="text-center font-medium">
        {item.content}
      </div>
      {isTarget && (
        <div className="flex justify-center mt-1">
          <Star size={16} className="text-green-600" />
        </div>
      )}
    </Card>
  );
}
