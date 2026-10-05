import '@/styles/academy-game.css';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sfx } from '@/lib/academy/sfx';
import { prefersReducedMotion } from '@/lib/academy/playerSafety';
import { speak } from '@/content/playground-library/unit1/audio';
import { fillModel, NAME_MAX_LENGTH, sanitizeName, saveNameTag, spellLetters, spellingLine } from '@/lib/academy/nameTag';
import type { AnswerEvent } from '@/pages/AcademyDemo';

/**
 * NAME TAG STUDIO — the student designs a manga-style transfer-student card:
 *  1 avatar + colour  ->  2 type the name (spelled letter by letter)  ->  3 say "Hello! My name is ..."  ->  4 Nova scans the card.
 * The finished card ({avatar,color,name}) is saved to localStorage 'academy.nameTag' when save_to_profile is true.
 *
 * Comfort rules: tap-only, every control >= 44px, text >= 14px, the action row is sticky so the fixed Back/Next bar never
 * hides it. No AnimatePresence (stalls here): plain enter-only motion. No zoom/pan of pictures: pictures hold still,
 * effects are overlays (sparkles, speed lines, a scan bar). Voice: only the project's recorded-voice path (speak());
 * a dynamic name that has no clip stays silent and the text is shown — never browser speech.
 */
export interface NameTagStep { id: 'avatar' | 'name' | 'say' | 'scan'; prompt?: string; checkSpelling?: boolean; model?: string }
export interface NameTagStudioSlide {
  type: 'name_tag_studio';
  title?: string;
  intro?: string;
  avatars?: string[];
  steps?: NameTagStep[];
  nova_lines?: { ok?: string; retry?: string };
  save_to_profile?: boolean;
}

const MIA_VAULT_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/f218718d-5e3a-4b36-bebf-181b55e257e0/ai-image-v14-mia-meet-scene-1788879515022.png';
const AVATAR_ART: Record<string, { label: string; src: string }> = {
  ava: { label: 'Ava', src: '/avatars/academy/ava-v2.webp' },
  theo: { label: 'Theo', src: '/avatars/academy/theo-v2.webp' },
  vee: { label: 'Vee', src: '/avatars/academy/vee-v2.webp' },
  mia: { label: 'Mia', src: MIA_VAULT_URL },
};
const COLORS = [
  { id: 'sky', label: 'Sky blue', hex: '#38bdf8', dark: '#0c4a6e' },
  { id: 'rose', label: 'Rose pink', hex: '#fb7185', dark: '#881337' },
  { id: 'sun', label: 'Sun yellow', hex: '#fbbf24', dark: '#78350f' },
  { id: 'mint', label: 'Mint green', hex: '#34d399', dark: '#064e3b' },
  { id: 'violet', label: 'Violet', hex: '#a78bfa', dark: '#4c1d95' },
];
const DEFAULT_STEPS: NameTagStep[] = [{ id: 'avatar' }, { id: 'name', checkSpelling: true }, { id: 'say', model: 'Hello! My name is {name}.' }, { id: 'scan' }];

const speedLines: React.CSSProperties = {
  backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.10) 0deg 3deg, transparent 3deg 11deg)',
};
const halftone: React.CSSProperties = {
  backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1.2px, transparent 1.4px)',
  backgroundSize: '9px 9px',
};

function AvatarImg({ id, className, bare }: { id: string; className?: string; bare?: boolean }) {
  const art = AVATAR_ART[id];
  const [bad, setBad] = useState(false);
  if (!art || bad) {
    return <div className={`flex items-center justify-center bg-white/90 text-3xl font-black text-slate-700 ${className ?? ''}`} aria-hidden>{(art?.label ?? id).charAt(0).toUpperCase()}</div>;
  }
  return <img src={art.src} alt="" onError={() => setBad(true)} className={`${bare ? 'bg-gradient-to-b from-[#3b6dff]/30 to-[#8b5cf6]/30' : 'bg-white/90'} object-cover object-top ${className ?? ''}`} draggable={false} />;
}

