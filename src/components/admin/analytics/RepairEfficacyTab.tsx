// Repair Efficacy Tab — visualizes qa_repair_telemetry over the last 7 days.
// Shows top blocking codes, success/block ratio, and engine breakdown so we
// can tune the validators and prompts where they hurt most.

import { Fragment, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Locator {
  slideId?: string;
  activityId?: string;
  path?: string;
}

interface Row {
  id: string;
  lesson_id: string | null;
  hub: string | null;
  cefr: string | null;
  attempt_index: number | null;
  next_action: string | null;
  repair_codes: string[] | null;
  blocking_engines: string[] | null;
  overall_score: number | null;
  locators: Record<string, Locator[]> | null;
  created_at: string;
}

interface LocatorHit {
  rowId: string;
  lessonId: string | null;
  hub: string | null;
  cefr: string | null;
  attemptIndex: number | null;
  nextAction: string | null;
  createdAt: string;
  locators: Locator[];
}

interface CodeStat {
  code: string;
  total: number;
  blocked: number;
  rate: number; // auto-heal rate (non-blocked / total)
}

export default function RepairEfficacyTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cacheStats, setCacheStats] = useState<{ hits: number; total: number }>({ hits: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(7);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [cacheEvents, setCacheEvents] = useState<{ hit: boolean; judge_name: string; hub: string | null; content_hash?: string | null }[]>([]);
  const [cacheAges, setCacheAges] = useState<{ judge_name: string; created_at: string; content_hash: string }[]>([]);
  const [ttlOverrides, setTtlOverrides] = useState<Record<string, number>>({});
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async (showLoader: boolean) => {
      if (showLoader) setLoading(true);
      const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      const [{ data }, { data: cacheRows }, { data: ageRows }, { data: overrideRows }] = await Promise.all([
        supabase
          .from('qa_repair_telemetry')
          .select('id, lesson_id, hub, cefr, attempt_index, next_action, repair_codes, blocking_engines, overall_score, locators, created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(2000),
        supabase
          .from('qa_judge_cache_events')
          .select('hit, judge_name, hub, content_hash')
          .gte('created_at', since)
          .limit(5000),
        supabase
          .from('qa_judge_cache')
          .select('judge_name, created_at, content_hash')
          .limit(5000),
        supabase
          .from('qa_judge_ttl_overrides')
          .select('judge, ttl_days'),
      ]);
      if (cancelled) return;
      setRows((data ?? []) as Row[]);
      const events = (cacheRows ?? []) as { hit: boolean; judge_name: string; hub: string | null; content_hash: string | null }[];
      setCacheEvents(events);
      setCacheStats({ hits: events.filter((e) => e.hit).length, total: events.length });
      setCacheAges((ageRows ?? []) as { judge_name: string; created_at: string; content_hash: string }[]);
      const overrides: Record<string, number> = {};
      for (const o of (overrideRows ?? []) as { judge: string; ttl_days: number }[]) overrides[o.judge] = o.ttl_days;
      setTtlOverrides(overrides);
      setLastRefresh(new Date());
      if (showLoader) setLoading(false);
    };
    fetchData(true);
    const interval = autoRefresh ? setInterval(() => fetchData(false), 60000) : null;
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [rangeDays, autoRefresh, refreshTick]);



  if (loading) {
    return <div className="text-sm text-muted-foreground mt-4">Loading…</div>;
  }

  const total = rows.length;
  const blocked = rows.filter((r) => r.next_action === 'block').length;
  const published = rows.filter((r) => r.next_action === 'publish').length;

  const codeMap = new Map<string, CodeStat>();
  for (const r of rows) {
    const isBlocked = r.next_action === 'block';
    for (const code of r.repair_codes ?? []) {
      const cur = codeMap.get(code) ?? { code, total: 0, blocked: 0, rate: 0 };
      cur.total++;
      if (isBlocked) cur.blocked++;
      codeMap.set(code, cur);
    }
  }
  const topCodes = [...codeMap.values()]
    .map((c) => ({ ...c, rate: c.total ? 1 - c.blocked / c.total : 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const engineMap = new Map<string, number>();
  for (const r of rows) {
    for (const eng of r.blocking_engines ?? []) {
      engineMap.set(eng, (engineMap.get(eng) ?? 0) + 1);
    }
  }
  const topEngines = [...engineMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end items-center gap-2">
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Auto-refresh (60s)
          {autoRefresh && lastRefresh && (
            <span className="text-[10px]">· {lastRefresh.toLocaleTimeString()}</span>
          )}
        </label>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setRangeDays(d as 7 | 30 | 90)}
              className={`px-3 py-1.5 transition ${rangeDays === d ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
            >
              {d}d
            </button>
          ))}
        </div>
        <ExportCsvButton rows={rows} cacheEvents={cacheEvents} rangeDays={rangeDays} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <Stat label={`Generations (${rangeDays}d)`} value={total} />

        <Stat label="Published" value={published} tone="success" />
        <Stat label="Blocked" value={blocked} tone="destructive" />
        <Stat
          label="Critic cache hit-rate"
          value={cacheStats.total ? Math.round((cacheStats.hits / cacheStats.total) * 100) : 0}
          suffix="%"
          tone={
            cacheStats.total === 0
              ? undefined
              : cacheStats.hits / cacheStats.total >= 0.8
                ? 'success'
                : cacheStats.hits / cacheStats.total < 0.3
                  ? 'destructive'
                  : undefined
          }
          sub={`${cacheStats.hits}/${cacheStats.total} judge calls`}
        />
        <StoryArcHealStat rows={rows} />
      </div>

      <StoryArcHubBreakdown rows={rows} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Top repair codes — auto-heal rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topCodes.length === 0 && (
            <div className="text-sm text-muted-foreground">No repair telemetry in the last 7 days.</div>
          )}
          {topCodes.map((c) => (
            <div key={c.code} className="flex items-center gap-3">
              <Badge variant={c.rate >= 0.7 ? 'default' : c.rate >= 0.4 ? 'secondary' : 'destructive'}>
                {Math.round(c.rate * 100)}%
              </Badge>
              <div className="font-mono text-xs text-foreground flex-1 truncate">{c.code}</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {c.total - c.blocked}/{c.total} healed
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <HubBreakdown rows={rows} />

      <PublishDenialBreakdown rows={rows} />

      <JudgeCacheBreakdown events={cacheEvents} />

      <JudgeCacheAgeHistogram rows={cacheAges} hashToHub={Object.fromEntries(cacheEvents.filter(e => e.content_hash && e.hub).map(e => [e.content_hash as string, e.hub as string]))} />

      <TtlRecommendationTile events={cacheEvents} ages={cacheAges} overrides={ttlOverrides} onChanged={() => setRefreshTick((x) => x + 1)} />


      <ManualSweepCard />

      <LocatorBreakdown rows={rows} />





      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Blocking engines</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {topEngines.length === 0 && (
            <div className="text-sm text-muted-foreground">No engine blocks recorded.</div>
          )}
          {topEngines.map(([engine, count]) => (
            <Badge key={engine} variant="outline">
              {engine} · {count}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HubBreakdown({ rows }: { rows: Row[] }) {
  const hubs = ['playground', 'academy', 'success'] as const;
  const byHub = hubs.map((h) => {
    const hubRows = rows.filter((r) => (r.hub ?? '').toLowerCase() === h);
    const codeMap = new Map<string, { total: number; blocked: number }>();
    for (const r of hubRows) {
      const isBlocked = r.next_action === 'block';
      for (const c of r.repair_codes ?? []) {
        const cur = codeMap.get(c) ?? { total: 0, blocked: 0 };
        cur.total++;
        if (isBlocked) cur.blocked++;
        codeMap.set(c, cur);
      }
    }
    const top = [...codeMap.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);
    return { hub: h, total: hubRows.length, top };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Top blocking codes by hub</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byHub.map(({ hub, total, top }) => (
          <div key={hub} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold capitalize text-foreground">{hub}</div>
              <div className="text-xs text-muted-foreground">{total} runs</div>
            </div>
            {top.length === 0 && (
              <div className="text-xs text-muted-foreground">No data.</div>
            )}
            {top.map(([code, s]) => (
              <div key={code} className="flex items-center gap-2">
                <Badge variant={s.blocked / s.total >= 0.5 ? 'destructive' : 'secondary'} className="text-[10px]">
                  {s.total - s.blocked}/{s.total}
                </Badge>
                <div className="font-mono text-[11px] truncate flex-1">{code}</div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


function LocatorBreakdown({ rows }: { rows: Row[] }) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  // Aggregate: code -> locator-key (slide/activity/path) -> count
  const byCode = new Map<string, Map<string, number>>();
  const hitsByCode = new Map<string, LocatorHit[]>();
  for (const r of rows) {
    if (!r.locators) continue;
    for (const [code, locs] of Object.entries(r.locators)) {
      if (!Array.isArray(locs)) continue;
      const hits = hitsByCode.get(code) ?? [];
      hits.push({
        rowId: r.id,
        lessonId: r.lesson_id,
        hub: r.hub,
        cefr: r.cefr,
        attemptIndex: r.attempt_index,
        nextAction: r.next_action,
        createdAt: r.created_at,
        locators: locs,
      });
      hitsByCode.set(code, hits);
      for (const loc of locs) {
        const key =
          loc.slideId
            ? `slide:${loc.slideId}`
            : loc.activityId
              ? `activity:${loc.activityId}`
              : loc.path
                ? `path:${loc.path}`
                : '';
        if (!key) continue;
        const inner = byCode.get(code) ?? new Map<string, number>();
        inner.set(key, (inner.get(key) ?? 0) + 1);
        byCode.set(code, inner);
      }
    }
  }

  const codeTotals = [...byCode.entries()]
    .map(([code, m]) => ({
      code,
      total: [...m.values()].reduce((a, b) => a + b, 0),
      top: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const selectedHits = selectedCode ? hitsByCode.get(selectedCode) ?? [] : [];

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Top blocking locators (where each code fires)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {codeTotals.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No locator telemetry yet — publish a lesson with blocking issues to populate.
            </div>
          )}
          {codeTotals.map(({ code, total, top }) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedCode(code)}
              className="w-full text-left space-y-1 rounded-md border border-transparent p-2 transition hover:border-border hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">{code}</Badge>
                <div className="text-xs text-muted-foreground">{total} hits</div>
                <div className="ml-auto text-[11px] text-muted-foreground">View lessons</div>
              </div>
              <div className="pl-1 space-y-0.5">
                {top.map(([key, count]) => (
                  <div key={key} className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-muted-foreground w-10 text-right">{count}×</span>
                    <span className="font-mono truncate">{key}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {selectedCode && (
        <LocatorDrilldownModal
          code={selectedCode}
          hits={selectedHits}
          onClose={() => setSelectedCode(null)}
        />
      )}
    </>
  );
}

function LocatorDrilldownModal({
  code,
  hits,
  onClose,
}: {
  code: string;
  hits: LocatorHit[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-lg border border-border bg-card text-card-foreground shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Locator drill-down</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">{code}</Badge>
              <span className="text-xs text-muted-foreground">{hits.length} affected generation attempts</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportDrilldownCsv(code, hits)}
              disabled={hits.length === 0}
              className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">
          {hits.length === 0 && (
            <div className="text-sm text-muted-foreground">No detailed locator rows found for this code.</div>
          )}
          {hits.length > 0 && (
            <div className="space-y-2">
              {hits.map((hit) => (
                <div key={hit.rowId} className="rounded-md border border-border p-3">
                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-[1.4fr_repeat(5,auto)] md:items-center">
                    <div className="min-w-0">
                      <div className="text-muted-foreground">Lesson</div>
                      <div className="font-mono text-foreground truncate">{hit.lessonId ?? 'unlinked'}</div>
                    </div>
                    <MetaPill label="Hub" value={hit.hub ?? 'unknown'} />
                    <MetaPill label="CEFR" value={hit.cefr ?? '—'} />
                    <MetaPill label="Attempt" value={hit.attemptIndex == null ? '—' : String(hit.attemptIndex)} />
                    <MetaPill label="Action" value={hit.nextAction ?? '—'} />
                    <MetaPill label="When" value={new Date(hit.createdAt).toLocaleString()} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {hit.locators.map((loc, index) => (
                      <Badge key={`${hit.rowId}-${index}`} variant="secondary" className="font-mono text-[10px]">
                        {formatLocator(loc)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-2 py-1">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}


function exportSweepAuditCsv(
  rows: { id: string; triggered_by: string; actor_user_id: string | null; cache_evicted: number; events_evicted: number; error: string | null; created_at: string }[],
  filter: string,
) {
  const header = ['created_at', 'triggered_by', 'actor_user_id', 'cache_evicted', 'events_evicted', 'error'];
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.created_at, r.triggered_by, r.actor_user_id ?? '', r.cache_evicted, r.events_evicted, r.error ?? ''].map(esc).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qa-sweep-audit-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportDrilldownCsv(code: string, hits: LocatorHit[]) {
  const header = ['code', 'lesson_id', 'hub', 'cefr', 'attempt_index', 'next_action', 'created_at', 'locator_kind', 'locator_value'];
  const lines: string[] = [header.join(',')];
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  for (const hit of hits) {
    const base = [code, hit.lessonId ?? '', hit.hub ?? '', hit.cefr ?? '', hit.attemptIndex ?? '', hit.nextAction ?? '', hit.createdAt];
    if (hit.locators.length === 0) {
      lines.push([...base, '', ''].map(esc).join(','));
      continue;
    }
    for (const loc of hit.locators) {
      const kind = loc.slideId ? 'slide' : loc.activityId ? 'activity' : loc.path ? 'path' : 'unknown';
      const value = loc.slideId ?? loc.activityId ?? loc.path ?? '';
      lines.push([...base, kind, value].map(esc).join(','));
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qa-locator-${code}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatLocator(loc: Locator) {
  if (loc.slideId) return `slide:${loc.slideId}`;
  if (loc.activityId) return `activity:${loc.activityId}`;
  if (loc.path) return `path:${loc.path}`;
  return 'unknown';
}


function StoryArcHealStat({ rows }: { rows: Row[] }) {
  // Lesson-scoped heal rate: a lesson "healed" when STORY_ARC_UNDECLARED
  // appeared in any attempt AND the final attempt for that lesson cleared it
  // (i.e. final next_action !== 'block' OR the code is gone from final codes).
  const byLesson = new Map<string, Row[]>();
  for (const r of rows) {
    if (!r.lesson_id) continue;
    (byLesson.get(r.lesson_id) ?? byLesson.set(r.lesson_id, []).get(r.lesson_id)!).push(r);
  }
  let triggered = 0;
  let healed = 0;
  let stillBlocked = 0;
  for (const attempts of byLesson.values()) {
    const everHit = attempts.some((a) => (a.repair_codes ?? []).includes('STORY_ARC_UNDECLARED'));
    if (!everHit) continue;
    triggered++;
    const sorted = [...attempts].sort((a, b) => (a.attempt_index ?? 0) - (b.attempt_index ?? 0));
    const final = sorted[sorted.length - 1];
    const finalCodes = new Set(final.repair_codes ?? []);
    const cleared = final.next_action !== 'block' && !finalCodes.has('STORY_ARC_UNDECLARED');
    if (cleared) healed++;
    else stillBlocked++;
  }
  const rate = triggered ? Math.round((healed / triggered) * 100) : 0;
  return (
    <Stat
      label="Storybook arc heal-rate"
      value={rate}
      suffix="%"
      tone={triggered === 0 ? undefined : rate >= 70 ? 'success' : rate < 40 ? 'destructive' : undefined}
      sub={`${healed} healed · ${stillBlocked} still blocked / ${triggered} lessons`}
    />
  );
}

function StoryArcHubBreakdown({ rows }: { rows: Row[] }) {
  const hubs = ['playground', 'academy', 'success'] as const;
  const stats = hubs.map((hub) => {
    const hubRows = rows.filter((r) => (r.hub ?? '').toLowerCase() === hub);
    const byLesson = new Map<string, Row[]>();
    for (const r of hubRows) {
      if (!r.lesson_id) continue;
      (byLesson.get(r.lesson_id) ?? byLesson.set(r.lesson_id, []).get(r.lesson_id)!).push(r);
    }
    let triggered = 0;
    let healed = 0;
    for (const attempts of byLesson.values()) {
      if (!attempts.some((a) => (a.repair_codes ?? []).includes('STORY_ARC_UNDECLARED'))) continue;
      triggered++;
      const sorted = [...attempts].sort((a, b) => (a.attempt_index ?? 0) - (b.attempt_index ?? 0));
      const final = sorted[sorted.length - 1];
      const finalCodes = new Set(final.repair_codes ?? []);
      if (final.next_action !== 'block' && !finalCodes.has('STORY_ARC_UNDECLARED')) healed++;
    }
    const rate = triggered ? Math.round((healed / triggered) * 100) : 0;
    return { hub, triggered, healed, rate };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Storybook arc heal-rate by hub (7d)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.hub} className="rounded-md border p-3">
            <div className="text-xs font-medium capitalize text-muted-foreground">{s.hub}</div>
            <div
              className={`text-2xl font-bold ${
                s.triggered === 0
                  ? 'text-muted-foreground'
                  : s.rate >= 70
                    ? 'text-emerald-600'
                    : s.rate < 40
                      ? 'text-destructive'
                      : 'text-foreground'
              }`}
            >
              {s.triggered === 0 ? '—' : `${s.rate}%`}
            </div>
            <div className="text-xs text-muted-foreground">
              {s.healed}/{s.triggered} lessons healed
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}



function PublishDenialBreakdown({ rows }: { rows: Row[] }) {
  const denials = rows.filter((r) => r.next_action === 'block');
  const hubs = ['playground', 'academy', 'success'] as const;
  const byHub = hubs.map((h) => {
    const hubDenials = denials.filter((r) => (r.hub ?? '').toLowerCase() === h);
    const codeMap = new Map<string, number>();
    for (const r of hubDenials) {
      for (const c of r.repair_codes ?? []) codeMap.set(c, (codeMap.get(c) ?? 0) + 1);
    }
    const top = [...codeMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { hub: h, total: hubDenials.length, top };
  });
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Publish-gate denials by hub ({denials.length} blocked / 7d)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byHub.map(({ hub, total, top }) => (
          <div key={hub} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold capitalize text-foreground">{hub}</div>
              <div className="text-xs text-muted-foreground">{total} blocked</div>
            </div>
            {top.length === 0 && (
              <div className="text-xs text-muted-foreground">No denials.</div>
            )}
            {top.map(([code, count]) => (
              <div key={code} className="flex items-center gap-2">
                <Badge variant="destructive" className="text-[10px]">{count}×</Badge>
                <div className="font-mono text-[11px] truncate flex-1">{code}</div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function JudgeCacheBreakdown({
  events,
}: {
  events: { hit: boolean; judge_name: string; hub: string | null }[];
}) {
  const hubs = ['playground', 'academy', 'success'] as const;
  type Stats = { hits: number; total: number };
  // judge -> { overall, [hub]: stats }
  const byJudge = new Map<string, { overall: Stats } & Record<string, Stats>>();
  for (const e of events) {
    const row =
      byJudge.get(e.judge_name) ??
      ({
        overall: { hits: 0, total: 0 },
        playground: { hits: 0, total: 0 },
        academy: { hits: 0, total: 0 },
        success: { hits: 0, total: 0 },
      } as { overall: Stats } & Record<string, Stats>);
    row.overall.total++;
    if (e.hit) row.overall.hits++;
    const hubKey = (e.hub ?? '').toLowerCase();
    if (hubKey === 'playground' || hubKey === 'academy' || hubKey === 'success') {
      row[hubKey].total++;
      if (e.hit) row[hubKey].hits++;
    }
    byJudge.set(e.judge_name, row);
  }
  const rows = [...byJudge.entries()].sort((a, b) => b[1].overall.total - a[1].overall.total);
  const cell = (s: Stats) => {
    if (!s.total) return <span className="text-muted-foreground">—</span>;
    const rate = s.hits / s.total;
    const tone = rate >= 0.8 ? 'text-emerald-600' : rate >= 0.3 ? 'text-foreground' : 'text-destructive';
    return (
      <span className={tone}>
        {Math.round(rate * 100)}%{' '}
        <span className="text-muted-foreground">({s.hits}/{s.total})</span>
      </span>
    );
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Critic cache hit-rate by judge × hub</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 && (
          <div className="text-sm text-muted-foreground">No judge cache events yet.</div>
        )}
        {rows.length > 0 && (
          <div className="grid grid-cols-[1fr_repeat(4,auto)] gap-x-4 gap-y-1.5 text-xs">
            <div className="text-muted-foreground">judge</div>
            <div className="text-muted-foreground text-right">overall</div>
            {hubs.map((h) => (
              <div key={h} className="text-muted-foreground text-right capitalize">{h}</div>
            ))}
            {rows.map(([judge, s]) => (
              <Fragment key={judge}>
                <div className="font-mono truncate">{judge}</div>
                <div className="text-right">{cell(s.overall)}</div>
                {hubs.map((h) => (
                  <div key={h} className="text-right">{cell(s[h])}</div>
                ))}
              </Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JudgeCacheAgeHistogram({
  rows,
  hashToHub,
}: {
  rows: { judge_name: string; created_at: string; content_hash: string }[];
  hashToHub: Record<string, string>;
}) {
  const [hubFilter, setHubFilter] = useState<'all' | 'Playground' | 'Academy' | 'Success' | 'unknown'>('all');

  const filteredRows = rows.filter((r) => {
    if (hubFilter === 'all') return true;
    const hub = hashToHub[r.content_hash];
    if (hubFilter === 'unknown') return !hub;
    return hub === hubFilter;
  });

  // Buckets in days, mapped against the 30d TTL.
  const buckets: { label: string; max: number }[] = [
    { label: '0–1d', max: 1 },
    { label: '1–7d', max: 7 },
    { label: '7–14d', max: 14 },
    { label: '14–21d', max: 21 },
    { label: '21–30d', max: 30 },
    { label: '>30d (stale)', max: Infinity },
  ];
  const now = Date.now();
  const byJudge = new Map<string, number[]>();
  for (const r of filteredRows) {
    const ageDays = (now - new Date(r.created_at).getTime()) / 86400000;
    const idx = buckets.findIndex((b) => ageDays <= b.max);
    const arr = byJudge.get(r.judge_name) ?? new Array(buckets.length).fill(0);
    arr[idx === -1 ? buckets.length - 1 : idx]++;
    byJudge.set(r.judge_name, arr);
  }
  const judges = [...byJudge.entries()].sort(
    (a, b) => b[1].reduce((s, n) => s + n, 0) - a[1].reduce((s, n) => s + n, 0),
  );
  const total = filteredRows.length;
  const staleTotal = [...byJudge.values()].reduce((s, arr) => s + arr[buckets.length - 1], 0);

  const hubOptions: typeof hubFilter[] = ['all', 'Playground', 'Academy', 'Success', 'unknown'];

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm text-muted-foreground">
          Critic cache age by judge {total > 0 && <span className="ml-1 text-xs">· {total} rows · {staleTotal} stale (&gt;30d)</span>}
        </CardTitle>
        <div className="flex gap-1">
          {hubOptions.map((h) => (
            <button
              key={h}
              onClick={() => setHubFilter(h)}
              className={`text-xs px-2 py-0.5 rounded border ${hubFilter === h ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}
            >
              {h}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {judges.length === 0 ? (
          <div className="text-sm text-muted-foreground">No judge cache rows.</div>
        ) : (
          <div className="grid grid-cols-[1fr_repeat(6,auto)] gap-x-3 gap-y-1.5 text-xs">
            <div className="text-muted-foreground">judge</div>
            {buckets.map((b) => (
              <div key={b.label} className="text-muted-foreground text-right">{b.label}</div>
            ))}
            {judges.map(([judge, counts]) => {
              const sum = counts.reduce((s, n) => s + n, 0) || 1;
              return (
                <Fragment key={judge}>
                  <div className="font-mono truncate">{judge}</div>
                  {counts.map((n, i) => {
                    const pct = Math.round((n / sum) * 100);
                    const stale = i === buckets.length - 1 && n > 0;
                    return (
                      <div key={i} className={`text-right ${stale ? 'text-destructive' : ''}`}>
                        {n > 0 ? <>{n} <span className="text-muted-foreground">({pct}%)</span></> : <span className="text-muted-foreground">—</span>}
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TtlRecommendationTile({
  events,
  ages,
  overrides = {},
  onChanged,
}: {
  events: { hit: boolean; judge_name: string; content_hash?: string | null; hub?: string | null }[];
  ages: { judge_name: string; created_at: string; content_hash: string }[];
  overrides?: Record<string, number>;
  onChanged?: () => void;
}) {
  const [hubFilter, setHubFilter] = useState<'all' | 'playground' | 'academy' | 'success' | 'unknown'>('all');
  const [busyJudge, setBusyJudge] = useState<string | null>(null);

  const applySuggested = async (judge: string, ttl: number) => {
    setBusyJudge(judge);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message ?? 'You must be signed in to manage TTL overrides.');

      const { error } = await supabase
        .from('qa_judge_ttl_overrides')
        .upsert({ judge, ttl_days: ttl, updated_at: new Date().toISOString(), updated_by: user.id }, { onConflict: 'judge' });
      if (error) throw error;

      toast.success('TTL override applied', { description: `${judge} now uses ${ttl}d.` });
      onChanged?.();
    } catch (error) {
      toast.error('Could not apply TTL override', { description: formatSupabaseMutationError(error) });
    } finally {
      setBusyJudge(null);
    }
  };

  const revertOverride = async (judge: string) => {
    setBusyJudge(judge);
    try {
      const { error } = await supabase.from('qa_judge_ttl_overrides').delete().eq('judge', judge);
      if (error) throw error;

      toast.success('TTL override reverted', { description: `${judge} is back to the 30d default.` });
      onChanged?.();
    } catch (error) {
      toast.error('Could not revert TTL override', { description: formatSupabaseMutationError(error) });
    } finally {
      setBusyJudge(null);
    }
  };

  const applyAll = async () => {
    const pending = rows.filter((r) => overrides[r.judge] !== r.suggested);
    if (pending.length === 0) return;
    if (!window.confirm(`Apply suggested TTL to ${pending.length} judge(s)?`)) return;
    setBusyJudge('__all__');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message ?? 'You must be signed in to manage TTL overrides.');

      const updatedAt = new Date().toISOString();
      const { error } = await supabase.from('qa_judge_ttl_overrides').upsert(
        pending.map((r) => ({ judge: r.judge, ttl_days: r.suggested, updated_at: updatedAt, updated_by: user.id })),
        { onConflict: 'judge' },
      );
      if (error) throw error;

      toast.success('TTL overrides applied', { description: `${pending.length} judge override(s) updated.` });
      onChanged?.();
    } catch (error) {
      toast.error('Could not apply TTL overrides', { description: formatSupabaseMutationError(error) });
    } finally {
      setBusyJudge(null);
    }
  };

  const revertAll = async () => {
    const judges = Object.keys(overrides);
    if (judges.length === 0) return;
    if (!window.confirm(`Remove ${judges.length} override(s) and fall back to ${30}d default?`)) return;
    setBusyJudge('__all__');
    try {
      const { error } = await supabase.from('qa_judge_ttl_overrides').delete().in('judge', judges);
      if (error) throw error;

      toast.success('TTL overrides reverted', { description: `${judges.length} override(s) removed.` });
      onChanged?.();
    } catch (error) {
      toast.error('Could not revert TTL overrides', { description: formatSupabaseMutationError(error) });
    } finally {
      setBusyJudge(null);
    }
  };

  const ageByHash = new Map(ages.map((a) => [a.content_hash, new Date(a.created_at).getTime()]));
  const now = Date.now();

  const matchHub = (h: string | null | undefined) => {
    if (hubFilter === 'all') return true;
    if (hubFilter === 'unknown') return !h;
    return h === hubFilter;
  };

  // Per-judge p90 of hit ages (days), filtered by hub.
  const byJudge = new Map<string, number[]>();
  for (const e of events) {
    if (!e.hit || !e.content_hash) continue;
    if (!matchHub(e.hub ?? null)) continue;
    const t = ageByHash.get(e.content_hash);
    if (!t) continue;
    const ageDays = (now - t) / 86400000;
    (byJudge.get(e.judge_name) ?? byJudge.set(e.judge_name, []).get(e.judge_name)!).push(ageDays);
  }

  const rows = [...byJudge.entries()]
    .map(([judge, arr]) => {
      const sorted = arr.slice().sort((a, b) => a - b);
      const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? sorted[sorted.length - 1] ?? 0;
      const suggested = Math.max(1, Math.ceil(p90 * 1.2));
      return { judge, samples: arr.length, p90, suggested };
    })
    .sort((a, b) => b.samples - a.samples);

  const overall = rows.flatMap((r) => Array(r.samples).fill(r.p90));
  const overallP90 = overall.length
    ? overall.sort((a, b) => a - b)[Math.floor(overall.length * 0.9)]
    : 0;
  const overallSuggested = Math.max(1, Math.ceil(overallP90 * 1.2));

  const CURRENT_TTL = 30;
  const tooTight = rows.filter((r) => r.suggested > CURRENT_TTL).length;
  const tooLoose = rows.filter((r) => r.p90 < CURRENT_TTL / 3).length;

  const exportCsv = () => {
    const header = ['judge', 'hits', 'p90_days', 'suggested_ttl_days', 'delta_vs_current'];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([r.judge, r.samples, r.p90.toFixed(2), r.suggested, r.suggested - CURRENT_TTL].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-ttl-recommendation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySql = async () => {
    if (rows.length === 0) return;
    const sql = [
      '-- Suggested per-judge TTLs (days) for qa_judge_cache eviction',
      '-- Generated ' + new Date().toISOString(),
      ...rows.map(
        (r) =>
          `-- ${r.judge}: keep ${r.suggested}d  (p90=${r.p90.toFixed(1)}d, hits=${r.samples})`,
      ),
      '',
      'insert into public.qa_judge_ttl_overrides (judge, ttl_days, updated_at) values',
      rows.map((r) => `  ('${r.judge.replace(/'/g, "''")}', ${r.suggested}, now())`).join(',\n'),
      'on conflict (judge) do update set ttl_days = excluded.ttl_days, updated_at = now();',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      // ignore
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm text-muted-foreground">
            TTL recommendation
            {rows.length > 0 && (
              <span className="ml-1 text-xs">
                · overall p90 {overallP90.toFixed(1)}d → suggest {overallSuggested}d (current {CURRENT_TTL}d)
                {tooTight > 0 && <span className="ml-1 text-destructive">· {tooTight} judge(s) need longer TTL</span>}
                {tooLoose > 0 && <span className="ml-1 text-amber-500">· {tooLoose} judge(s) could shorten TTL</span>}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border overflow-hidden text-[10px]">
              {(['all', 'playground', 'academy', 'success', 'unknown'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHubFilter(h)}
                  className={`px-2 py-0.5 transition ${hubFilter === h ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                >
                  {h}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="rounded-md border border-border px-2 py-0.5 text-[10px] text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={copySql}
              disabled={rows.length === 0}
              title="Copy a per-judge TTL upsert into qa_judge_ttl_overrides"
              className="rounded-md border border-border px-2 py-0.5 text-[10px] text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy SQL
            </button>
            <button
              type="button"
              onClick={applyAll}
              disabled={rows.length === 0 || busyJudge === '__all__' || rows.every((r) => overrides[r.judge] === r.suggested)}
              title="Apply suggested TTL to every judge that doesn't already match"
              className="rounded-md border border-border px-2 py-0.5 text-[10px] text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply all
            </button>
            <button
              type="button"
              onClick={revertAll}
              disabled={Object.keys(overrides).length === 0 || busyJudge === '__all__'}
              title="Remove every active override (back to 30d default)"
              className="rounded-md border border-border px-2 py-0.5 text-[10px] text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Revert all
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">Not enough cache hits to recommend a TTL.</div>
        ) : (
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-x-3 gap-y-1 text-xs items-center">
            <div className="text-muted-foreground">judge</div>
            <div className="text-muted-foreground text-right">hits</div>
            <div className="text-muted-foreground text-right">p90 age</div>
            <div className="text-muted-foreground text-right">suggested</div>
            <div className="text-muted-foreground text-right">active</div>
            <div className="text-muted-foreground text-right">Δ vs active</div>
            <div className="text-muted-foreground text-right">actions</div>
            {rows.map((r) => {
              const active = overrides[r.judge];
              const effective = active ?? CURRENT_TTL;
              const delta = r.suggested - effective;
              const tone = delta > 0 ? 'text-destructive' : delta < -10 ? 'text-amber-500' : 'text-muted-foreground';
              const busy = busyJudge === r.judge;
              const bulkBusy = busyJudge === '__all__';
              const matches = active === r.suggested;
              return (
                <Fragment key={r.judge}>
                  <div className="font-mono truncate">{r.judge}</div>
                  <div className="text-right">{r.samples}</div>
                  <div className="text-right">{r.p90.toFixed(1)}d</div>
                  <div className="text-right font-semibold">{r.suggested}d</div>
                  <div className={`text-right ${active != null ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
                    {active != null ? `${active}d ✓` : `${CURRENT_TTL}d`}
                  </div>
                  <div className={`text-right ${tone}`}>{delta > 0 ? `+${delta}` : delta}d</div>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      disabled={bulkBusy || busy || matches}
                      onClick={() => applySuggested(r.judge, r.suggested)}
                      title={matches ? 'Active TTL already matches suggestion' : `Set ${r.judge} TTL to ${r.suggested}d`}
                      className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      disabled={bulkBusy || busy || active == null}
                      onClick={() => revertOverride(r.judge)}
                      title={active == null ? 'No override to revert' : `Remove override (back to ${CURRENT_TTL}d default)`}
                      className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Revert
                    </button>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
        {Object.keys(overrides).length > 0 && (
          <div className="mt-2 text-[10px] text-muted-foreground">
            {Object.keys(overrides).length} active override(s) loaded from <span className="font-mono">qa_judge_ttl_overrides</span>.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatSupabaseMutationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes('row-level security')) {
    return 'You must be signed in as an admin to manage judge TTL overrides.';
  }
  return message;
}



function Stat({
  label,
  value,
  tone,
  suffix,
  sub,
}: {
  label: string;
  value: number;
  tone?: 'success' | 'destructive';
  suffix?: string;
  sub?: string;
}) {
  const color =
    tone === 'success'
      ? 'text-emerald-500'
      : tone === 'destructive'
        ? 'text-destructive'
        : 'text-foreground';
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color}`}>{value}{suffix ?? ''}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function ManualSweepCard() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'manual' | 'cron'>('all');
  const [history, setHistory] = useState<
    { id: string; triggered_by: string; actor_user_id: string | null; cache_evicted: number; events_evicted: number; error: string | null; created_at: string }[]
  >([]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('qa_sweep_audit')
      .select('id, triggered_by, actor_user_id, cache_evicted, events_evicted, error, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setHistory((data ?? []) as typeof history);
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const sweep = async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('qa-judge-cache-sweep', {
        body: { triggered_by: 'manual', actor_user_id: user?.id ?? null },
      });
      if (error) throw error;
      const d = (data ?? {}) as { cache_evicted?: number; events_evicted?: number; telemetry_evicted?: number; audit_evicted?: number };
      setResult(
        `Evicted ${d.cache_evicted ?? 0} cache · ${d.events_evicted ?? 0} events · ${d.telemetry_evicted ?? 0} telemetry · ${d.audit_evicted ?? 0} audit rows.`,
      );
      await loadHistory();
    } catch (e) {
      setResult(`Sweep failed: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const isRetentionNote = (err: string | null) => !!err && err.startsWith('retention:');
  const manualRuns = history.filter((h) => h.triggered_by === 'manual');
  const cronRuns = history.filter((h) => h.triggered_by === 'cron');
  const failed = history.filter((h) => h.error && !isRetentionNote(h.error)).length;
  const totalCache = history.reduce((sum, h) => sum + (h.cache_evicted ?? 0), 0);
  const totalEvents = history.reduce((sum, h) => sum + (h.events_evicted ?? 0), 0);
  const parseRetention = (err: string) => {
    const t = /telemetry=(\d+)/.exec(err)?.[1];
    const a = /audit=(\d+)/.exec(err)?.[1];
    return { telemetry: Number(t ?? 0), audit: Number(a ?? 0) };
  };
  const totalRetention = history.reduce(
    (acc, h) => {
      if (!isRetentionNote(h.error)) return acc;
      const { telemetry, audit } = parseRetention(h.error!);
      return { telemetry: acc.telemetry + telemetry, audit: acc.audit + audit };
    },
    { telemetry: 0, audit: 0 },
  );

  const lastCron = cronRuns[0]?.created_at ? new Date(cronRuns[0].created_at) : null;
  const hoursSinceCron = lastCron ? (Date.now() - lastCron.getTime()) / 36e5 : Infinity;
  const cronStuck = hoursSinceCron > 36;

  const filtered = filter === 'all' ? history : history.filter((h) => h.triggered_by === filter);
  const visible = filtered.slice(0, 20);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Critic cache — sweep & audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={sweep}
            disabled={running}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {running ? 'Sweeping…' : 'Evict rows older than 30d'}
          </button>
          {result && <div className="text-xs text-muted-foreground">{result}</div>}
        </div>
        {cronStuck && history.length > 0 && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            ⚠️ No cron sweep in the last 36h
            {lastCron ? ` (last ${Math.round(hoursSinceCron)}h ago)` : ' (never recorded)'}. Schedule may be stuck — run a manual sweep or check pg_cron.
          </div>
        )}
        {history.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <SweepStat label="Total runs" value={history.length} />
              <SweepStat label="Manual" value={manualRuns.length} />
              <SweepStat label="Cron" value={cronRuns.length} />
              <SweepStat label="Failed" value={failed} tone={failed > 0 ? 'destructive' : undefined} />
              <SweepStat label="Cache+Events" value={`${totalCache}+${totalEvents}`} />
              <SweepStat label="Telem+Audit" value={`${totalRetention.telemetry}+${totalRetention.audit}`} />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-muted-foreground">Recent runs</div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportSweepAuditCsv(filtered, filter)}
                  disabled={filtered.length === 0}
                  className="rounded-md border border-border px-2 py-0.5 text-[10px] text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export CSV
                </button>
                <div className="inline-flex rounded-md border border-border overflow-hidden text-[10px]">
                  {(['all', 'manual', 'cron'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`px-2 py-0.5 transition ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1 max-h-64 overflow-auto">
              {visible.map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-xs">
                  <Badge variant={h.triggered_by === 'manual' ? 'default' : 'secondary'}>
                    {h.triggered_by}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                  {h.actor_user_id && (
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]" title={h.actor_user_id}>
                      {h.actor_user_id.slice(0, 8)}
                    </span>
                  )}
                  {h.error ? (
                    isRetentionNote(h.error) ? (
                      <span className="text-muted-foreground">
                        {h.cache_evicted} cache · {h.events_evicted} events · {parseRetention(h.error).telemetry} telem · {parseRetention(h.error).audit} audit
                      </span>
                    ) : (
                      <span className="text-destructive">error: {h.error}</span>
                    )
                  ) : (
                    <span className="text-foreground">
                      {h.cache_evicted} cache · {h.events_evicted} events
                    </span>
                  )}
                </div>
              ))}
              {visible.length === 0 && (
                <div className="text-xs text-muted-foreground">No runs match this filter.</div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SweepStat({ label, value, tone }: { label: string; value: number | string; tone?: 'destructive' }) {
  return (
    <div className={`rounded-md border border-border p-2 ${tone === 'destructive' ? 'border-destructive/50' : ''}`}>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`font-semibold ${tone === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}


function ExportCsvButton({
  rows,
  cacheEvents,
  rangeDays,
}: {
  rows: Row[];
  cacheEvents: { hit: boolean; judge_name: string; hub: string | null }[];
  rangeDays: number;
}) {
  const download = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const escape = (v: unknown) => {
    const s = v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportTelemetry = () => {
    const header = [
      'created_at', 'lesson_id', 'hub', 'cefr', 'attempt_index',
      'next_action', 'overall_score', 'repair_codes', 'blocking_engines', 'locators',
    ];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([
        r.created_at, r.lesson_id, r.hub, r.cefr, r.attempt_index,
        r.next_action, r.overall_score,
        (r.repair_codes ?? []).join('|'),
        (r.blocking_engines ?? []).join('|'),
        r.locators,
      ].map(escape).join(','));
    }
    download(`qa-repair-telemetry-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'));
  };

  const exportCache = () => {
    const header = ['hit', 'judge_name', 'hub'];
    const lines = [header.join(',')];
    for (const e of cacheEvents) {
      lines.push([e.hit, e.judge_name, e.hub].map(escape).join(','));
    }
    download(`qa-judge-cache-events-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'));
  };

  const exportPerHub = () => {
    const hubs = ['playground', 'academy', 'success'] as const;
    const header = [
      'created_at', 'lesson_id', 'hub', 'cefr', 'attempt_index',
      'next_action', 'overall_score', 'repair_codes', 'blocking_engines', 'locators',
    ];
    for (const hub of hubs) {
      const hubRows = rows.filter((r) => (r.hub ?? '').toLowerCase() === hub);
      if (hubRows.length === 0) continue;
      const lines = [header.join(',')];
      for (const r of hubRows) {
        lines.push([
          r.created_at, r.lesson_id, r.hub, r.cefr, r.attempt_index,
          r.next_action, r.overall_score,
          (r.repair_codes ?? []).join('|'),
          (r.blocking_engines ?? []).join('|'),
          r.locators,
        ].map(escape).join(','));
      }
      download(
        `qa-repair-telemetry-${hub}-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.csv`,
        lines.join('\n'),
      );
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={exportTelemetry}
        className="text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition"
      >
        Export telemetry CSV
      </button>
      <button
        type="button"
        onClick={exportPerHub}
        className="text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition"
      >
        Export per-hub CSVs
      </button>
      <button
        type="button"
        onClick={exportCache}
        className="text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition"
      >
        Export cache CSV
      </button>
    </div>
  );

}
