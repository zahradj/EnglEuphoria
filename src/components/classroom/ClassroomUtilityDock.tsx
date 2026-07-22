import React, { useState } from 'react';
import { BookOpen, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import { ClassroomStorybookPanel } from '@/components/classroom/ClassroomStorybookPanel';
import { ClassroomGamesPanel } from '@/components/classroom/ClassroomGamesPanel';

interface ClassroomUtilityDockProps {
  bookingId: string;
  lessonId?: string | null;
  role: 'teacher' | 'student';
  showGames?: boolean;
}

/**
 * Compact, collapsible bottom-right dock for classroom utilities
 * (Storybook + Games). Defaults to collapsed pills so the lesson
 * stage keeps maximum real-estate; expands on click.
 */
export const ClassroomUtilityDock: React.FC<ClassroomUtilityDockProps> = ({
  bookingId,
  lessonId,
  role,
  showGames = false,
}) => {
  const [openPanel, setOpenPanel] = useState<'storybook' | 'games' | null>(null);

  return (
    <div className="fixed bottom-4 right-4 z-30 hidden md:flex md:flex-col md:items-end md:gap-2 max-w-[calc(100vw-2rem)]">
      {openPanel === 'storybook' && (
        <div className="w-72 animate-fade-in">
          <ClassroomStorybookPanel
            bookingId={bookingId}
            lessonId={lessonId ?? null}
            role={role}
          />
        </div>
      )}
      {openPanel === 'games' && showGames && (
        <div className="w-72 animate-fade-in">
          <ClassroomGamesPanel bookingId={bookingId} />
        </div>
      )}

      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full border border-border shadow-sm px-2 py-1">
        <button
          onClick={() =>
            setOpenPanel((p) => (p === 'storybook' ? null : 'storybook'))
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            openPanel === 'storybook'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted'
          }`}
          aria-label="Toggle storybook panel"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Books
          {openPanel === 'storybook' ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </button>
        {showGames && (
          <button
            onClick={() =>
              setOpenPanel((p) => (p === 'games' ? null : 'games'))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              openPanel === 'games'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
            aria-label="Toggle games panel"
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            Games
            {openPanel === 'games' ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
