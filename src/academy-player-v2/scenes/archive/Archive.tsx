// Archive Search (borrows Her Story's keyword search, with an evidence board): the article is filed as clippings in a newsroom archive. A desk task asks a question; the student TAPS keyword chips,
// the desk returns at most three clippings, the student PINS the one that answers the task, then answers. Reading a clipping can unlock new keyword chips ("leads").
// Gentle by design: no timer, no typing, nothing lost; a wrong pin says what that clipping is about and invites another search.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sayLine, stopVoice } from '../../services/voice';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { archiveSpoken, CAP, search, textOf, validateArchive, type ArchiveScene, type Clipping } from './archiveLogic';
import type { SceneModule, SceneProps } from '../../types';

export type { ArchiveScene, Clipping, ArchiveTask } from './archiveLogic';

/** the clipping text with the searched keyword marked */
function Marked({ text, kw }: { text: string; kw: string | null }) {
  if (!kw) return <>{text}</>;
  const esc = kw.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
  const parts = text.split(new RegExp(`(${esc})`, 'ig'));
  return <>{parts.map((p, i) => (p.toLowerCase() === kw.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}</>;
}

function ArchiveView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<ArchiveScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const cap = scene.cap ?? CAP;
  const [ti, setTi] = useState(0);
  const [chips, setChips] = useState<string[]>(scene.chips);
  const [fresh, setFresh] = useState<string[]>([]);
  const [kw, setKw] = useState<string | null>(null);
  const [results, setResults] = useState<Clipping[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const [board, setBoard] = useState<{ q: string; a: string }[]>([]);
  const [fin, setFin] = useState(false);
  const task = scene.tasks[ti];
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const clipEls = useRef<Record<string, HTMLElement | null>>({});
  const boardEl = useRef<HTMLDivElement>(null);
  const answerEls = useRef<(HTMLButtonElement | null)[]>([]);
  const ready = task.needs.every((n) => pinned.includes(n));

  useVoiceKey(scene.who, ti === 0 && !kw ? `${scene.intro} ${task.q}` : task.q, `q${ti}`, artBase);
  useEffect(() => () => stopVoice(), []);

  const tap = (word: string) => {
    if (answered !== null) return;
    const found = search(scene.clippings, word, cap);
    setKw(word); setResults(found); setNote(found.length ? null : t('ap.arNone', 'The desk found nothing for that word. Try another one.'));
    const leads = found.flatMap((c) => c.leads ?? []).filter((l) => !chips.some((c) => c.toLowerCase() === l.toLowerCase()));
    if (leads.length) { setChips((c) => [...c, ...new Set(leads)]); setFresh((f) => [...f, ...leads]); fx.floatAt(boardEl.current, '＋', 'teal'); }
  };
  const pin = (c: Clipping) => {
    if (answered !== null || pinned.includes(c.id)) return;
    if (task.needs.includes(c.id)) {
      setPinned((p) => [...p, c.id]); setNote(null);
      fx.burstAt(clipEls.current[c.id], 'teal'); fx.floatAt(clipEls.current[c.id], '📌', 'teal'); popEl(clipEls.current[c.id], calm, 'pop'); actor.cheer(900);
    } else {
      popEl(clipEls.current[c.id], calm, 'wobble'); actor.flinch(1000);
      setNote(t('ap.arWrongPin', 'That clipping does not answer the task. Search again, or try another clipping.'));
      const label = task.q;
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
    }
  };
  const answer = (i: number) => {
    if (answered !== null || !ready) return;
    if (i === task.answer) {
      setAnswered(i); setBoard((b) => [...b, { q: task.q, a: task.options[i] }]);
      fx.burstAt(answerEls.current[i], 'gold'); fx.floatAt(answerEls.current[i], '+10', 'gold'); popEl(answerEls.current[i], calm, 'pop'); actor.hold('happy', 'cheer');
    } else {
      popEl(answerEls.current[i], calm, 'wobble'); actor.flinch(1000); setNote(task.why);
      if (!mistakes.current.includes(`${task.q} ·`)) mistakes.current.push(`${task.q} ·`);
    }
  };
  const next = () => {
    if (ti < scene.tasks.length - 1) { setTi(ti + 1); setPinned([]); setAnswered(null); setNote(null); setKw(null); setResults([]); actor.hold('thinking'); return; }
    if (reported.current) return;
    reported.current = true; setFin(true); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score: scene.tasks.length * 10, mistakes: mistakes.current, ...(scene.story ? { story: { [scene.story]: true } } : {}) });
  };
  const stars = starsFor(mistakes.current.length ? 0 : 1, 1);
  const pinnedClips = useMemo(() => scene.clippings.filter((c) => pinned.includes(c.id)), [scene.clippings, pinned]);

  return (
    <div className="av-game av-archive" data-testid="av-archive" data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={answered !== null} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-iv-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.arTask', 'Desk task {{n}} of {{m}}', { n: ti + 1, m: scene.tasks.length })}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>
        <section className="av-panel av-game-card av-ar-card">
          <div className="av-ar-task" key={`t${ti}`}>
            <small>{t('ap.arDesk', 'THE DESK ASKS')}</small>
            <p>{task.q}</p>
            <button type="button" className="av-oa-ear" aria-label={t('ap.oaHear', 'Hear it')} onClick={() => void sayLine({ who: scene.who, text: task.q }, artBase)}>🔊</button>
          </div>

          {answered === null && (
            <>
              <p className="av-q av-ar-prompt">{ready ? t('ap.arAnswer', 'You pinned it. Now answer the desk.') : pinned.length ? t('ap.arMore', 'Pin the other clipping too.') : t('ap.arSearch', 'Tap a keyword to search the archive.')}</p>
              <div className="av-ar-chips" role="group" aria-label={t('ap.arChips', 'Keywords')}>
                {chips.map((c) => <button key={c} type="button" className="av-ar-chip" data-on={kw === c || undefined} data-new={fresh.includes(c) || undefined} aria-pressed={kw === c} onClick={() => tap(c)}>🔎 {c}{fresh.includes(c) && <i aria-hidden="true">new</i>}</button>)}
              </div>
              {kw && (
                <div className="av-ar-results" role="list" aria-label={t('ap.arResults', 'Clippings for {{kw}}', { kw })}>
                  {results.map((c, n) => (
                    <article key={c.id} role="listitem" ref={(el) => { clipEls.current[c.id] = el; }} className="av-ar-clip" data-pinned={pinned.includes(c.id) || undefined} style={{ ['--i' as string]: n }}>
                      <p><Marked text={textOf(c)} kw={kw} /></p>
                      <div className="av-ar-clip-act">
                        <button type="button" className="av-oa-ear" aria-label={t('ap.oaHear', 'Hear it')} onClick={() => void sayLine({ who: scene.who, text: textOf(c) }, artBase)}>🔊</button>
                        <button type="button" className="av-pill" data-tone="brand" disabled={pinned.includes(c.id)} onClick={() => pin(c)}>📌 {pinned.includes(c.id) ? t('ap.arPinned', 'Pinned') : t('ap.arPin', 'Pin it')}</button>
                      </div>
                    </article>
                  ))}
                  {!results.length && <p className="av-note av-why" role="status">{t('ap.arNone', 'The desk found nothing for that word. Try another one.')}</p>}
                  {results.length === cap && <small className="av-ar-cap">{t('ap.arCap', 'The desk shows {{n}} clippings at most. Try a more exact word.', { n: cap })}</small>}
                </div>
              )}
              {ready && (
                <div className="av-ar-answer" role="group" aria-label={t('ap.arAnswerGroup', 'Answers')}>
                  {task.options.map((o, i) => <button key={o} type="button" ref={(el) => { answerEls.current[i] = el; }} className="av-opt" onClick={() => answer(i)}>{o}</button>)}
                </div>
              )}
              {note && <p className="av-note av-why" role="status">{note}</p>}
            </>
          )}

          {answered !== null && (
            <div className="av-ar-done" role="status">
              <p className="av-note av-why" data-ok="true">{task.why}</p>
              <button type="button" className="av-btn" data-kind="go" onClick={next}>{ti < scene.tasks.length - 1 ? t('ap.arNext', 'Next desk task') : t('ap.arEnd', 'Close the file')} ›</button>
            </div>
          )}
          {fin && <Reward score={scene.tasks.length * 10} stars={stars} gem={mistakes.current.length === 0} calm={calm} tone="gold" />}

          <div className="av-ar-board" ref={boardEl} aria-label={t('ap.arBoard', 'Editor’s board')}>
            <h3>📋 {t('ap.arBoard', 'Editor’s board')}</h3>
            {pinnedClips.map((c) => <span key={c.id} className="av-ar-pin" data-now>{c.lines[0].slice(0, 46)}…</span>)}
            {board.map((b, i) => <span key={i} className="av-ar-pin" data-done><b>{b.a}</b> · {b.q}</span>)}
            {!pinnedClips.length && !board.length && <em>{t('ap.arEmpty', 'Pinned clippings and answers appear here.')}</em>}
          </div>
        </section>
      </div>
    </div>
  );
}

export const archiveScene: SceneModule<ArchiveScene> = { view: ArchiveView, spoken: archiveSpoken, validate: validateArchive };
