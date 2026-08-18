/**
 * Authoring tool for the unified PPP + activity lesson engine (Academy +
 * Success). Mounted at /unified-creator/:hub, gated to content_creator/admin
 * like PlaygroundCreator. Builds the same UnifiedLesson shape the solo
 * player (UnifiedLessonPlayer) reads, saved via unifiedLessonsService.ts.
 *
 * Each block/activity type gets a small dedicated form matching exactly the
 * config shape ActivitySection.tsx / PresentationSection.tsx expect — kept
 * deliberately minimal (2-5 fields each) rather than a generic JSON editor,
 * so an author can't produce a shape the player doesn't understand.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  UnifiedLesson,
  UnifiedMoment,
  UnifiedBlock,
  CatalogActivityBlock,
  SectionMode,
  Hub,
} from '@/unified-lessons/types';
import type { LessonBlock, MomentKind } from '@/game-runtime/engine/types';
import {
  listUnifiedLessons,
  saveUnifiedLesson,
  setUnifiedLessonStatus,
  deleteUnifiedLesson,
  type UnifiedLessonRow,
} from '@/unified-lessons/unifiedLessonsService';
import { getHubIdentity } from '@/components/unified-player/HubTheme';

const HUB_LABEL: Record<Hub, string> = { playground: 'Playground', academy: 'Academy', success: 'Success' };

const MOMENT_KIND_TO_MODE: Record<MomentKind, SectionMode> = {
  intro_moment: 'presentation',
  discovery_moment: 'presentation',
  practice_moment: 'activity',
  story_moment: 'presentation',
  challenge_moment: 'activity',
  reward_moment: 'presentation',
};

const MOMENT_KIND_OPTIONS: { value: MomentKind; label: string }[] = [
  { value: 'intro_moment', label: 'Intro (presentation)' },
  { value: 'discovery_moment', label: 'Discovery (presentation)' },
  { value: 'practice_moment', label: 'Practice (activity)' },
  { value: 'challenge_moment', label: 'Challenge (activity)' },
  { value: 'story_moment', label: 'Story (presentation)' },
  { value: 'reward_moment', label: 'Reward (presentation)' },
];

const PRESENTATION_BLOCK_TYPES: LessonBlock['type'][] = ['intro', 'vocab_solo', 'phonics_focus', 'storybook', 'lesson_summary'];
const ACTIVITY_TYPES = ['multiple', 'match', 'memory', 'fill', 'missing_letter', 'hotspot', 'role_play', 'speaking_mission'] as const;

let uidSeq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${uidSeq++}`;

function emptyLesson(hub: Hub): UnifiedLesson {
  return { id: '', title: 'New lesson', cefr: 'B1', hub, moments: [] };
}

function emptyBlockFor(type: LessonBlock['type']): LessonBlock {
  switch (type) {
    case 'intro': return { type: 'intro', title: '' };
    case 'vocab_solo': return { type: 'vocab_solo', word: '', definition: '' };
    case 'phonics_focus': return { type: 'phonics_focus', sound: '', examples: [] };
    case 'storybook': return { type: 'storybook', title: '', pages: [] };
    case 'lesson_summary': return { type: 'lesson_summary', title: '', bullets: [] };
    default: return { type: 'intro', title: '' };
  }
}

function emptyActivityFor(activityType: string): CatalogActivityBlock {
  const defaults: Record<string, Record<string, unknown>> = {
    multiple: { question: '', options: [], answer: '' },
    match: { instruction: '', pairs: [] },
    memory: { instruction: '', pairs: [] },
    fill: { text: '', answer: '', options: [] },
    missing_letter: { instruction: '', word: '', missing_position: 1 },
    hotspot: { instruction: '', parts: [] },
    role_play: { prompt: '', character: '', lines: [], scaffold: '' },
    speaking_mission: { prompt: '', scaffold: '' },
  };
  return { type: 'catalog_activity', activityType, label: '', config: defaults[activityType] ?? {} };
}

function linesToArray(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}
function csvToArray(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

// ─── Presentation block forms ────────────────────────────────────────────
function BlockForm({ block, onChange }: { block: LessonBlock; onChange: (b: LessonBlock) => void }) {
  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
  switch (block.type) {
    case 'intro':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Title" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <input className={input} placeholder="Subtitle — tell them why this matters to them (adults especially need the 'why' up front)" value={block.subtitle ?? ''} onChange={(e) => onChange({ ...block, subtitle: e.target.value })} />
        </div>
      );
    case 'vocab_solo':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Word" value={block.word} onChange={(e) => onChange({ ...block, word: e.target.value })} />
          <input className={input} placeholder="Definition" value={block.definition} onChange={(e) => onChange({ ...block, definition: e.target.value })} />
        </div>
      );
    case 'phonics_focus':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Sound (e.g. sh)" value={block.sound} onChange={(e) => onChange({ ...block, sound: e.target.value })} />
          <input className={input} placeholder="Examples, comma separated" value={block.examples.join(', ')} onChange={(e) => onChange({ ...block, examples: csvToArray(e.target.value) })} />
        </div>
      );
    case 'storybook':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Title" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <textarea className={input} rows={3} placeholder="Pages, one per line" value={block.pages.map((p) => p.text).join('\n')} onChange={(e) => onChange({ ...block, pages: linesToArray(e.target.value).map((text) => ({ text })) })} />
        </div>
      );
    case 'lesson_summary':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Title" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <textarea className={input} rows={3} placeholder="Bullets, one per line" value={block.bullets.join('\n')} onChange={(e) => onChange({ ...block, bullets: linesToArray(e.target.value) })} />
        </div>
      );
    default:
      return <p className="text-sm text-slate-400">Unsupported block type: {block.type}</p>;
  }
}

// ─── Activity block forms ────────────────────────────────────────────────
function ActivityForm({ block, onChange }: { block: CatalogActivityBlock; onChange: (b: CatalogActivityBlock) => void }) {
  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
  const cfg = block.config as Record<string, any>;
  const setCfg = (patch: Record<string, unknown>) => onChange({ ...block, config: { ...cfg, ...patch } });

  switch (block.activityType) {
    case 'multiple':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Question" value={cfg.question ?? ''} onChange={(e) => setCfg({ question: e.target.value })} />
          <input className={input} placeholder="Options, comma separated" value={(cfg.options ?? []).join(', ')} onChange={(e) => setCfg({ options: csvToArray(e.target.value) })} />
          <input className={input} placeholder="Correct answer" value={cfg.answer ?? ''} onChange={(e) => setCfg({ answer: e.target.value })} />
        </div>
      );
    case 'match':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Instruction" value={cfg.instruction ?? ''} onChange={(e) => setCfg({ instruction: e.target.value })} />
          <input className={input} placeholder="Words to match, comma separated" value={(cfg.pairs ?? []).map((p: any) => p.word).join(', ')} onChange={(e) => setCfg({ pairs: csvToArray(e.target.value).map((word) => ({ word, image_url: '' })) })} />
        </div>
      );
    case 'memory':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Instruction" value={cfg.instruction ?? ''} onChange={(e) => setCfg({ instruction: e.target.value })} />
          <textarea className={input} rows={3} placeholder={'One pair per line: word,emoji'} value={(cfg.pairs ?? []).map((p: any) => `${p.label},${p.emoji ?? ''}`).join('\n')} onChange={(e) => setCfg({ pairs: linesToArray(e.target.value).map((line) => { const [label, emoji] = line.split(',').map((s) => s.trim()); return { id: label, label, emoji }; }) })} />
        </div>
      );
    case 'fill':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Sentence with ____ for the gap" value={cfg.text ?? ''} onChange={(e) => setCfg({ text: e.target.value })} />
          <input className={input} placeholder="Correct answer" value={cfg.answer ?? ''} onChange={(e) => setCfg({ answer: e.target.value })} />
          <input className={input} placeholder="Distractor options, comma separated" value={(cfg.options ?? []).join(', ')} onChange={(e) => setCfg({ options: csvToArray(e.target.value) })} />
        </div>
      );
    case 'missing_letter':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Instruction" value={cfg.instruction ?? ''} onChange={(e) => setCfg({ instruction: e.target.value })} />
          <input className={input} placeholder="Word" value={cfg.word ?? ''} onChange={(e) => setCfg({ word: e.target.value })} />
          <input className={input} type="number" placeholder="Missing letter position (0-based)" value={cfg.missing_position ?? 1} onChange={(e) => setCfg({ missing_position: Number(e.target.value) })} />
        </div>
      );
    case 'hotspot':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Instruction" value={cfg.instruction ?? ''} onChange={(e) => setCfg({ instruction: e.target.value })} />
          <textarea className={input} rows={3} placeholder={'One item per line: word,emoji'} value={(cfg.parts ?? []).map((p: any) => `${p.label},${p.emoji ?? ''}`).join('\n')} onChange={(e) => setCfg({ parts: linesToArray(e.target.value).map((line) => { const [label, emoji] = line.split(',').map((s) => s.trim()); return { label, emoji }; }) })} />
        </div>
      );
    case 'role_play':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Prompt (e.g. Greet the interviewer)" value={cfg.prompt ?? ''} onChange={(e) => setCfg({ prompt: e.target.value })} />
          <input className={input} placeholder="Character name" value={cfg.character ?? ''} onChange={(e) => setCfg({ character: e.target.value })} />
          <textarea className={input} rows={3} placeholder={'Lines the character says, one per line'} value={(cfg.lines ?? []).join('\n')} onChange={(e) => setCfg({ lines: linesToArray(e.target.value) })} />
          <input className={input} placeholder="Scaffold — a sentence starter to help them respond (optional)" value={cfg.scaffold ?? ''} onChange={(e) => setCfg({ scaffold: e.target.value })} />
        </div>
      );
    case 'speaking_mission':
      return (
        <div className="space-y-2">
          <input className={input} placeholder="Prompt (open speaking task)" value={cfg.prompt ?? ''} onChange={(e) => setCfg({ prompt: e.target.value })} />
          <input className={input} placeholder="Scaffold — a sentence starter (optional)" value={cfg.scaffold ?? ''} onChange={(e) => setCfg({ scaffold: e.target.value })} />
        </div>
      );
    default:
      return null;
  }
}

// ─── Moment editor ────────────────────────────────────────────────────────
function MomentEditor({
  moment,
  onChange,
  onDelete,
  onMove,
  accent,
}: {
  moment: UnifiedMoment;
  onChange: (m: UnifiedMoment) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  accent: string;
}) {
  const isActivity = moment.mode === 'activity';

  const updateBlock = (index: number, block: UnifiedBlock) => {
    const blocks = [...moment.blocks];
    blocks[index] = block;
    onChange({ ...moment, blocks });
  };
  const removeBlock = (index: number) => {
    onChange({ ...moment, blocks: moment.blocks.filter((_, i) => i !== index) });
  };
  const addPresentationBlock = (type: LessonBlock['type']) => {
    onChange({ ...moment, blocks: [...moment.blocks, emptyBlockFor(type)] });
  };
  const addActivityBlock = (activityType: string) => {
    onChange({ ...moment, blocks: [...moment.blocks, emptyActivityFor(activityType)] });
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <select
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm font-bold"
          value={moment.kind}
          onChange={(e) => {
            const kind = e.target.value as MomentKind;
            onChange({ ...moment, kind, mode: MOMENT_KIND_TO_MODE[kind] });
          }}
        >
          {MOMENT_KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
          placeholder="Moment title (optional)"
          value={moment.title ?? ''}
          onChange={(e) => onChange({ ...moment, title: e.target.value })}
        />
        <button onClick={() => onMove(-1)} className="rounded-lg border px-2 py-1 text-xs font-bold text-slate-500">↑</button>
        <button onClick={() => onMove(1)} className="rounded-lg border px-2 py-1 text-xs font-bold text-slate-500">↓</button>
        <button onClick={onDelete} className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-bold text-rose-600">Delete</button>
      </div>

      <div className="space-y-3">
        {moment.blocks.map((block, i) => (
          <div key={i} className="rounded-xl bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                {block.type === 'catalog_activity' ? block.activityType : block.type}
              </span>
              <button onClick={() => removeBlock(i)} className="text-xs font-bold text-rose-500">Remove</button>
            </div>
            {block.type === 'catalog_activity' ? (
              <>
                <input
                  className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Label shown above the activity (optional)"
                  value={block.label ?? ''}
                  onChange={(e) => updateBlock(i, { ...block, label: e.target.value })}
                />
                <ActivityForm block={block} onChange={(b) => updateBlock(i, b)} />
              </>
            ) : (
              <BlockForm block={block} onChange={(b) => updateBlock(i, b)} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isActivity
          ? ACTIVITY_TYPES.map((t) => (
              <button key={t} onClick={() => addActivityBlock(t)} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: accent }}>
                + {t}
              </button>
            ))
          : PRESENTATION_BLOCK_TYPES.map((t) => (
              <button key={t} onClick={() => addPresentationBlock(t)} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: accent }}>
                + {t}
              </button>
            ))}
      </div>
    </div>
  );
}

// ─── Top-level creator page ───────────────────────────────────────────────
export default function UnifiedLessonCreator() {
  const { hub: hubParam } = useParams<{ hub: string }>();
  const navigate = useNavigate();
  const hub = (['academy', 'success'].includes(hubParam ?? '') ? hubParam : 'academy') as Hub;
  const theme = getHubIdentity(hub);
  const accent = theme.accent;

  const [rows, setRows] = useState<UnifiedLessonRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [lesson, setLesson] = useState<UnifiedLesson>(emptyLesson(hub));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshList = async () => {
    setLoadingList(true);
    try {
      const data = await listUnifiedLessons(hub, { mineOnly: true });
      setRows(data);
    } catch (e: any) {
      setMessage(e?.message ?? 'Failed to load lessons');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    setLesson(emptyLesson(hub));
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hub]);

  const loadRow = (row: UnifiedLessonRow) => {
    setLesson({
      id: row.id,
      title: row.title,
      cefr: row.cefr,
      hub: row.hub,
      defaultHostCharacterId: row.default_host_character_id ?? undefined,
      moments: row.moments,
    });
    setMessage(null);
  };

  const addMoment = () => {
    const kind: MomentKind = 'practice_moment';
    setLesson((l) => ({
      ...l,
      moments: [...l.moments, { id: uid('moment'), kind, mode: MOMENT_KIND_TO_MODE[kind], blocks: [] }],
    }));
  };

  const updateMoment = (index: number, moment: UnifiedMoment) => {
    setLesson((l) => {
      const moments = [...l.moments];
      moments[index] = moment;
      return { ...l, moments };
    });
  };
  const deleteMoment = (index: number) => {
    setLesson((l) => ({ ...l, moments: l.moments.filter((_, i) => i !== index) }));
  };
  const moveMoment = (index: number, dir: -1 | 1) => {
    setLesson((l) => {
      const moments = [...l.moments];
      const target = index + dir;
      if (target < 0 || target >= moments.length) return l;
      [moments[index], moments[target]] = [moments[target], moments[index]];
      return { ...l, moments };
    });
  };

  const save = async (status?: 'draft' | 'published') => {
    setSaving(true);
    setMessage(null);
    try {
      const row = await saveUnifiedLesson({
        id: lesson.id || undefined,
        hub,
        title: lesson.title,
        cefr: lesson.cefr,
        defaultHostCharacterId: lesson.defaultHostCharacterId ?? null,
        moments: lesson.moments,
        status,
      });
      loadRow(row);
      await refreshList();
      setMessage(status === 'published' ? 'Published.' : 'Draft saved.');
    } catch (e: any) {
      setMessage(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const unpublish = async () => {
    if (!lesson.id) return;
    setSaving(true);
    try {
      await setUnifiedLessonStatus(lesson.id, 'draft');
      await refreshList();
      setMessage('Moved back to draft.');
    } catch (e: any) {
      setMessage(e?.message ?? 'Failed to unpublish');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!lesson.id) return;
    setSaving(true);
    try {
      await deleteUnifiedLesson(lesson.id);
      setLesson(emptyLesson(hub));
      await refreshList();
      setMessage('Lesson deleted.');
    } catch (e: any) {
      setMessage(e?.message ?? 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: theme.sceneGradient }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(circle at 50% 0%, ${theme.glow}, transparent 45%)` }}
      />
      <header className="relative bg-black/20 px-6 py-4 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-xl shadow-lg ring-2 ring-white/40" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}>
            {theme.characterAvatarEmoji}
          </span>
          <div>
            <h1 className="text-xl font-black text-white drop-shadow">{HUB_LABEL[hub]} Lesson Creator</h1>
            <p className="text-sm text-white/80">Combine PPP sections with activities in one lesson.</p>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <button onClick={() => setLesson(emptyLesson(hub))} className="w-full rounded-xl px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: accent }}>
            + New lesson
          </button>
          {loadingList ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <button
                  key={row.id}
                  onClick={() => loadRow(row)}
                  className={`w-full rounded-xl border-2 p-3 text-left text-sm ${lesson.id === row.id ? 'border-slate-400 bg-white' : 'border-transparent bg-white/60'}`}
                >
                  <div className="font-bold text-slate-800">{row.title}</div>
                  <div className="text-xs text-slate-400">{row.cefr} · {row.status}</div>
                </button>
              ))}
              {rows.length === 0 && <p className="text-sm text-slate-400">No lessons yet.</p>}
            </div>
          )}
        </aside>

        <main className="space-y-4">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
                placeholder="Lesson title"
                value={lesson.title}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
              />
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={lesson.cefr}
                onChange={(e) => setLesson({ ...lesson, cefr: e.target.value })}
              >
                {['A2', 'B1', 'B2', 'C1'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {lesson.moments.map((moment, i) => (
            <MomentEditor
              key={moment.id}
              moment={moment}
              accent={accent}
              onChange={(m) => updateMoment(i, m)}
              onDelete={() => deleteMoment(i)}
              onMove={(dir) => moveMoment(i, dir)}
            />
          ))}

          <button onClick={addMoment} className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 hover:border-slate-400">
            + Add moment
          </button>

          <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
            <button disabled={saving} onClick={() => save('draft')} className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-50">
              Save draft
            </button>
            <button disabled={saving} onClick={() => save('published')} className="rounded-xl px-4 py-2 text-sm font-black text-white disabled:opacity-50" style={{ backgroundColor: accent }}>
              Publish
            </button>
            {lesson.id && (
              <button disabled={saving} onClick={unpublish} className="rounded-xl border-2 border-amber-300 px-4 py-2 text-sm font-black text-amber-700 disabled:opacity-50">
                Unpublish
              </button>
            )}
            {lesson.id && (
              <button disabled={saving} onClick={remove} className="rounded-xl border-2 border-rose-300 px-4 py-2 text-sm font-black text-rose-600 disabled:opacity-50">
                Delete
              </button>
            )}
            {lesson.id && (
              <button onClick={() => navigate(`/unified-pilot/${hub}/${lesson.id}`)} className="ml-auto rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-black text-slate-700">
                Preview →
              </button>
            )}
            {message && <span className="text-sm font-bold text-slate-500">{message}</span>}
          </div>
        </main>
      </div>
    </div>
  );
}
