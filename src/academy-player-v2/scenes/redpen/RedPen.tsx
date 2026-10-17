// Red Pen (an editing game: a draft note with three red marks; the student rewrites each marked sentence): the pen names the TYPE of mistake (tense with a finished time, participle, missing have),
// a second try shows a hint, a third shows a sample. Nothing is lost. When all three are fixed the Gazette page is stamped CHECKED. Targets are named in advance (editing research: clear targets work).
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stopVoice } from '../../services/voice';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type MarkKind = 'tense' | 'participle' | 'have';
export interface DraftSentence {
  /** the sentence as the junior reporter wrote it; marked ones carry a mistake */
  text: string; marked?: boolean; kind?: MarkKind;
  /** every pattern (regex source, case-insensitive) must match the rewrite */
  accept?: string[]; hint?: string; sample?: string; why?: string;
}
export interface RedPenScene extends SceneBase { kind: 'redpen'; title: string; who: CastName; intro: string; drafts: DraftSentence[]; story?: string }

export const KIND_LABEL: Record<MarkKind, [string, string]> = { tense: ['ap.rpTense', 'a finished time needs the past simple'], participle: ['ap.rpParticiple', 'wrong past participle'], have: ['ap.rpHave', 'have or has is missing'] };
export const fixes = (d: DraftSentence, text: string) => !!d.accept?.length && text.trim().length > 6 && d.accept.every((a) => new RegExp(a, 'i').test(text));

export function validateRedPen(s: RedPenScene): string[] {
  const p: string[] = [];
  if (!s.intro?.trim()) p.push(`${s.id}: redpen needs an intro`);
  const marked = (s.drafts ?? []).filter((d) => d.marked);
  if (marked.length !== 3) p.push(`${s.id}: a red-pen draft has exactly 3 marked sentences (has ${marked.length})`);
  if ((s.drafts?.length ?? 0) < 5) p.push(`${s.id}: the draft needs 5+ sentences`);
  for (const d of marked) {
    if (!d.kind || !d.accept?.length || !d.hint || !d.sample) p.push(`${s.id}: marked "${d.text}" needs a kind, accept patterns, a hint and a sample`);
    else {
      if (!fixes(d, d.sample)) p.push(`${s.id}: the sample for "${d.text}" does not pass its own patterns`);
      if (fixes(d, d.text)) p.push(`${s.id}: the mistake "${d.text}" already passes its own patterns`);
    }
  }
  return p;
}

function RedPenView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<RedPenScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [text, setText] = useState<Record<number, string>>({});
  const [open, setOpen] = useState<number | null>(() => scene.drafts.findIndex((d) => d.marked));
  const [fixed, setFixed] = useState<number[]>([]);
  const [tries, setTries] = useState<Record<number, number>>({});
  const [fin, setFin] = useState(false);
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const rowEls = useRef<Record<number, HTMLElement | null>>({});
  const markedIdx = scene.drafts.flatMap((d, i) => (d.marked ? [i] : []));
  const d = open !== null ? scene.drafts[open] : undefined;

  useVoiceKey(scene.who, scene.intro, 'intro', artBase);
  useEffect(() => () => stopVoice(), []);

  const submit = () => {
    if (open === null || !d) return;
    const v = text[open] ?? d.text;
    if (fixes(d, v)) {
      const left = markedIdx.filter((i) => i !== open && !fixed.includes(i));
      setFixed((f) => [...f, open]); fx.burstAt(rowEls.current[open], 'teal'); fx.floatAt(rowEls.current[open], '+10', 'teal'); popEl(rowEls.current[open], calm, 'pop'); actor.cheer(900);
      if (left.length) setOpen(left[0]);
      else { setOpen(null); if (!reported.current) { reported.current = true; setFin(true); fx.confetti(); actor.hold('happy', 'cheer'); onDone({ won: true, score: 30, mistakes: mistakes.current, ...(scene.story ? { story: { [scene.story]: true } } : {}) }); } }
    } else {
      setTries((x) => ({ ...x, [open]: (x[open] ?? 0) + 1 })); actor.flinch(900); popEl(rowEls.current[open], calm, 'wobble');
      if (!mistakes.current.includes(d.text)) mistakes.current.push(d.text);
    }
  };
  const n = open !== null ? tries[open] ?? 0 : 0;
  const stars = starsFor(mistakes.current.length ? 0 : 1, 1);

  return (
    <div className="av-game av-redpen" data-testid="av-redpen" data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={fin} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-iv-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.rpFixed', 'Fixed {{n}} of {{m}}', { n: fixed.length, m: markedIdx.length })}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>
        <section className="av-panel av-game-card av-rp-card">
          <div className="av-rp-page" data-checked={fin || undefined}>
            <h3>📰 {t('ap.rpDraft', 'Draft for the Gazette')}</h3>
            <ol>
              {scene.drafts.map((s, i) => {
                const isFixed = fixed.includes(i);
                const shown = isFixed ? text[i] : s.text;
                return (
                  <li key={i} ref={(el) => { rowEls.current[i] = el; }} data-marked={(s.marked && !isFixed) || undefined} data-fixed={isFixed || undefined} data-open={open === i || undefined}>
                    {s.marked && !isFixed ? <button type="button" className="av-rp-mark" onClick={() => setOpen(i)} aria-label={t('ap.rpOpen', 'Fix this sentence')}>{shown}</button> : <span>{shown}</span>}
                    {s.marked && !isFixed && <em aria-hidden="true">✎</em>}
                  </li>
                );
              })}
            </ol>
            {fin && <span className="av-rp-stamp" role="img" aria-label={t('ap.rpChecked', 'CHECKED')}>{t('ap.rpChecked', 'CHECKED')}</span>}
          </div>
          {d && open !== null && (
            <div className="av-rp-edit" key={open}>
              <p className="av-q">{t('ap.rpWhat', 'Red pen: {{what}}.', { what: t(KIND_LABEL[d.kind!][0], KIND_LABEL[d.kind!][1]) })}</p>
              <textarea className="av-rp-input" rows={2} value={text[open] ?? d.text} onChange={(e) => setText((x) => ({ ...x, [open]: e.target.value }))} aria-label={t('ap.rpRewrite', 'Rewrite the sentence')} />
              {n >= 1 && <p className="av-note av-why" role="status">{d.hint}</p>}
              {n >= 2 && d.sample && <p className="av-note av-why" role="status">{t('ap.rpSample', 'One good rewrite:')} <b>{d.sample}</b></p>}
              <button type="button" className="av-btn" data-kind="go" onClick={submit}>{t('ap.rpSubmit', 'Fix it')} ✓</button>
            </div>
          )}
          {fin && <Reward score={30} stars={stars} gem={mistakes.current.length === 0} calm={calm} tone="gold" />}
        </section>
      </div>
    </div>
  );
}

export const redpenScene: SceneModule<RedPenScene> = {
  view: RedPenView,
  spoken: (s) => [{ who: s.who, text: s.intro }],
  validate: validateRedPen,
};
