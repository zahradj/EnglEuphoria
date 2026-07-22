import React, { useEffect, useMemo, useState } from 'react';
import { Gamepad2, Wand2, BarChart3, Rocket, Loader2, Sparkles, Trophy, Mic, Users, CheckCircle2, XCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameMaker } from './GameMaker';
import { ARCADE_GAMES } from '@/arcade/gameRegistry';
import type { ArcadeGameMeta } from '@/arcade/types';

type Hub = 'playground' | 'academy' | 'success';
const HUB_COLOR: Record<Hub, string> = {
  playground: 'from-orange-500 to-amber-500',
  academy: 'from-purple-600 to-indigo-600',
  success: 'from-emerald-600 to-teal-600',
};

// ─── Overview cards ────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: React.ReactNode; hint?: string; icon: React.ElementType; tone?: string }> = ({ label, value, hint, icon: Icon, tone = 'from-indigo-500 to-purple-600' }) => (
  <Card className="p-4 relative overflow-hidden">
    <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${tone} opacity-10`} />
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{value}</div>
    {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
  </Card>
);

// ─── Analytics tab ─────────────────────────────────────────────
const AnalyticsPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [libTotals, setLibTotals] = useState({ total: 0, published: 0, byHub: { playground: 0, academy: 0, success: 0 } as Record<Hub, number> });
  const [sessionStats, setSessionStats] = useState({ sessions: 0, avgAccuracy: 0, avgHesitation: 0, speaking: 0, byHub: { playground: 0, academy: 0, success: 0 } as Record<Hub, number> });
  const [topGames, setTopGames] = useState<Array<{ game_id: string; plays: number; accuracy: number }>>([]);

  const load = async () => {
    setLoading(true);
    // library counts
    const { data: rows } = await supabase.from('learning_games').select('id, is_published, tags').limit(1000);
    const byHub: Record<Hub, number> = { playground: 0, academy: 0, success: 0 };
    let published = 0;
    (rows || []).forEach((r: any) => {
      if (r.is_published) published++;
      const hub = (r.tags || []).find((t: string) => ['playground', 'academy', 'success'].includes(t)) as Hub | undefined;
      if (hub) byHub[hub]++;
    });
    setLibTotals({ total: rows?.length || 0, published, byHub });

    // arcade sessions (last 14 days)
    const since = new Date(Date.now() - 14 * 86400_000).toISOString();
    const { data: sessions } = await supabase
      .from('arcade_sessions')
      .select('id, hub, accuracy, hesitation_ms_avg, speaking_attempts')
      .gte('started_at', since)
      .limit(1000);
    const shub: Record<Hub, number> = { playground: 0, academy: 0, success: 0 };
    let acc = 0, hes = 0, spk = 0;
    (sessions || []).forEach((s: any) => {
      if (['playground', 'academy', 'success'].includes(s.hub)) shub[s.hub as Hub]++;
      acc += Number(s.accuracy || 0);
      hes += Number(s.hesitation_ms_avg || 0);
      spk += Number(s.speaking_attempts || 0);
    });
    const n = sessions?.length || 0;
    setSessionStats({
      sessions: n,
      avgAccuracy: n ? Math.round((acc / n) * 100) : 0,
      avgHesitation: n ? Math.round(hes / n) : 0,
      speaking: spk,
      byHub: shub,
    });

    // top games from arcade_rounds
    const { data: rounds } = await supabase
      .from('arcade_rounds')
      .select('game_id, correct')
      .gte('created_at', since)
      .limit(5000);
    const tally: Record<string, { plays: number; correct: number }> = {};
    (rounds || []).forEach((r: any) => {
      const t = (tally[r.game_id] ||= { plays: 0, correct: 0 });
      t.plays++;
      if (r.correct) t.correct++;
    });
    const top = Object.entries(tally)
      .map(([game_id, v]) => ({ game_id, plays: v.plays, accuracy: v.plays ? v.correct / v.plays : 0 }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 8);
    setTopGames(top);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total games" value={libTotals.total} hint={`${libTotals.published} published`} icon={Gamepad2} tone="from-indigo-500 to-purple-600" />
        <StatCard label="Sessions · 14d" value={sessionStats.sessions} hint={`${sessionStats.avgAccuracy}% avg accuracy`} icon={BarChart3} tone="from-cyan-500 to-blue-600" />
        <StatCard label="Speaking attempts" value={sessionStats.speaking} hint={`${sessionStats.avgHesitation}ms avg hesitation`} icon={Mic} tone="from-rose-500 to-pink-600" />
        <StatCard label="Catalog archetypes" value={ARCADE_GAMES.length} hint="from Arcade registry" icon={Trophy} tone="from-amber-500 to-orange-600" />
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-3">Library by hub</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['playground', 'academy', 'success'] as Hub[]).map((h) => (
            <div key={h} className={`rounded-xl p-4 text-white bg-gradient-to-br ${HUB_COLOR[h]}`}>
              <div className="text-xs uppercase tracking-widest opacity-90">{h}</div>
              <div className="text-3xl font-extrabold mt-1">{libTotals.byHub[h]}</div>
              <div className="text-xs opacity-90 mt-1">{sessionStats.byHub[h]} sessions · 14d</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-3">Top played games · 14d</h3>
        {topGames.length === 0 ? (
          <p className="text-sm text-slate-500">No play data yet.</p>
        ) : (
          <div className="space-y-2">
            {topGames.map((g) => {
              const meta = ARCADE_GAMES.find((m) => m.id === g.game_id || m.game_type === g.game_id);
              const acc = Math.round(g.accuracy * 100);
              return (
                <div key={g.game_id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{meta?.display_name || g.game_id}</div>
                    <div className="text-[11px] text-slate-500">{g.plays} plays · {acc}% correct</div>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${acc >= 70 ? 'bg-emerald-500' : acc >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${acc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── AI Studio tab (esl-game-studio) ───────────────────────────
const AiStudioPanel: React.FC = () => {
  const [hub, setHub] = useState<Hub>('academy');
  const [cefr, setCefr] = useState('A2');
  const [skillKind, setSkillKind] = useState('vocab');
  const [skillKey, setSkillKey] = useState('');
  const [label, setLabel] = useState('');
  const [archetype, setArchetype] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    if (!skillKey.trim() || !label.trim()) {
      toast.error('Skill key and label are required');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('esl-game-studio', {
        body: {
          hub,
          cefr,
          target: { skill_kind: skillKind, skill_key: skillKey.trim(), label: label.trim() },
          archetype: archetype || undefined,
        },
      });
      if (error || data?.error) {
        toast.error('Generation failed', { description: data?.error || error?.message });
        return;
      }
      setResult(data);
      toast.success(`Generated · verdict: ${data?.verdict || 'unknown'}`);
    } catch (e: any) {
      toast.error(e?.message || 'Generation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow"><Wand2 className="h-5 w-5" /></div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">ESL Game Studio · AI</h3>
            <p className="text-xs text-slate-500">Bind a game to a ReinforcementTarget. Gemini direct, 7 specialists, one contract.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Hub</Label>
            <Select value={hub} onValueChange={(v) => setHub(v as Hub)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="playground">🎨 Playground</SelectItem>
                <SelectItem value="academy">🎓 Academy</SelectItem>
                <SelectItem value="success">🚀 Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">CEFR</Label>
            <Select value={cefr} onValueChange={setCefr}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Skill kind</Label>
            <Select value={skillKind} onValueChange={setSkillKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vocab">Vocabulary</SelectItem>
                <SelectItem value="grammar">Grammar</SelectItem>
                <SelectItem value="phoneme">Phoneme</SelectItem>
                <SelectItem value="speaking">Speaking</SelectItem>
                <SelectItem value="function">Function</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Archetype (optional)</Label>
            <Select value={archetype || 'auto'} onValueChange={(v) => setArchetype(v === 'auto' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-select</SelectItem>
                {['WordRush', 'SoundMatch', 'MeaningMaze', 'DialogueDash', 'MemoryGrid', 'GrammarSprint', 'FluencyArcade', 'BossRound'].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Skill key</Label>
            <Input placeholder={skillKind === 'vocab' ? 'e.g. bakery-items' : 'e.g. past-simple-irregular'} value={skillKey} onChange={(e) => setSkillKey(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label (shown to learner)</Label>
            <Input placeholder="e.g. Bakery Words" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
        </div>

        <Button onClick={generate} disabled={busy} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          {busy ? 'Running studio…' : 'Generate game spec'}
        </Button>
      </Card>

      {result && (
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {result.verdict === 'publish' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-amber-600" />}
            <span className="font-semibold text-sm">Verdict: {result.verdict}</span>
            {Array.isArray(result.issues) && result.issues.length > 0 && (
              <Badge variant="outline" className="text-[10px]">{result.issues.length} issue(s)</Badge>
            )}
          </div>
          {Array.isArray(result.issues) && result.issues.length > 0 && (
            <ul className="text-xs text-rose-600 list-disc pl-5">{result.issues.slice(0, 6).map((m: string, i: number) => <li key={i}>{m}</li>)}</ul>
          )}
          <Textarea rows={16} readOnly className="font-mono text-[11px]" value={JSON.stringify(result.spec ?? result, null, 2)} />
        </Card>
      )}
    </div>
  );
};

// ─── Rollout tab ───────────────────────────────────────────────
const RolloutPanel: React.FC = () => {
  const [rows, setRows] = useState<Array<{ id: string; title: string; is_published: boolean; tags: string[] | null; level: string; game_type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [hubFilter, setHubFilter] = useState<'all' | Hub>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('learning_games')
      .select('id, title, is_published, tags, level, game_type')
      .order('created_at', { ascending: false })
      .limit(500);
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getHub = (tags: string[] | null | undefined): Hub | null => {
    const h = (tags || []).find((t) => ['playground', 'academy', 'success'].includes(t)) as Hub | undefined;
    return h || null;
  };
  const filtered = rows.filter((r) => hubFilter === 'all' || getHub(r.tags) === hubFilter);

  const bulk = async (publish: boolean) => {
    const ids = filtered.map((r) => r.id);
    if (!ids.length) return;
    if (!confirm(`${publish ? 'Publish' : 'Unpublish'} ${ids.length} game(s)?`)) return;
    const { error } = await supabase.from('learning_games').update({ is_published: publish }).in('id', ids);
    if (error) toast.error(error.message); else toast.success(`${publish ? 'Published' : 'Unpublished'} ${ids.length}`);
    load();
  };

  const toggle = async (id: string, next: boolean) => {
    setBusyId(id);
    const { error } = await supabase.from('learning_games').update({ is_published: next }).eq('id', id);
    if (error) toast.error(error.message); else toast.success(next ? 'Live' : 'Hidden');
    setBusyId(null);
    load();
  };

  const stats = useMemo(() => {
    const s = { total: filtered.length, live: 0, draft: 0 };
    filtered.forEach((r) => (r.is_published ? s.live++ : s.draft++));
    return s;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Select value={hubFilter} onValueChange={(v) => setHubFilter(v as any)}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All hubs</SelectItem>
              <SelectItem value="playground">Playground</SelectItem>
              <SelectItem value="academy">Academy</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{stats.total} total</Badge>
          <Badge className="bg-emerald-600">{stats.live} live</Badge>
          <Badge variant="secondary">{stats.draft} draft</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => bulk(false)}>Unpublish all shown</Button>
          <Button size="sm" onClick={() => bulk(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Send className="w-3.5 h-3.5 mr-1" />Publish all shown
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : (
        <Card className="p-3">
          <div className="space-y-1">
            {filtered.map((r) => {
              const hub = getHub(r.tags);
              return (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{r.title}</span>
                      <Badge variant="outline" className="text-[10px]">{r.level}</Badge>
                      {hub && <Badge variant="outline" className="text-[10px]">{hub}</Badge>}
                      <Badge variant="secondary" className="text-[10px]">{r.game_type}</Badge>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{r.is_published ? 'Live' : 'Draft'}</span>
                  <Switch
                    checked={r.is_published}
                    disabled={busyId === r.id}
                    onCheckedChange={(v) => toggle(r.id, v)}
                  />
                </div>
              );
            })}
            {filtered.length === 0 && <p className="text-sm text-slate-500 text-center p-6">No games match this filter.</p>}
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── Dashboard shell ───────────────────────────────────────────
export const GameStudioDashboard: React.FC = () => {
  const [tab, setTab] = useState<'catalog' | 'ai' | 'analytics' | 'rollout'>('catalog');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      <header className="rounded-2xl p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl">🎮</div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Game Studio · Arcade Catalog</h1>
            <p className="text-sm text-white/85">Build wonderful games. Bind every round to a ReinforcementTarget. Ship to the Student Arcade with one switch.</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Badge className="bg-white/20 border-none">{ARCADE_GAMES.length} archetypes</Badge>
            <Badge className="bg-white/20 border-none"><Mic className="w-3 h-3 mr-1" />Speaking</Badge>
            <Badge className="bg-white/20 border-none"><Users className="w-3 h-3 mr-1" />Multiplayer</Badge>
          </div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="catalog"><Gamepad2 className="w-4 h-4 mr-1" />Builder</TabsTrigger>
          <TabsTrigger value="ai"><Wand2 className="w-4 h-4 mr-1" />AI Studio</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1" />Analytics</TabsTrigger>
          <TabsTrigger value="rollout"><Rocket className="w-4 h-4 mr-1" />Rollout</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-4">
          {/* GameMaker owns its own max-w container; wrap resets to full width */}
          <div className="[&>div]:!max-w-none [&>div]:!p-0">
            <GameMaker />
          </div>
        </TabsContent>
        <TabsContent value="ai" className="mt-4"><AiStudioPanel /></TabsContent>
        <TabsContent value="analytics" className="mt-4"><AnalyticsPanel /></TabsContent>
        <TabsContent value="rollout" className="mt-4"><RolloutPanel /></TabsContent>
      </Tabs>
    </div>
  );
};

export default GameStudioDashboard;
