
import { useState, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export function useGamePosition(initialPosition: Position, initialSize: Size) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);

  // Center content in whiteboard and ensure it fits within bounds
  const adjustToWhiteboardBounds = () => {
    const whiteboardElement = document.querySelector('.whiteboard-container');
    if (!whiteboardElement) return;

    const whiteboardRect = whiteboardElement.getBoundingClientRect();
    const padding = 20;
    const topPadding = 60;
    
    const maxWidth = whiteboardRect.width - (padding * 2);
    const maxHeight = whiteboardRect.height - topPadding - padding;

    // Use 80% of the available space for better visibility
    const preferredWidth = Math.max(600, maxWidth * 0.8);
    const preferredHeight = Math.max(400, maxHeight * 0.8);

    // Adjust size to fit within whiteboard
    const adjustedWidth = Math.min(preferredWidth, maxWidth);
    const adjustedHeight = Math.min(preferredHeight, maxHeight);

    // Center the game in the whiteboard
    const centeredX = (maxWidth - adjustedWidth) / 2 + padding;
    const centeredY = (maxHeight - adjustedHeight) / 2 + topPadding;

    setSize({ width: adjustedWidth, height: adjustedHeight });
    setPosition({ x: centeredX, y: centeredY });
  };

  useEffect(() => {
    adjustToWhiteboardBounds();
    window.addEventListener('resize', adjustToWhiteboardBounds);
    return () => window.removeEventListener('resize', adjustToWhiteboardBounds);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to whiteboard bounds
      const whiteboardElement = document.querySelector('.whiteboard-container');
      if (whiteboardElement) {
        const whiteboardRect = whiteboardElement.getBoundingClientRect();
        const padding = 20;
        const topPadding = 60;
        const maxX = whiteboardRect.width - size.width - padding;
        const maxY = whiteboardRect.height - size.height - topPadding;
        
        setPosition({
          x: Math.max(padding, Math.min(newX, maxX)),
          y: Math.max(padding, Math.min(newY, maxY))
        });
      } else {
        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, size]);

  return {
    position,
    size,
    handleMouseDown
  };
}