/** The finished card. Pictures never scale or pan; only overlays animate. */
function TagCard({ avatar, color, name, scanning, welcome }: { avatar: string; color: string; name: string; scanning?: boolean; welcome?: boolean }) {
  const col = COLORS.find((c) => c.id === color) ?? COLORS[0];
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border-4 border-white text-slate-900 shadow-[0_6px_0_0_rgba(0,0,0,0.5),0_18px_36px_rgba(0,0,0,0.45)]" style={{ background: col.hex }}>
      <div className="pointer-events-none absolute inset-0" style={halftone} />
      <div className="relative flex items-stretch gap-3 p-3">
        <AvatarImg id={avatar} className="h-28 w-24 shrink-0 rounded-2xl border-4 border-white sm:h-32 sm:w-28" />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: col.dark }}>Starline Academy · Transfer student</div>
          <div className="my-1 break-words rounded-xl bg-white px-3 py-2 text-3xl font-black leading-none tracking-wide sm:text-4xl" aria-label={`Name: ${name}`}>{name || '· · ·'}</div>
          <div className="text-sm font-extrabold" style={{ color: col.dark }}>Hello! My name is {name || '…'}</div>
        </div>
      </div>
      {welcome && <div className="relative bg-slate-900 px-3 py-2 text-center text-base font-black uppercase tracking-widest text-amber-300">Welcome to Starline Academy</div>}
      {scanning && (
        <>
          <motion.div className="pointer-events-none absolute inset-x-0 h-1.5 bg-cyan-200 shadow-[0_0_18px_6px_rgba(103,232,249,0.9)]"
            initial={{ top: '0%' }} animate={{ top: reduced ? '50%' : ['0%', '100%', '0%'] }} transition={{ duration: 1.4, repeat: reduced ? 0 : Infinity, ease: 'linear' }} />
          <div className="pointer-events-none absolute inset-0 bg-cyan-300/10" />
        </>
      )}
    </div>
  );
}

function Sparkles() {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  if (reduced) return null;
  const spots = [[8, 14], [88, 10], [20, 70], [78, 62], [50, 6], [92, 82]];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {spots.map(([x, y], i) => (
        <motion.span key={i} className="absolute text-xl text-[#86ecff]" style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ opacity: [0.15, 1, 0.15] }} transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35 }}>✦</motion.span>
      ))}
    </div>
  );
}

