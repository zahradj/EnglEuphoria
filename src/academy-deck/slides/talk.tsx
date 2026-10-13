import { useEffect, useMemo, useRef, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { useDragChip } from '../drag';
import { COLOR, Bubble } from '../Stage';
import { ChatWindow } from './chat';
import type { CastName, ConvoSlide, FadeSlide, PhoneChatSlide, SaySlide, TeachArt, WhoSaidSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';
import { Icon } from '../Icon';
import { Hear } from '../Hear';
import { Art } from './teach';

const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

/** Who said it? Drag each speech bubble to the character who says it. */
export function WhoSaidView({ slide }: { slide: WhoSaidSlide }) {
  const { right, wrong, done, seed, speak } = useDeck();
  const [shown, setShown] = useState(slide.replay ? 1 : 0);
  const [watched, setWatched] = useState(!slide.replay);
  // each replay line is spoken as it appears
  useEffect(() => {
    const l = !watched ? slide.replay?.[shown - 1] : undefined;
    if (l) void speak(l.who, l.text);
  }, [watched, shown, slide.replay, speak]);
  const [placed, setPlaced] = useState<Record<number, CastName>>({});
  const [held, setHeld] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const speakers = useMemo(() => [...new Set(slide.items.map((i) => i.who))], [slide.items]);
  const bank = useMemo(() => shuffled(slide.items.map((_, i) => i), seed), [slide.items, seed]);
  const drop = (i: number, who: string) => {
    if (i in placed) return;
    if (slide.items[i].who === who) {
      setPlaced({ ...placed, [i]: slide.items[i].who });
      setHeld(null);
      if (!slip) right();
      setSlip(false);
    } else {
      setSlip(true);
      wrong();
    }
  };
  const drag = useDragChip((id, t) => drop(Number(id), t), (id) => setHeld(held === Number(id) ? null : Number(id)));
  const all = Object.keys(placed).length === slide.items.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  if (!watched && slide.replay) {
    const lines = slide.replay.slice(0, shown);
    const last = shown >= slide.replay.length;
    return (
      <Panel title={slide.replayTitle ?? 'Last time, at the desk…'} wide>
        <ChatWindow lines={lines} />
        <p className="ad-hint-line"><Icon name="speaker" /> Listen to the message. Then say it out loud, like Ava or Theo!</p>
        <div className="ad-row">
          <button type="button" className="ad-btn ad-btn-primary" onClick={() => (last ? setWatched(true) : setShown(shown + 1))}>{last ? 'I said it. Now you try ▸' : 'I said it ▸'}</button>
        </div>
      </Panel>
    );
  }
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-whos">
        {speakers.map((w) => (
          <div key={w} className="ad-who" data-drop={w} style={{ ['--who' as string]: COLOR[w] }} onClick={() => held !== null && drop(held, w)} role="button" tabIndex={0} aria-label={`${w}'s bubbles`}>
            <b>{w}</b>
            {slide.items.map((it, i) => (placed[i] === w ? <span key={i} className="ad-who-line">{it.text}</span> : null))}
          </div>
        ))}
      </div>
      <div className="ad-chips">
        {bank.filter((i) => !(i in placed)).map((i) => (
          <button key={i} type="button" className="ad-chip ad-chip-bubble" data-held={held === i} {...drag.bind(String(i), false)}>{slide.items[i].text}</button>
        ))}
      </div>
      {slip && !all && <Feedback kind="try">{NOT_YET} Who asks? Who answers?</Feedback>}
    </Panel>
  );
}

/** Dialogue wheel: the student plays `me`, chooses each reply. The conversation is PLAYED, not read. */
export function ConvoView({ slide }: { slide: ConvoSlide }) {
  const { right, wrong, done, seed, vars, speak } = useDeck();
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? 'friend');
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<{ who: string; text: string }[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [firstTry, setFirstTry] = useState(true);
  const finished = step >= slide.steps.length;
  const opts = useMemo(() => (finished ? [] : shuffled(slide.steps[step].options, seed + step)), [slide.steps, step, seed, finished]);
  const other = slide.actors?.find((a) => a.who !== slide.me)?.who ?? 'Theo';
  const end = useRef<HTMLDivElement>(null);
  // the other character asks each question out loud as it appears
  useEffect(() => {
    if (!finished) void speak(other, slide.steps[step].ask);
  }, [step, finished, other, slide.steps, speak]);
  useEffect(() => {
    if (finished) done();
    end.current?.scrollIntoView?.({ block: 'nearest' });
  }, [finished, done, log.length]);
  const pick = (o: { text: string; ok?: boolean; hint?: string }) => {
    if (o.ok) {
      setLog([...log, { who: other, text: fill(slide.steps[step].ask) }, { who: slide.me, text: o.text }]);
      setStep(step + 1);
      setTip(null);
      if (firstTry) right();
      setFirstTry(true);
    } else {
      setFirstTry(false);
      setTip(o.hint ?? NOT_YET);
      wrong();
    }
  };
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-convo-log" aria-live="polite">
        {log.map((l, i) => (
          <p key={i} className="ad-line" data-me={l.who === slide.me} style={{ ['--who' as string]: COLOR[l.who as CastName] }}><b>{l.who === slide.me && slide.meLabel ? slide.meLabel : l.who}</b> {l.text}{l.who !== slide.me && <Hear who={l.who} text={l.text} />}</p>
        ))}
        <div ref={end} />
      </div>
      {!finished ? (
        <>
          <div className="ad-model-say">
            <Bubble who={other as CastName} side="right">{fill(slide.steps[step].ask)}</Bubble>
            {slide.steps[step].pic && <div className="ad-sticker"><Art art={slide.steps[step].pic!} size="sm" /></div>}
          </div>
          <div className="ad-options" data-pics={opts.some((o) => o.pic)} role="group" aria-label={`${slide.me} says`}>
            {opts.map((o) => (
              <button key={o.text} type="button" className="ad-option" data-pic={!!o.pic} onClick={() => pick(o)}>
                {o.pic ? <span className="ad-option-art"><Art art={o.pic} size="sm" /></span> : <Icon name="chat" className="ad-option-icon" />}
                <span className="ad-option-text">{o.text}</span>
              </button>
            ))}
          </div>
          {tip && <Feedback kind="try">{tip}</Feedback>}
        </>
      ) : (
        <Feedback kind="ok">{slide.after}</Feedback>
      )}
    </Panel>
  );
}

