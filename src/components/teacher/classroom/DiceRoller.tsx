import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { whiteboardService } from '@/services/whiteboardService';
import { getClassroomHubTheme, type ClassroomHubKey } from './hubClassroomTheme';

interface DiceRollerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required to broadcast the roll over the unified classroom channel. */
  roomId?: string;
  senderId?: string;
  hubType?: ClassroomHubKey;
}

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const DiceRoller: React.FC<DiceRollerProps> = ({ open, onOpenChange, roomId, senderId, hubType = 'academy' }) => {
  const theme = getClassroomHubTheme(hubType);
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);

    let rollCount = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        // Final authoritative roll — computed once on the teacher side and broadcast.
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setResult(finalResult);
        setIsRolling(false);

        if (roomId && senderId) {
          void whiteboardService
            .sendToolAction(roomId, { tool: 'dice', result: finalResult, senderId })
            .catch((err) => console.error('Dice broadcast failed:', err));
        }
      }
    }, 100);
  };

  useEffect(() => {
    if (open) {
      setResult(null);
    }
  }, [open]);

  const DiceIcon = result ? diceIcons[result - 1] : Dice6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">Roll the Dice!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 gap-6">
          <div
            className={`w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg ${
              isRolling ? 'animate-bounce' : ''
            }`}
            style={{ background: theme.hexGradient }}
          >
            <DiceIcon className="w-20 h-20 text-white" />
          </div>
          {result && !isRolling && (
            <div className="text-4xl font-bold" style={{ color: theme.accentHex }}>
              You rolled: {result}
            </div>
          )}
          <Button
            onClick={rollDice}
            disabled={isRolling}
            className={`${theme.buttonPrimary} px-8`}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
