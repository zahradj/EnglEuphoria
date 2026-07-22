import React from 'react';
import type { SmartWorksheet, StageMode } from '@/services/whiteboardService';
import { NativeGameFlashcards } from './NativeGameFlashcards';
import { NativeGameMemory } from './NativeGameMemory';
import { NativeGameSentence } from './NativeGameSentence';
import { NativeGameBlanks } from './NativeGameBlanks';

interface Props {
  mode: StageMode;
  worksheet: SmartWorksheet | null;
  roomId: string;
  userId: string;
  role: 'teacher' | 'student';
}

/** Routes the active stage mode to the correct native game component. */
export const NativeGameStage: React.FC<Props> = ({ mode, worksheet, roomId, userId, role }) => {
  if (!worksheet) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Game starting…</p>
          <p className="text-sm text-muted-foreground">
            {role === 'teacher'
              ? 'Generate a worksheet from the AI Game Generator.'
              : 'Waiting for your teacher to load the game.'}
          </p>
        </div>
      </div>
    );
  }

  switch (mode) {
    case 'native_game_flashcards':
      return <NativeGameFlashcards worksheet={worksheet} roomId={roomId} userId={userId} role={role} />;
    case 'native_game_memory':
      return <NativeGameMemory worksheet={worksheet} roomId={roomId} userId={userId} role={role} />;
    case 'native_game_sentence':
      return <NativeGameSentence worksheet={worksheet} roomId={roomId} userId={userId} role={role} />;
    case 'native_game_blanks':
      return <NativeGameBlanks worksheet={worksheet} roomId={roomId} userId={userId} role={role} />;
    default:
      return null;
  }
};
