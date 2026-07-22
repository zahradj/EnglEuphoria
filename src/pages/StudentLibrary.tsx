import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  getMyLibrary,
  toggleFavorite,
  recommendBooksForHub,
  unlockBook,
  type LibraryEntry,
} from '@/services/storybookLibrary';
import { BookCard } from '@/components/storybook/BookCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/common/BackButton';


type HubKey = 'playground' | 'academy' | 'success';

const HUB_MAP: Record<string, HubKey> = {
  playground: 'playground',
  kids: 'playground',
  academy: 'academy',
  teens: 'academy',
  professional: 'success',
  success: 'success',
  adults: 'success',
};

export default function StudentLibrary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [hub, setHub] = useState<HubKey>('academy');
  const [cefr, setCefr] = useState<string>('A2');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const { data: profile } = await (supabase as any)
          .from('student_profiles')
          .select('hub_type, current_level')
          .eq('user_id', user.id)
          .maybeSingle();
        const resolvedHub = HUB_MAP[(profile?.hub_type ?? '').toLowerCase()] ?? 'academy';
        const resolvedCefr = profile?.current_level ?? 'A2';
        setHub(resolvedHub);
        setCefr(resolvedCefr);

        let lib = await getMyLibrary();
        // Auto-unlock a starter book if library empty
        if (lib.length === 0) {
          const recs = await recommendBooksForHub(resolvedHub, resolvedCefr, 1);
          if (recs[0]) {
            await unlockBook(recs[0].id, 'auto_starter');
            lib = await getMyLibrary();
          }
        }
        setEntries(lib);
        const recs = await recommendBooksForHub(resolvedHub, resolvedCefr, 8);
        const unlockedIds = new Set(lib.map((e) => e.book_id));
        setRecommended(recs.filter((b: any) => !unlockedIds.has(b.id)));
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const buckets = useMemo(() => ({
    reading: entries.filter((e) => e.status === 'reading'),
    unlocked: entries.filter((e) => e.status === 'unlocked'),
    completed: entries.filter((e) => e.status === 'completed'),
    favorites: entries.filter((e) => e.status === 'favorite'),
  }), [entries]);

  const handleFav = async (bookId: string, fav: boolean) => {
    await toggleFavorite(bookId, fav);
    setEntries((prev) => prev.map((e) => e.book_id === bookId ? { ...e, status: fav ? 'favorite' : 'unlocked' } : e));
  };

  const hubAccent = hub === 'playground' ? 'from-[#FE6A2F]/20' : hub === 'academy' ? 'from-[#6B21A8]/20' : 'from-[#059669]/20';

  return (
    <div className={`min-h-dvh bg-gradient-to-b ${hubAccent} via-background to-background`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <BackButton to="/dashboard" label="Back to dashboard" />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Library</h1>
            <p className="text-sm text-muted-foreground">Stories that build your English, one chapter at a time.</p>
          </div>
        </div>
        


        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/5] rounded-2xl" />)}
          </div>
        ) : (
          <Tabs defaultValue="reading">
            <TabsList>
              <TabsTrigger value="reading">Reading ({buckets.reading.length})</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked ({buckets.unlocked.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({buckets.completed.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorites ({buckets.favorites.length})</TabsTrigger>
              <TabsTrigger value="recommended"><Sparkles className="h-3.5 w-3.5 mr-1" />For you</TabsTrigger>
            </TabsList>

            {(['reading', 'unlocked', 'completed', 'favorites'] as const).map((key) => (
              <TabsContent key={key} value={key} className="mt-6">
                {buckets[key].length === 0 ? (
                  <EmptyState label={`No ${key} books yet.`} />
                ) : (
                  <Grid>
                    {buckets[key].map((e) => <BookCard key={e.id} entry={e} onToggleFavorite={handleFav} />)}
                  </Grid>
                )}
              </TabsContent>
            ))}

            <TabsContent value="recommended" className="mt-6">
              {recommended.length === 0 ? (
                <EmptyState label="No new recommendations right now — check back after your next lesson." />
              ) : (
                <Grid>
                  {recommended.map((b: any) => (
                    <BookCard
                      key={b.id}
                      entry={{
                        id: b.id, student_id: user?.id ?? '', book_id: b.id,
                        status: 'unlocked', unlocked_at: null, last_page_id: null,
                        reading_progress: 0, unlock_reason: 'recommended', book: b,
                      }}
                      onToggleFavorite={async (id, fav) => {
                        await unlockBook(id, 'recommendation_open');
                        await toggleFavorite(id, fav);
                        const lib = await getMyLibrary();
                        setEntries(lib);
                      }}
                    />
                  ))}
                </Grid>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
      <p>{label}</p>
    </div>
  );
}
