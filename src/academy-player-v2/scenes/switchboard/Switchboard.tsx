// Switchboard (Timeline Switchboard; borrows Baba Is You's rule blocks). A bright wall of photos, a timeline with a glowing NOW line: a finished-past band on the left
// and a vague "sometime up to now" cloud that touches NOW. The student drags a time-marker block onto the timeline (dated ones snap to a point in the band,
// ever / never / so far / just pulse onto the cloud); the sentence strip rewrites itself and the student drags the right verb form in; the sentence "powers on"
// (a light runs along the timeline, the recorded voice reads it). Levels: forward (build from a goal), reverse (read a sentence, place the event, choose a marker),
// free play (two sentences about your own life). Pointer drag AND tap-to-select + tap-to-place (keyboard works). A wrong drop bounces back, a ghost shows the zone.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { ALL_MARKERS, checkLevel, formFor, judgeEvent, judgeMarker, judgeVerb, POSITIONS, sentenceOf, strip, stripText, zoneOf, type SwitchEvent, type SwitchForms, type SwitchLevel, type Zone } from './switchLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { SwitchLevel, ForwardLevel, ReverseLevel, FreeLevel, SwitchEvent, SwitchForms, Zone } from './switchLogic';
export interface SwitchboardScene extends SceneBase {
  kind: 'switchboard'; title: string; who: CastName;
  /** the coach's briefing (recorded voice) */
  intro: string;
  levels: SwitchLevel[];
}

type Item = { k: 'marker' | 'verb' | 'event'; v: string };
type Step = 'brief' | 'pick' | 'event' | 'marker' | 'verb' | 'power';
type Target = Zone | 'strip';

