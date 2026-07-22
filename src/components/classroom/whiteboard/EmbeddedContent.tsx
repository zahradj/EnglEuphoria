import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Move, Play, Maximize2 } from "lucide-react";

interface EmbeddedContentData {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'webpage' | 'docs' | 'other';
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface EmbeddedContentProps {
  content: EmbeddedContentData;
  onRemove: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onResize?: (id: string, width: number, height: number) => void;
}

export function EmbeddedContent({ content, onRemove, onMove, onResize }: EmbeddedContentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getEmbedUrl = (url: string, type: string): string => {
    switch (type) {
      case 'youtube':
        const youtubeId = extractYouTubeId(url);
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.origin}` : url;
      case 'vimeo':
        const vimeoId = extractVimeoId(url);
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
      case 'docs':
        if (url.includes('docs.google.com')) {
          return url.replace('/edit', '/preview');
        }
        return url;
      default:
        return url;
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const extractVimeoId = (url: string): string | null => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels\/)([\d]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLIFrameElement) return;
    
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
    const maxX = containerRect.width - (content.width || 320);
    const maxY = containerRect.height - (content.height || 240);
    
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    onMove?.(content.id, boundedX, boundedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleOpenLink = () => {
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  const width = isExpanded ? (content.width || 320) * 1.5 : (content.width || 320);
  const height = isExpanded ? (content.height || 240) * 1.5 : (content.height || 240);

  const canEmbed = content.type === 'youtube' || content.type === 'vimeo' || 
                   content.type === 'docs' || content.url.startsWith('https://');

  return (
    <Card
      className={`absolute bg-white shadow-lg border-2 transition-all duration-200 ${
        isDragging ? 'border-blue-400 shadow-xl cursor-grabbing' : 'border-gray-200 cursor-grab hover:shadow-xl'
      }`}
      style={{
        left: content.x,
        top: content.y,
        width: width + 24, // Add padding
        height: height + 60, // Add space for header
        zIndex: isDragging ? 1000 : isExpanded ? 100 : 10
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs truncate">{content.title}</h4>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            <Maximize2 size={10} />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleOpenLink}
            title="Open in new tab"
          >
            <ExternalLink size={10} />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
            onClick={() => onRemove(content.id)}
            title="Remove content"
          >
            <X size={10} />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-2">
        {canEmbed ? (
          <iframe
            src={getEmbedUrl(content.url, content.type)}
            width={width}
            height={height}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded border"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100 rounded border"
            style={{ width, height }}
          >
            <div className="text-center p-4">
              <Play className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-600 mb-2">Content not embeddable</p>
              <Button size="sm" onClick={handleOpenLink}>
                <ExternalLink size={12} className="mr-1" />
                Open Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
