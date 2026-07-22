// Activity Catalog — single read-only documentation page.
// Shows every ActivityType with hub eligibility, CEFR range, and an example payload.
// Route: /activity-catalog

import { useMemo, useState } from 'react';
import { ACTIVITY_CATALOG, ALL_ACTIVITY_TYPES } from '@/activities/catalog/activityCatalog';
import { HUB_ACTIVITY_PROFILES } from '@/activities/catalog/hubActivityProfiles';
import { ACTIVITY_EXAMPLES } from '@/activities/catalog/activityExamples';
import type { ActivityType } from '@/activities/types';
import type { Hub } from '@/governance/types';

type HubFilter = 'all' | Hub;

const HUBS: Hub[] = ['playground', 'academy', 'success'];
const CEFR_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

const HUB_TOKEN: Record<Hub, { name: string; primary: string; accent: string }> = {
  playground: { name: 'Playground', primary: '#FE6A2F', accent: '#FEFBDD' },
  academy: { name: 'Academy', primary: '#6B21A8', accent: '#F5F3FF' },
  success: { name: 'Success', primary: '#059669', accent: '#F0FDFA' },
};

type Status = 'preferred' | 'allowed' | 'banned';

function statusFor(type: ActivityType, hub: Hub): Status {
  const profile = HUB_ACTIVITY_PROFILES[hub];
  if (profile.banned.includes(type)) return 'banned';
  if (profile.preferred.includes(type)) return 'preferred';
  const fit = ACTIVITY_CATALOG[type].hub_fit[hub] ?? 0;
  if (fit <= 0.05) return 'banned';
  return 'allowed';
}

const STATUS_STYLE: Record<Status, string> = {
  preferred: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  allowed: 'bg-slate-100 text-slate-700 border-slate-200',
  banned: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function ActivityCatalogPage() {
  const [hubFilter, setHubFilter] = useState<HubFilter>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<ActivityType | null>(null);

  const rows = useMemo(() => {
    return ALL_ACTIVITY_TYPES
      .filter((t) => {
        if (search && !t.toLowerCase().includes(search.toLowerCase())) return false;
        if (hubFilter === 'all') return true;
        return statusFor(t, hubFilter) !== 'banned';
      })
      .sort();
  }, [hubFilter, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Activity Catalog</h1>
          <p className="mt-1 text-slate-600 text-sm max-w-3xl">
            Every activity type the lesson generator can choose. Hub badges show whether the
            type is <span className="font-semibold text-emerald-700">preferred</span>, neutrally{' '}
            <span className="font-semibold text-slate-700">allowed</span>, or hard{' '}
            <span className="font-semibold text-rose-700">banned</span>. CEFR shows the range the
            type can run at.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity type…"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm w-64"
            />
            <div className="ml-auto flex gap-1.5">
              <FilterChip label="All" active={hubFilter === 'all'} onClick={() => setHubFilter('all')} />
              {HUBS.map((h) => (
                <FilterChip
                  key={h}
                  label={HUB_TOKEN[h].name}
                  color={HUB_TOKEN[h].primary}
                  active={hubFilter === h}
                  onClick={() => setHubFilter(h)}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">CEFR</th>
                <th className="text-left px-4 py-3">Load</th>
                {HUBS.map((h) => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: HUB_TOKEN[h].primary }}>
                    {HUB_TOKEN[h].name}
                  </th>
                ))}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((type) => {
                const entry = ACTIVITY_CATALOG[type];
                const isOpen = expanded === type;
                return (
                  <>
                    <tr key={type} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 align-top">
                        <div className="font-mono font-semibold text-slate-900">{type}</div>
                        <div className="text-xs text-slate-500 mt-0.5 max-w-md">{entry.description}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700 whitespace-nowrap">
                        {entry.min_cefr} → {entry.max_cefr}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700 capitalize">{entry.load}</td>
                      {HUBS.map((h) => {
                        const s = statusFor(type, h);
                        return (
                          <td key={h} className="px-4 py-3 align-top">
                            <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-medium ${STATUS_STYLE[s]}`}>
                              {s}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 align-top">
                        <button
                          onClick={() => setExpanded(isOpen ? null : type)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                        >
                          {isOpen ? 'Hide' : 'Example'}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50/60 border-t border-slate-100">
                        <td colSpan={6 + HUBS.length} className="px-6 py-4">
                          <ExampleBlock type={type} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="mt-6 text-xs text-slate-500">
          Source of truth: <code>src/activities/catalog/activityCatalog.ts</code> +{' '}
          <code>hubActivityProfiles.ts</code>. CEFR caps {CEFR_ORDER.join(' < ')}.
        </footer>
      </main>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
        active ? 'text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
      }`}
      style={active ? { background: color ?? '#0f172a', borderColor: color ?? '#0f172a' } : undefined}
    >
      {label}
    </button>
  );
}

function ExampleBlock({ type }: { type: ActivityType }) {
  const ex = ACTIVITY_EXAMPLES[type];
  if (!ex) return <div className="text-sm text-slate-500 italic">No example registered.</div>;
  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Example slide</div>
        <div className="mt-1 font-bold text-slate-900">{ex.title}</div>
        <div className="mt-1 text-sm text-slate-700">{ex.prompt}</div>
      </div>
      <pre className="rounded-lg bg-slate-900 text-emerald-200 text-xs p-3 overflow-auto max-h-72">
{JSON.stringify(ex.payload, null, 2)}
      </pre>
    </div>
  );
}
