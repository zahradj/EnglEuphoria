import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';
import { decide, decisionText, speakingShare, starsFor } from '../../levelTestScoring';
import { saveAssessmentResult } from '@/services/playgroundAssessmentService';
import { getHomeworkQuest } from '@/content/homework-quests/registry';
import { practisePackId, practiseScopeForTest } from '@/content/homework-quests/practise-again';

/* ---------- Level Test (owner-approved plan 2026-10-12, docs/assessment/prea1-assessment-plan.md) ----------
 * The Pre-A1 Final Test ("Explorer Graduation") and Checkpoint 1 ("Halfway Explorer"). Shaped like Cambridge Pre A1
 * Starters (listening, early reading, speaking; each reported as 1–5 stars like the YLE shields), made calm for a 4–7
 * year old: one spoken question at a time, picture / letter answers, 🔊 replays as often as needed, no clock, no lives,
 * one try per question (a miss shows and says the right answer kindly). Sections: listening — words, listening —
 * sentences, sounds & blending (recorded letter sounds, then "What word is it?"), and speaking, which the TEACHER rates
 * live (0–3 per prompt) on their own screen. The child always ends on a certificate; the stars, the decision (Ready for
 * A1 / Almost / Not yet, or Go on / with support / Review first) and the Save button are for the teacher only. Saving
 * stores the evidence in playground_assessment_results and, on the final test, can file the usual level change request
 * for the admin to approve — the test never moves a student by itself. */

type LevelTest = Extract<Scene, { kind: 'level-test' }>;
type Item = LevelTest['sections'][number]['items'][number];

