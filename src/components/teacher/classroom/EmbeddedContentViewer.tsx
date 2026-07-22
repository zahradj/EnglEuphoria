import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Maximize2, Minimize2, RefreshCw, Pencil, Eraser, Palette, Trash2 } from 'lucide-react';
import { CollaborativeCanvas } from '@/components/classroom/shared/CollaborativeCanvas';
import { WhiteboardStroke } from '@/services/whiteboardService';
import { useWebScrollSync } from '@/hooks/useWebScrollSync';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmbeddedContentViewerProps {
  url: string;
  onClose: () => void;
  // Drawing props (optional)
  enableDrawing?: boolean;
  roomId?: string;
  userId?: string;
  userName?: string;
  strokes?: WhiteboardStroke[];
  onAddStroke?: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
  onClearCanvas?: () => void;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#F38181', '#AA96DA', '#FCBAD3', '#2D4059',
  '#FFFFFF', '#000000'
];

export const EmbeddedContentViewer: React.FC<EmbeddedContentViewerProps> = ({
  url,
  onClose,
  enableDrawing = true,
  roomId,
  userId,
  userName,
  strokes = [],
  onAddStroke,
  onClearCanvas
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const [activeColor, setActiveColor] = useState('#FF6B6B');

  // Teacher broadcasts wrapper scroll; student receives it. Iframe internal
  // scroll is locked because cross-origin iframes cannot be controlled.
  const { wrapperRef, onScroll } = useWebScrollSync({
    roomId: roomId || '',
    userId: userId || '',
    role: 'teacher',
    enabled: !!roomId,
  });

  // Transform URL for better embedding (e.g., YouTube)
  const getEmbedUrl = (inputUrl: string): string => {
    try {
      const parsed = new URL(inputUrl);
      
      // YouTube - convert to embed URL
      if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
        const videoId = parsed.searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      }
      
      // YouTube short URL
      if (parsed.hostname === 'youtu.be') {
        const videoId = parsed.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      }

      // Google Docs - ensure embed view
      if (parsed.hostname.includes('docs.google.com')) {
        if (!inputUrl.includes('/embed')) {
          return inputUrl.replace('/edit', '/preview').replace('/view', '/preview');
        }
      }

      return inputUrl;
    } catch {
      return inputUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(false);
    setKey(prev => prev + 1);
  };

  const canDraw = enableDrawing && roomId && userId && userName && onAddStroke;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${
          isFullscreen 
            ? 'fixed inset-0 z-50' 
            : 'absolute inset-0 z-30'
        } bg-gray-950 rounded-xl overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400 overflow-hidden">
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[300px]">{url}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Drawing Tools */}
            {canDraw && (
              <>
                <div className="h-4 w-px bg-gray-700 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawingEnabled(!drawingEnabled)}
                  className={`h-8 w-8 ${drawingEnabled ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  title={drawingEnabled ? 'Disable Drawing' : 'Enable Drawing'}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                
                {drawingEnabled && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveTool(activeTool === 'pen' ? 'eraser' : 'pen')}
                      className={`h-8 w-8 ${activeTool === 'eraser' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      title={activeTool === 'pen' ? 'Switch to Eraser' : 'Switch to Pen'}
                    >
                      <Eraser className="w-4 h-4" />
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          title="Color"
                        >
                          <div 
                            className="h-4 w-4 rounded-full border-2 border-gray-400"
                            style={{ backgroundColor: activeColor }}
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
                        <div className="grid grid-cols-5 gap-1">
                          {COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => setActiveColor(color)}
                              className={`w-6 h-6 rounded-full transition-transform ${
                                activeColor === color 
                                  ? 'ring-2 ring-white scale-110' 
                                  : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {onClearCanvas && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClearCanvas}
                        className="h-8 w-8 text-gray-400 hover:text-red-400"
                        title="Clear Canvas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
                <div className="h-4 w-px bg-gray-700 mx-1" />
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8 text-gray-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 text-gray-400 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(url, '_blank')}
              className="h-8 w-8 text-gray-400 hover:text-white"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-400 hover:text-red-400"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content — scrollable wrapper around iframe so we can sync scroll across CORS */}
        <div
          ref={wrapperRef}
          onScroll={onScroll}
          className="flex-1 relative bg-white overflow-y-auto overflow-x-hidden"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading content...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="flex flex-col items-center gap-3 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Unable to load content</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  This website may not allow embedding. Try opening it in a new tab instead.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={handleRefresh} className="border-gray-700">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                  <Button onClick={() => window.open(url, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" /> Open in new tab
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Iframe is given a tall fixed height so the WRAPPER scrolls.
              scrolling="no" prevents the inner iframe from creating its own scroll. */}
          <iframe
            key={key}
            src={embedUrl}
            scrolling="no"
            style={{ width: '100%', height: '3000px', border: 0, display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(true);
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          />

          {/* Drawing Canvas Overlay — pinned to the visible viewport, not the scrolled content */}
          {canDraw && drawingEnabled && (
            <div className="sticky top-0 left-0 w-full h-0 z-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full pointer-events-auto" style={{ height: 'var(--embed-vh, 100%)' }}>
                <CollaborativeCanvas
                  roomId={roomId}
                  userId={userId}
                  userName={userName}
                  role="teacher"
                  canDraw={true}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  strokes={strokes}
                  onAddStroke={onAddStroke}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
