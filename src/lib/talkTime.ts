/**
 * Talking-time helpers: the "is someone speaking right now?" gate used by the classroom meter, and the
 * traffic-light thresholds the teacher scorecard uses.
 *
 * Guidance in ESL teaching is that learners should speak most of the lesson (commonly cited: ~70% student /
 * ~30% teacher for conversation, less for true beginners). The platform's rule is simply that the student
 * should talk MORE than the teacher, so 50% is the pass line and 60%+ is great.
 */

export const TALK_TARGET_PCT = 50;

export type TalkStatus = 'great' | 'good' | 'watch' | 'low';

export function talkStatus(studentPct: number): TalkStatus {
  if (studentPct >= 60) return 'great';
  if (studentPct >= TALK_TARGET_PCT) return 'good';
  if (studentPct >= 35) return 'watch';
  return 'low';
}

interface GateOptions {
  /** Below this RMS (0..1) nothing counts as speech, however quiet the room is. */
  minRms?: number;
  /** Speech must exceed the learned room-noise floor by this factor. */
  floorRatio?: number;
  /** Keep counting this long after the level drops, so pauses between words don't fragment the count. */
  hangoverMs?: number;
}

/**
 * Turns a stream of microphone loudness readings into "seconds spoken". It learns the background-noise floor
 * while nobody is speaking, so a fan or street noise isn't counted, and bridges short pauses with a hangover.
 * Pure logic - no audio APIs - so it is unit-tested.
 */
export class SpeechGate {
  private floor = 0;
  private lastTs: number | null = null;
  private lastVoiceAt = -Infinity;
  private speakingMs = 0;
  private readonly minRms: number;
  private readonly floorRatio: number;
  private readonly hangoverMs: number;

  constructor(opts: GateOptions = {}) {
    this.minRms = opts.minRms ?? 0.012;
    this.floorRatio = opts.floorRatio ?? 2.5;
    this.hangoverMs = opts.hangoverMs ?? 350;
  }

  /** Feed one reading; returns whether the speaker counts as speaking at `nowMs`. */
  update(rms: number, nowMs: number): boolean {
    const dt = this.lastTs === null ? 0 : Math.min(Math.max(nowMs - this.lastTs, 0), 500);
    this.lastTs = nowMs;

    const threshold = Math.max(this.minRms, this.floor * this.floorRatio);
    const loud = rms > threshold;
    if (loud) {
      this.lastVoiceAt = nowMs;
    } else {
      // Only learn the room noise from quiet moments so loud speech never raises the floor.
      this.floor += 0.05 * (rms - this.floor);
    }

    const speaking = nowMs - this.lastVoiceAt <= this.hangoverMs;
    if (speaking) this.speakingMs += dt;
    return speaking;
  }

  /** Whole seconds of speech accumulated since the last call (the remainder is kept for next time). */
  takeSeconds(): number {
    const s = Math.floor(this.speakingMs / 1000);
    this.speakingMs -= s * 1000;
    return s;
  }

  get pendingMs() {
    return this.speakingMs;
  }
}