function SwitchboardView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<SwitchboardScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [li, setLi] = useState(0);
  const [step, setStep] = useState<Step>('brief');
  const [built, setBuilt] = useState(0);
  const [evIdx, setEvIdx] = useState(0);
  const [placed, setPlaced] = useState<string | null>(null);
  const [verb, setVerb] = useState<string | null>(null);
  const [evZone, setEvZone] = useState<Zone | null>(null);
  const [sel, setSel] = useState<Item | null>(null);
  const [drag, setDrag] = useState<{ item: Item; x: number; y: number } | null>(null);
  const [ghost, setGhost] = useState<Zone | 'strip' | null>(null);
  const [bounce, setBounce] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; tone: 'warn' | 'good' } | null>(null);
  const [said, setSaid] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);
  const mistakes = useRef<string[]>([]);
  const score = useRef(0);
  const clean = useRef(0);
  const missed = useRef(false);
  const reported = useRef(false);
  const gameEl = useRef<HTMLDivElement>(null);
  const bandEl = useRef<HTMLButtonElement>(null);
  const cloudEl = useRef<HTMLButtonElement>(null);
  const stripEl = useRef<HTMLDivElement>(null);
  const lineEl = useRef<HTMLDivElement>(null);
  const drags = useRef<{ item: Item; sx: number; sy: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const timers = useRef<number[]>([]);

  const level = scene.levels[li];
  const free = level.mode === 'free';
  const evCur: { event: SwitchEvent; forms: SwitchForms } = level.mode === 'free' ? level.events[evIdx] : { event: level.event, forms: level.forms };
  const { event: ev, forms } = evCur;
  const placedZone = placed ? zoneOf(placed) : null;
  const choices = level.choices ?? ALL_MARKERS;
  const wall = level.mode === 'free' ? level.events.map((e) => e.event) : [...new Map(scene.levels.filter((l) => l.mode !== 'free').map((l) => [(l as { event: SwitchEvent }).event.object, (l as { event: SwitchEvent }).event])).values()];
  const finalText = placed ? sentenceOf(ev, forms, placed) : '';
  const toks = strip(ev, forms, placed, verb);
  const reverse = level.mode === 'reverse';
  const total = scene.levels.reduce((n, l) => n + (l.mode === 'free' ? l.count : 1), 0);

  useEffect(() => () => { timers.current.forEach((x) => window.clearTimeout(x)); }, []);
  useVoiceKey(scene.who, step === 'brief' ? scene.intro : step === 'power' ? said : undefined, step === 'brief' ? 'brief' : `${li}-${built}-${step}`, artBase);

  const miss = (label: string) => { if (!mistakes.current.includes(label)) mistakes.current.push(label); missed.current = true; };
  const showGhost = (g: Zone | 'strip') => { setGhost(g); timers.current.push(window.setTimeout(() => setGhost(null), 1900)); };
  const doBounce = (item: Item) => { setBounce(`${item.k}:${item.v}`); timers.current.push(window.setTimeout(() => setBounce(null), 520)); };

  const zoneWord = (z: Zone) => (z === 'point' ? t('ap.swPastName', 'finished past') : t('ap.swCloudName', 'up to now'));

  const begin = () => { setStep(free ? 'pick' : reverse ? 'event' : 'marker'); missed.current = false; };

  const power = (text: string) => {
    setStep('power'); setSaid(text);
    const pts = missed.current ? 5 : 10; score.current += pts; if (!missed.current) clean.current++;
    const el = lineEl.current;
    fx.burstAt(el, 'gold'); fx.floatAt(el, `+${pts}`, 'gold'); popEl(stripEl.current, calm, 'pop'); actor.hold('happy', 'cheer');
    setNote(null);
  };

  // one attempt: an item dropped (or tapped) on a target
  const attempt = (item: Item, target: Target) => {
    setSel(null);
    if (step === 'marker' && item.k === 'marker' && target !== 'strip') {
      const accepted = level.mode === 'forward' ? [level.marker.text] : level.mode === 'reverse' ? [level.marker.text, ...(level.alsoOk ?? [])] : undefined;
      const v = judgeMarker(item.v, target, accepted);
      if (v.ok) {
        setPlaced(item.v); setNote(null); setGhost(null);
        const el = target === 'point' ? bandEl.current : cloudEl.current;
        fx.burstAt(el, 'lilac'); popEl(el, calm, 'thud');
        if (reverse) { actor.cheer(900); power(sentenceOf(ev, forms, item.v)); setVerb(zoneOf(item.v) === 'point' ? forms.past : forms.participle); }
        else { setStep('verb'); actor.cheer(800); }
        return;
      }
      doBounce(item);
      if (v.why === 'zone') {
        miss(item.v); showGhost(v.expected);
        setNote({ text: v.expected === 'point' ? t('ap.swZonePoint', '“{{m}}” names a finished time, so it goes in the finished past.', { m: item.v }) : t('ap.swZoneCloud', '“{{m}}” is about “up to now” with no finished time, so it goes in the cloud that touches NOW.', { m: item.v }), tone: 'warn' });
        popEl(target === 'point' ? bandEl.current : cloudEl.current, calm, 'wobble'); actor.flinch(1100);
      } else if (level.mode === 'forward') {
        setNote({ text: t('ap.swGoalMarker', 'The goal needs “{{m}}”. Pick that block.', { m: level.marker.text }), tone: 'warn' });
      } else {
        miss(item.v); showGhost(level.mode === 'reverse' ? level.marker.zone : 'strip');
        setNote({ text: t('ap.swNotFit', '“{{m}}” does not fit the sentence “{{s}}”.', { m: item.v, s: level.mode === 'reverse' ? level.goalSentence : '' }), tone: 'warn' });
        actor.flinch(1100);
      }
      return;
    }
    if (step === 'verb' && item.k === 'verb' && placedZone) {
      const form = item.v === forms.past ? 'past' : 'participle';
      const v = judgeVerb(placedZone, form);
      if (v.ok) { setVerb(item.v); power(sentenceOf(ev, forms, placed!)); return; }
      doBounce(item); miss(`${placed} ${item.v}`); showGhost('strip');
      setNote({ text: placedZone === 'point' ? t('ap.swFormPast', 'A finished time needs the past simple: {{v}}.', { v: forms.past }) : t('ap.swFormPP', '“Up to now” needs have + the past participle: have {{v}}.', { v: forms.participle }), tone: 'warn' });
      popEl(stripEl.current, calm, 'wobble'); actor.flinch(1100);
      return;
    }
    if (step === 'event' && item.k === 'event' && target !== 'strip' && level.mode === 'reverse') {
      const v = judgeEvent(level, target);
      if (v.ok) {
        setEvZone(target); setStep('marker'); setNote(null); setGhost(null); actor.cheer(800);
        const el = target === 'point' ? bandEl.current : cloudEl.current; fx.burstAt(el, 'teal'); popEl(el, calm, 'thud');
        return;
      }
      doBounce(item); miss(`${ev.verbBase} ${ev.object}`); showGhost(v.expected);
      setNote({ text: v.expected === 'cloud' ? t('ap.swEventCloud', '“{{s}}” has have + a participle and no date, so the event belongs in the cloud up to now.', { s: level.goalSentence }) : t('ap.swEventPoint', '“{{s}}” is the past simple: a finished time, so the event belongs in the finished past.', { s: level.goalSentence }), tone: 'warn' });
      actor.flinch(1100);
      return;
    }
    // an item on the wrong kind of target: it just goes back
    doBounce(item);
  };
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;

  const targetAt = (cx: number, cy: number): Target | null => {
    const inside = (el: Element | null) => { if (!el) return false; const r = el.getBoundingClientRect(); return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom; };
    if (inside(cloudEl.current)) return 'cloud';
    if (inside(bandEl.current)) return 'point';
    if (inside(stripEl.current)) return 'strip';
    return null;
  };
  const startDrag = (item: Item, e: React.PointerEvent) => {
    if (typeof e.button === 'number' && e.button > 0) return;
    drags.current = { item, sx: e.clientX, sy: e.clientY, moved: false };
    const move = (m: PointerEvent) => {
      const d = drags.current; if (!d) return;
      if (!d.moved && Math.hypot(m.clientX - d.sx, m.clientY - d.sy) > 8) { d.moved = true; setSel(null); }
      if (d.moved) setDrag({ item: d.item, x: m.clientX, y: m.clientY });
    };
    const up = (m: PointerEvent) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      const d = drags.current; drags.current = null;
      if (d?.moved) {
        justDragged.current = true; window.setTimeout(() => { justDragged.current = false; }, 0);
        setDrag(null);
        const tg = targetAt(m.clientX, m.clientY);
        if (tg) attemptRef.current(d.item, tg); else doBounce(d.item);
      }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  };
  const tapItem = (item: Item) => {
    if (justDragged.current) return;
    setNote(null);
    setSel((s) => (s && s.k === item.k && s.v === item.v ? null : item));
  };
  const tapTarget = (tg: Target) => {
    if (sel) { attempt(sel, tg); return; }
    setNote({ text: t('ap.swPickFirst', 'Pick a block first, then tap where it goes. Or drag it.'), tone: 'warn' });
  };

  const next = () => {
    const l = level;
    const reset = () => { setPlaced(null); setVerb(null); setEvZone(null); setSel(null); setNote(null); setSaid(undefined); setGhost(null); missed.current = false; actor.hold('thinking'); };
    if (l.mode === 'free' && built + 1 < l.count) { setBuilt(built + 1); reset(); setStep('pick'); return; }
    if (li < scene.levels.length - 1) {
      const nl = scene.levels[li + 1];
      setLi(li + 1); setBuilt(0); setEvIdx(0); reset(); setStep(nl.mode === 'free' ? 'pick' : nl.mode === 'reverse' ? 'event' : 'marker');
      return;
    }
    if (reported.current) return;
    reported.current = true; setDone(true); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score: score.current, mistakes: mistakes.current });
  };

  const isSel = (k: Item['k'], v: string) => sel?.k === k && sel.v === v;
  const block = (item: Item, label: string, extra?: string) => (
    <button key={`${item.k}:${item.v}`} type="button" className="av-sw-block" data-k={item.k} data-zone={item.k === 'marker' ? zoneOf(item.v) : undefined}
      data-sel={isSel(item.k, item.v) || undefined} data-bounce={bounce === `${item.k}:${item.v}` || undefined} data-drag={drag?.item.k === item.k && drag.item.v === item.v || undefined}
      aria-pressed={isSel(item.k, item.v)} style={{ touchAction: 'none' }} onPointerDown={(e) => startDrag(item, e)} onClick={() => tapItem(item)}>
      <span>{label}</span>{extra && <small>{extra}</small>}
    </button>
  );

  const markerLeft = placed ? POSITIONS[placed] : 0;
  const markerSpan = placedZone === 'point' ? 'band' : 'cloud';
  const showStrip = step !== 'brief';
  const stripLine = reverse && step !== 'power' ? level.goalSentence : placed || free ? stripText(toks, placed) : stripText(toks, null);

  return (
    <div className="av-game av-switchboard" data-testid="av-switchboard" data-step={step} data-mode={level.mode} ref={gameEl} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={step === 'power'} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-sw-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.swLevelN', 'Level {{n}} of {{m}}', { n: li + 1, m: scene.levels.length })}</span>
          <span className="av-pill" data-tone="brand">{level.mode === 'forward' ? t('ap.swModeForward', 'Build the sentence') : level.mode === 'reverse' ? t('ap.swModeReverse', 'Read it, then place it') : t('ap.swModeFree', 'Free play: your life')}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <section className="av-panel av-game-card av-sw-panel" aria-live="polite">
          {step === 'brief' && <div className="av-fd-say"><p className="av-q">{scene.intro}</p><button type="button" className="av-btn" data-kind="go" onClick={begin}>{t('ap.start', 'Start')}</button></div>}

          {step !== 'brief' && (
            <>
              <div className="av-sw-wall" role="group" aria-label={t('ap.swWall', 'The photo wall')}>
                {wall.map((e, k) => {
                  const isCur = e.object === ev.object;
                  const body = (
                    <>
                      <figure className="av-photo" data-tone={e.tone ?? 'sea'}><span className="av-photo-sun" /><span className="av-photo-hill" data-k="1" /><span className="av-photo-hill" data-k="2" /><span className="av-photo-ground" /></figure>
                      <span className="av-sw-cap">{e.verbBase} {e.object}</span>
                    </>
                  );
                  if (free && step === 'pick') {
                    return <button key={e.object} type="button" className="av-sw-polaroid" data-pick data-cur={k === evIdx || undefined} aria-pressed={k === evIdx} onClick={() => { setEvIdx(k); setStep('marker'); setNote(null); }}>{body}</button>;
                  }
                  if (reverse && step === 'event' && isCur) {
                    return <div key={e.object} className="av-sw-polaroid" data-cur><button type="button" className="av-sw-block" data-k="event" data-sel={isSel('event', e.object) || undefined} data-bounce={bounce === `event:${e.object}` || undefined} data-drag={drag?.item.k === 'event' || undefined} aria-pressed={isSel('event', e.object)} aria-label={`${e.verbBase} ${e.object}`} style={{ touchAction: 'none' }} onPointerDown={(p) => startDrag({ k: 'event', v: e.object }, p)} onClick={() => tapItem({ k: 'event', v: e.object })}>{body}</button></div>;
                  }
                  return <div key={e.object} className="av-sw-polaroid" data-cur={isCur || undefined} data-placed={isCur && evZone ? true : undefined}>{body}</div>;
                })}
                <p className="av-sw-goal">{level.mode === 'free' ? (step === 'pick' ? t('ap.swPickEvent', 'Pick something you have done, or want to say.') : t('ap.swFreeGoal', 'Sentence {{n}} of {{m}}: build it about your life.', { n: built + 1, m: level.count })) : level.goalSentence}</p>
              </div>

              <div className="av-sw-timeline" data-power={step === 'power' || undefined} data-ghost={ghost || undefined}>
                <button type="button" ref={bandEl} className="av-sw-zone" data-zone="point" data-ghost={ghost === 'point' || undefined} data-lit={placedZone === 'point' || (evZone === 'point') || undefined} onClick={() => tapTarget('point')}
                  aria-label={t('ap.swBandLabel', 'Finished past: dated moments')}>
                  <span className="av-sw-zname">{t('ap.swBand', 'FINISHED PAST')}</span>
                  <span className="av-sw-ticks" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7].map((n) => <i key={n} />)}</span>
                </button>
                <button type="button" ref={cloudEl} className="av-sw-zone" data-zone="cloud" data-ghost={ghost === 'cloud' || undefined} data-lit={placedZone === 'cloud' || (evZone === 'cloud') || undefined} onClick={() => tapTarget('cloud')}
                  aria-label={t('ap.swCloudLabel', 'Up to now: sometime, no date')}>
                  <span className="av-sw-zname">{t('ap.swCloud', 'SOMETIME UP TO NOW')}</span>
                  <span className="av-sw-puff" aria-hidden="true"><i /><i /><i /><i /></span>
                </button>
                <div className="av-sw-now" aria-hidden="true"><b>{t('ap.swNow', 'NOW')}</b></div>
                <div className="av-sw-future" aria-hidden="true">{t('ap.swFuture', 'later')}</div>
                {placed && <span className="av-sw-pin" data-span={markerSpan} style={{ insetInlineStart: `${markerLeft}%` }}><span>{placed}</span></span>}
                {evZone && !placed && <span className="av-sw-pin" data-span={evZone === 'point' ? 'band' : 'cloud'} data-event style={{ insetInlineStart: `${evZone === 'point' ? 28 : 64}%` }}><span>{ev.object}</span></span>}
                {step === 'power' && <span className="av-sw-light" aria-hidden="true" ref={lineEl} />}
                {step !== 'power' && <span ref={lineEl} className="av-sw-anchor" aria-hidden="true" />}
              </div>

              {showStrip && (
                <div className="av-sw-strip" ref={stripEl} data-on={step === 'power' || undefined} data-ghost={ghost === 'strip' || undefined} role="status" aria-label={t('ap.swStrip', 'The sentence')}>
                  {reverse && step !== 'power' ? <span className="av-sw-given">{level.goalSentence}</span> : step === 'power' ? <span className="av-sw-final">{finalText}</span> : (
                    toks.map((tk, k) => tk.kind === 'slot-verb'
                      ? <button key={k} type="button" className="av-sw-slot" data-slot="verb" data-ready={step === 'verb' || undefined} onClick={() => step === 'verb' && tapTarget('strip')} aria-label={t('ap.swVerbSlot', 'Verb slot')}>{tk.text}</button>
                      : tk.kind === 'slot-marker'
                        ? <span key={k} className="av-sw-slot" data-slot="marker" data-ready={step === 'marker' || undefined}>{tk.text}</span>
                        : <span key={k} className="av-sw-word" data-kind={tk.kind}>{tk.text}</span>)
                  )}
                </div>
              )}

              {(step === 'marker' || step === 'verb' || step === 'event') && (
                <div className="av-sw-tray" role="group" aria-label={step === 'verb' ? t('ap.swVerbs', 'Verb blocks') : t('ap.swMarkers', 'Time markers')}>
                  {step === 'marker' && choices.map((m) => block({ k: 'marker', v: m }, m))}
                  {step === 'verb' && [forms.past, forms.participle].map((f) => block({ k: 'verb', v: f }, f))}
                  {step === 'event' && <p className="av-fd-hint">{t('ap.swEventHint', 'Drag the photo onto the timeline, or tap it and then tap the right zone.')}</p>}
                </div>
              )}

              {step === 'marker' && <p className="av-fd-hint">{t('ap.swDragHint', 'Drag a time word onto the timeline, or tap it and then tap the zone.')}</p>}

              {step === 'power' && !done && (
                <div className="av-fd-next">
                  <p className="av-note" data-tone="good" role="status">{free ? t('ap.swPowered', 'Powered on!') : level.hint}</p>
                  <button type="button" className="av-btn" data-kind="go" onClick={next}>{li === scene.levels.length - 1 && (!free || built + 1 >= (level as { count: number }).count) ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>
                </div>
              )}
              {done && <Reward score={score.current} stars={starsFor(clean.current, total)} gem={mistakes.current.length === 0} calm={calm} />}
            </>
          )}

          {note && !done && <p className="av-note av-fd-note-line" data-tone={note.tone} role="status">{note.text}</p>}
        </section>
      </div>
      {drag && gameEl.current && (() => { const r = gameEl.current.getBoundingClientRect(); return <div className="av-sw-ghost" style={{ left: drag.x - r.left, top: drag.y - r.top }} aria-hidden="true">{drag.item.k === 'event' ? ev.object : drag.item.v}</div>; })()}
    </div>
  );
}

