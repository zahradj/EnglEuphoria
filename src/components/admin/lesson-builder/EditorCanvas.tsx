import React from 'react';
import { CanvasEditor } from './canvas/CanvasEditor';
import { Slide } from './types';

interface EditorCanvasProps {
  slide: Slide | null;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  readOnly?: boolean;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ slide, onUpdateSlide, readOnly }) => {
  return <CanvasEditor slide={slide} onUpdateSlide={onUpdateSlide} readOnly={readOnly} />;
};
