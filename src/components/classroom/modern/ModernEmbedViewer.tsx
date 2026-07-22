import { useState, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { X, Minimize2, Maximize2, ExternalLink, RotateCw } from "lucide-react";
import { Rnd } from "react-rnd";

interface ModernEmbedViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
}

const EMBED_TEMPLATES = {
  youtube: { domain: "youtube.com", allowFullscreen: true },
  baamboozle: { domain: "baamboozle.com", interactive: true },
  quizizz: { domain: "quizizz.com", interactive: true },
  googleSlides: { domain: "docs.google.com/presentation", readonly: true },
  miro: { domain: "miro.com", collaborative: true },
};

export function ModernEmbedViewer({
  url,
  title = "Embedded Content",
  onClose,
  initialWidth = 800,
  initialHeight = 600,
}: ModernEmbedViewerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const isValidUrl = useCallback((urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }, []);

  const refresh = useCallback(() => {
    setIframeKey(prev => prev + 1);
  }, []);

  const openInNewTab = useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  if (!isValidUrl(url)) {
    return (
      <GlassCard className="p-6 max-w-md mx-auto mt-8">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Invalid URL</p>
          <p className="text-sm text-muted-foreground">
            Please check the URL and try again.
          </p>
          <GlassButton onClick={onClose}>Close</GlassButton>
        </div>
      </GlassCard>
    );
  }

  if (isMinimized) {
    return (
      <GlassCard className="fixed bottom-20 right-6 z-40 p-3 cursor-pointer hover:scale-105 transition-transform">
        <div className="flex items-center gap-3" onClick={() => setIsMinimized(false)}>
          <div className="w-12 h-12 bg-classroom-primary/20 rounded flex items-center justify-center">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{title}</div>
            <div className="text-xs text-muted-foreground truncate">{url}</div>
          </div>
          <GlassButton
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-4 h-4" />
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  return (
    <Rnd
      default={{
        x: (window.innerWidth - initialWidth) / 2,
        y: (window.innerHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      }}
      minWidth={320}
      minHeight={240}
      bounds="window"
      dragHandleClassName="embed-drag-handle"
      className="z-40"
    >
      <GlassCard className="h-full flex flex-col shadow-glow">
        {/* Controls Bar */}
        <div className="embed-drag-handle flex items-center justify-between p-2 border-b border-white/10 cursor-move">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{title}</div>
            <div className="text-xs text-muted-foreground truncate">{url}</div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <GlassButton
              size="sm"
              variant="default"
              onClick={refresh}
              title="Refresh"
            >
              <RotateCw className="w-4 h-4" />
            </GlassButton>
            <GlassButton
              size="sm"
              variant="default"
              onClick={openInNewTab}
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </GlassButton>
            <GlassButton
              size="sm"
              variant="default"
              onClick={() => setIsMinimized(true)}
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </GlassButton>
            <GlassButton
              size="sm"
              variant="default"
              onClick={onClose}
              title="Close"
            >
              <X className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      </GlassCard>
    </Rnd>
  );
}
