import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { useCEFRProgress } from '@/hooks/useCEFRProgress';
import { useStudentXP } from '@/hooks/useStudentXP';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardShell, useHubTheme } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2, Target } from 'lucide-react';

const HUB_AGE: Record<string, [number, number]> = {
  playground: [4, 9],
  academy: [10, 17],
  professional: [18, 99],
};

export default function GradedLibraryRoom() {
  const { user } = useAuth();
  const { data: theme } = useActiveTheme();
  const { hub, accent } = useHubTheme();
  const { awardXP } = useStudentXP();
  useCEFRProgress();

  const [minAge, maxAge] = HUB_AGE[hub] ?? [10, 99];

  const { data: assets, isLoading } = useQuery({
    queryKey: ['library-assets', hub, theme?.theme],
    queryFn: async () => {
      const { data } = await supabase
        .from('library_assets')
        .select('id, title, description, thumbnail_url, file_url, tags, min_age, max_age, system_tag')
        .eq('is_teacher_only', false)
        .or(`min_age.lte.${maxAge},min_age.is.null`)
        .or(`max_age.gte.${minAge},max_age.is.null`)
        .limit(24);
      const list = data ?? [];
      // Sort: theme matches first
      const themeKey = theme?.theme?.toLowerCase() ?? '';
      return list.sort((a, b) => {
        const am = (a.tags ?? []).some((t: string) => t.toLowerCase().includes(themeKey)) ? 0 : 1;
        const bm = (b.tags ?? []).some((t: string) => t.toLowerCase().includes(themeKey)) ? 0 : 1;
        return am - bm;
      });
    },
  });

  const markRead = async (assetId: string) => {
    if (!user) return;
    await supabase.from('library_reads').upsert(
      { student_id: user.id, asset_id: assetId, completed: true },
      { onConflict: 'student_id,asset_id' }
    );
    awardXP({ action: 'library_read', ref_id: assetId });
  };

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/${hub === 'professional' ? 'hub' : hub}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Link>
        </Button>
        <h1 className={`text-xl font-bold ${accent}`}>Graded Library</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : !assets?.length ? (
        <Card className="p-8 text-center text-muted-foreground">No stories available yet for your level.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => {
            const matches = (a.tags ?? []).some((t: string) =>
              t.toLowerCase().includes((theme?.theme ?? '').toLowerCase())
            );
            return (
              <Card key={a.id} className="overflow-hidden flex flex-col">
                {a.thumbnail_url && (
                  <img src={a.thumbnail_url} alt={a.title} className="w-full h-32 object-cover" loading="lazy" />
                )}
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  {matches && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      <Target className="h-3 w-3" /> Matches your week
                    </span>
                  )}
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  {a.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                  )}
                  <div className="mt-auto pt-2 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-3 w-3 mr-1" /> Read
                      </a>
                    </Button>
                    <Button size="sm" onClick={() => markRead(a.id)}>+30 XP</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