/** Phone chat: Theo texts; the student builds the reply from word tiles and sends it. */
export function PhoneChatView({ slide }: { slide: PhoneChatSlide }) {
  const { right, wrong, done, seed, vars, speak } = useDeck();
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? '…');
  const [step, setStep] = useState(0);
  const [thread, setThread] = useState<{ me: boolean; text: string; pic?: TeachArt }[]>([{ me: false, text: slide.steps[0].text, pic: slide.steps[0].pic }]);
  const [used, setUsed] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [missed, setMissed] = useState(false);
  const raw = slide.steps[Math.min(step, slide.steps.length - 1)];
  const cur = useMemo(() => ({ ...raw, reply: fill(raw.reply) }), [raw, vars]); // eslint-disable-line react-hooks/exhaustive-deps
  const goal = useMemo(() => cur.reply.split(/\s+/), [cur]);
  const tiles = useMemo(() => shuffled([...goal, ...(cur.extra ?? [])].map((w, i) => ({ w, i })), seed + step), [goal, cur, seed, step]);
  const finished = step >= slide.steps.length;
  const hintIdx = tiles.findIndex((t, k) => !used.includes(k) && clean(t.w) === clean(goal[used.length] ?? ''));
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  // the contact's new message is spoken when it arrives
  useEffect(() => {
    const m = thread[thread.length - 1];
    if (m && !m.me) void speak(slide.contact, m.text);
  }, [thread.length, slide.contact, speak]); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = (k: number) => {
    if (finished || used.includes(k)) return;
    if (clean(tiles[k].w) === clean(goal[used.length])) {
      const next = [...used, k];
      if (next.length === goal.length) {
        const sent = [...thread, { me: true, text: cur.reply }];
        const nxt = slide.steps[step + 1];
        setThread(nxt ? [...sent, { me: false, text: nxt.text, pic: nxt.pic }] : sent);
        setStep(step + 1);
        setUsed([]);
        if (!missed) right();
        setMissed(false);
      } else setUsed(next);
    } else {
      setBad(k);
      setMissed(true);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-phone">
        <div className="ad-phone-head"><Icon name="phone" /> {slide.contact}</div>
        <div className="ad-phone-thread">
          {thread.map((m, i) => (
            <div key={i} className="ad-msg-row" data-me={m.me}>
              <p className="ad-msg" data-me={m.me}>{m.text}{!m.me && <Hear who={slide.contact} text={m.text} />}</p>
              {m.pic && <span className="ad-sticker ad-sticker-chat"><Art art={m.pic} size="sm" /></span>}
            </div>
          ))}
        </div>
        <div className="ad-phone-compose" aria-live="polite">{finished ? '✔ Sent!' : used.length ? used.map((k) => tiles[k].w).join(' ') : 'Tap the words to write your reply…'}</div>
      </div>
      {!finished && (
        <div className="ad-chips">
          {tiles.map((t, k) => (
            <button key={k} type="button" className="ad-chip" data-pic={!!cur.tilePics?.[t.w]} disabled={used.includes(k)} data-bad={bad === k} data-next={missed && k === hintIdx} onClick={() => tap(k)}>
              {cur.tilePics?.[t.w] && <span className="ad-tilepic"><Art art={cur.tilePics[t.w]} size="sm" /></span>}
              {t.w}
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}

/** Say it by heart: three rounds, the same lines with less and less help. The student ticks each line when they have said it. */
export function FadeView({ slide }: { slide: FadeSlide }) {
  const { done, setVars } = useDeck();
  const [round, setRound] = useState(0);
  const [said, setSaid] = useState<number[]>([]);
  const fade = (l: FadeSlide['lines'][number]) => {
    if (round === 0) return l.text;
    if (round === 1) return l.text.split(' ').map((w) => (l.keys.some((k) => clean(k) === clean(w)) ? '_'.repeat(Math.max(3, clean(w).length)) : w)).join(' ');
    const [first, ...rest] = l.text.split(' ');
    return `${first} ${rest.map((w) => '_'.repeat(Math.max(2, clean(w).length))).join(' ')}`;
  };
  const roundDone = said.length === slide.lines.length;
  const labels = ['Round 1 · read it and say it', 'Round 2 · key words hidden', 'Round 3 · only the first word'];
  const next = () => {
    if (round >= 2) {
      setVars({ fadeDone: '1' });
      done();
    } else {
      setRound(round + 1);
      setSaid([]);
    }
  };
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-roundtag">{labels[round]}</div>
      <div className="ad-fadelines">
        {slide.lines.map((l, i) => (
          <div key={i} className="ad-fadeline" data-said={said.includes(i)} style={{ ['--who' as string]: COLOR[l.who] }}>
            <b>{l.who}</b>
            <span className="ad-fadetext">{fade(l)}</span>
            <button type="button" className="ad-btn ad-btn-small" aria-pressed={said.includes(i)} onClick={() => setSaid(said.includes(i) ? said.filter((x) => x !== i) : [...said, i])}>{said.includes(i) ? '✓ said' : 'I said it'}</button>
          </div>
        ))}
      </div>
      <div className="ad-row"><button type="button" className="ad-btn ad-btn-primary" disabled={!roundDone} onClick={next}>{round >= 2 ? 'I can say it! ▸' : 'Next round ▸'}</button></div>
    </Panel>
  );
}

/** Say it with the model hidden. Type it or say it; "Show me" brings the model back (counted for the teacher). */
export function SayView({ slide }: { slide: SaySlide }) {
  const { vars, done, setVars } = useDeck();
  const [typed, setTyped] = useState('');
  const [peek, setPeek] = useState(false);
  const base = slide.byDial ? slide.byDial[(vars.dial as 'chill' | 'normal' | 'push') ?? 'normal'] ?? slide.model : slide.model;
  const model = useMemo(() => base.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? '___'), [base, vars]);
  const shown = peek || !!slide.open;
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-sayhidden" data-peek={shown}>{shown ? model : <><Icon name="lock" /> Say it from memory. The model is hidden.</>}</div>
      <textarea className="ad-input ad-textarea" rows={2} value={typed} placeholder="Or type it here…" aria-label="Type your sentence" onChange={(e) => setTyped(e.target.value)} />
      <div className="ad-row">
        {!slide.open && <button type="button" className="ad-btn" onClick={() => setPeek(true)} disabled={peek}>Show me</button>}
        <button type="button" className="ad-btn ad-btn-primary" onClick={() => { setVars({ exitPeeked: String(peek), exitText: typed }); done(); }}>{typed.trim() ? 'Done ▸' : 'I said it ▸'}</button>
      </div>
    </Panel>
  );
}
