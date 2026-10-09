// Academy lesson player — presentation parts. Imports only React and files in this folder.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PictureTile, Backdrop, CastBust } from './art';
import { speakerColor } from './castVisual';
import { seededShuffle } from './engine';
import type { Beat, ChatMessage, ChoiceOption, FlashCard, FormField, Gloss, PanelSpec, ProfileRow } from './scriptTypes';

type SayBeat = Extract<Beat, { t: 'say' }>;

/* ── run-of-show strip ── */
export const SEGMENT_GOALS = ['Meet the team', 'What do you already know?', 'Solve the mystery', 'Learn the words', 'A quick game', 'Your mission', 'Make it yours', 'Wrap-up'] as const;
export const SEGMENT_NAMES = ['Check-in', 'Remember?', 'The Drop', 'Notice & Build', 'Energiser', 'Mission', 'Release', 'Wrap'] as const;

export function RunStrip({ title, segment }: { title: string; segment: number }) {
  return (
    <header className="ap-strip">
      <span className="ap-title">{title}</span>
      <div className="ap-segs" role="progressbar" aria-valuemin={1} aria-valuemax={8} aria-valuenow={segment + 1} aria-label={`Lesson part ${segment + 1} of 8: ${SEGMENT_NAMES[segment]}`}>
        {SEGMENT_NAMES.map((n, i) => (
          <span key={n} className="ap-seg" data-state={i < segment ? 'done' : i === segment ? 'now' : 'todo'} title={n} />
        ))}
      </div>
      <span className="ap-seg-name">{SEGMENT_NAMES[segment]}</span>
    </header>
  );
}

