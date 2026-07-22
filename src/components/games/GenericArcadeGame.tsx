// Generic adaptive renderer for arcade catalog games that don't have a
// dedicated React renderer yet. Handles 4 reusable families and surfaces a
// readable preview for the rest. Always emits an onComplete event so XP fires.
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Check, ArrowRight } from 'lucide-react';

interface Props {
  gameType: string;
  catalogId?: string | null;
  content: any;
  onComplete?: () => void;
}

const FAMILY: Record<string, 'mcq' | 'pairs' | 'sort' | 'speaking' | 'list' | 'preview'> = {
  matching_pairs: 'pairs',
  drag_drop_sort: 'sort',
  spelling_race: 'list',
  phonics_challenge: 'mcq',
  listening_hunt: 'mcq',
  song_chant: 'speaking',
  timeline_race: 'sort',
  roleplay_mission: 'speaking',
  pronunciation_quest: 'speaking',
  fluency_round: 'speaking',
  story_continuation: 'speaking',
  debate_battle: 'speaking',
  business_sim: 'speaking',
  memory_quest: 'list',
  grammar_boss: 'mcq',
  vocab_tournament: 'mcq',
  fluency_streak: 'list',
  team_mission: 'preview',
  classroom_battle: 'mcq',
  leaderboard_event: 'mcq',
  coop_challenge: 'preview',
};

function MCQ({ items, onDone }: { items: any[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const it = items[i] || {};
  const opts: string[] = it.options || it.opts || [];
  const correct = typeof it.correct === 'number' ? it.correct : 0;
  const q = it.q || it.question || it.prompt || '';
  const next = () => {
    setPicked(null);
    if (i + 1 >= items.length) onDone();
    else setI(i + 1);
  };
  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">Question {i + 1} of {items.length}</div>
      <div className="text-lg font-semibold text-slate-900">{q}</div>
      <div className="grid gap-2">
        {opts.map((o, idx) => (
          <button
            key={idx}
            disabled={picked !== null}
            onClick={() => setPicked(idx)}
            className={`text-left px-4 py-3 rounded-lg border-2 transition ${
              picked === null
                ? 'border-slate-200 hover:border-indigo-400 bg-white'
                : idx === correct
                  ? 'border-emerald-500 bg-emerald-50'
                  : idx === picked
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 bg-white opacity-60'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <Button onClick={next} className="w-full">
          {i + 1 >= items.length ? <>Finish <Check className="w-4 h-4 ml-1" /></> : <>Next <ArrowRight className="w-4 h-4 ml-1" /></>}
        </Button>
      )}
    </div>
  );
}

function Pairs({ pairs, onDone }: { pairs: { left: string; right: string }[]; onDone: () => void }) {
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [selL, setSelL] = useState<string | null>(null);
  const rights = pairs.map((p) => p.right);
  const allDone = Object.keys(solved).length >= pairs.length;
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">Match each item on the left with its pair on the right.</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p) => (
            <button key={p.left} disabled={!!solved[p.left]} onClick={() => setSelL(p.left)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                solved[p.left] ? 'bg-emerald-50 border-emerald-300 text-emerald-700 line-through' :
                selL === p.left ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}>{p.left}</button>
          ))}
        </div>
        <div className="space-y-2">
          {rights.map((r, i) => (
            <button key={i} disabled={!selL} onClick={() => {
              if (!selL) return;
              const match = pairs.find((p) => p.left === selL && p.right === r);
              if (match) setSolved((s) => ({ ...s, [selL]: true }));
              setSelL(null);
            }}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-indigo-300">{r}</button>
          ))}
        </div>
      </div>
      {allDone && <Button onClick={onDone} className="w-full">Finish <Check className="w-4 h-4 ml-1" /></Button>}
    </div>
  );
}

function Sort({ buckets, items, onDone }: { buckets: string[]; items: { word: string; bucket: string }[]; onDone: () => void }) {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const done = Object.keys(picked).length >= items.length;
  const correctCount = items.filter((it, i) => picked[i] === it.bucket).length;
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">Tap each word, then tap its bucket.</div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg border bg-white">{it.word}</div>
            <div className="flex gap-1">
              {buckets.map((b) => (
                <button key={b} onClick={() => setPicked((p) => ({ ...p, [i]: b }))}
                  className={`px-2 py-1 rounded text-xs border ${picked[i] === b ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'}`}>{b}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {done && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Score: {correctCount}/{items.length}</div>
          <Button onClick={onDone} className="w-full">Finish <Check className="w-4 h-4 ml-1" /></Button>
        </div>
      )}
    </div>
  );
}

function List({ items, onDone }: { items: any[]; onDone: () => void }) {
  const [revealed, setRevealed] = useState<Record<number, true>>({});
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <button key={i} onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
          className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
          <div className="font-semibold text-slate-900">{it.prompt || it.text || it.word || it.q || `Item ${i + 1}`}</div>
          {revealed[i] && <div className="text-sm text-emerald-600 mt-1">→ {it.answer || it.hint || ''}</div>}
        </button>
      ))}
      <Button onClick={onDone} className="w-full">Finish <Check className="w-4 h-4 ml-1" /></Button>
    </div>
  );
}

