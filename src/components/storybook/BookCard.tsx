import { Link } from 'react-router-dom';
import { Heart, BookOpen, Lock } from 'lucide-react';
import type { LibraryEntry } from '@/services/storybookLibrary';

const HUB_BADGE: Record<string, string> = {
  playground: 'bg-[#FE6A2F]/15 text-[#FE6A2F] border-[#FE6A2F]/30',
  academy: 'bg-[#6B21A8]/15 text-[#6B21A8] border-[#6B21A8]/30',
  success: 'bg-[#059669]/15 text-[#059669] border-[#059669]/30',
};

export function BookCard({
  entry,
  onToggleFavorite,
}: {
  entry: LibraryEntry;
  onToggleFavorite?: (bookId: string, fav: boolean) => void;
}) {
  const book = entry.book;
  if (!book) return null;
  const locked = entry.status === 'locked';
  const fav = entry.status === 'favorite';
  const progress = Math.round((entry.reading_progress ?? 0) * 100);

  return (
    <div className="group relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-muted relative">
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 bg-background/70 grid place-items-center">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <button
          type="button"
          onClick={() => onToggleFavorite?.(book.id, !fav)}
          className="absolute top-2 right-2 h-9 w-9 rounded-full bg-background/80 grid place-items-center hover:bg-background"
          aria-label={fav ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart className={`h-4 w-4 ${fav ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-semibold border rounded-full px-2 py-0.5 ${HUB_BADGE[book.hub] ?? ''}`}>
            {book.hub}
          </span>
          <span className="text-[10px] uppercase font-semibold border border-border rounded-full px-2 py-0.5 text-muted-foreground">
            {book.cefr_level}
          </span>
        </div>
        {!locked && progress > 0 && (
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
        {!locked ? (
          <Link
            to={`/storybook/viewer/${book.id}`}
            className="block text-center text-sm font-semibold rounded-xl bg-primary text-primary-foreground py-2 hover:opacity-90"
          >
            {progress > 0 && progress < 100 ? 'Continue' : progress >= 100 ? 'Read again' : 'Start'}
          </Link>
        ) : (
          <button disabled className="block w-full text-center text-sm font-semibold rounded-xl bg-muted text-muted-foreground py-2">
            Locked
          </button>
        )}
      </div>
    </div>
  );
}
