import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CanvasElement } from './CanvasElement';
import { PropertiesPanel } from './PropertiesPanel';
import type { CanvasElementData, CanvasElementType, Slide } from '../types';

interface CanvasEditorProps {
  slide: Slide | null;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  onAddElement?: (type: CanvasElementType) => void;
  readOnly?: boolean;
}

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const DEFAULT_SIZES: Record<CanvasElementType, { w: number; h: number }> = {
  text: { w: 400, h: 80 },
  image: { w: 400, h: 300 },
  shape: { w: 200, h: 200 },
  quiz: { w: 500, h: 300 },
  matching: { w: 500, h: 300 },
  'fill-blank': { w: 500, h: 120 },
  'drag-drop': { w: 500, h: 300 },
  sorting: { w: 400, h: 300 },
  'sentence-builder': { w: 500, h: 200 },
  audio: { w: 300, h: 80 },
  video: { w: 640, h: 360 },
  character: { w: 250, h: 300 },
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ slide, onUpdateSlide, readOnly }) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const elements: CanvasElementData[] = slide?.canvasElements || [];
  const selectedElement = elements.find(e => e.id === selectedElementId) || null;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / CANVAS_W;
      const scaleY = rect.height / CANVAS_H;
      setScale(Math.min(scaleX, scaleY));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const addElement = useCallback((type: CanvasElementType) => {
    const size = DEFAULT_SIZES[type] || { w: 300, h: 200 };
    const newElement: CanvasElementData = {
      id: uuidv4(),
      elementType: type,
      x: Math.round(CANVAS_W / 2 - size.w / 2),
      y: Math.round(CANVAS_H / 2 - size.h / 2),
      width: size.w,
      height: size.h,
      rotation: 0,
      zIndex: elements.length + 1,
      content: type === 'text' ? { text: 'New Text', fontSize: 32, bold: false, italic: false, align: 'center', color: '#000000' }
        : type === 'quiz' ? { question: '', options: [] }
        : type === 'matching' ? { title: 'Match the pairs', pairs: [{ left: '', right: '' }] }
        : type === 'fill-blank' ? { sentence: '', answer: '' }
        : type === 'shape' ? { shape: 'rounded', fill: '#6366f1', opacity: 1 }
        : type === 'audio' ? { label: 'Audio clip', src: '' }
        : type === 'character' ? { name: 'pip', animation: 'idle', src: '/pip-mascot.png', speechBubble: '' }
        : {},
    };
    onUpdateSlide({ canvasElements: [...elements, newElement] });
    setSelectedElementId(newElement.id);
  }, [elements, onUpdateSlide]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElementData>) => {
    const updated = elements.map(e => e.id === id ? { ...e, ...updates } : e);
    onUpdateSlide({ canvasElements: updated });
  }, [elements, onUpdateSlide]);

  const deleteElement = useCallback((id: string) => {
    onUpdateSlide({ canvasElements: elements.filter(e => e.id !== id) });
    if (selectedElementId === id) setSelectedElementId(null);
  }, [elements, selectedElementId, onUpdateSlide]);

  // Expose addElement for external toolbar via parent data-canvas-editor element
  React.useEffect(() => {
    const parent = containerRef.current?.closest('[data-canvas-editor]');
    if (parent) {
      (parent as any).__addElement = addElement;
    }
  }, [addElement]);

  if (!slide) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Select a slide to start editing</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-muted/20 flex items-center justify-center overflow-hidden relative"
      onClick={() => setSelectedElementId(null)}
    >
      <div
        className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
      >
        {slide.imageUrl && (
          <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={!readOnly && element.id === selectedElementId}
            scale={scale}
            onSelect={() => !readOnly && setSelectedElementId(element.id)}
            onUpdate={readOnly ? () => {} : (updates) => updateElement(element.id, updates)}
            onDelete={readOnly ? () => {} : () => deleteElement(element.id)}
          />
        ))}

        {elements.length === 0 && !slide.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <div className="text-center">
              <p className="text-2xl font-light mb-2">{readOnly ? 'No Content' : 'Empty Canvas'}</p>
              {!readOnly && <p className="text-sm">Add elements from the left toolbar</p>}
            </div>
          </div>
        )}
      </div>

      {/* Floating Properties Panel — hidden in read-only mode */}
      {!readOnly && selectedElement && (
        <div className="absolute right-4 top-4 z-50" onClick={(e) => e.stopPropagation()}>
          <PropertiesPanel
            element={selectedElement}
            onUpdate={(updates) => selectedElementId && updateElement(selectedElementId, updates)}
            onClose={() => setSelectedElementId(null)}
            floating
          />
        </div>
      )}
    </div>
  );
};
