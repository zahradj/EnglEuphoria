// Interview (information gap; borrows Guess Who + Keep Talking): the student BUILDS the question from chips ("Have you ever" + a tile + the participle, chosen from 3),
// a person answers in a recorded voice, tiles flip and a notes strip fills. Two looks from one engine:
//   friends: interview three friends, count the yes answers, say who has done the most;
//   lineup:  "Who Is It?": six suspects fade out as the answers narrow the board until one remains, then a warrant line to say.
// A malformed question never costs anything (the chips just wobble with the rule). No timer, no lives.
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, CastImg, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx, type Mood } from '../kit';
import { fillFrame, shuffleSeed, useVoiceKey } from '../wave1Kit';
import { factsOf, identifies, participleChoices, questionOf, remaining, replyOf, winnerOf, yesCount, type InterviewTile, type Persona } from './interviewLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { InterviewTile, Persona, Fact } from './interviewLogic';
export interface InterviewScene extends SceneBase {
  kind: 'interview'; title: string; look: 'friends' | 'lineup'; chief: CastName;
  /** the chief's briefing (recorded voice) */
  intro: string;
  tiles: InterviewTile[];
  personas: Persona[];
  /** friends: the person with the most yes answers (checked against the data) */
  winnerId?: string;
  /** lineup: the hidden suspect whose file answers the questions, and the cast member whose recorded voice answers */
  targetId?: string;
  voice?: CastName;
  /** lineup: the board needs this many answers before the warrant (default 3) */
  minAsks?: number;
  /** the line the student says at the end; {name} and {facts} are filled in */
  summaryFrame: string;
}

interface Ask { pid: string; tileId: string; done: boolean }