export const switchboardScene: SceneModule<SwitchboardScene> = {
  view: SwitchboardView,
  spoken: (s) => [
    { who: s.who, text: s.intro },
    ...s.levels.flatMap((l) => (l.mode === 'free' ? [] : [{ who: s.who, text: sentenceOf(l.event, l.forms, l.marker.text) }])),
  ],
  validate: (s) => {
    const p: string[] = [];
    if (!s.intro?.trim()) p.push(`${s.id}: switchboard needs an intro`);
    if ((s.levels?.length ?? 0) < 3) p.push(`${s.id}: switchboard needs 3+ levels`);
    if (s.levels && !s.levels.some((l) => l.mode === 'forward')) p.push(`${s.id}: needs a forward level`);
    if (s.levels && !s.levels.some((l) => l.mode === 'reverse')) p.push(`${s.id}: needs a reverse level`);
    if (s.levels && s.levels[s.levels.length - 1].mode !== 'free') p.push(`${s.id}: the last level is free play`);
    if (s.levels && !s.levels.some((l) => l.mode !== 'free' && l.marker.zone === 'point') || s.levels && !s.levels.some((l) => l.mode !== 'free' && l.marker.zone === 'cloud')) p.push(`${s.id}: both zones (point and cloud) must be taught`);
    s.levels?.forEach((l, k) => p.push(...checkLevel(l, `${s.id} level ${k + 1}`)));
    return p;
  },
};
