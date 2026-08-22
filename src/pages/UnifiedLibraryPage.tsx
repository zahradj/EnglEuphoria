/**
 * Public, read-only browse page for the unified lesson engine's published
 * content — one per hub (Academy, Success), modeled on the existing
 * PlaygroundLibraryPublic.tsx pattern (no account needed, published-only).
 * Cards link straight into the solo player at /unified-pilot/:hub/:lessonId.
 *
 * White page background, matching the player — hub identity comes through
 * as accent-colored badges and the gradient CTA pill, not a full backdrop
 * wash.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Hub } from '@/unified-lessons/types';
import { listPublishedUnifiedLessons, type UnifiedLessonRow } from '@/unified-lessons/unifiedLessonsService';
import { getCompletedLessonIds } from '@/unified-lessons/completionTracking';
import { getHubIdentity } from '@/components/unified-player/HubTheme';

const HUB_LABEL: Record<Hub, string> = { playground: 'Playground', academy: 'Academy', success: 'Success' };

export default function UnifiedLibraryPage({ hub: hubProp }: { hub?: Hub } = {}) {
  const { hub: hubParam } = useParams<{ hub: string }>();
  const navigate = useNavigate();
  const hub = (hubProp ?? (['academy', 'success'].includes(hubParam ?? '') ? hubParam : 'academy')) as Hub;
  const theme = getHubIdentity(hub);

  const [rows, setRows] = useState<UnifiedLessonRow[] | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRows(null);
    setCompleted(getCompletedLessonIds(hub));
    listPublishedUnifiedLessons(hub)
      .then(setRows)
      .catch((err) => {
        console.error('Unified library fetch error', err);
        setRows([]);
      });
  }, [hub]);

  const completedCount = rows?.filter((r) => completed.has(r.id)).length ?? 0;

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="sticky top-0 z-20 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl text-2xl shadow-md" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}>
              {theme.characterAvatarEmoji}
            </span>
            <div>
              <h1 className="text-xl font-black" style={{ color: theme.accent }}>{HUB_LABEL[hub]} Library</h1>
              <p className="text-xs font-semibold text-slate-500">Lessons you can start right away, solo.</p>
            </div>
          </div>
          {rows && rows.length > 0 && completedCount > 0 && (
            <div className="rounded-full px-3 py-1.5 text-xs font-black text-white shadow" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}>
              ✓ {completedCount} of {rows.length} complete
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {rows === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-10 text-center ring-1 ring-slate-200">
            <p className="text-lg font-bold text-slate-600">No {HUB_LABEL[hub]} lessons published yet.</p>
            <p className="mt-1 text-sm text-slate-400">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => navigate(`/unified-pilot/${hub}/${row.id}`)}
                className="flex flex-col items-start gap-2 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}>
                    {row.cefr}
                  </span>
                  {completed.has(row.id) && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700">✓ Completed</span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-800">{row.title}</h2>
                <p className="text-sm text-slate-400">{row.moments.length} sections</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