function InterviewView({ scene, onDone, artBase, calm, seed, fx: fxIn }: SceneProps<InterviewScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const lineup = scene.look === 'lineup';
  const { personas, tiles } = scene;
  const target = lineup ? personas.find((p) => p.id === scene.targetId) : undefined;
  const minAsks = scene.minAsks ?? 3;
  const [sel, setSel] = useState(personas[0].id);
  const [asked, setAsked] = useState<Ask[]>([]);
  const [tileId, setTileId] = useState<string | null>(null);
  const [wrongPart, setWrongPart] = useState<{ n: number; tries: number } | null>(null);
  const [reply, setReply] = useState<{ pid: string; text: string; done: boolean; n: number; q: string } | null>(null);
  const [moods, setMoods] = useState<Record<string, Mood>>({});
  const [pick, setPick] = useState<string | null>(null);
  const [badPick, setBadPick] = useState<string | null>(null);
  const [phase, setPhase] = useState<'ask' | 'say' | 'done'>('ask');
  const mistakes = useRef<string[]>([]);
  const tries = useRef<Record<string, number>>({});
  const reported = useRef(false);
  const stripEl = useRef<HTMLDivElement>(null);
  const cardEls = useRef<Record<string, HTMLElement | null>>({});

  const tile = tiles.find((x) => x.id === tileId);
  const choices = useMemo(() => (tile ? participleChoices(tile, shuffleSeed, seed + tile.id.length) : []), [tile, seed]);
  const left = lineup ? remaining(personas, asked) : personas;
  const winnerId = lineup ? left[0]?.id : scene.winnerId;
  const winner = personas.find((p) => p.id === winnerId);
  const friendsAskedAll = !lineup && personas.every((p) => tiles.every((x) => asked.some((a) => a.pid === p.id && a.tileId === x.id)));
  const warrantReady = lineup && left.length === 1 && asked.length >= minAsks;
  const who = (p: Persona | undefined): string => (lineup ? scene.voice ?? 'Theo' : p?.cast ?? 'Vee');
  const frame = winner ? fillFrame(scene.summaryFrame, { name: winner.name, facts: factsOf(winner, tiles) }) : '';

  useVoiceKey(scene.chief, phase === 'say' ? frame : scene.intro, phase === 'say' ? 'say' : 'intro', artBase);
  const rp = personas.find((p) => p.id === reply?.pid);
  useVoiceKey(who(rp), reply?.text, `r${reply?.n ?? 0}`, artBase);

  const ask = (part: string, n: number) => {
    if (!tile || phase !== 'ask') return;
    if (part !== tile.verb.participle) {
      const k = (tries.current[tile.id] = (tries.current[tile.id] ?? 0) + 1);
      setWrongPart({ n, tries: k });
      popEl(stripEl.current, calm, 'wobble'); actor.flinch(1200);
      return;
    }
    const p = lineup ? target! : personas.find((x) => x.id === sel)!;
    const r = replyOf(p, tile.id);
    const q = questionOf(tile);
    setAsked((a) => [...a, { pid: p.id, tileId: tile.id, done: r.done }]);
    setReply({ pid: p.id, text: r.text, done: r.done, n: asked.length + 1, q });
    setMoods((m) => ({ ...m, [p.id]: r.done ? 'happy' : 'curious' }));
    setWrongPart(null); setTileId(null);
    fx.burstAt(stripEl.current, r.done ? 'teal' : 'lilac'); fx.floatAt(stripEl.current, '+5', r.done ? 'teal' : 'lilac'); popEl(stripEl.current, calm, 'pop');
    actor.cheer(1000);
  };

  const choosePerson = (id: string) => {
    if (phase !== 'ask') return;
    if (!friendsAskedAll) { setSel(id); setTileId(null); setWrongPart(null); return; }
    // all the answers are in: tapping a friend is the verdict
    if (pick) return;
    if (id === scene.winnerId) {
      setPick(id); setPhase('say'); setBadPick(null); fx.burstAt(cardEls.current[id], 'gold'); fx.floatAt(cardEls.current[id], '+20', 'gold'); popEl(cardEls.current[id], calm, 'pop'); actor.hold('happy', 'cheer');
    } else {
      setBadPick(id); popEl(cardEls.current[id], calm, 'wobble'); actor.flinch();
      const label = t('ap.ivWho', 'Who has done the most?');
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
    }
  };
  const acceptWarrant = () => { setPick(winnerId ?? null); setPhase('say'); fx.burstAt(cardEls.current[winnerId ?? ''], 'gold'); actor.hold('happy', 'cheer'); };
  const said = () => {
    if (reported.current) return;
    reported.current = true; setPhase('done'); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score: asked.length * 5 + 20, mistakes: mistakes.current });
  };

  const noteCell = (pid: string, tid: string) => { const a = asked.find((x) => x.pid === pid && x.tileId === tid); return a ? (a.done ? 'yes' : 'no') : 'none'; };
  const total = personas.length * tiles.length;
  const qLabel = lineup ? t('ap.ivAsked', 'Questions asked: {{n}}', { n: asked.length }) : t('ap.ivAskedOf', 'Questions {{n}} of {{m}}', { n: asked.length, m: total });
  const partLabel = wrongPart === null ? '___' : '…';

  return (
    <div className="av-game av-interview" data-testid="av-interview" data-look={scene.look} data-phase={phase} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={phase !== 'ask'} tone="gold" />
      <Cast who={scene.chief} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-iv-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{qLabel}</span>
          {lineup && <span className="av-pill" data-tone={left.length === 1 ? 'brand' : undefined}>{t('ap.ivLeft', 'Suspects left: {{n}}', { n: left.length })}</span>}
          <Badge who={scene.chief} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <section className="av-panel av-game-card av-iv-card">
          {!lineup && (
            <div className="av-iv-people" role="group" aria-label={t('ap.ivPeople', 'The friends')}>
              {personas.map((p) => {
                const n = asked.filter((a) => a.pid === p.id).length;
                const yes = asked.filter((a) => a.pid === p.id && a.done).length;
                const on = sel === p.id;
                return (
                  <button key={p.id} ref={(el) => { cardEls.current[p.id] = el; }} type="button" className="av-iv-person" data-on={on || undefined} data-pick={pick === p.id || undefined} data-bad={badPick === p.id || undefined}
                    data-pickable={friendsAskedAll || undefined} aria-pressed={on} onClick={() => choosePerson(p.id)}>
                    <span className="av-iv-face"><CastImg who={p.cast ?? 'Ava'} mood={moods[p.id] ?? 'neutral'} artBase={artBase} /></span>
                    <b>{p.name}</b>
                    <small>{friendsAskedAll ? t('ap.ivYesCount', '{{n}} yes', { n: yes }) : `${n}/${tiles.length}`}</small>
                    <span className="av-iv-pips" aria-hidden="true">{tiles.map((x) => <i key={x.id} data-s={noteCell(p.id, x.id)} />)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {lineup && (
            <div className="av-iv-board" role="list" aria-label={t('ap.ivBoard', 'The suspects')}>
              {personas.map((p, k) => {
                const out = !left.some((x) => x.id === p.id);
                const last = left.length === 1 && !out;
                return (
                  <div key={p.id} ref={(el) => { cardEls.current[p.id] = el; }} role="listitem" className="av-iv-suspect" data-out={out || undefined} data-last={last || undefined} style={{ ['--h' as string]: (k * 47) % 360 }}>
                    <span className="av-iv-mono" aria-hidden="true">{p.name.slice(0, 1)}</span>
                    <b>{p.name}</b>{p.tag && <small>{p.tag}</small>}
                    {out && <em>{t('ap.ivOut', 'ruled out')}</em>}
                  </div>
                );
              })}
            </div>
          )}

          {phase === 'ask' && !(lineup && warrantReady) && !friendsAskedAll && (
            <div className="av-iv-build">
              <p className="av-q">{lineup ? t('ap.ivBuildLineup', 'Build a question for the voice behind the screen.') : t('ap.ivBuild', 'Build your question for {{name}}.', { name: personas.find((p) => p.id === sel)?.name ?? '' })}</p>
              <div className="av-iv-strip" ref={stripEl} data-wob={wrongPart?.n}>
                <span className="av-chip" data-fixed>{t('ap.ivHave', 'Have you ever')}</span>
                <span className="av-chip" data-slot={tile ? 'on' : 'off'}>{tile ? partLabel : '___'}</span>
                <span className="av-chip" data-fixed data-dim={!tile || undefined}>{tile ? `${tile.object}?` : '…?'}</span>
              </div>
              {!tile && (
                <div className="av-iv-tiles" role="group" aria-label={t('ap.ivPickTile', 'Pick what to ask about')}>
                  {tiles.map((x, n) => {
                    const done = !lineup && asked.some((a) => a.pid === sel && a.tileId === x.id);
                    return <button key={x.id} type="button" className="av-iv-tile" data-done={done || undefined} style={{ ['--i' as string]: n }} onClick={() => { setTileId(x.id); setWrongPart(null); }}><b>{x.verb.base}</b><small>{x.object}</small>{done && <i aria-hidden="true">✓</i>}</button>;
                  })}
                </div>
              )}
              {tile && (
                <div className="av-iv-parts" role="group" aria-label={t('ap.ivPickPart', 'Pick the participle')}>
                  {choices.map((c, n) => <button key={c} type="button" className="av-opt av-iv-part" style={{ ['--i' as string]: n }} onClick={() => ask(c, n)}>{c}</button>)}
                  <button type="button" className="av-iv-back" onClick={() => { setTileId(null); setWrongPart(null); }}>{t('ap.back', 'Back')}</button>
                </div>
              )}
              {wrongPart && tile && (
                <p className="av-note av-why" role="status">
                  {t('ap.ivWrongPart', 'After “have” we need the participle, the third form.')}
                  {wrongPart.tries > 1 && <b> {tile.verb.base} · {tile.verb.past ?? '…'} · {tile.verb.participle}</b>}
                </p>
              )}
            </div>
          )}

          {reply && (
            <div className="av-iv-reply" key={reply.n} data-yes={reply.done || undefined}>
              <small>{reply.q}</small>
              <p><b>{lineup ? t('ap.ivVoice', 'The voice') : rp?.name}</b> {reply.text}</p>
            </div>
          )}

          {!lineup && (
            <div className="av-iv-notes" role="table" aria-label={t('ap.ivNotes', 'Your notes')}>
              <div role="row"><span role="columnheader" />{tiles.map((x) => <span role="columnheader" key={x.id}>{x.verb.base}</span>)}</div>
              {personas.map((p) => (
                <div role="row" key={p.id} data-me={sel === p.id || undefined}><b role="rowheader">{p.name}</b>{tiles.map((x) => { const s = noteCell(p.id, x.id); return <span role="cell" key={x.id} data-s={s}>{s === 'yes' ? '✓' : s === 'no' ? '✗' : '·'}</span>; })}</div>
              ))}
            </div>
          )}
          {lineup && asked.length > 0 && (
            <ul className="av-iv-log" aria-label={t('ap.ivNotes', 'Your notes')}>
              {asked.map((a, k) => { const x = tiles.find((y) => y.id === a.tileId)!; return <li key={k} data-yes={a.done || undefined}><span aria-hidden="true">{a.done ? '✓' : '✗'}</span>{questionOf(x)}</li>; })}
            </ul>
          )}

          {phase === 'ask' && friendsAskedAll && !pick && (
            <p className="av-q av-iv-verdict" role="status">{t('ap.ivPickWinner', 'Count the yes answers in your notes. Tap the friend who has done the most.')}{badPick && <span className="av-note av-why"> {t('ap.ivBadPick', 'Count again: that friend has fewer yes answers than someone else.')}</span>}</p>
          )}
          {phase === 'ask' && lineup && left.length === 1 && !warrantReady && <p className="av-note av-why">{t('ap.ivMore', 'One suspect is left. Ask one more question to be sure.')}</p>}
          {phase === 'ask' && warrantReady && (
            <div className="av-iv-warrant">
              <p>{t('ap.ivWarrant', 'Only {{name}} fits every answer. Issue the warrant?', { name: winner?.name ?? '' })}</p>
              <button type="button" className="av-btn" data-kind="go" onClick={acceptWarrant}>{t('ap.ivIssue', 'Issue the warrant')}</button>
            </div>
          )}

          {phase !== 'ask' && (
            <div className="av-iv-say" data-testid="av-iv-say">
              <p className="av-q">{t('ap.ivSay', 'Say it out loud:')}</p>
              <blockquote>{frame}</blockquote>
              {phase === 'say' && <button type="button" className="av-btn" data-kind="go" onClick={said}>{t('ap.ivSaid', 'I said it')} ✓</button>}
              {phase === 'done' && <Reward score={asked.length * 5 + 20} stars={starsFor(mistakes.current.length ? 0 : 1, 1)} gem={mistakes.current.length === 0} calm={calm} tone="teal" />}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export const interviewScene: SceneModule<InterviewScene> = {
  view: InterviewView,
  spoken: (s) => {
    const lineup = s.look === 'lineup';
    const out: { who: string; text: string }[] = [{ who: s.chief, text: s.intro }];
    const speakers = lineup ? s.personas.filter((p) => p.id === s.targetId) : s.personas;
    for (const p of speakers) for (const x of s.tiles) { const r = replyOf(p, x.id); out.push({ who: lineup ? s.voice ?? 'Theo' : p.cast ?? 'Vee', text: r.text }); }
    const w = s.personas.find((p) => p.id === (lineup ? s.targetId : s.winnerId));
    if (w) out.push({ who: s.chief, text: fillFrame(s.summaryFrame, { name: w.name, facts: factsOf(w, s.tiles) }) });
    return out;
  },
  validate: (s) => {
    const p: string[] = [];
    if (s.look !== 'friends' && s.look !== 'lineup') p.push(`${s.id}: interview look must be friends or lineup`);
    if ((s.tiles?.length ?? 0) < 3) p.push(`${s.id}: interview needs 3+ tiles`);
    s.tiles?.forEach((x) => {
      if (new Set([x.verb.participle, ...x.verb.distractors]).size !== 3) p.push(`${s.id}: tile ${x.id} needs 3 different participle buttons`);
    });
    const tileIds = new Set(s.tiles?.map((x) => x.id));
    s.personas?.forEach((x) => {
      if (s.look === 'friends' && !x.cast) p.push(`${s.id}: friend ${x.name} needs a cast member (portrait and voice)`);
      for (const id of tileIds) if (!x.facts[id]) p.push(`${s.id}: ${x.name} has no fact for tile ${id}`);
    });
    if (s.look === 'friends') {
      if ((s.personas?.length ?? 0) !== 3) p.push(`${s.id}: the friends look needs exactly 3 friends`);
      if (!s.winnerId || winnerOf(s.personas, s.tiles) !== s.winnerId) p.push(`${s.id}: winnerId is not the person with strictly the most yes answers`);
    } else {
      if ((s.personas?.length ?? 0) < 4) p.push(`${s.id}: the lineup needs 4+ suspects`);
      if (!s.targetId || !identifies(s.personas, s.tiles, s.targetId)) p.push(`${s.id}: asking every tile must leave only the target suspect`);
      if (!s.voice) p.push(`${s.id}: the lineup needs a voice (a cast member)`);
      const vectors = s.personas.map((x) => s.tiles.map((t) => (x.facts[t.id]?.done ? 1 : 0)).join(''));
      if (new Set(vectors).size !== vectors.length) p.push(`${s.id}: two suspects have the same file`);
    }
    if (!s.summaryFrame?.includes('{name}')) p.push(`${s.id}: the summary frame needs {name}`);
    return p;
  },
};
// kept for the tests: how many answers a friends interview needs
export const friendsQuestionCount = (s: InterviewScene) => s.personas.length * s.tiles.length;
export const yesTotals = (s: InterviewScene) => s.personas.map((p) => ({ id: p.id, yes: yesCount(p, s.tiles) }));
