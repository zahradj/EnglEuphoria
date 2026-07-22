import React, { useState, useRef, useCallback } from 'react';
import { Trash2, Maximize2, Mic, Volume2, MessageCircle } from 'lucide-react';
import pipMascotImg from '@/assets/pip-mascot.png';
import type { CanvasElementData } from '../types';

interface CanvasElementProps {
  element: CanvasElementData;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElementData>) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

const convertVideoUrl = (url: string): string => {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const getItemText = (item: any): string => typeof item === 'string' ? item : item?.text || '';
const getItemImage = (item: any): string => (typeof item === 'object' && item !== null) ? item?.image || '' : '';

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element, isSelected, scale, onSelect, onUpdate, onDelete, readOnly = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, elX: 0, elY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, elX: element.x, elY: element.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [element.x, element.y, onSelect, readOnly]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.current.x) / scale;
      const dy = (e.clientY - dragStart.current.y) / scale;
      onUpdate({ x: Math.round(dragStart.current.elX + dx), y: Math.round(dragStart.current.elY + dy) });
    }
    if (isResizing) {
      const dx = (e.clientX - resizeStart.current.x) / scale;
      const dy = (e.clientY - resizeStart.current.y) / scale;
      onUpdate({
        width: Math.max(60, Math.round(resizeStart.current.w + dx)),
        height: Math.max(40, Math.round(resizeStart.current.h + dy)),
      });
    }
  }, [isDragging, isResizing, scale, onUpdate]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: element.width, h: element.height };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [element.width, element.height]);

  const renderContent = () => {
    switch (element.elementType) {
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
            style={{
              fontSize: element.content?.fontSize || 24,
              fontWeight: element.content?.bold ? 'bold' : 'normal',
              fontStyle: element.content?.italic ? 'italic' : 'normal',
              color: element.content?.color || 'hsl(var(--foreground))',
              textAlign: element.content?.align || 'center',
            }}
          >
            {element.content?.text || 'Double-click to edit'}
          </div>
        );
      case 'image':
        return element.content?.src ? (
          <img src={element.content.src} alt="" className="w-full h-full object-cover rounded" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded text-muted-foreground text-sm">
            Drop image
          </div>
        );
      case 'video': {
        const embedUrl = convertVideoUrl(element.content?.url || '');
        return embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full rounded"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ pointerEvents: readOnly ? 'auto' : 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded text-muted-foreground text-sm">
            🎬 Paste video URL
          </div>
        );
      }
      case 'shape':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.content?.fill || 'hsl(var(--primary))',
              borderRadius: element.content?.shape === 'circle' ? '50%' : element.content?.shape === 'rounded' ? 12 : 0,
              opacity: element.content?.opacity ?? 1,
            }}
          />
        );
      case 'audio':
        return (
          <div className="w-full h-full p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded border border-primary/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              {element.content?.src ? <Volume2 className="h-5 w-5 text-primary" /> : <Mic className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{element.content?.label || 'Audio Clip'}</p>
              {element.content?.src ? (
                <p className="text-[10px] text-muted-foreground">Audio ready</p>
              ) : (
                <p className="text-[10px] text-muted-foreground">No audio — record or generate</p>
              )}
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="w-full h-full p-3 bg-primary/10 rounded border border-primary/30 flex flex-col justify-center">
            <p className="text-xs font-bold text-primary mb-1">QUIZ</p>
            <p className="text-sm">{element.content?.question || 'Quiz question...'}</p>
            {(element.content?.options || []).map((opt: any, i: number) => (
              <div key={opt.id || i} className={`text-xs mt-1 px-2 py-1 rounded flex items-center gap-2 ${opt.isCorrect ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                {opt.image && <img src={opt.image} alt="" className="h-6 w-8 object-cover rounded" />}
                {String.fromCharCode(65 + i)}. {opt.text}
              </div>
            ))}
          </div>
        );
      case 'matching':
        return (
          <div className="w-full h-full p-3 bg-accent/30 rounded border border-accent flex flex-col justify-center">
            <p className="text-xs font-bold text-accent-foreground mb-1">MATCHING</p>
            <p className="text-sm">{element.content?.title || 'Matching pairs activity'}</p>
            {(element.content?.pairs || []).map((pair: any, i: number) => (
              <div key={i} className="text-xs mt-1 flex gap-2 items-center">
                {pair.leftImage && <img src={pair.leftImage} alt="" className="h-6 w-8 object-cover rounded" />}
                <span className="bg-muted px-1 rounded">{pair.left}</span>
                <span>→</span>
                {pair.rightImage && <img src={pair.rightImage} alt="" className="h-6 w-8 object-cover rounded" />}
                <span className="bg-muted px-1 rounded">{pair.right}</span>
              </div>
            ))}
          </div>
        );
      case 'fill-blank':
        return (
          <div className="w-full h-full p-3 bg-secondary/30 rounded border border-secondary flex flex-col justify-center">
            <p className="text-xs font-bold text-secondary-foreground mb-1">FILL IN THE BLANK</p>
            <p className="text-sm">{element.content?.sentence || 'The cat ___ on the mat.'}</p>
          </div>
        );
      case 'drag-drop':
        return (
          <div className="w-full h-full p-3 bg-orange-50 rounded border border-orange-300 flex flex-col justify-center">
            <p className="text-xs font-bold text-orange-700 mb-1">DRAG & DROP</p>
            <p className="text-sm">{element.content?.instruction || 'Drag items to the correct zone'}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(element.content?.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                  {getItemImage(item) && <img src={getItemImage(item)} alt="" className="h-5 w-6 object-cover rounded" />}
                  {getItemText(item)}
                </div>
              ))}
            </div>
          </div>
        );
      case 'sorting':
        return (
          <div className="w-full h-full p-3 bg-blue-50 rounded border border-blue-300 flex flex-col justify-center">
            <p className="text-xs font-bold text-blue-700 mb-1">SORTING</p>
            <p className="text-sm">{element.content?.instruction || 'Put items in the correct order'}</p>
            <div className="flex flex-col gap-0.5 mt-1">
              {(element.content?.items || []).map((item: string, i: number) => (
                <span key={i} className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{i + 1}. {item}</span>
              ))}
            </div>
          </div>
        );
      case 'sentence-builder':
        return (
          <div className="w-full h-full p-3 bg-purple-50 rounded border border-purple-300 flex flex-col justify-center">
            <p className="text-xs font-bold text-purple-700 mb-1">SENTENCE BUILDER</p>
            <p className="text-sm mb-1">{element.content?.instruction || 'Arrange words to form a sentence'}</p>
            <div className="flex flex-wrap gap-1">
              {(element.content?.words || []).map((word: string, i: number) => (
                <span key={i} className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{word}</span>
              ))}
            </div>
          </div>
        );
      case 'character': {
        const animation = element.content?.animation || 'idle';
        const animClass = animation === 'wave' ? 'animate-pip-wave'
          : animation === 'jump' ? 'animate-pip-jump'
          : animation === 'shake' ? 'animate-pip-shake'
          : 'animate-pip-idle';
        return (
          <div className="w-full h-full relative flex items-center justify-center">
            <img
              src={element.content?.src || pipMascotImg}
              alt="Pip mascot"
              className={`max-w-full max-h-full object-contain ${animClass}`}
            />
            {element.content?.speechBubble && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-white border-2 border-primary rounded-xl px-3 py-1.5 text-xs font-bold text-foreground shadow-lg max-w-[200px] text-center whitespace-pre-wrap">
                {element.content.speechBubble}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-3 h-3">
                  <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-primary rotate-45 -translate-y-1.5" />
                </div>
              </div>
            )}
          </div>
        );
      }
      default:
        return <div className="w-full h-full bg-muted rounded" />;
    }
  };

  return (
    <div
      className={`absolute select-none ${readOnly ? '' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      }}
      onPointerDown={readOnly ? undefined : handlePointerDown}
      onPointerMove={readOnly ? undefined : handlePointerMove}
      onPointerUp={readOnly ? undefined : handlePointerUp}
    >
      {renderContent()}

      {isSelected && !readOnly && (
        <>
          <div className="absolute inset-0 border-2 border-primary rounded pointer-events-none" />
          <button
            className="absolute -top-3 -right-3 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-50"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <div
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary rounded-sm cursor-se-resize flex items-center justify-center shadow-md z-50"
            onPointerDown={handleResizeStart}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <Maximize2 className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full pointer-events-none" />
        </>
      )}
    </div>
  );
};
