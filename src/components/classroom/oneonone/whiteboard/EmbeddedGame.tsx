
import React, { useState } from "react";
import { EmbeddedGameHeader } from "./EmbeddedGameHeader";
import { EmbeddedGameError } from "./EmbeddedGameError";

interface EmbeddedGameData {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isBlocked?: boolean;
}

interface EmbeddedGameProps {
  game: EmbeddedGameData;
  onRemove: (gameId: string) => void;
  onError: (gameId: string) => void;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  onMouseDown?: (e: React.MouseEvent) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  currentUser?: { role: 'teacher' | 'student'; name: string };
}

export function EmbeddedGame({ 
  game, 
  onRemove, 
  onError,
  position,
  size,
  onMouseDown,
  isFullscreen = false,
  onToggleFullscreen,
  currentUser
}: EmbeddedGameProps) {
  const [loadError, setLoadError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleIframeError = () => {
    setLoadError(true);
    onError(game.id);
  };

  const handleIframeLoad = () => {
    setLoadError(false);
    setLoadTimeout(false);
    setRetryCount(0);
  };

  const handleRetry = () => {
    setLoadError(false);
    setLoadTimeout(false);
    setRetryCount(prev => prev + 1);
  };

  const showError = game.isBlocked || loadError || loadTimeout;
  
  const finalPosition = position || { x: game.x, y: game.y };
  const finalSize = size || { width: game.width, height: game.height };

  const openInNewTab = () => {
    const finalUrl = game.url.startsWith('http') ? game.url : `https://${game.url}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`absolute border-2 border-blue-500 rounded bg-white shadow-lg overflow-hidden cursor-move ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={isFullscreen ? {} : {
        left: `${finalPosition.x}px`,
        top: `${finalPosition.y}px`,
        width: `${finalSize.width}px`,
        height: `${finalSize.height}px`,
        minWidth: '600px',
        minHeight: '400px',
        maxWidth: '100%',
        maxHeight: '100%',
        zIndex: 10
      }}
      onMouseDown={onMouseDown}
    >
      <EmbeddedGameHeader
        title={game.title}
        showError={showError}
        onRetry={handleRetry}
        onOpenInNewTab={openInNewTab}
        onRemove={() => onRemove(game.id)}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={isFullscreen}
      />
      
      {showError ? (
        <EmbeddedGameError
          isBlocked={!!game.isBlocked}
          loadTimeout={loadTimeout}
          onRetry={handleRetry}
          onOpenInNewTab={openInNewTab}
        />
      ) : (
        <iframe
          key={`${game.id}-${retryCount}`}
          src={game.url}
          className="w-full h-[calc(100%-2.5rem)] border-0 pointer-events-auto"
          title={game.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          loading="lazy"
          style={{ 
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }}
        />
      )}
    </div>
  );
}
