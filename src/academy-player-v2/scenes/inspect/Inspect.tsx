// Inspect (the desk game; borrows Papers, Please + Return of the Obra Dinn's batch of three): documents reach the desk one at a time, a rulebook stays open,
// the student APPROVES or FIXES (tap the faulty word, pick the repair). Three are filed together and only then judged (a calm explanation each);
// a wrong one comes back once, reworded. Three looks from one engine: post (blog posts), postcard (diary lines) and passport (claims against stamps).
// Comfort: no timer, no lives, no elimination; a wrong answer is explained and returns once; the private "Not sure" flag is never scored.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sayLine } from '../../services/voice';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { accepts } from '../write/Write';
import { docText, faultTokens, judge, menuOf, returnedBatch, stripWord, tokenize, type Decision, type InspectItem, type InspectProp, type Verdict } from './inspectLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { InspectItem, InspectProp, InspectFault } from './inspectLogic';
export interface InspectRule { id: string; title: string; text: string; example?: string; /** the first batch (0-based) in which the rule is on the desk */ fromBatch?: number }
export interface InspectScene extends SceneBase {
  kind: 'inspect'; title: string; look: 'post' | 'postcard' | 'passport'; chief: CastName;
  /** the chief's briefing, said by the recorded voice when the shift starts */
  intro: string;
  rules: InspectRule[];
  batches: { title: string; items: InspectItem[] }[];
  /** the typed finish (postcard look): the student writes one line of their own */
  finale?: { prompt: string; frame: string; accept: string[]; hint: string; sample: string };
}

type Step = 'decide' | 'word' | 'repair' | 'ready' | 'reveal' | 'finale' | 'done';
interface Filed { item: InspectItem; d: Decision; unsure: boolean; correct: boolean; verdict: Verdict }

function Photo({ prop }: { prop: Extract<InspectProp, { kind: 'photo' }> }) {
  return (
    <figure className="av-photo" data-tone={prop.tone}>
      <span className="av-photo-sun" /><span className="av-photo-hill" data-k="1" /><span className="av-photo-hill" data-k="2" /><span className="av-photo-ground" />
      <figcaption>{prop.caption}</figcaption>
    </figure>
  );
}

