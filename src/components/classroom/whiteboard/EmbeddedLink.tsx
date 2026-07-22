import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Move } from "lucide-react";

interface EmbeddedLinkData {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
}

interface EmbeddedLinkProps {
  link: EmbeddedLinkData;
  onRemove: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

export function EmbeddedLink({ link, onRemove, onMove }: EmbeddedLinkProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return; // Don't drag when clicking buttons
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const container = e.currentTarget.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Keep within bounds
    const maxX = containerRect.width - 250; // Card width
    const maxY = containerRect.height - 100; // Card height
    
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    onMove?.(link.id, boundedX, boundedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleOpenLink = () => {
    // Security: Only open validated URLs in a new tab
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={`absolute w-64 p-3 bg-white shadow-lg border-2 transition-all duration-200 ${
        isDragging ? 'border-blue-400 shadow-xl cursor-grabbing' : 'border-gray-200 cursor-grab hover:shadow-xl'
      }`}
      style={{
        left: link.x,
        top: link.y,
        zIndex: isDragging ? 1000 : 10
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate mb-1">{link.title}</h4>
          <p className="text-xs text-muted-foreground truncate mb-3">{link.url}</p>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={handleOpenLink}
            >
              <ExternalLink size={12} className="mr-1" />
              Open
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Move"
            >
              <Move size={12} />
            </Button>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
          onClick={() => onRemove(link.id)}
          title="Remove link"
        >
          <X size={12} />
        </Button>
      </div>
    </Card>
  );
}
