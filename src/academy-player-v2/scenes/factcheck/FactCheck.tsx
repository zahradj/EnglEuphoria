// Fact-Check Wall (borrows the rule of three from Return of the Obra Dinn): the article stays on screen; cards come three at a time. For each card the student chooses TRUE, FALSE or NOT GIVEN and, for true and false,
// taps the line of the article that proves it. A group locks only when all three are right; otherwise the desk says how many are right (never which). No buzzer, no timer, no limit on tries.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sayLine, stopVoice } from '../../services/voice';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { allLines, cardReady, cardRight, factSpoken, groupsOf, judgeGroup, validateFact, type Answer, type FactScene, type Verdict } from './factLogic';
import type { SceneModule, SceneProps } from '../../types';

export type { FactScene, FactCard } from './factLogic';

const VERDICTS: { id: Verdict; icon: string }[] = [{ id: 'true', icon: '✓' }, { id: 'false', icon: '✗' }, { id: 'ng', icon: '?' }];

function FactCheckView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<FactScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const lines = useMemo(() => allLines(scene.clippings), [scene.clippings]);
  const groups = useMemo(() => groupsOf(scene.cards), [scene.cards]);
  const [gi, setGi] = useState(0);
  const [ans, setAns] = useState<Record<string, Answer>>({});
  const [active, setActive] = useState<string>(groups[0][0].id);
  const [msg, setMsg] = useState<string | null>(null);
  const [locked, setLocked] = useState<number[]>([]);
  const [fin, setFin] = useState(false);
  const mistakes = useRef<string[]>([]);
  const tried = useRef<Record<number, number>>({});
  const reported = useRef(false);
  const cardEls = useRef<Record<string, HTMLElement | null>>({});
  const checkEl = useRef<HTMLButtonElement>(null);
  const lineEls = useRef<Record<string, HTMLElement | null>>({});
  const group = groups[gi];
  const ready = group.every((c) => cardReady(ans[c.id]));
  const proofOf = (id: string) => ans[id]?.line;

  useVoiceKey(scene.who, scene.intro, 'intro', artBase);
  useEffect(() => () => stopVoice(), []);
  useEffect(() => { const el = lineEls.current[ans[active]?.line ?? '']; el?.scrollIntoView?.({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' }); }, [ans, active, calm]);

  const setVerdict = (id: string, v: Verdict) => { setActive(id); setMsg(null); setAns((a) => ({ ...a, [id]: { verdict: v, line: v === 'ng' ? undefined : a[id]?.line } })); };
  const pickLine = (lid: string) => {
    const c = group.find((x) => x.id === active);
    if (!c || ans[c.id]?.verdict === undefined || ans[c.id]?.verdict === 'ng') { setMsg(t('ap.fcPickVerdict', 'First choose TRUE or FALSE for the active card, then tap the line.')); return; }
    setMsg(null); setAns((a) => ({ ...a, [c.id]: { ...a[c.id], line: lid } }));
  };
  const check = () => {
    const r = judgeGroup(group, ans);
    if (r.all) {
      setLocked((l) => [...l, gi]); setMsg(null);
      fx.burstAt(checkEl.current, 'gold'); fx.floatAt(checkEl.current, '+30', 'gold'); actor.hold('happy', 'cheer');
      if (gi === groups.length - 1) { if (!reported.current) { reported.current = true; setFin(true); fx.confetti(); onDone({ won: true, score: scene.cards.length * 10, mistakes: mistakes.current, ...(scene.story ? { story: { [scene.story]: true } } : {}) }); } }
      else window.setTimeout(() => { setGi(gi + 1); setActive(groups[gi + 1][0].id); actor.hold('thinking'); }, calm ? 0 : 900);
    } else {
      tried.current[gi] = (tried.current[gi] ?? 0) + 1;
      setMsg(t('ap.fcSome', '{{n}} of the three are right. Look at the lines again.', { n: r.right }));
      actor.flinch(1000); popEl(checkEl.current, calm, 'wobble');
      if (tried.current[gi] === 1) mistakes.current.push(t('ap.fcGroup', 'Fact-check group {{n}}', { n: gi + 1 }));
    }
  };
  const stars = starsFor(mistakes.current.length ? 0 : 1, 1);
  const done = locked.includes(gi);

  return (
    <div className="av-game av-factcheck" data-testid="av-factcheck" data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={done} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-iv-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.fcGroupOf', 'Set {{n}} of {{m}}', { n: gi + 1, m: groups.length })}</span>
          <span className="av-fc-locks" aria-hidden="true">{groups.map((_, k) => <i key={k} data-on={locked.includes(k) || undefined} />)}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>
        <div className="av-fc-wrap">
          <section className="av-panel av-fc-article" aria-label={t('ap.fcArticle', 'The article')}>
            <h3>📰 {t('ap.fcArticle', 'The article')}</h3>
            {scene.clippings.map((c) => (
              <p key={c.id}>{c.lines.map((l, i) => {
                const id = `${c.id}.${i}`;
                const on = group.some((g) => proofOf(g.id) === id);
                const mine = proofOf(active) === id;
                return <span key={id} ref={(el) => { lineEls.current[id] = el; }} role="button" tabIndex={0} className="av-fc-line" data-on={on || undefined} data-mine={mine || undefined} onClick={() => pickLine(id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickLine(id); } }}>{l} </span>;
              })}</p>
            ))}
          </section>
          <section className="av-panel av-game-card av-fc-cards">
            <p className="av-q">{t('ap.fcPrompt', 'True, false or not given? Show the line.')}</p>
            {group.map((c) => {
              const a = ans[c.id];
              const right = done && cardRight(c, a);
              return (
                <div key={c.id} ref={(el) => { cardEls.current[c.id] = el; }} className="av-fc-card" data-active={active === c.id || undefined} data-locked={right || undefined} onClick={() => setActive(c.id)}>
                  <p>“{c.statement}”<button type="button" className="av-oa-ear" aria-label={t('ap.oaHear', 'Hear it')} onClick={(e) => { e.stopPropagation(); void sayLine({ who: scene.who, text: c.statement }, artBase); }}>🔊</button></p>
                  <div className="av-fc-verdicts" role="group" aria-label={t('ap.fcVerdict', 'Your verdict')}>
                    {VERDICTS.map((v) => (
                      <button key={v.id} type="button" className="av-opt" data-v={v.id} aria-pressed={a?.verdict === v.id} data-on={a?.verdict === v.id || undefined} disabled={done} onClick={(e) => { e.stopPropagation(); setVerdict(c.id, v.id); }}>
                        <em aria-hidden="true">{v.icon}</em>{v.id === 'true' ? t('ap.fcTrue', 'True') : v.id === 'false' ? t('ap.fcFalse', 'False') : t('ap.fcNg', 'Not given')}
                      </button>
                    ))}
                  </div>
                  {a?.verdict && a.verdict !== 'ng' && <small className="av-fc-need">{a.line ? t('ap.fcLineSet', 'Line chosen ✓') : t('ap.fcTapLine', 'Tap the line that shows it.')}</small>}
                  {a?.verdict === 'ng' && <small className="av-fc-need">{t('ap.fcNgNote', 'No line in the article says it.')}</small>}
                  {done && <p className="av-note av-why" data-ok="true">{c.why}</p>}
                </div>
              );
            })}
            {msg && <p className="av-note av-why" role="status">{msg}</p>}
            {!done && <button type="button" ref={checkEl} className="av-btn" data-kind="go" disabled={!ready} onClick={check}>{t('ap.fcCheck', 'Check these three')} ✓</button>}
            {fin && <Reward score={scene.cards.length * 10} stars={stars} gem={mistakes.current.length === 0} calm={calm} tone="gold" />}
          </section>
        </div>
      </div>
    </div>
  );
}

export const factcheckScene: SceneModule<FactScene> = { view: FactCheckView, spoken: factSpoken, validate: validateFact };