function Stamps({ prop }: { prop: Extract<InspectProp, { kind: 'stamps' }> }) {
  const { t } = useTranslation();
  return (
    <div className="av-passport" aria-label={t('ap.inPassport', 'Passport page')}>
      <header><b>{t('ap.inPassport', 'Passport page')}</b><i /></header>
      <ul>
        {prop.stamps.map((s, i) => (
          <li key={i} style={{ ['--r' as string]: `${((i * 11) % 9) - 4}deg` }}>
            <span className="av-pp-in"><b>{s.city}</b><small>{s.date}</small></span>
            {s.back ? <span className="av-pp-out"><b>{t('ap.inBackHome', 'BACK HOME')}</b><small>{s.back}</small></span> : <span className="av-pp-none">{t('ap.inNoExit', 'no exit stamp')}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Doc({ item, look, step, tapped, onTap }: { item: InspectItem; look: InspectScene['look']; step: Step; tapped: { line: number; idx: number } | null; onTap: (line: number, idx: number) => void }) {
  const { t } = useTranslation();
  const lines = useMemo(() => tokenize(item.doc), [item.doc]);
  const picking = step === 'word';
  const body = lines.map((toks, l) => (
    <p key={l}>
      {toks.map((tk) => {
        const on = tapped?.line === tk.line && tapped.idx === tk.idx;
        return picking
          ? <button key={tk.idx} type="button" className="av-tok" data-on={on || undefined} onClick={() => onTap(tk.line, tk.idx)}>{tk.text}</button>
          : <span key={tk.idx} className="av-tok" data-on={on || undefined}>{tk.text}</span>;
      })}
    </p>
  ));
  const prop = item.prop;
  if (look === 'passport') {
    return (
      <article className="av-doc" data-look="passport" data-picking={picking || undefined}>
        {prop?.kind === 'stamps' && <Stamps prop={prop} />}
        <div className="av-claim"><small>{t('ap.inClaim', 'The traveller says')}</small>{body}{item.from && <em>{item.from}</em>}</div>
      </article>
    );
  }
  if (look === 'postcard') {
    return (
      <article className="av-doc" data-look="postcard" data-picking={picking || undefined}>
        {prop?.kind === 'photo' && <Photo prop={prop} />}
        <div className="av-card-text">
          <span className="av-pc-stamp" aria-hidden="true" />
          {prop?.kind === 'postmark' && <span className="av-postmark" aria-hidden="true"><b>{prop.place}</b><small>{prop.date}</small></span>}
          {body}
          {item.from && <em>{item.from}</em>}
        </div>
      </article>
    );
  }
  return (
    <article className="av-doc" data-look="post" data-picking={picking || undefined}>
      <header><span className="av-avatar" aria-hidden="true">{(item.from ?? '?').slice(0, 1)}</span><b>{item.from}</b><small>{t('ap.inPostTag', 'bucket list · new post')}</small></header>
      <div className="av-post-body">{body}</div>
    </article>
  );
}

function InspectView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<InspectScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [batches, setBatches] = useState(scene.batches);
  const realCount = scene.batches.length;
  const [bi, setBi] = useState(0);
  const [ni, setNi] = useState(0);
  const [step, setStep] = useState<Step>('decide');
  const [tapped, setTapped] = useState<{ line: number; idx: number } | null>(null);
  const [unsure, setUnsure] = useState(false);
  const [filed, setFiled] = useState<Filed[][]>([[]]);
  const [typed, setTyped] = useState('');
  const [typedTries, setTypedTries] = useState(0);
  const [finaleOk, setFinaleOk] = useState(false);
  const mistakes = useRef<string[]>([]);
  const firstOk = useRef(0);
  const reported = useRef(false);
  const rowEls = useRef<(HTMLElement | null)[]>([]);
  const trayEls = useRef<(HTMLElement | null)[]>([]);
  const batch = batches[bi];
  const item = batch.items[ni] ?? batch.items[batch.items.length - 1];
  const returned = bi >= realCount;
  const rulesNow = scene.rules.filter((r) => returned || (r.fromBatch ?? 0) <= bi);
  const total = scene.batches.reduce((n, b) => n + b.items.length, 0);
  const passport = scene.look === 'passport';
  const mine = filed[bi] ?? [];

  // the chief's briefing, then each rule that opens in a later batch
  const newRule = bi > 0 && !returned ? scene.rules.find((r) => r.fromBatch === bi) : undefined;
  useVoiceKey(scene.chief, bi === 0 ? scene.intro : newRule?.text, `${bi}-${bi === 0 ? 'i' : newRule?.id ?? 'x'}`, artBase);

  const record = (d: Decision) => {
    const j = judge(item, d);
    const f: Filed = { item, d, unsure, correct: j.correct, verdict: j.verdict };
    const next = filed.map((arr, k) => (k === bi ? [...arr, f] : arr));
    setFiled(next);
    setTapped(null); setUnsure(false);
    const nn = ni + 1;
    setNi(nn);
    setStep(nn >= batch.items.length ? 'ready' : 'decide');
    window.setTimeout(() => popEl(trayEls.current[ni], calm, 'thud'), 0);
    if (!d.approve) actor.surprise(900); else actor.hold('thinking');
  };
  const approve = () => { if (step === 'decide') record({ approve: true }); };
  const startFix = () => { if (step === 'decide') setStep(item.fault?.word || !passport ? 'word' : 'repair'); };
  const tapWord = (line: number, idx: number) => { if (step === 'word') { setTapped({ line, idx }); setStep('repair'); } };
  const pickFix = (fix: string) => { if (step === 'repair') record({ approve: false, tapped: tapped ?? undefined, fix }); };

  const fileBatch = () => {
    if (step !== 'ready') return;
    setStep('reveal');
    const wrong = mine.filter((f) => !f.correct);
    if (!returned) mine.forEach((f) => { if (f.correct) firstOk.current++; else mistakes.current.push(docText(f.item).slice(0, 90)); });
    if (wrong.length === 0) actor.hold('happy', 'cheer'); else actor.hold('curious', 'nod');
    mine.forEach((f, k) => {
      if (!f.correct) return;
      window.setTimeout(() => { fx.burstAt(rowEls.current[k], 'gold'); fx.floatAt(rowEls.current[k], '+10', 'gold'); popEl(rowEls.current[k], calm, 'pop'); }, calm ? 0 : 260 + k * 240);
    });
    if (wrong.length === 0 && !returned) window.setTimeout(() => fx.burstAt(rowEls.current[1], 'teal'), calm ? 0 : 900);
  };

  const finish = () => {
    if (reported.current) return;
    reported.current = true;
    fx.confetti(); actor.hold('happy', 'cheer');
    setStep('done');
    onDone({ won: true, score: firstOk.current * 10 + (scene.finale ? 10 : 0), mistakes: mistakes.current });
  };
  const afterReveal = () => {
    if (step !== 'reveal') return;
    if (bi < batches.length - 1) { setBi(bi + 1); setNi(0); setStep('decide'); actor.hold('thinking'); return; }
    if (!returned) {
      const wrongIds = filed.slice(0, realCount).flatMap((arr) => arr.filter((f) => !f.correct).map((f) => f.item.id));
      const back = returnedBatch(scene.batches, wrongIds);
      if (back.length) {
        setBatches([...scene.batches, { title: t('ap.inReturned', 'Returned to your desk'), items: back }]);
        setFiled((f) => [...f, []]); setBi(realCount); setNi(0); setStep('decide'); actor.hold('thinking');
        return;
      }
    }
    if (scene.finale) { setStep('finale'); actor.hold('thinking'); } else finish();
  };
  const checkFinale = () => {
    if (!scene.finale || finaleOk) return;
    if (accepts(scene.finale.accept, typed)) { setFinaleOk(true); fx.burstAt(rowEls.current[0], 'gold'); fx.floatAt(rowEls.current[0], '+10', 'gold'); finish(); }
    else { setTypedTries((n) => n + 1); actor.flinch(); popEl(rowEls.current[0], calm, 'wobble'); if (!mistakes.current.includes(scene.finale.frame)) mistakes.current.push(scene.finale.frame); }
  };

  // pins: one per document, in batches of three
  const pinState = (b: number, n: number): 'pending' | 'good' | 'redo' | 'now' => {
    const f = filed[b]?.[n];
    const revealed = b < bi || (b === bi && (step === 'reveal' || step === 'finale' || step === 'done'));
    if (!f || !revealed) return b === bi && n === ni && step !== 'ready' && step !== 'reveal' ? 'now' : 'pending';
    return f.correct ? 'good' : 'redo';
  };
  const rb = useRef<HTMLElement>(null);
  const [bookOpen, setBookOpen] = useState(true);
  useEffect(() => { const w = rb.current?.closest('.av-root')?.getBoundingClientRect().width ?? 1000; if (w && w < 640) setBookOpen(false); }, []);

  const menu = menuOf(item);
  const word = item.fault?.word;
  const tappedText = tapped ? tokenize(item.doc)[tapped.line]?.[tapped.idx]?.text.replace(/[.,!?;:]/g, '') : undefined;
  const sureLabel = t('ap.inNotSure', 'Not sure');
  const lookClass = `av-inspect av-in-${scene.look}`;

  return (
    <div className={`av-game ${lookClass}`} data-testid="av-inspect" data-look={scene.look} data-step={step} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={step === 'reveal' && mine.length > 0 && mine.every((f) => f.correct)} tone="gold" />
      <Cast who={scene.chief} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-in-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{returned ? t('ap.inReturned', 'Returned to your desk') : t('ap.inBatchN', 'Batch {{n}} of {{m}}', { n: bi + 1, m: realCount })}</span>
          <ol className="av-in-pins" aria-label={t('ap.inCaseMap', 'Case map')}>
            {scene.batches.map((b, k) => (
              <li key={k} data-here={k === bi || undefined}>
                {b.items.map((_, n) => <i key={n} data-s={pinState(k, n)} />)}
              </li>
            ))}
          </ol>
          <Badge who={scene.chief} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <div className="av-in-desk">
          <aside className="av-rulebook" ref={rb} data-open={bookOpen} aria-label={t('ap.inRulebook', 'Rulebook')}>
            <button type="button" className="av-rb-head" aria-expanded={bookOpen} onClick={() => setBookOpen((o) => !o)}><span>{t('ap.inRulebook', 'Rulebook')}</span><i aria-hidden="true">{bookOpen ? '–' : '+'}</i></button>
            <ol>
              {rulesNow.map((r) => (
                <li key={r.id} data-new={(r.fromBatch ?? 0) === bi && bi > 0 || undefined}>
                  <b>{r.title}</b>
                  <span>{r.text}</span>
                  {r.example && <em>{r.example}</em>}
                  <button type="button" className="av-rb-say" aria-label={t('ap.listen', 'Listen')} onClick={() => void sayLine({ who: scene.chief, text: r.text }, artBase)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7" /></svg></button>
                </li>
              ))}
            </ol>
          </aside>

          <section className="av-in-table" aria-live="polite">
            {(step === 'decide' || step === 'word' || step === 'repair') && (
              <div className="av-in-work" key={item.id}>
                <Doc item={item} look={scene.look} step={step} tapped={tapped} onTap={tapWord} />
                {step === 'decide' && (
                  <p className="av-in-prompt">{passport ? t('ap.inPromptPassport', 'Do the stamps match what the traveller says?') : t('ap.inPrompt', 'Does this follow the rules?')}</p>
                )}
                {step === 'word' && <p className="av-in-prompt" role="status">{t('ap.inTapWord', 'Tap the word that breaks a rule.')}</p>}
                {step === 'repair' && (
                  <div className="av-in-menu" role="group" aria-label={passport ? t('ap.inPickReason', 'Why do you send it back? Pick the reason.') : t('ap.inPickRepair', 'Pick the repair for “{{word}}”.', { word: tappedText ?? word ?? '' })}>
                    <p className="av-in-prompt">{passport ? t('ap.inPickReason', 'Why do you send it back? Pick the reason.') : t('ap.inPickRepair', 'Pick the repair for “{{word}}”.', { word: tappedText ?? word ?? '' })}</p>
                    {menu.map((m, n) => <button key={m} type="button" className="av-opt av-in-fix" style={{ ['--i' as string]: n }} onClick={() => pickFix(m)}>{m}</button>)}
                  </div>
                )}
                {step === 'decide' && (
                  <div className="av-in-actions">
                    <button type="button" className="av-stampbtn" data-kind="ok" onClick={approve}><i aria-hidden="true">✓</i>{passport ? t('ap.inClear', 'Clear') : t('ap.inApprove', 'Approve')}</button>
                    <button type="button" className="av-stampbtn" data-kind="fix" onClick={startFix}><i aria-hidden="true">✎</i>{passport ? t('ap.inSendBack', 'Send back') : t('ap.inFix', 'Fix it')}</button>
                    <button type="button" className="av-flagbtn" aria-pressed={unsure} data-on={unsure || undefined} onClick={() => setUnsure((u) => !u)}>{sureLabel}</button>
                  </div>
                )}
              </div>
            )}

            {(step === 'decide' || step === 'word' || step === 'repair' || step === 'ready') && (
              <div className="av-in-tray" aria-label={t('ap.inTray', 'On your desk')}>
                {batch.items.map((_, n) => {
                  const f = mine[n];
                  return (
                    <span key={n} ref={(el) => { trayEls.current[n] = el; }} className="av-in-slot" data-full={!!f || undefined} data-fix={(f && !f.d.approve) || undefined}>
                      {f ? <><small>{(f.item.from ?? '').split(' ')[0] || `#${n + 1}`}</small><b>{f.d.approve ? (passport ? t('ap.inCleared', 'CLEARED') : t('ap.inApproved', 'APPROVED')) : (passport ? t('ap.inSent', 'SENT BACK') : t('ap.inFixed', 'FIXED'))}</b></> : <small>{n + 1}</small>}
                    </span>
                  );
                })}
              </div>
            )}

            {step === 'ready' && (
              <div className="av-in-ready">
                <p>{t('ap.inReady', 'Three on your desk. File the batch to see what the chief finds.')}</p>
                <button type="button" className="av-btn" data-kind="go" onClick={fileBatch}>{t('ap.inFile', 'File the batch')}</button>
              </div>
            )}

            {step === 'reveal' && (
              <div className="av-in-case" data-testid="av-in-case">
                <h3>{t('ap.inFiled', 'Filed. Here is what the chief found.')}</h3>
                <ul>
                  {mine.map((f, k) => {
                    const fault = f.item.fault;
                    const text = f.d.approve ? t('ap.inYouApproved', 'You approved it.')
                      : f.d.fix ? (passport ? t('ap.inYouSent', 'You sent it back: {{reason}}', { reason: f.d.fix }) : t('ap.inYouFixed', 'You changed “{{from}}” to “{{to}}”.', { from: f.d.tapped ? (tokenize(f.item.doc)[f.d.tapped.line]?.[f.d.tapped.idx]?.text.replace(/[.,!?;:]/g, '') ?? '') : '', to: f.d.fix })) : '';
                    const lead = f.verdict === 'ok' ? '' : f.verdict === 'missed' ? t('ap.inMissed', 'There was a problem here.') : f.verdict === 'false-alarm' ? t('ap.inFalse', 'Nothing was wrong here.') : f.verdict === 'wrong-word' ? t('ap.inWrongWord', 'The problem is somewhere else.') : t('ap.inWrongFix', 'Right place, different repair.');
                    const why = fault ? fault.why : f.item.okWhy;
                    const span = new Set(faultTokens(f.item).map((x) => `${x.line}:${x.idx}`));
                    return (
                      <li key={f.item.id} ref={(el) => { rowEls.current[k] = el; }} data-ok={f.correct || undefined} style={{ ['--i' as string]: k }}>
                        <span className="av-in-mark" aria-label={f.correct ? t('ap.inOk', 'Correct') : t('ap.inLook', 'Look again')}>{f.correct ? '✓' : '↺'}</span>
                        <div>
                          <p className="av-in-line">{tokenize(f.item.doc).flat().map((tk) => <span key={`${tk.line}-${tk.idx}`} className="av-tok" data-fault={span.has(`${tk.line}:${tk.idx}`) || undefined}>{tk.text} </span>)}</p>
                          <p className="av-in-you">{text}{f.unsure && <small> · {sureLabel}</small>}</p>
                          <p className="av-in-why">{lead && <b>{lead} </b>}{why}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button type="button" className="av-btn" data-kind="go" onClick={afterReveal}>{bi < batches.length - 1 || (!returned && mine.some((f) => !f.correct)) ? `${t('ap.inNextBatch', 'Next batch')} ›` : scene.finale ? `${t('ap.next', 'Next')} ›` : t('ap.finish', 'Finish the lesson')}</button>
              </div>
            )}

            {step === 'finale' && scene.finale && (
              <div className="av-in-finale" ref={(el) => { rowEls.current[0] = el; }}>
                <h3>{t('ap.inFinale', 'Now write your own')}</h3>
                <p className="av-in-prompt">{scene.finale.prompt}</p>
                <input type="text" value={typed} placeholder={scene.finale.frame} aria-label={scene.finale.frame} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') checkFinale(); }} />
                <button type="button" className="av-btn" data-kind="go" onClick={checkFinale}>{t('ap.check', 'Check')}</button>
                {typedTries > 0 && <p className="av-note">{scene.finale.hint}{typedTries > 1 ? ` · ${scene.finale.sample}` : ''}</p>}
              </div>
            )}

            {step === 'done' && (
              <div className="av-in-done">
                <h3>{t('ap.inCaseDone', 'Case file closed')}</h3>
                <Reward score={firstOk.current * 10 + (scene.finale ? 10 : 0)} stars={starsFor(firstOk.current, total)} gem={mistakes.current.length === 0} calm={calm} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export const inspectScene: SceneModule<InspectScene> = {
  view: InspectView,
  spoken: (s) => [{ who: s.chief, text: s.intro }, ...s.rules.map((r) => ({ who: s.chief, text: r.text }))],
  validate: (s) => {
    const p: string[] = [];
    if (!['post', 'postcard', 'passport'].includes(s.look)) p.push(`${s.id}: inspect look must be post, postcard or passport`);
    if (!s.rules?.length) p.push(`${s.id}: inspect needs a rulebook`);
    const ruleIds = new Set(s.rules?.map((r) => r.id));
    if ((s.batches?.length ?? 0) < 2) p.push(`${s.id}: inspect needs 2+ batches`);
    const ids = new Set<string>();
    s.batches?.forEach((b, bi) => {
      if (b.items.length !== 3) p.push(`${s.id}: batch ${bi + 1} must hold exactly 3 documents (batch of three)`);
      b.items.forEach((it) => {
        if (ids.has(it.id)) p.push(`${s.id}: duplicate document id ${it.id}`);
        ids.add(it.id);
        const check = (x: Omit<InspectItem, 'retry'>, label: string) => {
          if (!x.doc?.length) p.push(`${s.id}: ${label} has no text`);
          if (x.fault) {
            const f = x.fault;
            if (!ruleIds.has(f.ruleId)) p.push(`${s.id}: ${label} cites rule ${f.ruleId}, which is not in the rulebook`);
            if (!f.fixes.includes(f.correct)) p.push(`${s.id}: ${label}: the right repair is not among the options`);
            if (f.fixes.length < 2 || f.fixes.length > 4) p.push(`${s.id}: ${label} needs 2-4 repair options`);
            if (s.look !== 'passport' && !f.word) p.push(`${s.id}: ${label} needs the faulty word (the student taps it)`);
            if (f.word && faultTokens(x).length === 0) p.push(`${s.id}: ${label}: the faulty word "${f.word}" is not in the text`);
            if (!f.why?.trim()) p.push(`${s.id}: ${label} needs a why`);
            if (f.word && f.word.split(/\s+/).map(stripWord).join(' ') === stripWord(f.correct)) p.push(`${s.id}: ${label}: the repair equals the faulty word`);
          } else {
            if (!x.okWhy?.trim()) p.push(`${s.id}: ${label} is fine, so it needs an okWhy`);
            if ((x.okFixes?.length ?? 0) < 2) p.push(`${s.id}: ${label} is fine, so it needs 2+ okFixes (a wrong menu for a false alarm)`);
          }
          if (s.look === 'passport' && x.prop?.kind !== 'stamps') p.push(`${s.id}: ${label}: the passport look needs a stamps prop`);
        };
        check(it, it.id);
        if (it.retry) { check(it.retry, `${it.id} (retry)`); if (!!it.retry.fault !== !!it.fault) p.push(`${s.id}: the retry of ${it.id} must be the same kind (fault or fine)`); }
      });
    });
    const all = s.batches?.flatMap((b) => b.items) ?? [];
    if (all.length && !all.some((i) => i.fault)) p.push(`${s.id}: no document has a fault`);
    if (all.length && !all.some((i) => !i.fault)) p.push(`${s.id}: no document is fine (the student could always press FIX)`);
    if (s.finale) {
      try { if (!accepts(s.finale.accept, s.finale.sample)) p.push(`${s.id}: the finale sample is not accepted by its own patterns`); } catch { p.push(`${s.id}: a finale pattern is not a valid regex`); }
    }
    return p;
  },
};
