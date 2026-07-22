import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { ReadabilityMeter } from './ReadabilityMeter';
import { MasteryBadge } from './MasteryBadge';
import { cn } from '@/lib/utils';

interface CreatorStudioPreviewProps {
  title: string;
  content: string;
  track: string;
  level: string;
  coverImageUrl?: string | null;
  isPublished?: boolean;
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

const TRACK_THEMES: Record<string, {
  label: string;
  emoji: string;
  frameClass: string;
  headerClass: string;
  badgeClass: string;
}> = {
  kids: {
    label: 'Playground',
    emoji: '🎮',
    frameClass: 'rounded-3xl border-4 border-amber-400/40 dark:border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    headerClass: 'bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  teens: {
    label: 'Academy',
    emoji: '🎓',
    frameClass: 'rounded-2xl border-2 border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.1)]',
    headerClass: 'bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5',
    badgeClass: 'bg-primary/10 text-primary',
  },
  adults: {
    label: 'Professional',
    emoji: '💼',
    frameClass: 'rounded-xl border border-border/60 shadow-lg',
    headerClass: 'bg-gradient-to-r from-muted/50 to-muted/30',
    badgeClass: 'bg-muted text-foreground/70',
  },
};

export const CreatorStudioPreview: React.FC<CreatorStudioPreviewProps> = ({
  title,
  content,
  track,
  level,
  coverImageUrl,
  isPublished,
}) => {
  const html = useMemo(() => DOMPurify.sanitize(markdownToHtml(content)), [content]);
  const theme = TRACK_THEMES[track] || TRACK_THEMES.teens;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Device Frame */}
      <div className={cn(
        'flex-1 overflow-hidden flex flex-col',
        'bg-card/60 backdrop-blur-xl',
        theme.frameClass
      )}>
        {/* Device notch */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-20 h-1.5 rounded-full bg-border/60" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto px-5 pb-5">
          {/* Cover image hero */}
          {coverImageUrl && (
            <div className="relative -mx-5 mb-4 overflow-hidden">
              <img
                src={coverImageUrl}
                alt="Lesson cover"
                className="w-full h-36 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            </div>
          )}

          {/* Track header bar */}
          <div className={cn('rounded-xl p-3 mb-4', theme.headerClass)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', theme.badgeClass)}>
                  {theme.emoji} {theme.label}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-accent/60 text-accent-foreground font-medium">
                  {level}
                </span>
              </div>
              {isPublished && <MasteryBadge size="sm" />}
            </div>
          </div>

          {/* Title */}
          {title ? (
            <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>
          ) : (
            <h1 className="text-2xl font-bold text-muted-foreground/40 mb-4 italic">Untitled Lesson</h1>
          )}

          {/* Content */}
          {content.trim() ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-muted-foreground/40 italic">Start writing to see a live preview…</p>
          )}
        </div>
      </div>

      {/* Readability meter */}
      <div className="rounded-xl border border-border bg-card p-4">
        <ReadabilityMeter text={content} />
      </div>
    </div>
  );
};