function SpeakingPanel({ content, onDone }: { content: any; onDone: () => void }) {
  const prompts = content.prompts || content.items || content.tasks || content.turns || [content];
  const [i, setI] = useState(0);
  const it = prompts[i] || {};
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-indigo-700 font-bold">Speaking prompt {i + 1}/{prompts.length}</div>
        <div className="text-lg font-semibold text-slate-900">
          {it.topic || it.target || it.scenario || it.prompt || it.text || it.line || it.q || content.opening || content.motion || 'Speak now'}
        </div>
        {it.starter && <div className="text-sm italic text-slate-600">Starter: "{it.starter}"</div>}
        {it.hint && <div className="text-sm text-slate-600">Hint: {it.hint}</div>}
      </div>
      <Button variant="outline" className="w-full"><Mic className="w-4 h-4 mr-2" /> Record (coming in classroom mode)</Button>
      <div className="flex gap-2">
        {i + 1 < prompts.length
          ? <Button onClick={() => setI(i + 1)} className="flex-1">Next prompt</Button>
          : <Button onClick={onDone} className="flex-1">Finish <Check className="w-4 h-4 ml-1" /></Button>}
      </div>
    </div>
  );
}

function PreviewOnly({ content, onDone }: { content: any; onDone: () => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600 mb-2">This game is designed for a multiplayer or live classroom session. Here's the content for reference:</p>
        <pre className="text-xs whitespace-pre-wrap text-slate-700">{JSON.stringify(content, null, 2)}</pre>
      </div>
      <Button onClick={onDone} className="w-full">Mark complete</Button>
    </div>
  );
}

export default function GenericArcadeGame({ gameType, catalogId, content, onComplete }: Props) {
  const key = (catalogId || gameType || '').toString();
  const family = FAMILY[key] || 'preview';
  const done = () => onComplete?.();

  if (family === 'mcq') {
    const items = content.questions || content.rounds || content.items || content.bracket?.map((b: any) => ({
      q: `Which word matches "${b.definition}"?`,
      options: [b.word, ...(b.distractors || [])].sort(() => Math.random() - 0.5),
      correct: 0,
    })) || [];
    if (items.length === 0) return <PreviewOnly content={content} onDone={done} />;
    // For bracket, recompute correct index after shuffle
    const normalized = items.map((it: any) => {
      if (typeof it.correct !== 'number' && it.options && it.answer) {
        return { ...it, correct: it.options.findIndex((o: string) => o === it.answer) };
      }
      return it;
    });
    return <MCQ items={normalized} onDone={done} />;
  }
  if (family === 'pairs') return <Pairs pairs={content.pairs || []} onDone={done} />;
  if (family === 'sort') {
    if (key === 'timeline_race') {
      const times = Array.from(new Set((content.events || []).map((e: any) => e.time)));
      const items = (content.events || []).map((e: any) => ({ word: e.text, bucket: e.time }));
      return <Sort buckets={times as string[]} items={items} onDone={done} />;
    }
    return <Sort buckets={content.buckets || []} items={content.items || []} onDone={done} />;
  }
  if (family === 'list') return <List items={content.items || content.words || content.prompts || []} onDone={done} />;
  if (family === 'speaking') return <SpeakingPanel content={content} onDone={done} />;
  return <PreviewOnly content={content} onDone={done} />;
}
