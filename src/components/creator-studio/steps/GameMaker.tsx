import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, Sparkles, Save, X, Search, Wand2, Copy, Mic, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import GamePlayer from '@/components/games/GamePlayer';
import { ARCADE_GAMES } from '@/arcade/gameRegistry';
import type { ArcadeGameMeta, ArcadeCategory } from '@/arcade/types';
import { getStarter, validateGameContent, getShapeHint } from '@/components/games/gameContentSchemas';

type Hub = 'playground' | 'academy' | 'success';
type Level = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

const ALL_LEVELS: Level[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
const HUB_LABEL: Record<Hub, string> = {
  playground: '🎨 Playground (4-9)',
  academy:    '🎓 Academy (10-17)',
  success:    '🚀 Success (18+)',
};
const CATEGORY_LABEL: Record<ArcadeCategory, string> = {
  foundational: 'Foundational',
  communication: 'Communication',
  review: 'Review',
  social: 'Social',
};

interface GameRow {
  id: string;
  game_type: string;
  catalog_game_id: string | null;
  level: string;
  title: string;
  description: string | null;
  content_json: any;
  is_published: boolean;
  tags: string[] | null;
  created_at: string;
}

function getHubFromTags(tags: string[] | null | undefined): Hub {
  const t = (tags || []).find((x) => ['playground', 'academy', 'success'].includes(x)) as Hub | undefined;
  return t || 'academy';
}
function levelOk(level: string, meta: ArcadeGameMeta): boolean {
  const order: string[] = ALL_LEVELS;
  const i = order.indexOf(level);
  const min = order.indexOf(meta.cefr_min as Level);
  const max = order.indexOf(meta.cefr_max as Level);
  return i >= 0 && i >= min && i <= max;
}
function allowedLevels(meta: ArcadeGameMeta): Level[] {
  return ALL_LEVELS.filter((l) => levelOk(l, meta));
}

export const GameMaker: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GameRow | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  // Library filters
  const [search, setSearch] = useState('');
  const [hubFilter, setHubFilter] = useState<'all' | Hub>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | Level>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ArcadeCategory>('all');
  const [publishedOnly, setPublishedOnly] = useState(false);

  // Picker filters
  const [pickerHub, setPickerHub] = useState<'all' | Hub>('all');
  const [pickerSpeaking, setPickerSpeaking] = useState(false);
  const [pickerMulti, setPickerMulti] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('learning_games')
      .select('id, game_type, catalog_game_id, level, title, description, content_json, is_published, tags, created_at')
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    setRows((data as any as GameRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const startNew = (meta: ArcadeGameMeta) => {
    const hub: Hub = meta.hub_allow.includes('academy' as any) ? 'academy' : (meta.hub_allow[0] as Hub);
    const level = (allowedLevels(meta)[0] || 'A1') as Level;
    setEditing({
      id: '',
      game_type: meta.game_type,
      catalog_game_id: meta.id,
      level,
      title: meta.display_name,
      description: meta.description || '',
      content_json: getStarter(meta.id),
      is_published: true,
      tags: [hub, meta.category],
      created_at: '',
    });
    setAiTopic('');
  };

  const duplicate = async (row: GameRow) => {
    if (!user?.id) { toast.error('Sign in required'); return; }
    const payload = {
      game_type: row.game_type,
      catalog_game_id: row.catalog_game_id,
      level: row.level,
      title: `${row.title} (copy)`,
      description: row.description,
      content_json: row.content_json,
      tags: row.tags || [],
      is_published: true,
      created_by: user.id,
    };
    const { error } = await supabase.from('learning_games').insert(payload as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Duplicated as draft');
    refresh();
  };

  const aiGenerate = async () => {
    if (!editing) return;
    const topic = aiTopic.trim();
    if (!topic) { toast.error('Enter a topic for the AI'); return; }
    setAiBusy(true);
    try {
      const hub = getHubFromTags(editing.tags);
      const catalogId = editing.catalog_game_id || editing.game_type;
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: { game_type: catalogId, level: editing.level, hub, topic },
      });
      if (error || data?.error) {
        const { extractEdgeError } = await import('@/lib/extractEdgeError');
        const msg = await extractEdgeError({ error, data, fallback: 'AI generation failed' });
        toast.error('AI generation failed', { description: msg, duration: 12000 });
        return;
      }
      if (!data?.content) { toast.error('AI returned no content'); return; }
      setEditing({ ...editing, content_json: data.content });
      toast.success('AI content drafted ✨ — review then Save');
    } catch (e: any) {
      toast.error(e?.message || 'AI generation failed');
    } finally {
      setAiBusy(false);
    }
  };

  const save = async () => {
    if (!editing || !user?.id) { toast.error('Sign in required'); return; }
    if (!editing.title.trim()) { toast.error('Title is required'); return; }
    let json: any = editing.content_json;
    if (typeof json === 'string') {
      try { json = JSON.parse(json); } catch { toast.error('Content JSON is invalid'); return; }
    }
    const catalogId = editing.catalog_game_id || editing.game_type;
    const errs = validateGameContent(catalogId, json);
    if (errs.length) {
      toast.error('Fix content issues before saving', { description: errs.slice(0, 4).join(' · '), duration: 12000 });
      return;
    }
    const payload = {
      game_type: editing.game_type,
      catalog_game_id: editing.catalog_game_id,
      level: editing.level,
      title: editing.title.trim(),
      description: editing.description?.trim() || null,
      content_json: json,
      tags: editing.tags || [],
      is_published: editing.is_published,
      created_by: user.id,
    };
    const op = editing.id
      ? supabase.from('learning_games').update(payload as any).eq('id', editing.id).select().maybeSingle()
      : supabase.from('learning_games').insert(payload as any).select().maybeSingle();
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editing.is_published ? '🎮 Published to Student Library' : (editing.id ? 'Game updated' : 'Game saved as draft'));
    setEditing(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this game permanently?')) return;
    const { error } = await supabase.from('learning_games').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted');
    refresh();
  };

  const togglePublish = async (row: GameRow) => {
    const { error } = await supabase
      .from('learning_games')
      .update({ is_published: !row.is_published })
      .eq('id', row.id);
    if (error) { toast.error(error.message); return; }
    toast.success(!row.is_published ? 'Published to students' : 'Unpublished');
    refresh();
  };

  const metaFor = (row: GameRow): ArcadeGameMeta | undefined =>
    ARCADE_GAMES.find((g) => g.id === (row.catalog_game_id || row.game_type));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (publishedOnly && !r.is_published) return false;
      if (levelFilter !== 'all' && r.level !== levelFilter) return false;
      if (hubFilter !== 'all') {
        const rowHub = getHubFromTags(r.tags);
        if (rowHub !== hubFilter) return false;
      }
      if (categoryFilter !== 'all') {
        const m = metaFor(r);
        if (!m || m.category !== categoryFilter) return false;
      }
      if (q && !(r.title?.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, hubFilter, levelFilter, categoryFilter, publishedOnly]);

  const grouped = useMemo(() => {
    const map: Record<string, GameRow[]> = {};
    for (const r of filtered) {
      const m = metaFor(r);
      const key = m ? `${CATEGORY_LABEL[m.category]} · ${m.display_name}` : `Other · ${r.game_type}`;
      (map[key] ||= []).push(r);
    }
    return map;
  }, [filtered]);

  const visiblePickerGames = useMemo(() => ARCADE_GAMES.filter((g) => {
    if (pickerHub !== 'all' && !g.hub_allow.includes(pickerHub as any)) return false;
    if (pickerSpeaking && !g.supports_speaking) return false;
    if (pickerMulti && !g.supports_multiplayer) return false;
    return true;
  }), [pickerHub, pickerSpeaking, pickerMulti]);

  // ── Editor view ─────────────────────────────────────────────
  if (editing) {
    const meta = ARCADE_GAMES.find((g) => g.id === (editing.catalog_game_id || editing.game_type));
    const currentJson = typeof editing.content_json === 'string' ? (() => { try { return JSON.parse(editing.content_json); } catch { return null; } })() : editing.content_json;
    const catalogId = editing.catalog_game_id || editing.game_type;
    const liveErrors = currentJson ? validateGameContent(catalogId, currentJson) : ['Content JSON is invalid'];
    const hub = getHubFromTags(editing.tags);
    const allowedHubs: Hub[] = (meta?.hub_allow as Hub[]) || ['playground', 'academy', 'success'];
    const levels = meta ? allowedLevels(meta) : ALL_LEVELS;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-md text-white">🎮</div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {editing.id ? 'Edit Game' : 'Create Game'} · {meta?.display_name || editing.game_type}
            </h2>
            <p className="text-sm text-slate-500">{meta?.description || '—'}</p>
            {meta && (
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="secondary">{CATEGORY_LABEL[meta.category]}</Badge>
                <Badge variant="outline">CEFR {meta.cefr_min}–{meta.cefr_max}</Badge>
                {meta.supports_speaking && <Badge variant="outline" className="text-rose-700 border-rose-300"><Mic className="w-3 h-3 mr-1" />Speaking</Badge>}
                {meta.supports_multiplayer && <Badge variant="outline" className="text-indigo-700 border-indigo-300"><Users className="w-3 h-3 mr-1" />Multiplayer</Badge>}
                <Badge variant="outline">~{Math.round(meta.ceiling_seconds / 60)}m</Badge>
              </div>
            )}
          </div>
          <Button variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
          <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={liveErrors.length > 0}><Save className="h-4 w-4 mr-1" /> Save</Button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label>Title</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Hub</Label>
              <Select
                value={hub}
                onValueChange={(v) => {
                  const newHub = v as Hub;
                  const otherTags = (editing.tags || []).filter((t) => !['playground', 'academy', 'success'].includes(t));
                  setEditing({ ...editing, tags: [newHub, ...otherTags] });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allowedHubs.map((h) => <SelectItem key={h} value={h}>{HUB_LABEL[h]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CEFR Level</Label>
              <Select value={editing.level} onValueChange={(v) => setEditing({ ...editing, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea rows={2} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>

          {/* AI Assist */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">
              <Wand2 className="h-4 w-4" /> AI Assist
            </div>
            <p className="text-xs text-slate-500">Describe a topic and let AI draft the content JSON. You can still edit before saving.</p>
            <div className="flex gap-2">
              <Input
                placeholder={`e.g. "Past simple irregular verbs about travel"`}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                disabled={aiBusy}
              />
              <Button onClick={aiGenerate} disabled={aiBusy} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                {aiBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                {aiBusy ? 'Drafting…' : 'Generate'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Content (JSON)</span>
              <span className="text-xs text-slate-400 font-mono truncate ml-2">{getShapeHint(catalogId)}</span>
            </Label>
            <Textarea
              rows={14}
              className="font-mono text-xs"
              value={typeof editing.content_json === 'string' ? editing.content_json : JSON.stringify(editing.content_json, null, 2)}
              onChange={(e) => setEditing({ ...editing, content_json: e.target.value })}
            />
            {liveErrors.length > 0 ? (
              <ul className="text-xs text-rose-600 dark:text-rose-400 list-disc pl-5 space-y-0.5">
                {liveErrors.slice(0, 6).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Content is valid for this game type.</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3">
            <div>
              <p className="text-sm font-semibold">Publish to Students</p>
              <p className="text-xs text-slate-500">Visible in the Arcade for matching CEFR level + hub.</p>
            </div>
            <Switch checked={editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
          </div>

          {editing.id ? (
            <div className="rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Preview</p>
              <GamePlayer gameId={editing.id} />
            </div>
          ) : (
            <p className="text-xs text-slate-400">Save the game first to enable the interactive preview.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Library / picker view ───────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Game Maker · Arcade Catalog</h1>
        <p className="text-sm text-slate-500">22 catalog-backed mini-games. Published games appear in the Student Arcade.</p>
      </div>

      {/* Picker */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">New game from catalog</h2>
          <div className="flex items-center gap-2 text-xs">
            <Select value={pickerHub} onValueChange={(v) => setPickerHub(v as any)}>
              <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hubs</SelectItem>
                <SelectItem value="playground">Playground</SelectItem>
                <SelectItem value="academy">Academy</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center gap-1"><Switch checked={pickerSpeaking} onCheckedChange={setPickerSpeaking} /> Speaking</label>
            <label className="flex items-center gap-1"><Switch checked={pickerMulti} onCheckedChange={setPickerMulti} /> Multiplayer</label>
          </div>
        </div>
        {(['foundational', 'communication', 'review', 'social'] as ArcadeCategory[]).map((cat) => {
          const games = visiblePickerGames.filter((g) => g.category === cat);
          if (games.length === 0) return null;
          return (
            <div key={cat}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{CATEGORY_LABEL[cat]}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {games.map((g) => (
                  <button key={g.id} onClick={() => startNew(g)}
                    className="text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition group">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{g.display_name}</span>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{g.cefr_min}–{g.cefr_max} · {g.hub_allow.join('/')}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {g.supports_speaking && <Badge variant="outline" className="text-[9px] py-0">🎙</Badge>}
                      {g.supports_multiplayer && <Badge variant="outline" className="text-[9px] py-0">👥</Badge>}
                      {g.skill_focus.slice(0, 2).map((s) => <Badge key={s} variant="secondary" className="text-[9px] py-0">{s}</Badge>)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Library filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Your library · {filtered.length} of {rows.length}</h2>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
              <Input className="pl-7 h-8 w-44" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={hubFilter} onValueChange={(v) => setHubFilter(v as any)}>
              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hubs</SelectItem>
                <SelectItem value="playground">Playground</SelectItem>
                <SelectItem value="academy">Academy</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
              <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="foundational">Foundational</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as any)}>
              <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {ALL_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-1"><Switch checked={publishedOnly} onCheckedChange={setPublishedOnly} /> Published only</label>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-slate-500 p-4 text-center">
            {rows.length === 0 ? <>No games yet. Pick a type above to create your first one. <Sparkles className="inline h-4 w-4 ml-1 text-indigo-500" /></> : <>No games match your filters.</>}
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([key, items]) => (
              <div key={key}>
                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">{key}</div>
                <div className="space-y-1">
                  {items.map((r) => {
                    const m = metaFor(r);
                    return (
                      <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm">{r.title}</span>
                            <Badge variant="outline" className="text-[10px]">{r.level}</Badge>
                            <Badge variant="outline" className="text-[10px]">{getHubFromTags(r.tags)}</Badge>
                            {r.is_published ? <Badge className="bg-emerald-600 text-[10px]">Published</Badge> : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                            {m?.supports_speaking && <Badge variant="outline" className="text-[10px]">🎙</Badge>}
                            {m?.supports_multiplayer && <Badge variant="outline" className="text-[10px]">👥</Badge>}
                          </div>
                          {r.description && <div className="text-xs text-slate-500 truncate">{r.description}</div>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setPreviewId(r.id)}>Preview</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => duplicate(r)}><Copy className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => togglePublish(r)}>{r.is_published ? 'Unpublish' : 'Publish'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-rose-600 hover:text-rose-700"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {previewId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewId(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4">
              <GamePlayer gameId={previewId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMaker;