export function LevelTestScene({ scene, onWin, onNext, sync, role, roomId }: {
  scene: LevelTest; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync; role?: 'teacher' | 'student'; roomId?: string;
}) {
  const reduce = useReducedMotion();
  const flat = useMemo(() => scene.sections.flatMap((s, si) => s.items.map((it, ii) => ({ si, ii, it }))), [scene.sections]);
  const offsets = useMemo(() => scene.sections.map((_, si) => scene.sections.slice(0, si).reduce((a, s) => a + s.items.length, 0)), [scene.sections]);
  const [state, setState] = useSyncedState(sync, { phase: 0, i: 0, started: false, chosen: flat.map(() => -1), gemDone: false });
  const nSec = scene.sections.length;
  const phase = Math.max(0, Math.min(nSec + 1, Number(state.phase) || 0)); // sections…, speaking (= nSec), done (= nSec + 1)
  const chosen = useMemo(() => flat.map((_, k) => (typeof state.chosen[k] === 'number' ? state.chosen[k] : -1)), [state.chosen, flat]);
  const sec = phase < nSec ? scene.sections[phase] : undefined;
  const item: Item | undefined = sec ? sec.items[Math.min(state.i, sec.items.length - 1)] : undefined;
  const flatIdx = sec ? offsets[phase] + Math.min(state.i, sec.items.length - 1) : -1;
  const isTeacherView = role !== 'student'; // the teacher, or a solo / preview screen
  const busy = useRef(false);
  const [picked, setPicked] = useState(-1);
  const [rubric, setRubric] = useState<number[]>(() => scene.speaking.prompts.map(() => -1));
  const [requestLevel, setRequestLevel] = useState(true);
  const [note, setNote] = useState('');
  // Practise again packs the teacher will send (section key → on/off); default = every part under 4 stars
  const [practiseOff, setPractiseOff] = useState<Record<string, boolean>>({});
  const [save, setSave] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; msg?: string }>({ status: 'idle' });
  const [bursts, fire] = useBursts();

  const playItem = async (it: Item) => {
    if (it.blend?.length) {
      for (const l of it.blend) { await playLetterPhonic(l); await new Promise((r) => window.setTimeout(r, 350)); }
    }
    cueSpeak(it.ask, scene.who);
  };

  // section intros, then each question is said
  useEffect(() => {
    busy.current = false; setPicked(-1);
    const t = window.setTimeout(() => {
      if (phase === nSec + 1) cueSpeak(scene.certificate.line, scene.who);
      else if (phase === nSec) cueSpeak(scene.speaking.intro, scene.who);
      else if (sec && !state.started) cueSpeak(sec.intro, scene.who);
      else if (item) void playItem(item);
    }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, state.i, state.started, scene.id]);

  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, reduce ? 0 : ms));
  const choose = async (k: number) => {
    if (!sec || !item || busy.current || flatIdx < 0) return;
    busy.current = true; setPicked(k);
    const right = k === item.answer;
    if (right) { sfx.match(); fire(50, 55, 'stars'); await sayWithin(item.reply, scene.who, 2800); }
    else { sfx.pop(); await sayWithin(`Good try! ${item.reply}`, scene.who, 3200); }
    await wait(400);
    const last = state.i + 1 >= sec.items.length;
    setState((s) => {
      const ch = flat.map((_, q) => (q === flatIdx ? k : typeof s.chosen[q] === 'number' ? s.chosen[q] : -1));
      return last ? { ...s, chosen: ch, phase: phase + 1, i: 0, started: false } : { ...s, chosen: ch, i: s.i + 1 };
    });
  };
  const finishSpeaking = () => {
    if (phase !== nSec) return;
    sfx.whoop(); fire(50, 40, 'confetti');
    if (!state.gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, phase: nSec + 1, gemDone: true }));
  };

  // ---- results (teacher) ----
  const sectionScores = scene.sections.map((s, si) => {
    const idx = s.items.map((_, ii) => offsets[si] + ii);
    const correct = idx.filter((q) => chosen[q] === flat[q].it.answer).length;
    return { key: s.key, label: s.label, correct, total: s.items.length, stars: starsFor(s.items.length ? correct / s.items.length : 0) };
  });
  const spkShare = speakingShare(rubric);
  const spk = { key: scene.speaking.key, label: scene.speaking.label, correct: rubric.filter((r) => r >= 0).reduce((a, b) => a + b, 0), total: rubric.length * 3, stars: starsFor(spkShare) };
  const all = [...sectionScores, spk];
  const starsTotal = all.reduce((a, s) => a + s.stars, 0);
  const decision = decide(scene.mode, all, scene.strongKeys ?? []);
  const rubricDone = rubric.every((r) => r >= 0);
  const practiseScope = practiseScopeForTest(scene.testKey);
  const practiseOptions = practiseScope
    ? all.filter((s) => s.stars < 4).map((s) => ({ key: s.key, label: s.label, quest: getHomeworkQuest(practisePackId(practiseScope, s.key)) }))
      .filter((p): p is { key: string; label: string; quest: NonNullable<typeof p.quest> } => !!p.quest)
    : [];
  const practiseChosen = practiseOptions.filter((p) => !practiseOff[p.key]);
  const missed = flat.filter((f, q) => chosen[q] >= 0 && chosen[q] !== f.it.answer).map((f) => f.it.options[f.it.answer].label);

  const doSave = async () => {
    if (!roomId) { setSave({ status: 'error', msg: 'Preview only — open the test in a class to save it for a student.' }); return; }
    setSave({ status: 'saving' });
    const res = await saveAssessmentResult({
      bookingId: roomId, testKey: scene.testKey, level: scene.level,
      sections: all.map(({ key, label, correct, total, stars }) => ({ key, label, correct, total, stars })),
      items: flat.map((f, q) => ({ section: scene.sections[f.si].key, ask: f.it.ask, answer: f.it.options[f.it.answer].label, chosen: chosen[q] >= 0 ? f.it.options[chosen[q]].label : null, correct: chosen[q] === f.it.answer })),
      rubric: scene.speaking.prompts.map((p, k) => ({ prompt: p.prompt, score: rubric[k] })),
      starsTotal, starsMax: all.length * 5, decision, note,
      requestLevel: scene.mode === 'final' && decision === 'ready' && requestLevel && scene.nextLevel
        ? { level: scene.nextLevel, reason: `${scene.title}: ${all.map((s) => `${s.label} ${s.stars}/5`).join(', ')} — ${starsTotal}/${all.length * 5} stars. Ready for ${scene.nextLevel}.${note.trim() ? ` ${note.trim()}` : ''}` }
        : undefined,
      practise: practiseChosen.map((p) => ({ questId: p.quest.id, title: `${p.quest.title} · ${p.quest.subtitle}` })),
    });
    if (res.ok) {
      const hw = res.homeworkSent ? ` ${res.homeworkSent} Practise again homework${res.homeworkSent > 1 ? 's' : ''} sent.` : '';
      setSave({ status: 'saved', msg: (res.requestId ? 'Saved. The level change request is waiting for the admin.' : 'Saved.') + hw });
    }
    else setSave({ status: 'error', msg: (res as { error: string }).error });
  };

  const optW = item && item.options.length > 3 ? 'min(18vh, 13vw)' : 'min(24vh, 17vw)';
  const progress = phase >= nSec ? 1 : (offsets[phase] + state.i) / Math.max(1, flat.length);

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-sky-950/30 via-transparent to-sky-950/35" />
      {phase === nSec + 1 && <Confetti count={80} />}

      {/* path of the four parts */}
      {phase <= nSec && (
        <div className="pointer-events-none absolute left-1/2 top-[12%] z-30 flex -translate-x-1/2 items-center gap-[0.8vw] rounded-full bg-indigo-950/55 px-[1.2vw] py-[0.6vh] shadow-lg">
          {[...scene.sections.map((s) => ({ icon: s.icon, label: s.label })), { icon: scene.speaking.icon, label: scene.speaking.label }].map((p, k) => (
            <span key={k} className={`flex items-center gap-1 rounded-full px-2 py-[0.3vh] font-black ${k < phase ? 'bg-lime-500 text-white' : k === phase ? 'bg-amber-400 text-indigo-950' : 'bg-white/15 text-white/70'}`} style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>
              {k < phase ? '✓' : p.icon} {p.label}
            </span>
          ))}
          <motion.img src={scene.hero} alt="" draggable={false} className="h-[6vh] w-[6vh] object-contain" animate={reduce ? {} : { y: [0, -4, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
        </div>
      )}
      {phase < nSec && (
        <div className="pointer-events-none absolute left-1/2 top-[19%] z-30 h-[1vh] w-[40%] -translate-x-1/2 overflow-hidden rounded-full bg-white/30">
          <motion.div className="h-full bg-gradient-to-r from-yellow-300 to-orange-400" animate={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {/* a section's intro card */}
      {sec && !state.started && (
        <motion.div key={`intro-${phase}`} className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-[2vh]" initial={reduce ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="rounded-[3vh] border-[0.6vh] border-amber-200 bg-gradient-to-b from-indigo-500 to-violet-700 px-[4vw] py-[3vh] text-center shadow-2xl">
            <div style={{ fontSize: 'min(10vh, 7vw)' }}>{sec.icon}</div>
            <div className="font-black text-yellow-200" style={{ fontSize: 'min(3vh, 2vw)' }}>Part {phase + 1}</div>
            <div className="font-black text-white" style={{ ...THICK_WORDS, fontSize: 'min(5.5vh, 3.6vw)' }}>{sec.intro}</div>
          </div>
          <button type="button" onClick={() => setState((s) => ({ ...s, started: true, i: 0 }))} className={`${CLAY_BUTTON} px-10 py-3 text-2xl`}>Start ▶</button>
        </motion.div>
      )}

      {/* a question */}
      {sec && state.started && item && (
        <>
          <div className="absolute inset-x-0 top-[24%] z-30 flex items-center justify-center gap-3 px-14">
            <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>{item.blend?.length ? '👂 What word is it?' : item.ask}</span>
            <button type="button" aria-label="Hear it again" onClick={() => { void playItem(item); }} className="rounded-full bg-white/90 px-3 py-1 text-[3vh] shadow-lg active:scale-95">🔊</button>
          </div>
          <div className="absolute inset-x-0 top-[38%] z-20 flex justify-center gap-[2.5vw]">
            {item.options.map((o, k) => {
              const isRight = k === item.answer;
              const show = picked >= 0;
              return (
                <motion.button key={`${phase}-${state.i}-${k}`} type="button" aria-label={o.label} onClick={() => { void choose(k); }} disabled={picked >= 0}
                  className={`relative flex flex-col items-center justify-center rounded-[3vh] border-[0.7vh] p-[1vh] shadow-[0_1vh_0_rgba(0,0,0,0.25),0_2vh_3vh_rgba(0,0,0,0.3)] ${show && isRight ? 'border-lime-200 bg-gradient-to-b from-lime-300 to-green-500' : show && k === picked ? 'border-rose-200 bg-gradient-to-b from-rose-300 to-rose-500' : 'border-sky-200 bg-gradient-to-b from-sky-300 to-indigo-500'}`}
                  style={{ width: optW, height: optW }}
                  initial={reduce ? false : { y: 60, opacity: 0 }}
                  animate={show && isRight && !reduce ? { y: [0, -16, 0], opacity: 1 } : { y: 0, opacity: show && !isRight && k !== picked ? 0.45 : 1 }}
                  transition={{ delay: show ? 0 : reduce ? 0 : 0.1 + k * 0.08, type: 'spring', stiffness: 160, damping: 14 }} whileTap={{ scale: 0.93 }}>
                  {o.img ? <img src={o.img} alt="" draggable={false} className="h-[80%] w-[80%] object-contain drop-shadow-[0_0.6vh_0.5vh_rgba(0,0,0,0.3)]" />
                    : <span className="font-black text-white" style={{ ...THICK_WORDS, fontSize: 'min(12vh, 8vw)', lineHeight: 1 }}>{o.text ?? o.label}</span>}
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {/* speaking: picture prompts for both; the 0–3 rubric only on the teacher's screen */}
      {phase === nSec && (
        <div className="absolute inset-x-0 top-[20%] z-30 flex flex-col items-center gap-[1.6vh] px-[3%]">
          <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'min(5vh, 3.4vw)' }}>🎤 {isTeacherView ? 'Ask, listen, and tap a score for each card' : 'Talk with your teacher!'}</span>
          <div className="flex flex-wrap justify-center gap-[1.4vw]">
            {scene.speaking.prompts.map((p, k) => (
              <div key={k} className="flex w-[min(24vh,17vw)] flex-col items-center gap-[0.6vh] rounded-[2.4vh] border-[0.5vh] border-amber-200 bg-gradient-to-b from-amber-50 to-orange-100 p-[1vh] shadow-xl">
                <img src={p.img} alt="" draggable={false} className="h-[14vh] w-full object-contain" />
                <button type="button" onClick={() => cueSpeak(p.say, scene.who)} className="rounded-full bg-orange-500 px-2 font-black text-white shadow" style={{ fontSize: 'min(2vh, 1.4vw)' }}>🔊 {k + 1}</button>
                {isTeacherView && (
                  <>
                    <div className="text-center font-bold leading-tight text-orange-900" style={{ fontSize: 'min(1.8vh, 1.25vw)' }}>{p.prompt}</div>
                    <div className="text-center italic leading-tight text-orange-700/80" style={{ fontSize: 'min(1.6vh, 1.1vw)' }}>e.g. {p.model}</div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((n) => (
                        <button key={n} type="button" aria-label={`score ${n}`} onClick={() => setRubric((r) => r.map((v, q) => (q === k ? n : v)))}
                          className={`h-[4.2vh] w-[4.2vh] rounded-full font-black shadow ${rubric[k] === n ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`} style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{n}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {isTeacherView && <div className="rounded-full bg-indigo-950/60 px-3 font-bold text-white/90" style={{ fontSize: 'min(1.8vh, 1.25vw)' }}>0 no answer · 1 one word with help · 2 one word alone · 3 a phrase or sentence</div>}
          <button type="button" onClick={finishSpeaking} className={`${CLAY_BUTTON} px-8 py-2 text-xl`}>We're done talking ✓</button>
        </div>
      )}

      {/* the end: certificate for the child; result + save for the teacher */}
      <AnimatePresence>
        {phase === nSec + 1 && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center gap-[3vw] px-[4%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex flex-col items-center gap-[1.4vh] rounded-[3vh] border-[0.8vh] border-yellow-300 bg-gradient-to-b from-amber-50 to-yellow-100 px-[3vw] py-[3vh] shadow-2xl">
              <div className="flex items-end gap-[1.5vw]">
                <motion.img src={scene.hero} alt="" draggable={false} className="h-[22vh] w-[22vh] object-contain" initial={reduce ? false : { y: 100, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }} />
                <motion.img src={scene.medal} alt="" draggable={false} className="h-[14vh] w-[14vh] object-contain" initial={reduce ? false : { y: -160, rotate: -30 }} animate={{ y: 0, rotate: [0, 10, -6, 0] }} transition={{ delay: 0.5, type: 'spring', stiffness: 140, damping: 10 }} />
              </div>
              <div className="text-center font-black text-orange-700" style={{ fontSize: 'min(5vh, 3.4vw)' }}>{scene.certificate.title}</div>
              <div className="text-center font-bold text-orange-900/80" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>{scene.certificate.line}</div>
              {!isTeacherView && <button onClick={onNext} className={`${CLAY_BUTTON} mt-2 px-10 py-3 text-xl`}>Next ⭐</button>}
            </div>

            {isTeacherView && (
              <div className="flex w-[min(62vh,44vw)] flex-col gap-[1vh] rounded-[2.4vh] bg-white/95 p-[2vh] text-slate-800 shadow-2xl" style={{ fontSize: 'min(2vh, 1.35vw)' }}>
                <div className="font-black text-indigo-800" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>Teacher · {scene.title} result</div>
                {all.map((s) => (
                  <div key={s.key} className="flex items-center justify-between gap-2">
                    <span className="font-bold">{s.label}</span>
                    <span className="text-slate-500">{s.key === scene.speaking.key ? `${s.correct}/${s.total} pts` : `${s.correct}/${s.total}`}</span>
                    <span className="whitespace-nowrap">{'⭐'.repeat(s.stars)}{'☆'.repeat(5 - s.stars)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-[0.6vh] font-black"><span>Total</span><span>{starsTotal} / {all.length * 5} ⭐</span></div>
                {!rubricDone && (
                  <div className="rounded bg-amber-100 px-2 py-1 text-amber-900">
                    <b>Score every speaking card (0–3) to save:</b>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {scene.speaking.prompts.map((p, k) => (
                        <span key={k} className="flex items-center gap-1" title={p.prompt}>
                          <b>{k + 1}</b>
                          {[0, 1, 2, 3].map((n) => (
                            <button key={n} type="button" onClick={() => setRubric((r) => r.map((v, q) => (q === k ? n : v)))}
                              className={`h-[3vh] w-[3vh] rounded-full font-black ${rubric[k] === n ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`}>{n}</button>
                          ))}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className={`rounded-xl px-3 py-2 font-black ${decision === 'ready' || decision === 'go_on' || decision === 'unit_pass' ? 'bg-emerald-100 text-emerald-800' : decision === 'almost' || decision === 'go_on_support' || decision === 'unit_practise' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                  {decisionText(decision, scene.level).label}
                  <div className="font-semibold">{decisionText(decision, scene.level).next}</div>
                </div>
                {missed.length > 0 && <div className="text-slate-600"><b>Practise:</b> {missed.join(', ')}</div>}
                {practiseOptions.length > 0 && (
                  <div className="rounded bg-sky-50 px-2 py-1 text-sky-900">
                    <b>Send Practise again homework:</b>
                    {practiseOptions.map((p) => (
                      <label key={p.key} className="flex items-center gap-2">
                        <input type="checkbox" checked={!practiseOff[p.key]} onChange={(e) => setPractiseOff((o) => ({ ...o, [p.key]: !e.target.checked }))} />
                        {p.label} — {p.quest.title.replace('Practise again: ', '')} ({p.quest.levels.length} games)
                      </label>
                    ))}
                  </div>
                )}
                {scene.mode === 'final' && decision === 'ready' && scene.nextLevel && (
                  <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={requestLevel} onChange={(e) => setRequestLevel(e.target.checked)} /> Also send the level change request ({scene.level} → {scene.nextLevel}) to the admin</label>
                )}
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the record (optional)" className="h-[7vh] w-full resize-none rounded-lg border p-2" />
                <div className="flex items-center gap-2">
                  <button type="button" disabled={save.status === 'saving' || save.status === 'saved' || !rubricDone} onClick={() => { void doSave(); }}
                    className="rounded-full bg-indigo-600 px-4 py-2 font-black text-white shadow disabled:opacity-50">{save.status === 'saving' ? 'Saving…' : save.status === 'saved' ? 'Saved ✓' : 'Confirm & save result'}</button>
                  <button type="button" onClick={onNext} className="rounded-full bg-orange-500 px-4 py-2 font-black text-white shadow">Next ⭐</button>
                </div>
                {save.msg && <div className={save.status === 'error' ? 'font-bold text-rose-700' : 'font-bold text-emerald-700'}>{save.msg}</div>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Bursts items={bursts} />
    </div>
  );
}
