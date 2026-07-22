
import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { MatchItem } from "./types";

interface DragItemProps {
  item: MatchItem;
  isMatched: boolean;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
}

export function DragItem({ item, isMatched, onDragStart }: DragItemProps) {
  const getItemEmoji = (content: string) => {
    const emojiMap: Record<string, string> = {
      'cat': '🐱',
      'dog': '🐶',
      'apple': '🍎',
      'book': '📚',
      'house': '🏠',
      'car': '🚗',
      'tree': '🌳',
      'flower': '🌸',
      'sun': '☀️',
      'moon': '🌙',
      'water': '💧',
      'fire': '🔥',
      'hello': '👋',
      'goodbye': '👋',
      'happy': '😊',
      'sad': '😢',
      'eat': '🍽️',
      'drink': '🥤',
      'sleep': '😴',
      'run': '🏃',
      'walk': '🚶',
      'read': '📖',
      'write': '✍️',
      'sing': '🎤',
      'dance': '💃',
    };
    
    const lowerContent = content.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerContent.includes(key)) {
        return emoji;
      }
    }
    return '📝';
  };

  return (
    <Card
      className={`p-3 cursor-move transition-all ${
        isMatched 
          ? 'bg-green-100 border-green-300 opacity-50' 
          : 'hover:shadow-md hover:scale-105'
      }`}
      draggable={!isMatched}
      onDragStart={(e) => onDragStart(e, item.id)}
    >
      <div className="flex items-center gap-2 justify-center">
        <span className="text-2xl">{getItemEmoji(item.content)}</span>
        <div className="text-center font-medium">
          {item.content}
        </div>
      </div>
      {isMatched && (
        <div className="flex justify-center mt-1">
          <Star size={16} className="text-green-600" />
        </div>
      )}
    </Card>
  );
}
