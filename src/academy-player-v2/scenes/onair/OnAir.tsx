// On Air (dialogue-tree radio interview; borrows the visual-novel dialogue tree + the detective notepad): the student is the host of a live school radio show.
//   show:      the guest says a line; the student picks what to say (REACT / ASK / SHARE cards, or a dead-end card). Good lines make the guest open up:
//              the guest's FACE and posture change and a halo around the guest grows - no number, no bar, no timer (comfort, research: a visible score turns talk into score chasing).
//   twotruths: the guest tells three experiences, one is false. The host puts follow-up questions, the answers go on a notepad (nothing is highlighted), then pins the lie and says why.
// Gentle by design: nothing is lost, nothing is timed; a weak card is answered with a one-word reply and a kind note. Mic: "Hear it" plays the producer's recorded model of any card.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sayLine, stopVoice } from '../../services/voice';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx, type Mood } from '../kit';
import { fillFrame } from '../wave1Kit';
import { halo, maxWarmth, moodAfter, onAirSpoken, validateOnAir, warmthOf, type OnAirOption, type OnAirScene } from './onairLogic';
import type { ReelLine, SceneModule, SceneProps } from '../../types';

export type { OnAirScene, OnAirOption, Exchange, Claim, Probe } from './onairLogic';

/** a recorded line plus a "speaking" flag that drives the VU needle (it drops back after the clip, or after a moment if there is no clip) */
function useStudioVoice(artBase: string) {
  const [speaking, setSpeaking] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; stopVoice(); }; }, []);
  const say = (who: string, text: string) => {
    stopVoice(); setSpeaking(true);
    void sayLine({ who, text }, artBase).then((played) => {
      if (!alive.current) return;
      if (played) setSpeaking(false); else window.setTimeout(() => { if (alive.current) setSpeaking(false); }, 900);
    });
  };
  return { speaking, say };
}

const KIND_ICON: Record<string, string> = { react: '❗', ask: '❓', share: '💬', flat: '…' };

function Studio({ speaking, children }: { speaking: boolean; children?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="av-oa-studio" data-speaking={speaking || undefined}>
      <span className="av-oa-light" role="img" aria-label={t('ap.oaOnAir', 'ON AIR')}><i />{t('ap.oaOnAir', 'ON AIR')}</span>
      <span className="av-oa-vu" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((k) => <i key={k} style={{ ['--k' as string]: k }} />)}</span>
      {children}
    </div>
  );
}