/* ── typewriter (skippable; instant when motion is reduced; the full text is always in the DOM for screen readers) ── */
function useTypewriter(text: string, enabled: boolean) {
  const [n, setN] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((c) => {
        if (c >= text.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [text, enabled]);
  return { shown: n, done: n >= text.length, finish: () => setN(text.length) };
}

export function RichText({ text, keys = [], gloss = {}, onGloss }: { text: string; keys?: string[]; gloss?: Gloss; onGloss: (w: string) => void }) {
  const parts = text.split(/(\s+)/);
  const keySet = new Set(keys.map((k) => k.toLowerCase()));
  const glossKeys = Object.keys(gloss).map((g) => g.toLowerCase());
  return (
    <>
      {parts.map((p, i) => {
        const bare = p.toLowerCase().replace(/[^a-z'’-]/g, '');
        if (bare && glossKeys.includes(bare))
          return (
            <button key={i} type="button" className="ap-gloss-btn" onClick={() => onGloss(bare)} aria-label={`${p.trim()}: tap to see the meaning`}>
              {p}
            </button>
          );
        if (bare && keySet.has(bare)) return <mark key={i} className="ap-key">{p}</mark>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ── dialogue box ── */
export function DialogueBox({ beat, reduced, onNext, onReplay, atEnd, nextLabel, nextDisabled }: { beat: SayBeat; reduced: boolean; onNext: () => void; onReplay: () => void; atEnd?: boolean; nextLabel?: string; nextDisabled?: boolean }) {
  const { shown, done, finish } = useTypewriter(beat.text, !reduced);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setOpen(null), [beat]);
  const visible = beat.text.slice(0, shown);
  return (
    <section className="ap-dialogue" aria-label="Dialogue" onClick={() => (done ? undefined : finish())}>
      {beat.who !== 'narrator' && <span className="ap-name" style={{ background: speakerColor(beat.who) }}>{beat.who}</span>}
      {/* full text for assistive tech; the animated copy is aria-hidden so it is not read letter by letter */}
      <div className="ap-dialogue-body">
        <p className="ap-text" role="log" aria-live="polite" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{beat.text}</span>
          <span aria-hidden="true">
            <RichText text={visible} keys={beat.key} gloss={done ? beat.gloss : undefined} onGloss={setOpen} />
          </span>
        </p>
        {open && beat.gloss && <p className="ap-gloss-pop" role="note"><b>{open}</b>: {beat.gloss[open] ?? beat.gloss[Object.keys(beat.gloss).find((k) => k.toLowerCase() === open) ?? ''] ?? ''}</p>}
      </div>
      <div className="ap-row">
        <button type="button" className="ap-btn" onClick={onReplay} aria-label="Replay this line">↻ Replay</button>
        <button type="button" className="ap-btn ap-btn-primary" disabled={done && nextDisabled} onClick={() => (done ? onNext() : finish())} aria-label={done ? (atEnd ? 'Finish' : 'Next line') : 'Show the whole line'}>
          {done ? (nextLabel ?? 'Next ▸') : 'Skip ▸▸'}
        </button>
      </div>
    </section>
  );
}

/* ── choices (friendly retry; tiered hint) ── */
export function ChoiceBlock({ prompt, options, hintTier, onRight, onWrong, extra }: { prompt: string; options: ChoiceOption[]; hintTier: number; onRight: (index: number) => void; onWrong: () => void; extra?: ReactNode }) {
  const [state, setState] = useState<Record<number, 'right' | 'again'>>({});
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    setState({});
    setMsg(null);
  }, [prompt]);
  // hints remove wrong answers first, then point at the right one
  const wrongIdx = options.map((o, i) => (o.correct === false ? i : -1)).filter((i) => i >= 0);
  const dimmed = new Set(wrongIdx.slice(0, Math.min(hintTier, Math.max(0, wrongIdx.length - 0))));
  const pick = (i: number) => {
    const o = options[i];
    if (o.correct === false && !o.goto) {
      setState((s) => ({ ...s, [i]: 'again' }));
      setMsg(o.feedback ?? 'Not yet — try again.');
      onWrong();
      return;
    }
    setState((s) => ({ ...s, [i]: 'right' }));
    setMsg(o.feedback ?? null);
    window.setTimeout(() => onRight(i), 450);
  };
  return (
    <div className="ap-panel">
      {extra}
      <p className="ap-prompt">{prompt}</p>
      {options.map((o, i) => (
        <button key={i} type="button" className="ap-choice" data-state={state[i]} disabled={dimmed.has(i) && state[i] !== 'right'} onClick={() => pick(i)}>
          {o.text}
          {hintTier >= 3 && o.correct ? '  ← try this' : ''}
        </button>
      ))}
      {msg && <p className="ap-feedback" role="status">{msg}</p>}
    </div>
  );
}

/* ── flash deck: meet (sets of 3-4), then a gentle retrieval check ── */
export function FlashDeck({ title, cards, seed, onCheck, onDone, onReplay }: { title: string; cards: FlashCard[]; seed: number; onCheck: (correct: boolean) => void; onDone: () => void; onReplay: (voice?: string) => void }) {
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'meet' | 'check'>('meet');
  const [q, setQ] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const order = useMemo(() => seededShuffle(cards.map((_, i) => i), seed), [cards, seed]);
  const choices = useMemo(() => seededShuffle(cards.map((_, i) => i), seed + q + 1), [cards, seed, q]);
  useEffect(() => {
    setHeard(new Set());
    setPhase('meet');
    setQ(0);
    setWrong(null);
  }, [cards]);

  if (phase === 'meet') {
    const all = heard.size === cards.length;
    return (
      <div className="ap-panel">
        <p className="ap-prompt">{title} — tap each card</p>
        <div className="ap-deck">
          {cards.map((c, i) => (
            <button key={c.word} type="button" className="ap-card" data-picked={heard.has(i)} onClick={() => { setHeard(new Set(heard).add(i)); onReplay(c.voice); }} aria-label={`${c.word}: ${c.chunk}`}>
              <PictureTile id={c.pictureId} alt={c.alt} word={c.word} />
              <span className="ap-word">{c.word}</span>
              <span className="ap-chunk">{c.chunk}</span>
            </button>
          ))}
        </div>
        <div className="ap-row">
          <span className="ap-chunk">{heard.size} of {cards.length} heard</span>
          <button type="button" className="ap-btn ap-btn-primary" disabled={!all} onClick={() => setPhase('check')}>Check ▸</button>
        </div>
      </div>
    );
  }
  const target = cards[order[q]];
  const blanked = target.chunk.replace(new RegExp(target.word, 'i'), '_____');
  return (
    <div className="ap-panel">
      <p className="ap-prompt">Which word fits? ({q + 1} of {cards.length})</p>
      <PictureTile id={target.pictureId} alt={target.alt} word={target.word} />
      <p className="ap-text" style={{ textAlign: 'center' }}>{blanked}</p>
      <div className="ap-deck">
        {choices.map((ci) => (
          <button
            key={cards[ci].word}
            type="button"
            className="ap-card"
            data-wrong={wrong === ci}
            onClick={() => {
              if (cards[ci].word === target.word) {
                onCheck(wrong === null);
                setWrong(null);
                if (q + 1 >= cards.length) onDone();
                else setQ(q + 1);
              } else {
                setWrong(ci);
                onCheck(false);
              }
            }}
          >
            <span className="ap-word">{cards[ci].word}</span>
          </button>
        ))}
      </div>
      {wrong !== null && <p className="ap-feedback" role="status">Not yet — look at the picture and try again.</p>}
    </div>
  );
}

/* ── chat story (the student taps for the next message; no timers) ── */
export function ChatStory({ title, messages, reply, hintTier, onContinue, onReplyRight, onReplyWrong }: { title: string; messages: ChatMessage[]; reply?: { prompt: string; options: ChoiceOption[] }; hintTier: number; onContinue: () => void; onReplyRight: (i: number) => void; onReplyWrong: () => void }) {
  const [count, setCount] = useState(1);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => setCount(1), [messages]);
  useEffect(() => bottom.current?.scrollIntoView?.({ block: 'nearest' }), [count]);
  const all = count >= messages.length;
  const thread = (
    <div className="ap-chat" role="log" aria-live="polite">
      <div className="ap-chat-title">{title}</div>
      {messages.slice(0, count).map((m, i) => (
        <div key={i} className="ap-bubble" data-me={m.who === 'You'} style={{ ['--who' as string]: speakerColor(m.who) }}>
          <span className="ap-bubble-who">{m.who === 'Unknown' ? m.label : m.who}</span>
          {m.text}
        </div>
      ))}
      <div ref={bottom} />
    </div>
  );
  if (all && reply) return <ChoiceBlock prompt={reply.prompt} options={reply.options} hintTier={hintTier} onRight={onReplyRight} onWrong={onReplyWrong} extra={thread} />;
  return (
    <div className="ap-panel">
      {thread}
      <div className="ap-row">
        <span className="ap-chunk">{Math.min(count, messages.length)} of {messages.length}</span>
        <button type="button" className="ap-btn ap-btn-primary" onClick={() => (all ? onContinue() : setCount(count + 1))}>{all ? 'Continue ▸' : 'Next message ▸'}</button>
      </div>
    </div>
  );
}

/* ── comic panels ── */
export function ComicPanels({ layout, panels, artBase, onContinue }: { layout: 'strip' | 'grid'; panels: PanelSpec[]; artBase?: string; onContinue: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="ap-panel">
      <div className="ap-comic" data-layout={layout}>
        {panels.map((p, i) => (
          <figure key={i} className="ap-panelbox" aria-label={p.alt} style={{ margin: 0 }}>
            <Backdrop id={p.bg} alt={p.alt} artBase={artBase} />
            {p.who && <CastBust who={p.who} expr={p.expr} label={false} />}
            {p.bubble && (
              <div className="ap-speech">
                <b>{p.bubble.who === 'narrator' ? '' : `${p.bubble.who}: `}</b>
                {p.keyWord && p.bubble.text.toLowerCase().includes(p.keyWord.word.toLowerCase()) ? (
                  <RichText text={p.bubble.text} gloss={{ [p.keyWord.word.toLowerCase()]: p.keyWord.meaning }} onGloss={(w) => setOpen(`${w}: ${p.keyWord!.meaning}`)} />
                ) : (
                  p.bubble.text
                )}
              </div>
            )}
          </figure>
        ))}
      </div>
      {open && <p className="ap-gloss-pop" role="note">{open}</p>}
      <div className="ap-row">
        <span className="ap-chunk">Tap a dotted word for its meaning</span>
        <button type="button" className="ap-btn ap-btn-primary" onClick={onContinue}>Continue ▸</button>
      </div>
    </div>
  );
}


/* ── build the sentence: tap tiles in order (distractors allowed); a wrong tile is gently refused ── */
export function BuildBlock({ prompt, target, extraTiles = [], hint, hintTier, seed, onWrong, onDone }: { prompt: string; target: string; extraTiles?: string[]; hint?: string; hintTier: number; seed: number; onWrong: () => void; onDone: (firstTry: boolean) => void }) {
  const goal = useMemo(() => target.trim().split(/\s+/), [target]);
  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');
  const tiles = useMemo(() => seededShuffle([...goal, ...extraTiles].map((w, i) => ({ w, i })), seed), [goal, extraTiles, seed]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [slip, setSlip] = useState(false);
  const [missed, setMissed] = useState(false);
  useEffect(() => {
    setPlaced([]);
    setSlip(false);
    setMissed(false);
  }, [target]);
  const done = placed.length === goal.length;
  const tap = (idx: number) => {
    if (done || placed.includes(idx)) return;
    if (clean(tiles[idx].w) === clean(goal[placed.length])) {
      setSlip(false);
      setPlaced([...placed, idx]);
    } else {
      setSlip(true);
      setMissed(true);
      onWrong();
    }
  };
  return (
    <div className="ap-panel">
      <p className="ap-prompt">{prompt}</p>
      <div className="ap-build-line" aria-live="polite" aria-label="Your sentence">
        {goal.map((_, k) => (
          <span key={k} className="ap-slot" data-filled={k < placed.length}>{k < placed.length ? tiles[placed[k]].w : ''}</span>
        ))}
      </div>
      <div className="ap-deck">
        {tiles.map((t, idx) => (
          <button key={idx} type="button" className="ap-tile" disabled={placed.includes(idx)} data-next={hintTier >= 2 && !done && clean(t.w) === clean(goal[placed.length])} onClick={() => tap(idx)}>
            {t.w}
          </button>
        ))}
      </div>
      {slip && <p className="ap-feedback" role="status">Not yet — try again.{hint ? ` ${hint}` : ''}</p>}
      <div className="ap-row">
        <button type="button" className="ap-btn" disabled={!placed.length || done} onClick={() => setPlaced(placed.slice(0, -1))}>↶ Undo word</button>
        <button type="button" className="ap-btn ap-btn-primary" disabled={!done} onClick={() => onDone(!missed)}>{done ? 'Great ▸' : 'Build it ▸'}</button>
      </div>
    </div>
  );
}

/* ── private say-it-or-type-it (nothing is recorded or sent) ── */
export function RecordBlock({ prompt, model, onContinue }: { prompt: string; model: string; onContinue: () => void }) {
  const [typed, setTyped] = useState('');
  const [said, setSaid] = useState(false);
  useEffect(() => {
    setTyped('');
    setSaid(false);
  }, [model]);
  return (
    <div className="ap-panel">
      <p className="ap-prompt">{prompt}</p>
      <p className="ap-text ap-model">{model}</p>
      <label className="ap-chunk" htmlFor="ap-type">Say it out loud — or type it. Only you and your teacher see this.</label>
      <input id="ap-type" className="ap-input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type here (optional)" />
      <div className="ap-row">
        <button type="button" className="ap-btn" aria-pressed={said} onClick={() => setSaid((v) => !v)}>{said ? '✓ I said it' : '🎤 I said it'}</button>
        <button type="button" className="ap-btn ap-btn-primary" disabled={!said && !typed.trim()} onClick={onContinue}>Continue ▸</button>
      </div>
    </div>
  );
}

/* ── can-do ticks (self-rating; never a score) ── */
export type TickLevel = 'yes' | 'almost' | 'notyet';
export function TicksBlock({ prompt, items, onDone }: { prompt: string; items: string[]; onDone: (r: Record<string, TickLevel>) => void }) {
  const [r, setR] = useState<Record<string, TickLevel>>({});
  useEffect(() => setR({}), [items]);
  const levels: [TickLevel, string][] = [['yes', 'Yes'], ['almost', 'Almost'], ['notyet', 'Not yet']];
  return (
    <div className="ap-panel">
      <p className="ap-prompt">{prompt}</p>
      {items.map((it) => (
        <div key={it} className="ap-tick">
          <span className="ap-text">{it}</span>
          <span className="ap-tick-opts" role="radiogroup" aria-label={it}>
            {levels.map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={r[it] === k} className="ap-btn" data-on={r[it] === k} onClick={() => setR({ ...r, [it]: k })}>{label}</button>
            ))}
          </span>
        </div>
      ))}
      <div className="ap-row">
        <span className="ap-chunk">"Not yet" is a useful answer. It tells us what to practise.</span>
        <button type="button" className="ap-btn ap-btn-primary" disabled={Object.keys(r).length < items.length} onClick={() => onDone(r)}>Done ▸</button>
      </div>
    </div>
  );
}


/* ── sort: one card at a time, "I know it" / "not sure yet" (teacher baseline, never a score) ── */
export function SortBlock({ prompt, cards, yes, no, onDone }: { prompt: string; cards: string[]; yes: string; no: string; onDone: (known: number, unsure: string[]) => void }) {
  const [i, setI] = useState(0);
  const [known, setKnown] = useState(0);
  const [unsure, setUnsure] = useState<string[]>([]);
  useEffect(() => {
    setI(0);
    setKnown(0);
    setUnsure([]);
  }, [cards]);
  const pick = (isYes: boolean) => {
    const k = known + (isYes ? 1 : 0);
    const u = isYes ? unsure : [...unsure, cards[i]];
    if (i + 1 >= cards.length) onDone(k, u);
    else {
      setKnown(k);
      setUnsure(u);
      setI(i + 1);
    }
  };
  return (
    <div className="ap-panel">
      <p className="ap-prompt">{prompt}</p>
      <div className="ap-sortcard" aria-live="polite">{cards[i]}</div>
      <div className="ap-row">
        <button type="button" className="ap-btn ap-btn-primary" onClick={() => pick(true)}>{yes}</button>
        <button type="button" className="ap-btn" onClick={() => pick(false)}>{no}</button>
      </div>
      <p className="ap-chunk">{i + 1} of {cards.length}. There is no wrong answer here.</p>
    </div>
  );
}

/* ── match: tap a left item, then its partner ── */
export function MatchBlock({ prompt, pairs, seed, onWrong, onRight, onDone }: { prompt: string; pairs: { left: string; right: string }[]; seed: number; onWrong: () => void; onRight: () => void; onDone: () => void }) {
  const order = useMemo(() => seededShuffle(pairs.map((_, i) => i), seed), [pairs, seed]);
  const [done, setDone] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [slip, setSlip] = useState<number | null>(null);
  useEffect(() => {
    setDone([]);
    setSel(null);
    setSlip(null);
  }, [pairs]);
  const all = done.length === pairs.length;
  const tapRight = (ri: number) => {
    if (sel === null || done.includes(ri)) return;
    if (ri === sel) {
      setDone([...done, ri]);
      setSel(null);
      setSlip(null);
      if (slip !== sel) onRight();
    } else {
      setSlip(sel);
      onWrong();
    }
  };
  return (
    <div className="ap-panel">
      <p className="ap-prompt">{prompt}</p>
      <div className="ap-match">
        <div className="ap-match-col">
          {pairs.map((p, i) => (
            <button key={i} type="button" className="ap-tile" disabled={done.includes(i)} data-sel={sel === i} onClick={() => setSel(i)}>{p.left}</button>
          ))}
        </div>
        <div className="ap-match-col">
          {order.map((ri) => (
            <button key={ri} type="button" className="ap-tile" disabled={done.includes(ri)} onClick={() => tapRight(ri)}>{pairs[ri].right}</button>
          ))}
        </div>
      </div>
      {slip !== null && !all && <p className="ap-feedback" role="status">Not yet — try again.</p>}
      <div className="ap-row">
        <span className="ap-chunk">{done.length} of {pairs.length} matched. Tap a left card first.</span>
        <button type="button" className="ap-btn ap-btn-primary" disabled={!all} onClick={onDone}>Continue ▸</button>
      </div>
    </div>
  );
}

/* ── profile card: read with tap-to-gloss; optional "tap what looks odd" hotspots ── */
export function ProfileBlock({ title, prompt, rows, hotspots = [], gloss = {}, onDone }: { title: string; prompt?: string; rows: ProfileRow[]; hotspots?: { row: number; why: string }[]; gloss?: Gloss; onDone: () => void }) {
  const [found, setFound] = useState<number[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    setFound([]);
    setMsg(null);
    setOpen(null);
  }, [rows]);
  const spot = (i: number) => {
    const h = hotspots.find((x) => x.row === i);
    if (h) {
      if (!found.includes(i)) setFound([...found, i]);
      setMsg(h.why);
    } else setMsg('That looks fine. Look again.');
  };
  const all = hotspots.length === 0 || found.length >= hotspots.length;
  return (
    <div className="ap-panel">
      {prompt && <p className="ap-prompt">{prompt}</p>}
      <div className="ap-profile" role="group" aria-label={title}>
        <div className="ap-profile-head"><span className="ap-avatar" aria-hidden="true">?</span><b>{title}</b></div>
        {rows.map((r, i) => (
          <div key={i} className="ap-profile-row" data-found={found.includes(i)}>
            <span className="ap-chunk">{r.label}</span>
            <span className="ap-profile-val"><RichText text={r.value} gloss={gloss} onGloss={(w) => setOpen(`${w}: ${gloss[w] ?? ''}`)} /></span>
            {hotspots.length > 0 && <button type="button" className="ap-btn" aria-label={`This looks odd: ${r.label}`} onClick={() => spot(i)}>{found.includes(i) ? '✓' : '?'}</button>}
          </div>
        ))}
      </div>
      {open && <p className="ap-gloss-pop" role="note">{open}</p>}
      {msg && <p className="ap-feedback" role="status">{msg}</p>}
      <div className="ap-row">
        <span className="ap-chunk">{hotspots.length > 0 ? `${found.length} of ${hotspots.length} odd things found` : 'Tap a dotted word for its meaning'}</span>
        <button type="button" className="ap-btn ap-btn-primary" disabled={!all} onClick={onDone}>Continue ▸</button>
      </div>
      {hotspots.length > 0 && !all && <button type="button" className="ap-btn" onClick={() => { setFound(hotspots.map((h) => h.row)); setMsg('Here they are. Look at the ✓ marks.'); }}>Show me</button>}
    </div>
  );
}

/* ── form: a small set of fields, answers saved for later screens ── */
export function FormBlock({ prompt, fields, onDone }: { prompt: string; fields: FormField[]; onDone: (values: Record<string, string>) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => setVals({}), [fields]);
  const ok = fields.every((f) => f.optional || (vals[f.key] ?? '').trim());
  return (
    <div className="ap-panel">
      <p className="ap-prompt">{prompt}</p>
      {fields.map((f) => (
        <div key={f.key} className="ap-field">
          <label className="ap-chunk" htmlFor={`ap-f-${f.key}`}>{f.label}</label>
          {f.kind === 'text' ? (
            <input id={`ap-f-${f.key}`} className="ap-input" maxLength={24} value={vals[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value.replace(/[{}<>]/g, '') })} />
          ) : (
            <div className="ap-tick-opts" role="radiogroup" aria-label={f.label}>
              {(f.options ?? []).map((o) => (
                <button key={o} type="button" role="radio" aria-checked={vals[f.key] === o} className="ap-btn" data-on={vals[f.key] === o} onClick={() => setVals({ ...vals, [f.key]: o })}>{o}</button>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="ap-row">
        <span className="ap-chunk">You can use any name or a nickname.</span>
        <button type="button" className="ap-btn ap-btn-primary" disabled={!ok} onClick={() => onDone(vals)}>Continue ▸</button>
      </div>
    </div>
  );
}


/* ── cinematic title card at the start of each run-of-show part (tap to skip; the parent auto-dismisses it) ── */
export function TitleCard({ index, onDone }: { index: number; onDone: () => void }) {
  return (
    <div className="ap-titlecard" role="dialog" aria-label={`Part ${index + 1}: ${SEGMENT_NAMES[index]}`} onClick={onDone}>
      <span className="ap-tc-num" aria-hidden="true">{index + 1}</span>
      <span className="ap-tc-kicker">Part {index + 1} of 8</span>
      <span className="ap-tc-name">{SEGMENT_NAMES[index]}</span>
      <span className="ap-tc-goal">{SEGMENT_GOALS[index]}</span>
      <span className="ap-tc-hint">Tap to start</span>
    </div>
  );
}

/** Small star burst on a correct answer (one-time, ~600 ms, never on a wrong answer). */
export function RewardBurst() {
  return (
    <div className="ap-burst" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ ['--a' as string]: `${i * 36}deg`, ['--d' as string]: `${60 + (i % 3) * 22}px` }}>{i % 2 ? '★' : '✦'}</span>
      ))}
    </div>
  );
}
