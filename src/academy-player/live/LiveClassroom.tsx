// Live one-to-one classroom (Academy only): ONE student and ONE teacher on a shared stage.
// The teacher sets the pace (the student says "I am ready", the teacher moves on); the student does the activities.
// This preview shows both people on one screen. In a real class each person sees only their own side, and `PlayerEvent`s
// (engine.ts, ordered by `rev`) travel over the live channel; that channel is not built yet.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AcademyPlayer, type LiveSnapshot, type PlayerController, type PlayerSignal } from '../AcademyPlayer';
import type { SceneScript } from '../scriptTypes';
import type { SessionPlan } from '../../curriculum/academy/sessionPlan';

type View = 'both' | 'student' | 'teacher';

export interface LiveClassroomProps {
  script: SceneScript;
  plan: SessionPlan;
  artBase?: string;
  theme?: 'explorer' | 'studio';
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function useWide() {
  const [wide, setWide] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 980 : true));
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 980);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return wide;
}

export function LiveClassroom({ script, plan, artBase, theme = 'studio' }: LiveClassroomProps) {
  const wide = useWide();
  const [view, setView] = useState<View>('both');
  const shown: View = wide ? view : view === 'both' ? 'student' : view;
  const ctl = useRef<PlayerController | null>(null);
  const [snap, setSnap] = useState<LiveSnapshot | null>(null);
  const [minutesAsked, setMinutesAsked] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [segStart, setSegStart] = useState(0);
  const segRef = useRef(-1);

  // wall-clock for the teacher only (the student never sees a countdown)
  useEffect(() => {
    if (!snap?.started) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [snap?.started]);
  const seg = snap?.state.stage.segment ?? 0;
  useEffect(() => {
    if (segRef.current !== seg) {
      segRef.current = seg;
      setSegStart(elapsed);
    }
  }, [seg, elapsed]);

  const onSignal = (s: PlayerSignal) => {
    if (s.type === 'minute') setMinutesAsked((m) => m + 1);
  };

  const part = plan.segments[seg];
  const beat = snap ? script.beats[snap.state.beatIndex] : undefined;
  const right = snap ? snap.state.answers.filter((a) => a.correct).length : 0;
  const tries = snap ? snap.state.answers.length : 0;
  const inPart = elapsed - segStart;
  const over = part ? inPart > part.minutes * 60 : false;
  const status = !snap?.started ? 'Not started' : snap.resting ? 'Resting (asked for a minute)' : snap.waiting ? 'Ready — waiting for you' : 'Working on the activity';
  const spoken = useMemo(() => (beat && beat.t === 'say' ? `${beat.who === 'narrator' ? '' : beat.who + ': '}${beat.text}` : null), [beat]);

  return (
    <div className="lc-root" data-view={shown}>
      <header className="lc-bar">
        <div className="lc-title"><span className="lc-live" aria-hidden="true" />Live · one-to-one <b>{script.title}</b></div>
        {wide && (
          <div className="lc-seg" role="group" aria-label="Preview view">
            {(['both', 'student', 'teacher'] as View[]).map((v) => (
              <button key={v} type="button" className="lc-segbtn" aria-pressed={view === v} onClick={() => setView(v)}>{v === 'both' ? 'Both' : v === 'student' ? 'Student' : 'Teacher'}</button>
            ))}
          </div>
        )}
        {!wide && (
          <div className="lc-seg" role="group" aria-label="Preview view">
            {(['student', 'teacher'] as View[]).map((v) => (
              <button key={v} type="button" className="lc-segbtn" aria-pressed={shown === v} onClick={() => setView(v)}>{v === 'student' ? 'Student' : 'Teacher'}</button>
            ))}
          </div>
        )}
      </header>

      <div className="lc-body">
        <section className="lc-student" hidden={shown === 'teacher'} aria-label="Student screen">
          <div className="lc-tiles" aria-hidden="true">
            <div className="lc-tile lc-tile-teacher"><span className="lc-face">T</span><span className="lc-tile-name">Your teacher</span><span className="lc-cam">live video</span></div>
            <div className="lc-tile lc-tile-me"><span className="lc-face lc-face-me">You</span></div>
          </div>
          <AcademyPlayer script={script} theme={theme} artBase={artBase} live controllerRef={ctl} onState={setSnap} onSignal={onSignal} />
        </section>

        <aside className="lc-teacher" hidden={shown === 'student'} aria-label="Teacher console">
          <div className="lc-note">Only the teacher sees this panel.</div>

          {!snap?.started ? (
            <button type="button" className="lc-go" onClick={() => ctl.current?.start()}>Start the lesson ▸</button>
          ) : (
            <>
              <div className="lc-card">
                <div className="lc-row"><b>Part {seg + 1} of {plan.segments.length} · {part?.name}</b><span className="lc-time" data-over={over}>{mmss(inPart)} / {part?.minutes}:00</span></div>
                <div className="lc-bar2"><i style={{ width: `${Math.min(100, (inPart / ((part?.minutes ?? 1) * 60)) * 100)}%` }} data-over={over} /></div>
                <div className="lc-row lc-sub"><span>Lesson time {mmss(elapsed)} of 60:00</span><span>{part?.core ? 'core part' : 'flex part'}</span></div>
              </div>

              <div className="lc-card" data-ready={snap.waiting}>
                <div className="lc-row"><b>Student</b><span className="lc-chip" data-on={snap.waiting}>{status}</span></div>
                <div className="lc-stats">
                  <span>Answers <b>{right}/{tries}</b></span>
                  <span>Hints <b>{snap.hintTier}</b></span>
                  <span>Minutes asked <b>{minutesAsked}</b></span>
                </div>
              </div>

              <div className="lc-controls">
                <button type="button" className="lc-btn" onClick={() => ctl.current?.go({ type: 'back' })}>◀ Back</button>
                <button type="button" className="lc-btn lc-btn-main" data-pulse={snap.waiting} onClick={() => ctl.current?.go({ type: 'next' })}>Next ▸</button>
                <button type="button" className="lc-btn" onClick={() => ctl.current?.hint(snap.hintTier + 1)} disabled={snap.hintTier >= 3}>Give a hint</button>
                <label className="lc-jump">Jump to
                  <select value={seg} onChange={(e) => ctl.current?.go({ type: 'goto', segment: Number(e.target.value) })}>
                    {plan.segments.map((p, i) => <option key={p.name} value={i}>{i + 1}. {p.name} ({p.minutes} min)</option>)}
                  </select>
                </label>
              </div>

              {spoken && <div className="lc-card"><div className="lc-sub">On the student's screen</div><p className="lc-say">{spoken}</p></div>}
              {beat && beat.t !== 'say' && <div className="lc-card"><div className="lc-sub">On the student's screen</div><p className="lc-say">Activity: {beat.t}{'prompt' in beat && beat.prompt ? ` — ${beat.prompt}` : ''}</p></div>}

              {part && (
                <div className="lc-card">
                  <div className="lc-sub">What you do</div>
                  <ul>{part.teacher.map((t) => <li key={t}>{t}</li>)}</ul>
                  <div className="lc-sub">What the student does</div>
                  <ul>{part.student.map((t) => <li key={t}>{t}</li>)}</ul>
                  <div className="lc-sub">Comfort</div>
                  <p className="lc-chips">{part.comfort.map((c) => <span key={c} className="lc-chip">{c}</span>)}</p>
                  {part.name === 'Mission' && <p className="lc-sub">Chill track: {plan.chillTrack}</p>}
                </div>
              )}
              <div className="lc-card lc-sub">Wait 5–7 seconds after a question. Log errors silently and end on a success.</div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default LiveClassroom;
