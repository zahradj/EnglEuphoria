import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star, Timer, Dice6, Smile, PenLine, PenOff, Monitor, Link, MonitorStop } from 'lucide-react';

interface InteractionToolsGridProps {
  onGiveStar: () => void;
  onOpenTimer: () => void;
  onRollDice: () => void;
  /** Send a sticker reaction emoji to the student. */
  onSendSticker: (emoji: string) => void;
  studentCanDraw?: boolean;
  onToggleStudentDrawing?: () => void;
  onShareScreen?: () => void;
  onEmbedLink?: () => void;
  isScreenSharing?: boolean;
  onStopScreenShare?: () => void;
}

/**
 * Reaction palette — each emoji is broadcast through the same realtime channel
 * and shown as a giant overlay on both the teacher's and the student's screens.
 */
const STICKER_PACK: Array<{ emoji: string; label: string }> = [
  { emoji: '👏', label: 'Clap' },
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '💯', label: 'Hundred' },
  { emoji: '😂', label: 'Laugh' },
];

export const InteractionToolsGrid: React.FC<InteractionToolsGridProps> = ({
  onGiveStar,
  onOpenTimer,
  onRollDice,
  onSendSticker,
  studentCanDraw = false,
  onToggleStudentDrawing,
  onShareScreen,
  onEmbedLink,
  isScreenSharing = false,
  onStopScreenShare
}) => {
  const tools = [
    { icon: Star, label: 'Star', color: 'bg-yellow-500 hover:bg-yellow-600', action: onGiveStar },
    { icon: Timer, label: 'Timer', color: 'bg-blue-500 hover:bg-blue-600', action: onOpenTimer },
    { icon: Dice6, label: 'Dice', color: 'bg-purple-500 hover:bg-purple-600', action: onRollDice },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool) => (
          <Button
            key={tool.label}
            variant="ghost"
            className={`h-12 flex flex-col items-center justify-center gap-1 ${tool.color} text-white`}
            onClick={tool.action}
          >
            <tool.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tool.label}</span>
          </Button>
        ))}

        {/* Reactions — full sticker pack popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 flex flex-col items-center justify-center gap-1 bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Smile className="h-5 w-5" />
              <span className="text-[10px] font-medium">Reactions</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="center" side="top">
            <div className="grid grid-cols-4 gap-1.5">
              {STICKER_PACK.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  onClick={() => onSendSticker(emoji)}
                  title={label}
                  className="h-12 w-12 text-2xl rounded-lg hover:bg-pink-100 active:scale-95 transition-all flex items-center justify-center"
                  aria-label={`Send ${label} reaction`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Screen Share & Embed Link Row */}
      <div className="grid grid-cols-2 gap-2">
        {isScreenSharing ? (
          <Button
            variant="ghost"
            className="h-10 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            onClick={onStopScreenShare}
          >
            <MonitorStop className="h-4 w-4" />
            <span className="text-xs font-medium">Stop Share</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="h-10 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={onShareScreen}
          >
            <Monitor className="h-4 w-4" />
            <span className="text-xs font-medium">Share Screen</span>
          </Button>
        )}
        <Button
          variant="ghost"
          className="h-10 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white"
          onClick={onEmbedLink}
        >
          <Link className="h-4 w-4" />
          <span className="text-xs font-medium">Embed Link</span>
        </Button>
      </div>

      {onToggleStudentDrawing && (
        <Button
          variant="ghost"
          className={`w-full h-10 flex items-center justify-center gap-2 text-white transition-all ${
            studentCanDraw ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}
          onClick={onToggleStudentDrawing}
        >
          {studentCanDraw ? <PenLine className="h-4 w-4" /> : <PenOff className="h-4 w-4" />}
          <span className="text-xs font-medium">
            {studentCanDraw ? 'Student Drawing: ON' : 'Student Drawing: OFF'}
          </span>
        </Button>
      )}
    </div>
  );
};
