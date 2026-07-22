import React from 'react';
import { IronLMSGame, TargetGroup, GameResult } from '@/types/ironLMS';
import { MechanicGame } from './MechanicGame';
import { ContextGame } from './ContextGame';
import { ApplicationGame } from './ApplicationGame';
import { AlertCircle, Loader2 } from 'lucide-react';

interface IronLMSGamePlayerProps {
  game: IronLMSGame;
  targetGroup: TargetGroup;
  onComplete?: (result: GameResult) => void;
  onProgress?: (current: number, total: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function IronLMSGamePlayer({ 
  game, 
  targetGroup, 
  onComplete, 
  onProgress,
  isLoading,
  error
}: IronLMSGamePlayerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertCircle className="h-8 w-8 mb-3" />
        <p className="font-medium">Failed to load game</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-3" />
        <p>No game data available</p>
      </div>
    );
  }

  switch (game.type) {
    case 'mechanic':
      return (
        <MechanicGame 
          game={game} 
          targetGroup={targetGroup} 
          onComplete={onComplete}
          onProgress={onProgress}
        />
      );
    
    case 'context':
      return (
        <ContextGame 
          game={game} 
          targetGroup={targetGroup} 
          onComplete={onComplete}
          onProgress={onProgress}
        />
      );
    
    case 'application':
      return (
        <ApplicationGame 
          game={game} 
          targetGroup={targetGroup} 
          onComplete={onComplete}
        />
      );
    
    default:
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-3" />
          <p>Unknown game type: {(game as any).type}</p>
        </div>
      );
  }
}
