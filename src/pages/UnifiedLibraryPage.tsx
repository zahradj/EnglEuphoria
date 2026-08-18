/**
 * Public, read-only browse page for the unified lesson engine's published
 * content — one per hub (Academy, Success), modeled on the existing
 * PlaygroundLibraryPublic.tsx pattern (no account needed, published-only).
 * Cards link straight into the solo player at /unified-pilot/:hub/:lessonId.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Hub } from '@/unified-lessons/types';
import { listPublishedUnifiedLessons, type UnifiedLessonRow } from '@/unified-lessons/unifiedLessonsService';

const HUB_LABEL: Record<Hub, string> = { playground: 'Playground', academy: 'Academy', success: 'Success' };
const HUB_ACCENT: Record<Hub, string> = { playground: '#FE6A2F', academy: '#3b82f6', success: '#059669' };
const HUB_SOFT_BG: Record<Hub, string> = { playground: '#fff7ed', academy: '#eff6ff', success: '#ecfdf5' };

export default function UnifiedLibraryPage({ hub: hubProp }: { hub?: Hub } = {}) {
  const { hub: hubParam } = useParams<{ hub: string }>();
  const navigate = useNavigate();
  const hub = (hubProp ?? (['academy', 'success'].includes(hubParam ?? '') ? hubParam : 'academy')) as Hub;
  const accent = HUB_ACCENT[hub];

  const [rows, setRows] = useState<UnifiedLessonRow[] | null>(null);

  useEffect(() => {
    setRows(null);
    listPublishedUnifiedLessons(hub)
      .then(setRows)
      .catch((err) => {
        console.error('Unified library fetch error', err);
        setRows([]);
      });
  }, [hub]);

  return (
    <div className="min-h-screen w-full" style={{ background: HUB_SOFT_BG[hub] }}>
      <header className="sticky top-0 z-20 border-b-2 bg-white/90 backdrop-blur-md" style={{ borderColor: `${accent}33` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-black" style={{ color: accent }}>{HUB_LABEL[hub]} Library</h1>
            <p className="text-xs font-semibold text-slate-500">Lessons you can start right away, solo.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {rows === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/60" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-600">No {HUB_LABEL[hub]} lessons published yet.</p>
            <p className="mt-1 text-sm text-slate-400">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => navigate(`/unified-pilot/${hub}/${row.id}`)}
                className="flex flex-col items-start gap-2 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: `${accent}33` }}
              >
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: accent }}>
                  {row.cefr}
                </span>
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
