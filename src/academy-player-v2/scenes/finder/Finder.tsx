// Finder (Postcard Finder; borrows Codenames' one clue, many targets + referential communication + Taboo's banned words).
// Six lookalike postcards. FIND rounds: a recorded clue arrives in steps and a meter shows how many postcards it still fits; tap the card.
// BUILD rounds: the student sees a secret postcard and builds a clue from word chips (counter "new words 0/3"); the partner picks a card.
// If a lookalike is picked the game never says "wrong": "This clue also fits the postcard with the tent. Add one detail." and the student adds a chip.
// The found card flips to a stamp. No timer, no lives; the partner is the teacher in a live lesson and a fixed script when the student plays alone.
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { Postcard, type CardState } from './Postcard';
import { bannedChips, canSend, cardOf, checkGrid, chipTags, clueTags, diffOf, fits, fitIds, missingTag, newWords, partnerPick, separatingChips, type FinderChip, type FinderGrid } from './finderLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { FinderCard, FinderChip, FinderGrid, FinderClue, FinderTone } from './finderLogic';
export interface FinderScene extends SceneBase {
  kind: 'finder'; title: string; partner: CastName;
  /** the partner's briefing (recorded voice) */
  intro: string;
  /** said when a build round starts */
  buildLine: string;
  /** said when the partner picks a lookalike ("Hmm, is it this one?") and when the right card is found */
  askLine: string;
  foundLine: string;
  grids: FinderGrid[];
}

const GROUPS: { id: FinderChip['group']; key: [string, string] }[] = [
  { id: 'feeling', key: ['ap.fdFeeling', 'Feeling'] },
  { id: 'place', key: ['ap.fdPlace', 'Place'] },
  { id: 'chunk', key: ['ap.fdChunk', 'What we did'] },
  { id: 'detail', key: ['ap.fdDetail', 'Details'] },
];

