import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  chapterTitle: string;
  pageIndex: number;
  totalPages: number;
  muted: boolean;
  onToggleMute: () => void;
  fontScale: number;
  onCycleFontScale: () => void;
}

export function ReaderChrome({ title, chapterTitle, pageIndex, totalPages, muted, onToggleMute, fontScale, onCycleFontScale }: Props) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/library')} aria-label="Back to library">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate">{title}</h1>
          <p className="text-xs text-muted-foreground truncate">{chapterTitle}</p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {pageIndex + 1} / {totalPages}
        </div>
        <Button variant="ghost" size="icon" onClick={onCycleFontScale} aria-label="Font size">
          <Type className="h-4 w-4" /><span className="ml-1 text-xs">{Math.round(fontScale * 100)}%</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${((pageIndex + 1) / Math.max(1, totalPages)) * 100}%` }} />
      </div>
    </header>
  );
}