export function NameTagStudio({ slide, onAnswer }: { slide: NameTagStudioSlide; onAnswer?: (e: AnswerEvent) => void }) {
  const steps = slide.steps?.length ? slide.steps : DEFAULT_STEPS;
  const avatars = (slide.avatars?.length ? slide.avatars : ['ava', 'theo', 'mia', 'vee']).filter((a) => AVATAR_ART[a]);
  const stepDef = (id: NameTagStep['id']) => steps.find((s) => s.id === id);
  const [stage, setStage] = useState<NameTagStep['id'] | 'done'>('avatar');
  const [avatar, setAvatar] = useState<string>(avatars[0] ?? 'ava');
  const [color, setColor] = useState<string>(COLORS[0].id);
  const [raw, setRaw] = useState('');
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [said, setSaid] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const name = sanitizeName(raw);
  const letters = spellLetters(name);
  const model = fillModel(stepDef('say')?.model ?? 'Hello! My name is {name}.', name);
  const novaOk = slide.nova_lines?.ok ?? 'Scan complete! Welcome to Starline Academy!';
  const novaRetry = slide.nova_lines?.retry ?? 'Beep. Check the letters of your name again.';
  const stepNo = stage === 'avatar' ? 1 : stage === 'name' ? 2 : stage === 'say' ? 3 : 4;

  useEffect(() => {
    if (stage !== 'scan') return;
    const t = window.setTimeout(() => {
      sfx.levelUp();
      try { if (!prefersReducedMotion()) confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 } }); } catch { /* decoration only */ }
      if (slide.save_to_profile) saveNameTag({ avatar, color, name });
      onAnswer?.({ itemIndex: 1, isCorrect: true, skillTag: 'self-introduction' });
      setStage('done');
    }, 2400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const confirmName = () => {
    if (name.length < 2) { sfx.wrong(); setNameMsg(novaRetry); return; }
    sfx.correct();
    setNameMsg(null);
    onAnswer?.({ itemIndex: 0, isCorrect: true, skillTag: 'name-spelling' });
    setStage('say');
  };
  const replay = () => { sfx.tap(); void speak(model, 'teacher').catch(() => undefined); };
  const finishSay = () => { sfx.go(); setStage('scan'); };

  const bigBtn = 'ag-btn !min-h-[52px] !px-7 text-base';
  const amber = 'ag-btn ag-btn--gold !min-h-[52px] !px-7 text-base';

  return (
    <div className="ag-root max-h-full w-full overflow-y-auto px-2 py-1">
      <div className="ag-scrim-soft relative mx-auto w-full max-w-4xl overflow-hidden px-12 py-10 md:px-14">
        <Sparkles />
        <div className="relative">
          <div className="mb-3">
            <div className="ag-chip">Episode 1 · Step {stepNo}/4</div>
            <h2 className="ag-title text-3xl uppercase md:text-4xl">{slide.title ?? 'Name Tag Studio'}</h2>
          </div>

          {stage === 'avatar' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="ag-prompt text-base md:text-lg">{slide.intro ?? 'Make your own name tag for Starline Academy.'} {stepDef('avatar')?.prompt ?? 'Choose your avatar.'}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {avatars.map((a) => (
                  <button key={a} onClick={() => { sfx.tap(); setAvatar(a); }} aria-pressed={avatar === a}
                    className={`ag-title flex min-h-[44px] flex-col items-center gap-1 rounded-[18px] p-1.5 text-base transition active:translate-y-px ${avatar === a ? 'shadow-[0_0_0_3px_#86ecff,0_0_24px_rgba(134,236,255,0.6)]' : 'opacity-80 hover:opacity-100'}`}>
                    <AvatarImg id={a} bare className="h-20 w-full rounded-xl md:h-24" />
                    {AVATAR_ART[a].label}
                  </button>
                ))}
              </div>
              <div className="ag-chip">Tag colour</div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c.id} onClick={() => { sfx.tap(); setColor(c.id); }} aria-pressed={color === c.id} aria-label={c.label}
                    className={`h-12 w-12 rounded-full border-4 transition active:translate-y-px ${color === c.id ? 'border-white shadow-[0_0_0_3px_#86ecff,0_0_18px_rgba(134,236,255,0.7)]' : 'border-white/40'}`} style={{ background: c.hex }} />
                ))}
              </div>
              <TagCard avatar={avatar} color={color} name="" />
            </motion.div>
          )}

          {stage === 'name' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="ag-prompt text-base md:text-lg">{stepDef('name')?.prompt ?? 'Type your name.'} (letters only, up to {NAME_MAX_LENGTH})</p>
              <input value={raw} onChange={(e) => { setRaw(e.target.value.replace(/[^\p{L}]/gu, '').slice(0, NAME_MAX_LENGTH)); setNameMsg(null); setLit(null); }}
                maxLength={NAME_MAX_LENGTH} autoComplete="off" autoCapitalize="words" spellCheck={false} aria-label="Your name" placeholder="Your name"
                className="ag-input !min-h-[60px] text-center !text-3xl font-bold tracking-wide" />
              {stepDef('name')?.checkSpelling !== false && letters.length > 0 && (
                <div>
                  <div className="mb-1 ag-chip">Spelling — tap each letter</div>
                  <div className="flex flex-wrap items-center gap-2" aria-label={`Spelled: ${spellingLine(name)}`}>
                    {letters.map((l, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="ag-title text-xl" aria-hidden>–</span>}
                        <button onClick={() => { sfx.tap(); setLit(i); }} aria-pressed={lit === i}
                          className={`ag-tile !min-h-[48px] !min-w-[48px] !text-2xl ${lit === i ? 'is-placed' : ''}`}>{l}</button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="ag-title mt-1 text-lg" style={{ color: "#ffd76a" }}>{spellingLine(name)}</div>
                </div>
              )}
              <TagCard avatar={avatar} color={color} name={name} />
            </motion.div>
          )}

          {stage === 'say' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="ag-prompt text-base md:text-lg">Listen, then say it out loud.</p>
              <div className="ag-title py-2 text-center text-3xl md:text-5xl" aria-live="polite">{model}</div>
              <div className="flex flex-wrap gap-3">
                <button onClick={replay} className={`${bigBtn} ag-btn--ghost`}>🔊 Replay model</button>
                <button onClick={() => { sfx.correct(); setSaid(true); }} aria-pressed={said} className={`ag-btn !min-h-[52px] !px-7 text-base ${said ? '' : 'ag-btn--ghost'}`}>{said ? '✓ I said it' : 'I said it'}</button>
              </div>
              <TagCard avatar={avatar} color={color} name={name} />
            </motion.div>
          )}

          {(stage === 'scan' || stage === 'done') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="ag-prompt border-l-4 border-[#86ecff] pl-4 text-base md:text-xl" role="status" aria-live="polite">
                <span className="ag-chip mr-2">Nova</span>{stage === 'scan' ? (stepDef('scan')?.prompt ?? 'Nova scans your tag…') : novaOk}
              </div>
              <TagCard avatar={avatar} color={color} name={name} scanning={stage === 'scan'} welcome={stage === 'done'} />
              {stage === 'done' && <p className="ag-title text-center text-base md:text-lg" style={{ color: "#ffd76a" }}>Your name tag is ready{slide.save_to_profile ? ' and saved' : ''}. Tap Next to continue!</p>}
            </motion.div>
          )}

          {/* Pinned action row: always above the fixed Back/Next bar. */}
          <div className="sticky bottom-0 z-10 -mx-1 mt-3 flex flex-wrap items-center gap-3 px-1 py-2">
            {stage === 'avatar' && <button onClick={() => { sfx.go(); setStage('name'); }} className={amber}>This is me ▶</button>}
            {stage === 'name' && (
              <>
                <button onClick={() => setStage('avatar')} className="ag-btn ag-btn--ghost !min-h-[52px] text-base">◀ Back</button>
                <button onClick={confirmName} disabled={!name} className={amber}>That is my name ▶</button>
                <div role="status" aria-live="polite" className="ag-feedback min-h-[1.5rem] flex-1 text-sm" style={{ color: "#f0b3ff" }}>{nameMsg}</div>
              </>
            )}
            {stage === 'say' && <button onClick={finishSay} disabled={!said} className={amber}>Scan my tag ▶</button>}
            {stage === 'done' && <button onClick={() => { setStage('avatar'); setSaid(false); }} className="ag-btn ag-btn--ghost !min-h-[52px] text-base">↺ Make another tag</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