function FinderView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<FinderScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [gi, setGi] = useState(0);
  const [brief, setBrief] = useState(true);
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<string[]>([]);
  const [asked, setAsked] = useState<{ id: string; n: number } | null>(null);
  const [note, setNote] = useState<{ text: string; tone: 'warn' | 'good' } | null>(null);
  const [found, setFound] = useState(false);
  const [replay, setReplay] = useState(0);
  const [glowChips, setGlowChips] = useState<string[]>([]);
  const [badChip, setBadChip] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const mistakes = useRef<string[]>([]);
  const helped = useRef(false);
  const clean = useRef(0);
  const score = useRef(0);
  const reported = useRef(false);
  const asks = useRef(0);
  const cardEls = useRef<Record<string, HTMLElement | null>>({});
  const stripEl = useRef<HTMLDivElement>(null);

  const grid = scene.grids[gi];
  const build = grid.mode === 'build';
  const target = cardOf(grid, grid.targetId);
  const last = gi === scene.grids.length - 1;
  const banned = useMemo(() => bannedChips(grid), [grid]);
  const tags = build ? chipTags(grid, chosen) : clueTags(grid, step);
  const fitting = fitIds(grid.cards, tags);
  const need = grid.minNewWords ?? 0;
  const newN = newWords(grid, chosen);

  // what the partner says now (recorded voice; silent when there is no clip)
  const sayText = brief ? scene.intro
    : found ? scene.foundLine
    : asked ? scene.askLine
    : build ? scene.buildLine
    : grid.clues?.[step]?.text;
  const sayKey = brief ? 'brief' : found ? `${gi}-found` : asked ? `${gi}-ask${asked.n}` : build ? `${gi}-build` : `${gi}-c${step}-${replay}`;
  useVoiceKey(scene.partner, sayText, sayKey, artBase);

  const wob = (el: Element | null | undefined) => popEl(el as HTMLElement | null, calm, 'wobble');
  const miss = (label: string) => { if (!mistakes.current.includes(label)) mistakes.current.push(label); helped.current = true; };

  const win = (id: string) => {
    setFound(true); setAsked(null); setNote(null);
    const pts = helped.current ? 5 : 10;
    score.current += pts; if (!helped.current) clean.current++;
    const el = cardEls.current[id];
    fx.burstAt(el, 'gold'); fx.floatAt(el, `+${pts}`, 'gold'); popEl(el, calm, 'pop');
    actor.hold('happy', 'cheer');
  };

  // ---- find rounds ----
  const tapCard = (id: string) => {
    if (found || brief) return;
    if (build) return;
    if (id === grid.targetId) { win(id); return; }
    const card = cardOf(grid, id);
    if (fits(card, tags)) {
      // a lookalike that also fits what was said so far: not an error, the partner gives one more detail
      helped.current = true;
      wob(cardEls.current[id]);
      if (step < (grid.clues?.length ?? 1) - 1) { setStep(step + 1); setNote({ text: t('ap.fdFitsToo', 'This one fits too. Listen for one more detail.'), tone: 'good' }); }
      actor.flinch(900);
      return;
    }
    const miss1 = missingTag(card, tags) ?? '';
    miss(`find ${grid.id}`);
    setNote({ text: t('ap.fdNotThis', 'That postcard does not show “{{tag}}”. Listen again.', { tag: miss1 }), tone: 'warn' });
    setReplay((n) => n + 1); wob(cardEls.current[id]); actor.flinch(1100);
  };
  const moreDetail = () => { if (step < (grid.clues?.length ?? 1) - 1) { helped.current = true; setStep(step + 1); setNote(null); } };

  // ---- build rounds ----
  const tapChip = (c: FinderChip, el: HTMLElement | null) => {
    if (found) return;
    if (chosen.includes(c.id)) { setChosen(chosen.filter((x) => x !== c.id)); setAsked(null); return; }
    if (banned.includes(c.id)) { wob(el); setNote({ text: t('ap.fdBannedNote', 'Banned today: you cannot say “{{word}}”. Use other words.', { word: c.text }), tone: 'warn' }); return; }
    if (!grid.acceptedChips?.includes(c.id)) {
      wob(el); setBadChip(c.id); window.setTimeout(() => setBadChip(null), 700);
      setNote({ text: t('ap.fdNotShown', 'Your postcard does not show that. Pick another word.'), tone: 'warn' });
      return;
    }
    if (chosen.length >= 6) return;
    setChosen([...chosen, c.id]); setAsked(null); setNote(null); setGlowChips([]);
    fx.burstAt(el, 'lilac');
  };
  const send = () => {
    if (found || !canSend(grid, chosen)) return;
    const pick = partnerPick(grid, chipTags(grid, chosen));
    if (pick.id === grid.targetId) { win(pick.id); return; }
    if (!pick.id) return;
    asks.current += 1;
    const d = diffOf(cardOf(grid, pick.id), target);
    const text = d.kind === 'detail' ? t('ap.fdAlsoDetail', 'This clue also fits the postcard with the {{x}}. Add one detail.', { x: d.value })
      : d.kind === 'feeling' ? t('ap.fdAlsoFeeling', 'This clue also fits the postcard where the person felt {{x}}. Add one detail.', { x: d.value })
      : d.kind === 'place' ? t('ap.fdAlsoPlace', 'This clue also fits the postcard from the {{x}}. Add one detail.', { x: d.value })
      : t('ap.fdAlsoChunk', 'This clue also fits the postcard where they {{x}}. Add one detail.', { x: d.value });
    setAsked({ id: pick.id, n: asks.current });
    setNote({ text, tone: 'warn' });
    setGlowChips(separatingChips(grid, pick.id));
    miss(`clue ${grid.id}`);
    wob(cardEls.current[pick.id]); actor.hold('curious', 'nod');
  };

  const next = () => {
    if (!last) {
      setGi(gi + 1); setStep(0); setChosen([]); setAsked(null); setNote(null); setFound(false); setGlowChips([]); setReplay(0);
      helped.current = false; asks.current = 0; actor.hold('thinking');
      return;
    }
    if (reported.current) return;
    reported.current = true; setDone(true); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score: score.current, mistakes: mistakes.current });
  };

  const cardState = (id: string): CardState => {
    if (brief) return 'idle';
    if (found) return id === grid.targetId ? 'found' : 'dim';
    if (build) return asked?.id === id ? 'asked' : id === grid.targetId ? 'secret' : 'idle';
    return fitting.includes(id) ? 'idle' : 'dim';
  };
  const clues = (grid.clues ?? []).slice(0, step + 1);
  const youGive = build;
  const sentence = chosen.map((id) => grid.chips?.find((c) => c.id === id)?.text).filter(Boolean).join(' · ');

  return (
    <div className="av-game av-finder" data-testid="av-finder" data-mode={grid.mode} data-found={found || undefined} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={found} tone="gold" />
      <Cast who={scene.partner} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-fd-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.fdRound', 'Postcard {{n}} of {{m}}', { n: gi + 1, m: scene.grids.length })}</span>
          <span className="av-pill" data-tone={youGive ? 'brand' : undefined}>{youGive ? t('ap.fdYouGive', 'You give the clue') : t('ap.fdGives', '{{who}} gives the clue', { who: scene.partner })}</span>
          <Badge who={scene.partner} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <section className="av-panel av-game-card av-fd-panel" aria-live="polite">
          <div className="av-fd-board" role="group" aria-label={t('ap.fdBoard', 'The postcards')} data-brief={brief || undefined}>
            {grid.cards.map((c, k) => (
              <Postcard key={`${grid.id}-${c.id}`} card={c} state={cardState(c.id)} disabled={found || brief || build} hot={glowChips.length > 0 && asked?.id === c.id}
                innerRef={(el) => { cardEls.current[c.id] = el; }} onClick={() => tapCard(c.id)} />
            ))}
          </div>

          <div className="av-fd-side">
          {brief && (
            <div className="av-fd-say">
              <p className="av-q">{scene.intro}</p>
              <button type="button" className="av-btn" data-kind="go" onClick={() => setBrief(false)}>{t('ap.start', 'Start')}</button>
            </div>
          )}

          {!brief && !build && !found && (
            <div className="av-fd-clue">
              <ol className="av-fd-bubbles">
                {clues.map((c, k) => <li key={k} data-now={k === step || undefined}><b>{scene.partner}</b> {c.text}</li>)}
              </ol>
              <div className="av-fd-meter" role="status">
                <span className="av-fd-pips" aria-hidden="true">{grid.cards.map((c) => <i key={c.id} data-on={fitting.includes(c.id) || undefined} />)}</span>
                <span>{t('ap.fdFits', 'This clue fits {{n}} of {{m}} postcards', { n: fitting.length, m: grid.cards.length })}</span>
              </div>
              <div className="av-fd-actions">
                <button type="button" className="av-btn" onClick={() => setReplay((n) => n + 1)}>{t('ap.listenAgain', 'Listen again')}</button>
                {step < (grid.clues?.length ?? 1) - 1 && <button type="button" className="av-btn" data-kind="go" onClick={moreDetail}>{t('ap.fdMore', 'One more detail')}</button>}
              </div>
              <p className="av-fd-hint">{t('ap.fdTapHint', 'Tap the postcard that fits.')}</p>
            </div>
          )}

          {!brief && build && !found && (
            <div className="av-fd-builder">
              <div className="av-fd-strip" ref={stripEl} data-empty={chosen.length === 0 || undefined}>
                <small>{t('ap.fdYourClue', 'Your clue')}</small>
                <span className="av-fd-strip-chips">
                  {chosen.length === 0 && <em>{t('ap.fdTapWords', 'Tap words below to build your clue.')}</em>}
                  {chosen.map((id) => { const c = grid.chips!.find((x) => x.id === id)!; return <button key={id} type="button" className="av-chip" data-fixed aria-label={t('ap.fdRemove', 'Remove {{word}}', { word: c.text })} onClick={(e) => tapChip(c, e.currentTarget)}>{c.text}</button>; })}
                </span>
                <span className="av-fd-count" data-ok={newN >= need || undefined} role="status">{t('ap.fdNew', 'New words {{n}}/{{m}}', { n: Math.min(newN, need), m: need })}</span>
              </div>
              {banned.length > 0 && <p className="av-fd-ban">{t('ap.fdBanList', 'Banned words today:')} {banned.map((id) => <s key={id}>{grid.chips!.find((c) => c.id === id)?.text}</s>)}</p>}
              <div className="av-fd-bank">
                {GROUPS.map((g) => {
                  const cs = grid.chips!.filter((c) => c.group === g.id);
                  if (!cs.length) return null;
                  return (
                    <div key={g.id} className="av-fd-group" role="group" aria-label={t(g.key[0], g.key[1])}>
                      <small>{t(g.key[0], g.key[1])}</small>
                      <span>
                        {cs.map((c) => (
                          <button key={c.id} type="button" className="av-chip" data-used={chosen.includes(c.id) || undefined} data-banned={banned.includes(c.id) || undefined} data-new={c.isNew || undefined} data-glow={glowChips.includes(c.id) || undefined} data-bad={badChip === c.id || undefined}
                            aria-pressed={chosen.includes(c.id)} aria-disabled={banned.includes(c.id) || undefined} onClick={(e) => tapChip(c, e.currentTarget)}>{c.text}</button>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="av-fd-actions">
                <button type="button" className="av-btn" data-kind="go" disabled={!canSend(grid, chosen)} onClick={send}>{t('ap.fdSend', 'Send the clue')}</button>
                {chosen.length > 0 && !canSend(grid, chosen) && <span className="av-fd-hint">{t('ap.fdNeedNew', 'Add {{n}} more new word(s) first.', { n: need - newN })}</span>}
                {chosen.length === 0 && <span className="av-fd-hint">{grid.clueText ? t('ap.fdModel', 'Example: “{{clue}}”', { clue: grid.clueText }) : null}</span>}
              </div>
            </div>
          )}

          {note && !found && <p className="av-note av-fd-note-line" data-tone={note.tone} role="status">{note.text}</p>}

          {found && !done && (
            <div className="av-fd-next">
              <p className="av-note" data-tone="good" role="status">{t('ap.fdGotIt', '{{place}}: found it!', { place: target.place.charAt(0).toUpperCase() + target.place.slice(1) })} {build && sentence ? `“${sentence}”` : ''}</p>
              <button type="button" className="av-btn" data-kind="go" onClick={next}>{last ? t('ap.finish', 'Finish the lesson') : `${t('ap.fdNextCard', 'Next postcard')} ›`}</button>
            </div>
          )}
          {done && <Reward score={score.current} stars={starsFor(clean.current, scene.grids.length)} gem={mistakes.current.length === 0} calm={calm} />}
          </div>
        </section>
      </div>
    </div>
  );
}

export const finderScene: SceneModule<FinderScene> = {
  view: FinderView,
  spoken: (s) => [
    { who: s.partner, text: s.intro }, { who: s.partner, text: s.buildLine }, { who: s.partner, text: s.askLine }, { who: s.partner, text: s.foundLine },
    ...s.grids.flatMap((g) => (g.clues ?? []).map((c) => ({ who: s.partner, text: c.text }))),
  ],
  validate: (s) => {
    const p: string[] = [];
    if (!s.grids?.length) return [`${s.id}: finder needs grids`];
    if (!s.intro?.trim() || !s.askLine?.trim() || !s.foundLine?.trim() || !s.buildLine?.trim()) p.push(`${s.id}: finder needs intro, buildLine, askLine and foundLine`);
    if (!s.grids.some((g) => g.mode === 'find')) p.push(`${s.id}: finder needs a find round`);
    if (!s.grids.some((g) => g.mode === 'build')) p.push(`${s.id}: finder needs a build round (the roles swap)`);
    const ids = new Set<string>();
    s.grids.forEach((g) => { if (ids.has(g.id)) p.push(`${s.id}: duplicate grid id ${g.id}`); ids.add(g.id); p.push(...checkGrid(g).map((x) => `${s.id}: ${x}`)); });
    return p;
  },
};