function OnAirView(props: SceneProps<OnAirScene>) {
  const { scene, onDone, artBase, calm } = props;
  const { t } = useTranslation();
  const fx = useSceneFx(props.fx);
  const actor = useReactor('neutral');
  const voice = useStudioVoice(artBase);
  const show = scene.look === 'show';
  const reported = useRef(false);
  const mistakes = useRef<string[]>([]);
  const reel = useRef<ReelLine[]>([]);

  // ---- show state ----
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [picks, setPicks] = useState<(OnAirOption | undefined)[]>([]);
  const optEls = useRef<(HTMLButtonElement | null)[]>([]);
  const ex = scene.exchanges?.[i];
  // ---- two truths state ----
  const claims = scene.claims ?? [];
  const [heard, setHeard] = useState(0);
  const [asked, setAsked] = useState<{ claim: string; q: string; a: string }[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [wrongPin, setWrongPin] = useState<string | null>(null);
  const [said, setSaid] = useState(false);
  const claimEls = useRef<Record<string, HTMLElement | null>>({});
  const minProbes = scene.minProbes ?? 3;

  const [phase, setPhase] = useState<'play' | 'done'>('play');
  const warmth = warmthOf(picks);
  const max = maxWarmth(scene);

  // the intro, then the guest's first line / first claim
  useEffect(() => { voice.say(scene.producer, scene.intro); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (show && ex && phase === 'play') { const t0 = window.setTimeout(() => voice.say(scene.guest, ex.guest), i === 0 ? 1600 : 250); return () => window.clearTimeout(t0); } }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (n: number) => {
    if (!ex || pick !== null) return;
    const o = ex.options[n];
    setPick(n); setPicks((p) => [...p, o]);
    const mood = moodAfter(o.fit) as Mood;
    actor.hold(mood, o.fit === 2 ? 'cheer' : o.fit === 1 ? 'nod' : 'flinch');
    const el = optEls.current[n];
    popEl(el, calm, o.fit === 0 ? 'wobble' : 'pop');
    if (o.fit > 0) { fx.burstAt(el, o.fit === 2 ? 'gold' : 'teal'); fx.floatAt(el, o.fit === 2 ? '✦✦' : '✦', o.fit === 2 ? 'gold' : 'teal'); }
    if (o.fit === 0) mistakes.current.push(o.text);
    else reel.current.push({ who: 'You', text: o.text }, { who: scene.guest, text: o.reply });
    voice.say(scene.guest, o.reply);
  };
  const nextShow = () => {
    if (!scene.exchanges) return;
    if (i < scene.exchanges.length - 1) { setI(i + 1); setPick(null); actor.hold('neutral'); return; }
    finishShow();
  };
  const finishShow = () => {
    if (reported.current) return;
    reported.current = true; setPhase('done'); fx.confetti(); actor.hold('happy', 'cheer');
    const story = scene.flag && warmth >= (scene.flagAt ?? 1) ? { [scene.flag]: true } : undefined;
    onDone({ won: true, score: warmth * 5 + 10, mistakes: mistakes.current, reel: reel.current, ...(story ? { story } : {}) });
  };

  // ---- two truths ----
  const hearClaim = (n: number) => { setHeard(Math.max(heard, n + 1)); voice.say(scene.guest, claims[n].text); actor.hold('neutral'); };
  const probe = (claimId: string, qi: number) => {
    const c = claims.find((x) => x.id === claimId); const p = c?.probes[qi];
    if (!c || !p || asked.some((a) => a.claim === claimId && a.q === p.q)) return;
    setAsked((a) => [...a, { claim: claimId, q: p.q, a: p.a }]);
    reel.current.push({ who: 'You', text: p.q }, { who: scene.guest, text: p.a });
    voice.say(scene.guest, p.a);
    actor.hold('thinking', 'nod');
    const el = claimEls.current[claimId];
    fx.burstAt(el, 'lilac'); fx.floatAt(el, '✦', 'lilac');
  };
  const pin = (id: string) => {
    if (pinned || asked.length < minProbes) return;
    if (id === scene.lieId) {
      setPinned(id); setWrongPin(null); actor.hold('surprised', 'cheer');
      fx.burstAt(claimEls.current[id], 'gold'); fx.floatAt(claimEls.current[id], '+20', 'gold'); popEl(claimEls.current[id], calm, 'pop');
    } else {
      setWrongPin(id); actor.hold('curious', 'flinch'); popEl(claimEls.current[id], calm, 'wobble');
      const label = t('ap.oaPinTrue', 'Pinned a true experience');
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
    }
  };
  const lieNo = Math.max(0, claims.findIndex((c) => c.id === scene.lieId)) + 1;
  const sayLineText = fillFrame(scene.sayFrame ?? '', { n: String(lieNo), why: scene.why ?? '' });
  const saidIt = () => {
    if (reported.current) return;
    reported.current = true; setSaid(true); setPhase('done'); fx.confetti(); actor.hold('happy', 'cheer');
    reel.current.push({ who: 'You', text: sayLineText });
    onDone({ won: true, score: asked.length * 4 + 30, mistakes: mistakes.current, reel: reel.current, ...(scene.flag ? { story: { [scene.flag]: true } } : {}) });
  };
  const askedFor = (id: string) => asked.filter((a) => a.claim === id);
  const hearAll = heard >= claims.length;
  const haloV = show ? halo(warmth, max) : pinned ? 1 : halo(asked.length, minProbes + 2);
  const stars = starsFor(mistakes.current.length ? 0 : 1, 1);

  return (
    <div className="av-game av-onair" data-testid="av-onair" data-look={scene.look} data-phase={phase} data-calm={calm || undefined} style={{ ['--oa-halo' as string]: haloV }}>
      <GameBackdrop /><Glow on={haloV >= 0.6} tone="gold" />
      <Cast who={scene.guest} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-iv-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          {show && <span className="av-pill">{t('ap.oaQuestion', 'Question {{n}} of {{m}}', { n: Math.min(i + 1, scene.exchanges!.length), m: scene.exchanges!.length })}</span>}
          {!show && <span className="av-pill">{t('ap.oaNotes', 'Notepad: {{n}} answers', { n: asked.length })}</span>}
          <Badge who={scene.guest} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>
        <section className="av-panel av-game-card av-oa-card">
          <Studio speaking={voice.speaking}>
            <span className="av-oa-guest"><b>{scene.guest}</b> {t('ap.oaGuest', 'is your guest')}</span>
          </Studio>

          {show && ex && (
            <>
              <div className="av-oa-line" data-who="guest" key={`g${i}`}>
                <b>{scene.guest}</b>
                <p>“{ex.guest}”</p>
                <button type="button" className="av-oa-ear" aria-label={t('ap.oaHear', 'Hear it')} onClick={() => voice.say(scene.guest, ex.guest)}>🔊</button>
              </div>
              {pick === null ? (
                <>
                  <p className="av-q av-oa-prompt">{t('ap.oaPick', 'You are the host. What do you say?')}</p>
                  <div className="av-oa-cards" role="group" aria-label={t('ap.oaCards', 'What to say')}>
                    {ex.options.map((o, n) => (
                      <div key={o.text} className="av-oa-opt" style={{ ['--i' as string]: n }}>
                        <button type="button" ref={(el) => { optEls.current[n] = el; }} className="av-opt av-oa-card-btn" data-kind={o.kind} onClick={() => choose(n)}>
                          <em aria-hidden="true">{KIND_ICON[o.kind]}</em><span>{o.text}</span>
                        </button>
                        <button type="button" className="av-oa-ear" aria-label={t('ap.oaModel', 'Hear {{who}} say it', { who: scene.producer })} onClick={() => voice.say(scene.producer, o.text)}>🔊</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="av-oa-line" data-who="you" key={`y${i}`}><b>{t('ap.oaYou', 'You')}</b><p>“{ex.options[pick].text}”</p></div>
                  <div className="av-oa-line" data-who="guest" data-warm={ex.options[pick].fit} key={`r${i}`}>
                    <b>{scene.guest}</b><p>“{ex.options[pick].reply}”</p>
                    <button type="button" className="av-oa-ear" aria-label={t('ap.oaHear', 'Hear it')} onClick={() => voice.say(scene.guest, ex.options[pick].reply)}>🔊</button>
                  </div>
                  <p className="av-note av-why" role="status" data-fit={ex.options[pick].fit}>{ex.options[pick].note}</p>
                  {phase === 'play' && <button type="button" className="av-btn" data-kind="go" onClick={nextShow}>{i < scene.exchanges!.length - 1 ? t('ap.oaNext', 'Next question') : t('ap.oaEnd', 'End the show')} ›</button>}
                </>
              )}
              {phase === 'done' && <Reward score={warmth * 5 + 10} stars={stars} gem={mistakes.current.length === 0} calm={calm} tone="gold" />}
            </>
          )}

          {!show && (
            <>
              <p className="av-q av-oa-prompt">{!hearAll ? t('ap.oaHearClaims', 'Listen to {{who}}. One of the three experiences is not true.', { who: scene.guest }) : !pinned ? (asked.length < minProbes ? t('ap.oaAskMore', 'Ask follow-up questions. Read the notepad.') : t('ap.oaPinIt', 'Which one is the lie? Tap it.')) : t('ap.oaCaught', 'You caught it!')}</p>
              <ol className="av-oa-claims">
                {claims.map((c, n) => {
                  const revealed = n < heard;
                  const mine = askedFor(c.id);
                  const isLie = pinned === c.id;
                  return (
                    <li key={c.id} ref={(el) => { claimEls.current[c.id] = el; }} className="av-oa-claim" data-open={open === c.id || undefined} data-lie={isLie || undefined} data-bad={wrongPin === c.id || undefined} data-revealed={revealed || undefined}>
                      <span className="av-oa-no" aria-hidden="true">{n + 1}</span>
                      {revealed ? <p>“{c.text}”</p> : <button type="button" className="av-btn" onClick={() => hearClaim(n)}>{n === heard ? t('ap.oaHearNext', 'Hear experience {{n}}', { n: n + 1 }) : `${n + 1}`}</button>}
                      {revealed && hearAll && !pinned && (
                        <span className="av-oa-actions">
                          <button type="button" className="av-pill" aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)}>❓ {t('ap.oaAsk', 'Ask')}</button>
                          {asked.length >= minProbes && <button type="button" className="av-pill" data-tone="brand" onClick={() => pin(c.id)}>📌 {t('ap.oaPin', 'This is the lie')}</button>}
                        </span>
                      )}
                      {open === c.id && !pinned && (
                        <div className="av-oa-probes" role="group" aria-label={t('ap.oaQs', 'Questions you can ask')}>
                          {c.probes.map((p, qi) => {
                            const did = mine.some((a) => a.q === p.q);
                            return (
                              <div key={p.q} className="av-oa-opt">
                                <button type="button" className="av-opt av-oa-card-btn" data-kind="ask" disabled={did} onClick={() => probe(c.id, qi)}><em aria-hidden="true">❓</em><span>{p.q}</span></button>
                                <button type="button" className="av-oa-ear" aria-label={t('ap.oaModel', 'Hear {{who}} say it', { who: scene.producer })} onClick={() => voice.say(scene.producer, p.q)}>🔊</button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {wrongPin === c.id && <p className="av-note av-why" role="status">{t('ap.oaWrongPin', 'That one sounds true. Ask another question first.')}</p>}
                    </li>
                  );
                })}
              </ol>
              {asked.length > 0 && (
                <div className="av-oa-pad" role="table" aria-label={t('ap.oaPad', 'Your notepad')}>
                  <h3>📝 {t('ap.oaPad', 'Your notepad')}</h3>
                  {asked.map((a, k) => { const no = claims.findIndex((c) => c.id === a.claim) + 1; return <div role="row" key={k}><b role="rowheader">{no}</b><span role="cell">{a.q}</span><i role="cell">{a.a}</i></div>; })}
                </div>
              )}
              {pinned && (
                <div className="av-iv-say" data-testid="av-oa-say">
                  <p className="av-note av-why">{scene.explain ?? scene.why}</p>
                  <p className="av-q">{t('ap.ivSay', 'Say it out loud:')}</p>
                  <blockquote>{sayLineText}</blockquote>
                  {!said && <button type="button" className="av-btn" data-kind="go" onClick={saidIt}>{t('ap.ivSaid', 'I said it')} ✓</button>}
                  {said && <Reward score={asked.length * 4 + 30} stars={stars} gem={mistakes.current.length === 0} calm={calm} tone="gold" />}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export const onairScene: SceneModule<OnAirScene> = {
  view: OnAirView,
  spoken: onAirSpoken,
  validate: validateOnAir,
};
