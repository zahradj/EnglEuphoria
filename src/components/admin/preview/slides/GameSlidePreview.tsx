import React, { useState } from 'react';
import { Gamepad2, Shuffle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IronLMSGamePlayer } from '@/components/games';
import { IronLMSGame, mapSystemToTargetGroup } from '@/types/ironLMS';

interface MatchingItem {
  left: string;
  right: string;
}

interface GameSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      gameType?: string;
      instructions?: string;
      items?: MatchingItem[];
      categories?: { name: string; items: string[] }[];
      ironLMSGame?: IronLMSGame;
    };
  };
  system?: string;
}

export function GameSlidePreview({ slide, system = 'hub' }: GameSlidePreviewProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  
  const { gameType, instructions, items, categories, ironLMSGame } = slide.content || {};

  // If this slide has an IronLMS game, render the game player
  if (ironLMSGame) {
    const targetGroup = mapSystemToTargetGroup(system);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="h-6 w-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-foreground">
            {slide.title || ironLMSGame.title || 'Interactive Game'}
          </h2>
          <Badge variant="secondary" className="ml-2">
            {ironLMSGame.type}
          </Badge>
        </div>
        <IronLMSGamePlayer 
          game={ironLMSGame} 
          targetGroup={targetGroup}
          onComplete={(result) => {
          }}
        />
      </div>
    );
  }

  // Legacy matching game logic
  const handleLeftClick = (idx: number) => {
    if (matched.has(idx)) return;
    setSelectedLeft(idx);
  };

  const handleRightClick = (idx: number) => {
    if (selectedLeft === idx) {
      setMatched(prev => new Set([...prev, idx]));
      setSelectedLeft(null);
    }
  };

  const shuffledRight = items ? [...items].sort(() => Math.random() - 0.5) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Gamepad2 className="h-6 w-6 text-pink-600" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Interactive Game'}
        </h2>
        {gameType && (
          <Badge variant="secondary" className="ml-2">
            {gameType}
          </Badge>
        )}
      </div>

      {instructions && (
        <p className="text-muted-foreground bg-muted/50 rounded-lg p-4">
          {instructions}
        </p>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Match these...
            </h3>
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleLeftClick(idx)}
                disabled={matched.has(idx)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  matched.has(idx)
                    ? 'bg-green-500/10 border-green-500 text-green-700'
                    : selectedLeft === idx
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {matched.has(idx) && <CheckCircle className="h-4 w-4 text-green-600" />}
                  <span>{item.left}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              ...with these
            </h3>
            {shuffledRight.map((item, idx) => {
              const originalIdx = items.findIndex(i => i.right === item.right);
              return (
                <button
                  key={idx}
                  onClick={() => handleRightClick(originalIdx)}
                  disabled={matched.has(originalIdx)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    matched.has(originalIdx)
                      ? 'bg-green-500/10 border-green-500 text-green-700'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {matched.has(originalIdx) && <CheckCircle className="h-4 w-4 text-green-600" />}
                    <span>{item.right}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category, idx) => (
            <div key={idx} className="bg-card rounded-xl p-4 border">
              <h3 className="font-semibold text-foreground mb-3 text-center">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="bg-muted/50 rounded-lg p-2 text-center text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {matched.size === items?.length && items && items.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 px-4 py-2 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">All matched! Great job!</span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedLeft(null);
            setMatched(new Set());
          }}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Reset Game
        </Button>
      </div>
    </div>
  );
}
