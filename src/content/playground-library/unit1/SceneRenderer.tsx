import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scene, CharKey } from './scenes';
import { CAST, PROP_THEME, getEmotionSprite, COLOR_SKETCH, comicPointForward } from './scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce, stopSpeaking, isSpeaking, speak, speakOnce, playLetterPhonic, playLetterName, unlockAudio, type Character } from './audio';
import * as sfx from './sfx';
import { Confetti } from './fx';
import { UNIT1_PHONICS, getMastered, logMicroCheck } from './masteryTracker';
import { SpriteMascot, MASCOT_EYE_BANDS } from './SpriteMascot';
import engleuphoriaLogo from '@/assets/engleuphoria-logo.png';

const cakeSticker = '/lep1/items/cake-sticker.png';
const candleSticker = '/lep1/items/candle-sticker.png';
const BIRTHDAY_SPRITE: Partial<Record<CharKey, string>> = {
  bella: '/lep1/characters/bella-birthday.png',
  mia: '/lep1/characters/mia-birthday.png',
  pip: '/lep1/characters/pip-birthday.png',
};
/** Characters already illustrated holding a bunch of party balloons — used instead of a plain portrait + emoji row. */
const BALLOONS_SPRITE: Partial<Record<CharKey, string>> = {
  bella: '/lep1/characters/bella-balloons.png',
  mia: '/lep1/characters/mia-balloons.png',
  leo: '/lep1/characters/leo-balloons.png',
  willow: '/lep1/characters/willow-balloons.png',
};

/** Rainbow spectrum used across every "count 1-10" activity (numbers tiles, balloon pop) — one fixed hue per digit, red through purple. */
const RAINBOW_10 = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#a855f7'];
const NUMBER_WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
/** Natural-cased number word for TTS — a bare digit string like "5" sent to the
 *  voice pipeline is read inconsistently; the actual word reads clearly every time. */
function numberSpeech(n: number): string {
  const w = NUMBER_WORDS[n - 1];
  return w ? w.charAt(0) + w.slice(1).toLowerCase() : String(n);
}

/** Hand-drawn balloon — real body/string/highlight shape instead of the 🎈 emoji glyph, colored per RAINBOW_10. */
function Balloon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 180" className="h-full w-full">
      <path d="M50 108 Q 44 124, 54 138 Q 44 152, 54 166 Q 48 174, 50 178" stroke="rgba(255,255,255,0.9)" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="52" rx="38" ry="46" fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
      <ellipse cx="36" cy="36" rx="10" ry="16" fill="rgba(255,255,255,0.55)" />
      <circle cx="60" cy="30" r="4" fill="rgba(255,255,255,0.75)" />
      <polygon points="45,98 55,98 50,108" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
    </svg>
  );
}

/** Hand-drawn wrapped present — pink box, cream lid band, ribbon + bow, big "?" — the tap-to-reveal box for the age-quiz game. */
function PresentBox() {
  return (
    <svg viewBox="0 0 220 240" style={{ width: 'clamp(220px, 34vw, 360px)', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}>
      <rect x="10" y="60" width="200" height="40" rx="10" fill="#E76FA5" stroke="#3b1e08" strokeWidth={4} />
      <rect x="20" y="100" width="180" height="130" rx="10" fill="#FEFBDD" stroke="#3b1e08" strokeWidth={4} />
      <rect x="100" y="60" width="20" height="170" fill="#E76FA5" stroke="#3b1e08" strokeWidth={3} />
      <rect x="10" y="75" width="200" height="12" fill="#FEFBDD" stroke="#3b1e08" strokeWidth={2} />
      <ellipse cx="90" cy="55" rx="26" ry="18" fill="#E76FA5" stroke="#3b1e08" strokeWidth={3} />
      <ellipse cx="130" cy="55" rx="26" ry="18" fill="#E76FA5" stroke="#3b1e08" strokeWidth={3} />
      <circle cx="110" cy="55" r="10" fill="#FEFBDD" stroke="#3b1e08" strokeWidth={3} />
      <text x="110" y="170" textAnchor="middle" fontSize="70" fontWeight={900} fill="#3b1e08">?</text>
    </svg>
  );
}

/** Hand-drawn treasure chest — wooden body + hinged lid that pops open on `open`, used by the Trophy Chest capstone game. */
function TrophyChestArt({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 220 200" style={{ width: 'clamp(190px, 30vw, 300px)', height: 'auto', overflow: 'visible', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}>
      <rect x="20" y="100" width="180" height="90" rx="14" fill="#C97A2F" stroke="#2B1E17" strokeWidth={5} />
      <rect x="20" y="128" width="180" height="14" fill="#8A5420" stroke="#2B1E17" strokeWidth={3} />
      <rect x="94" y="100" width="32" height="90" fill="#8A5420" stroke="#2B1E17" strokeWidth={3} />
      <circle cx="110" cy="145" r="14" fill="#F5B942" stroke="#2B1E17" strokeWidth={4} />
      <rect x="104" y="141" width="12" height="16" rx="3" fill="#8A5420" />
      <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: open ? 'rotate(-55deg) translate(-4px, -6px)' : 'rotate(0deg)', transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <path d="M14 100 Q14 42 110 38 Q206 42 206 100 Z" fill="#E08A3C" stroke="#2B1E17" strokeWidth={5} />
        <rect x="94" y="38" width="32" height="62" fill="#8A5420" opacity={0.85} />
      </g>
      {open && (
        <g className="pointer-events-none">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <text key={i} x={110 + Math.cos(a) * 78} y={78 + Math.sin(a) * 58} fontSize="20" textAnchor="middle" style={{ animation: `lep1-pop-fade 0.9s ease-out ${i * 0.05}s both` }}>✨</text>
            );
          })}
        </g>
      )}
    </svg>
  );
}

/* ---------- Shared chrome ---------- */

export const MAX_HEARTS = 3;

export function Hearts({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count} hearts remaining`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i} className={`text-xl transition ${i < count ? '' : 'grayscale opacity-30'}`}>❤️</span>
      ))}
    </span>
  );
}

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-5 text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30 ${className}`}
      style={{ boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)' }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-5 w-full rounded-full py-4 text-xl font-black text-white shadow-xl transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: 'linear-gradient(90deg, #FE6A2F, #FF8A4C, #FEBE4C)' }}
    >
      {children}
    </button>
  );
}

/* ---------- Dispatcher ---------- */

/** Per-scene coaching notes for teachers running the lesson live — only Lesson 3 has any so far. */
const L3_TEACHER_TIPS: Record<string, string> = {
  'l3-title': "Set the mood: 'Today we learn feelings — happy, sad, angry!' Have students mirror each face.",
  'l3-song': "The Feelings Song! Sing each line with the character. Clap on 'happy', hug yourself on 'sad', stomp on 'angry'. Tap Sing Again to loop — repeat 2x so the student joins in.",
  'l3-intro': 'Pause after each line. Ask the student to repeat with the same emotion in their voice.',
  'l3-vocab-match': 'Tap a character → card pops with the feeling. Model twice, then have student repeat with matching expression.',
  'l3-model-a': "Model /æ/ 3x (short 'a' as in 'angry'). Student echoes. Then say each anchor word together.",
  'l3-trace-a': 'Trace freely — no scoring. Say /æ/ every time the finger moves. Keep it playful.',
  'l3-model-s': 'Model /s/ like a snake — long and soft. Student repeats each anchor word after you.',
  'l3-trace-s': 'Trace freely. Whisper /sss/ together as they draw. No pressure on accuracy.',
  'l3-feeling-stage': "Model the sentence first: 'I am happy.' Student repeats before tapping the matching face.",
  'l3-who-feels-it': "Tap a friend → card pops with full sentence: 'Mia is happy', 'Bella is sad', 'Leo is angry', 'Pip is happy'. Repeat together.",
  'l3-feed-monsters': "Name the feeling BEFORE the student drags. 'Mia is happy → the YELLOW monster.' Cheer every match.",
  'l3-sort-as': 'Say each word before dragging. Emphasize the /æ/ or /s/ sound. Student repeats then drags.',
  'l3-sound-pop': 'Fast game — but pause between rounds so student can say the target sound aloud.',
  'l3-grand-build': 'Read the full sentence together. Then student picks the missing word and repeats the whole line.',
  'l3-x-is-feeling': "Model 'Leo is angry' with dramatic voice. Student mirrors both the words and the expression.",
  'l3-he-she-model': 'Point to the character: \'Mia is sad. SHE is sad.\' Emphasize HE for boys (Pip, Leo) and SHE for girls (Mia, Bella). Student repeats both lines.',
  'l3-he-she-sort': "The character says 'I am ___'. Student decides girl → SHE box (left), boy → HE box (right). Drag to sort. Tap the sentence card to replay the audio.",
  'l3-he-she-say': "Show the character + feeling card. Prompt: 'Is it HE or SHE? Say the sentence!' Wait for the student to say it OUT LOUD ('She is angry.') BEFORE they tap HE/SHE. On correct tap, the character models the sentence once — tap the card to replay.",
  'l3-feeling-quiz': "Emotion recognition only. Teacher says 'Who is happy?' — student taps whichever friend shows a smile. Names don't matter here; focus on reading the face.",
  'l3-i-am-feeling': "Personal turn. Ask: 'How are YOU today?' Encourage a full 'I am ___' answer.",
  'l3-roleplay-feelings': 'Take turns. You play one character, student plays another. Swap roles the second time.',
  'l3-i-am-demo': "Model each 'I am ___' sentence with big feeling. Point to yourself as the character speaks. Tap the card to replay before moving on.",
  'l3-feelings-dice': 'Roll → student acts out the feeling AND says the sentence. Big voices, big faces!',
  'l3-friend-pop': "Fast recall. Between rounds, prompt: 'Say it back — how is Pip?'",
  'l3-finale': 'Celebrate! Ask student to teach YOU one feeling they learned today.',
};

function TeacherTip({ instruction, tip }: { instruction?: string; tip?: string }) {
  const [open, setOpen] = useState(false);
  if (!instruction && !tip) return null;
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide teacher notes' : 'Show teacher notes'}
        className="fixed right-4 top-4 z-[9999] flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.35)' }}
        title="Teacher notes (only you can see this)"
      >
        {open ? '✕' : '\u{1F393}'}
      </button>
      {open && (
        <div
          className="fixed right-4 top-[68px] z-[9998] max-w-[340px] rounded-2xl border border-white/50 bg-neutral-900/90 p-4 text-sm leading-relaxed text-white shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-300">
            <span>{'\u{1F393}'}</span>
            <span>Teacher notes</span>
          </div>
          {instruction && (
            <div className="mb-3">
              <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">Say to student</div>
              <div className="rounded-lg bg-white/10 px-3 py-2 text-white/95">{instruction}</div>
            </div>
          )}
          {tip && (
            <div>
              <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">Tip</div>
              <div className="text-white/90">{tip}</div>
            </div>
          )}
          <div className="mt-3 text-[10px] italic text-white/50">Only visible to you. Tap the icon to hide.</div>
        </div>
      )}
    </>
  );
}

export function SceneRenderer(props: {
  scene: Scene;
  onWin: (gem: boolean) => void;
  onLose: () => void;
  onNext: () => void;
  onRestart: () => void;
  gemsCollected: number;
  heartsRemaining: number;
  lessonNumber?: number;
}) {
  const { scene, lessonNumber } = props;
  const teacherTip = lessonNumber === 3 ? L3_TEACHER_TIPS[scene.id] : undefined;
  const instruction = (scene as { teacher?: string }).teacher;
  const tipOverlay = (instruction || teacherTip) ? <TeacherTip key={scene.id} instruction={instruction} tip={teacherTip} /> : null;
  const content = (() => {
  switch (scene.kind) {
    case 'title-card': return <TitleCardScene scene={scene} onNext={props.onNext} />;
    case 'cinematic': return <CinematicScene scene={scene} onNext={props.onNext} />;
    case 'meet': return <MeetScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'sound-model': return <SoundModelScene scene={scene} onNext={props.onNext} />;
    case 'echo': return <EchoScene scene={scene} onWin={props.onWin} onNext={props.onNext} />;
    case 'basket': return <BasketScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'trace': return <TraceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'sound-sort': return <SoundSortScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'word-build': return <WordBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'who-said-it': return <WhoSaidItScene scene={scene} onWin={props.onWin} onNext={props.onNext} />;
    case 'gather': return <GatherScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'memory': return <MemoryScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'dash': return <DashScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'feelings': return <FeelingsScene scene={scene} onNext={props.onNext} />;
    case 'puzzle': return <PuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'trophy-chest': return <TrophyChestScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'roleplay': return <RoleplayScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'join-stage': return <JoinStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'hello-doors': return <HelloDoorsScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'color-friends': return <ColorFriendsScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'alphabet-blocks': return <AlphabetBlocksScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'alphabet-order': return <AlphabetOrderScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'song': return <SongScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'finale': return <FinaleScene scene={scene} hearts={props.heartsRemaining} gems={props.gemsCollected} onRestart={props.onRestart} />;
    case 'name-gate': return <NameGateScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'meet-group': return <MeetGroupScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'voice-stage': return <VoiceStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'sound-pop': return <SoundPopScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'brick-crush': return <BrickCrushScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'friend-pop': return <FriendPopScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'feelings-tap': return <FeelingsTapScene scene={scene} onNext={props.onNext} />;
    case 'feelings-wheel': return <FeelingsWheelScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'x-is-feeling': return <XIsFeelingScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'feelings-dice': return <FeelingsDiceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'feed-monsters': return <FeedMonstersScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'he-she-model': return <HeSheModelScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'he-she-sort': return <HeSheSortScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'he-she-say': return <HeSheSayScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'feeling-quiz': return <FeelingQuizScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'i-am-feeling': return <IAmFeelingScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'feelings-bingo': return <FeelingsBingoScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'numbers-learn': return <NumbersLearnScene scene={scene} onNext={props.onNext} />;
    case 'numbers-review': return <NumbersReviewScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'candle-cake': return <CandleCakeScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'count-balloons': return <CountBalloonsScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'age-balloons': return <AgeBalloonsScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'age-sentence-match': return <AgeSentenceMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'meet-greet': return <MeetGreetScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'age-quiz': return <AgeQuizScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    default: return null;
  }
  })();
  return (
    <>
      {content}
      {tipOverlay}
    </>
  );
}

/* ---------- Title card ---------- */

function TitleCardScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'title-card' }>; onNext: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-5 top-5 flex items-center gap-3 animate-[lep1-fade-slide_0.5s_ease-out]">
        <img src={engleuphoriaLogo} alt="EnglEuphoria logo" className="h-16 w-16 rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.4)] ring-2 ring-white/70" />
        <div className="hidden flex-col sm:flex">
          <span className="text-[11px] font-black uppercase tracking-widest text-white/90 drop-shadow">EnglEuphoria</span>
          <span className="text-[10px] font-bold text-white/80 drop-shadow">Playground Hub</span>
        </div>
      </div>
      <div className="absolute right-5 top-5 flex flex-wrap justify-end gap-2">
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.level}</span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.unit}</span>
        <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">{scene.lessonLabel}</span>
      </div>
      <div className="absolute inset-x-0 top-24 flex flex-col items-center px-6 text-center sm:top-20">
        <h1
          className="inline-block -rotate-2 text-6xl leading-[1] sm:text-8xl md:text-9xl"
          style={{
            fontFamily: "'Bungee', 'Fredoka', system-ui, sans-serif",
            background: 'linear-gradient(180deg, #FFF3B0 0%, #FFD34E 35%, #FF8A3D 70%, #E5561A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', WebkitTextStroke: '5px #2A1200',
            paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #B23A00) drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
            letterSpacing: '0.02em', animation: 'lep1-hop 1.8s ease-in-out infinite',
          }}
        >
          {scene.title}
        </h1>
        <p className="mt-2 max-w-xl rounded-full bg-white/85 px-4 py-1 text-sm font-black text-orange-800 shadow-lg ring-2 ring-orange-200 sm:text-base" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>{scene.subtitle} ✨</p>
      </div>
      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
        <button onClick={() => { unlockAudio(); onNext(); }} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-12 py-5 text-2xl font-black text-white shadow-2xl ring-4 ring-white/60 transition hover:scale-105 active:scale-95 animate-pulse">
          Start Lesson →
        </button>
      </div>
    </div>
  );
}

/* ---------- Cinematic ---------- */

function CinematicScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'cinematic' }>; onNext: () => void }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setStep(0);
      for (let i = 0; i < scene.script.length; i++) {
        if (cancelled) return;
        setStep(i);
        await safeSpeak(scene.script[i].line, scene.script[i].who);
      }
      if (!cancelled) setStep(scene.script.length);
    }
    run();
    return () => { cancelled = true; stopSpeaking(); };
  }, [scene.id]);

  const currentLine = step < 0 ? '…' : step < scene.script.length ? scene.script[step].line : 'Ready?';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] sm:text-5xl">{scene.title}</h1>
        <p className="mt-1 text-sm font-semibold text-white/95 drop-shadow sm:text-base">{scene.subtitle}</p>
      </div>
      {scene.id !== 'intro' && (
        <img src={CAST.pip.img} alt="Pip" className="absolute bottom-[18vh] left-1/2 -translate-x-1/2 object-contain drop-shadow-2xl" style={{ height: 'clamp(220px, 34vh, 420px)', animation: 'lep1-walk 3.2s ease-in-out infinite' }} />
      )}
      {step >= 0 && step < scene.script.length && (
        <div className="absolute bottom-[52vh] left-1/2 max-w-[520px] -translate-x-1/2 px-4">
          <div className="relative rounded-3xl bg-white/95 px-6 py-4 text-center text-2xl font-black text-orange-800 shadow-2xl">
            “{currentLine}”
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-x-[14px] border-t-[16px] border-x-transparent border-t-white/95" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-white px-8 py-4 text-base font-black uppercase tracking-widest text-orange-700 shadow-2xl transition hover:scale-[1.04]">
          🎮 {scene.cta}
        </button>
      </div>
    </div>
  );
}

/* ---------- Meet ---------- */

function MeetScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'meet' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  type Phase = 'idle' | 'talking' | 'repeat' | 'done';
  const [phase, setPhase] = useState<Phase>('idle');
  const [held, setHeld] = useState(false);
  const [heardRepeat, setHeardRepeat] = useState(0);
  const [xpBurst, setXpBurst] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];
  const repeatWord = scene.repeat ?? scene.line;


  const tapCharacter = async () => {
    if (phase !== 'idle') return;
    sfx.pop();
    setPhase('talking');
    await safeSpeak(scene.line, scene.who);
    setTimeout(() => setPhase('repeat'), 500);
  };
  const hearRepeat = async () => { sfx.click(); setHeardRepeat((n) => n + 1); await safeSpeak(repeatWord, scene.who); };
  const replayIntro = async () => { sfx.click(); await safeSpeak(scene.line, scene.who); };
  const startHold = () => {
    if (phase !== 'repeat') return;
    setHeld(true);
    holdTimer.current = window.setTimeout(async () => {
      setHeld(false); setPhase('done'); setXpBurst(true); sfx.gem();
      setTimeout(() => setXpBurst(false), 1200);
      onWin(true);
      await safeSpeak('Awesome voice! Great job!', 'pip');
    }, 1300);
  };
  const endHold = () => { setHeld(false); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <div className="relative min-h-[78vh]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          ⚔️ Quest · Meet {c.name}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-md">
        <div className="rounded-2xl px-4 py-3 text-center text-lg font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {scene.teacher}
        </div>
      </div>
      {/* scene.bg already paints {c.name} directly into the art — no separate sprite on top, just a tap affordance. */}
      {phase === 'idle' && <button onClick={tapCharacter} aria-label={`Tap ${c.name} to say hello`} className="absolute inset-0 z-10 h-[60vh] w-full cursor-pointer bg-transparent" />}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[26vh] z-10 grid place-items-center">
          <div className="relative h-40 w-40" style={{ animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c.color}55, transparent 65%)`, animation: 'lep1-ping 2s ease-out infinite' }} />
            <span className="absolute inset-6 rounded-full border-4" style={{ borderColor: c.color, animation: 'lep1-ping 2s ease-out 0.4s infinite' }} />
          </div>
        </div>
      )}
      {scene.phonics && (
        <span className="absolute right-3 top-16 z-20 grid h-16 w-16 place-items-center rounded-full bg-white text-3xl font-black shadow-2xl ring-4" style={{ color: c.color, borderColor: c.color, animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
          {scene.phonics.toUpperCase()}
        </span>
      )}
      {xpBurst && (
        <div className="pointer-events-none absolute inset-x-0 top-[32vh] z-30 grid place-items-center">
          <div className="animate-[lep1-pop-fade_1.1s_ease-out_forwards] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div>
        </div>
      )}
      {phase !== 'idle' && (
        <div className="absolute top-[14vh] right-4 sm:right-8 z-20 max-w-[42%] sm:max-w-[34%]">
          <button onClick={replayIntro} className="group relative w-full rounded-3xl border-4 bg-white px-5 py-4 text-left text-xl sm:text-2xl font-black shadow-2xl active:scale-95" style={{ color: c.color, borderColor: c.color }}>
            <span className="mr-2 text-xl">{c.emoji}</span>“{scene.line}”
          </button>
        </div>
      )}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[44vh] z-20 grid place-items-center">
          <span className="animate-pulse rounded-full bg-white/95 px-5 py-2 text-base font-bold shadow-xl" style={{ color: c.color }}>👆 Tap {c.name} {c.emoji}</span>
        </div>
      )}
      {(phase === 'repeat' || phase === 'done') && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-md" style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="rounded-t-[2rem] border-t-4 p-4 shadow-2xl" style={{ borderColor: c.color, background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between">
              <span className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-white" style={{ background: c.color }}>🎤 Your turn</span>
              <span className="text-xs font-bold text-neutral-500">Hold & repeat</span>
            </div>
            <p className="mt-2 text-center text-2xl font-black" style={{ color: c.color }}>“{repeatWord}”</p>
            <button onClick={hearRepeat} className="mt-3 w-full rounded-full bg-white py-2 text-sm font-bold text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">
              🔊 Hear it {heardRepeat > 0 && <span className="opacity-60">({heardRepeat})</span>}
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
              className={`mt-2 w-full rounded-full py-5 text-xl font-black text-white shadow-xl transition ${held ? 'scale-95' : ''}`}
              style={{ background: phase === 'done' ? 'linear-gradient(90deg, #10B981, #34D399)' : `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}
            >
              {phase === 'done' ? '✅ Nailed it!' : held ? '🎤 Keep talking…' : '🎤 Hold to say it'}
            </button>
            <PrimaryButton onClick={onNext} disabled={phase !== 'done'}>{phase === 'done' ? 'Next Quest →' : 'Say it first!'}</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sound model ---------- */

function SoundModelScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void }) {
  const c = CAST[scene.who];
  const theme = PROP_THEME[scene.prop ?? scene.who] ?? PROP_THEME.pip;
  const side: 'left' | 'right' = scene.who === 'mia' ? 'right' : 'left';
  const [beat, setBeat] = useState(-1);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'invite' | 'done'>('invite');
  const [replays, setReplays] = useState(0);

  // The teacher gives all spoken instructions live in the classroom — this
  // scene only ever plays the letter's actual recorded sound (never TTS
  // narration) and only ever on tap, never automatically on mount.
  const playLetterSound = useCallback(async () => {
    setBeat(0);
    await playLetterPhonic(scene.letter);
    setBeat(-1);
  }, [scene.letter]);

  useEffect(() => {
    setOpened(new Set());
    setPhase('invite');
  }, [scene.id]);

  const openProp = async (i: number) => {
    if (opened.has(i)) { sfx.pop(); await safeSpeak(scene.anchors[i].word, scene.who); return; }
    sfx.reveal();
    const next = new Set(opened); next.add(i); setOpened(next);
    await safeSpeak(scene.anchors[i].word, scene.who);
    if (next.size >= scene.anchors.length) { sfx.gem(); setPhase('done'); }
  };

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          🔊 Sound Quest · {scene.letter} says /{scene.phoneme.replace(/[/]/g, '')}/
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-30 flex w-[42%] flex-col items-center justify-center gap-4" style={{ [side]: 0 }}>
        <button
          type="button"
          onClick={playLetterSound}
          aria-label={`Hear the ${scene.letter} sound again`}
          className="pointer-events-auto grid place-items-center rounded-[2.5rem] border-8 bg-white/95 font-black shadow-2xl backdrop-blur transition active:scale-95"
          style={{ color: theme.tint, borderColor: theme.tint, width: 'min(60vh, 22rem)', height: 'min(60vh, 22rem)', fontSize: 'min(48vh, 18rem)', lineHeight: 1, animation: beat >= 0 ? 'lep1-pop 0.5s ease-out' : 'lep1-wiggle 4s ease-in-out infinite' }}
        >
          {scene.letter}
        </button>
        <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-2xl font-black shadow-xl sm:text-3xl" style={{ color: theme.tint, borderColor: theme.tint }}>
          /{scene.phoneme.replace(/[/]/g, '')}/ /{scene.phoneme.replace(/[/]/g, '')}/
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center px-4">
        <div className="max-w-md rounded-2xl px-4 py-3 text-center text-base font-bold text-white shadow-2xl sm:text-lg" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {phase === 'done' ? 'You found them all! Great listening! ⭐' : `Tap the letter or a picture to hear it!`}
        </div>
      </div>
      {scene.anchors.map((a, i) => {
        const base = side === 'left' ? 72 : 28;
        const cols = side === 'left' ? [-8, 12, -6] : [-12, 8, -10];
        const tops = ['14%', '46%', '78%'];
        const rots = [-6, 5, -3];
        const spot = { left: `${base + (cols[i] ?? 0)}%`, top: tops[i] ?? '50%', rot: rots[i] ?? 0 };
        const isOpen = opened.has(i);
        return (
          <div key={a.word} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: spot.left, top: spot.top, animation: `lep1-float 3s ease-in-out ${i * 0.3}s infinite` }}>
            <button
              onClick={() => openProp(i)}
              className={`relative grid place-items-center rounded-3xl bg-transparent p-0 transition-transform active:scale-90 ${isOpen ? 'h-64 w-64 sm:h-80 sm:w-80' : 'h-40 w-40 sm:h-52 sm:w-52'} ${!isOpen && phase === 'invite' ? 'animate-pulse' : ''}`}
              style={{ transform: `rotate(${spot.rot}deg)`, filter: `drop-shadow(0 0 18px ${theme.tint}) drop-shadow(0 12px 24px rgba(0,0,0,0.35))` }}
              aria-label={isOpen ? `Hear ${a.word} again` : `Open ${theme.label}`}
            >
              {isOpen ? (
                <img src={a.img} alt={a.word} className="h-full w-full object-contain animate-[lep1-pop_0.6s_ease-out]" />
              ) : theme.img ? (
                <img src={theme.img} alt={theme.label} className="h-full w-full object-contain" />
              ) : (
                <span className="text-[9rem] sm:text-[11rem]">{theme.closed}</span>
              )}
            </button>
            {isOpen && (
              <div className="mx-auto mt-3 w-max animate-[lep1-pop_0.5s_ease-out] rounded-2xl border-4 bg-white px-6 py-2 text-center text-3xl font-black shadow-xl sm:text-4xl" style={{ color: theme.tint, borderColor: theme.tint }}>
                {a.word}
              </div>
            )}
          </div>
        );
      })}
      <div className="absolute inset-x-0 bottom-4 z-30 mx-auto flex max-w-md gap-2 px-4">
        <button onClick={() => { setReplays((r) => r + 1); playLetterSound(); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-bold text-orange-700 shadow-xl ring-2 ring-orange-200 backdrop-blur active:scale-95">
          🔁 Hear sound {replays > 0 && <span className="opacity-60">({replays})</span>}
        </button>
        <button onClick={onNext} disabled={phase !== 'done'} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow-xl transition ${phase === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 active:scale-95' : 'cursor-not-allowed bg-neutral-400/70'}`}>
          {phase === 'done' ? 'Now you try →' : `Find ${scene.anchors.length - opened.size} more`}
        </button>
      </div>
    </div>
  );
}

/* ---------- Echo ---------- */

function EchoScene({ scene, onWin, onNext }: { scene: Extract<Scene, { kind: 'echo' }>; onWin: (gem: boolean) => void; onNext: () => void }) {
  const [heard, setHeard] = useState(0);
  const [held, setHeld] = useState(false);
  const [done, setDone] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];


  const hear = async () => { setHeard((h) => h + 1); await safeSpeak(scene.hearWord ?? scene.word, scene.who); };
  const startHold = () => {
    setHeld(true);
    holdTimer.current = window.setTimeout(() => { setDone(true); setHeld(false); onWin(true); cueSpeak('Amazing! Great voice!', 'pip'); }, 1200);
  };
  const endHold = () => { setHeld(false); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <GlassCard>
      <p className="text-center text-lg font-bold text-orange-700">{scene.teacher}</p>
      <div className="mt-4 grid place-items-center rounded-3xl bg-white/60 p-4">
        <img src={c.img} alt={c.name} width={128} height={128} className="h-32 w-32 object-contain animate-[lep1-hop_1.4s_ease-in-out_infinite]" />
        <p className="mt-2 text-3xl font-black" style={{ color: c.color }}>"{scene.word}"</p>
      </div>
      <button onClick={hear} className="mt-4 w-full rounded-full bg-white py-3 text-lg font-bold text-orange-700 shadow-md ring-2 ring-orange-200 active:scale-95">
        🔊 Listen {heard > 0 && <span className="text-sm opacity-60">({heard})</span>}
      </button>
      <button
        onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} disabled={heard === 0}
        className={`mt-3 w-full rounded-full py-6 text-2xl font-black text-white shadow-xl transition ${held ? 'scale-95' : ''} disabled:opacity-40`}
        style={{ background: done ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #FE6A2F, #FF8A4C)' }}
      >
        {done ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & say it'}
      </button>
      <PrimaryButton onClick={onNext} disabled={!done}>Next →</PrimaryButton>
    </GlassCard>
  );
}

/* ---------- Scatter layout ---------- */

/** Lays out N draggable items into two clean, evenly-spaced rows instead of
 *  the old hand-picked percentage list — which drifted into overlapping,
 *  off-center clutter as soon as an item count didn't match what the list
 *  was tuned for. Rotation is kept small so items read as tidy, not messy. */
function scatterPositions(n: number, rowTops: [number, number] = [16, 84], margin = 14): { left: string; top: string; rot: number }[] {
  const topCount = Math.ceil(n / 2);
  const bottomCount = n - topCount;
  const usable = 100 - margin * 2;
  const row = (count: number, topPct: number, offset: number) =>
    Array.from({ length: count }, (_, i) => ({
      left: `${count === 1 ? 50 : margin + (usable * i) / (count - 1)}%`,
      top: `${topPct}%`,
      rot: (i % 2 === 0 ? -1 : 1) * (2 + ((i + offset) % 3)),
    }));
  return [...row(topCount, rowTops[0], 0), ...row(bottomCount, rowTops[1], topCount)];
}

/* ---------- Basket ---------- */

function BasketScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'basket' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [basketHot, setBasketHot] = useState(false);
  const [gemAwarded, setGemAwarded] = useState(false);
  const basketRef = useRef<HTMLDivElement | null>(null);
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const c = CAST[scene.who];
  const got = slots.filter((s) => s.collected).length;
  const done = got >= scene.goal;

  useEffect(() => {
    if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak(`Yes! The ${scene.letter} portal is open!`, scene.who); }
  }, [done, gemAwarded]);

  function onDown(idx: number) {
    return (e: React.PointerEvent<HTMLButtonElement>) => {
      const s = slots.find((x) => x.idx === idx);
      if (!s || s.collected) return;
      sfx.pop();
      cueSpeakOnce(s.it.word, 'teacher');
      dragIdx.current = idx;
      start.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
    };
  }
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    const b = basketRef.current?.getBoundingClientRect();
    if (b) setBasketHot(e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom);
  }
  function onUp(e: React.PointerEvent<HTMLButtonElement>) {
    const idx = dragIdx.current;
    dragIdx.current = null;
    setBasketHot(false);
    if (idx === null) return;
    const b = basketRef.current?.getBoundingClientRect();
    const dropped = b && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropped) return { ...x, dragging: false, dx: 0, dy: 0 };
      if (x.it.hit) { sfx.match(); cueSpeak(`${scene.phoneme}! ${x.it.word}!`, scene.who); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
    window.setTimeout(() => setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, flash: 'none' } : x))), 700);
  }

  const orbit = scatterPositions(scene.items.length, [56, 86], 14);

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-[260px] rounded-2xl bg-white/95 px-3 py-2 text-sm font-bold text-neutral-800 shadow-xl backdrop-blur sm:max-w-[320px] sm:text-base">{scene.teacher}</div>
      <div ref={basketRef} className={`absolute left-1/2 top-16 z-10 grid h-56 w-56 -translate-x-1/2 place-items-center rounded-full border-4 border-dashed shadow-2xl backdrop-blur transition-all sm:h-72 sm:w-72 ${basketHot ? 'scale-110 border-green-400 bg-green-100/90' : 'border-white/80 bg-white/40'}`}>
        <div className={`absolute inset-0 rounded-full opacity-70 ${done ? '' : 'animate-pulse'}`} style={{ background: `radial-gradient(circle at center, ${c.color}cc, transparent 70%)` }} />
        <div className="relative flex flex-col items-center gap-1 text-center">
          <span className="grid h-28 w-28 place-items-center rounded-3xl text-7xl font-black text-white shadow-lg sm:h-36 sm:w-36 sm:text-8xl" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>{scene.letter}</span>
          <p className="text-lg font-black leading-none" style={{ color: c.color }}>{scene.phoneme}</p>
          <p className="text-xs font-bold text-orange-700">⭐ {got}/{scene.goal}</p>
        </div>
      </div>
      {slots.map((s, i) => {
        const pos = orbit[i % orbit.length];
        if (s.collected) return <div key={s.idx} className="absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-green-300/60 text-3xl opacity-60 ring-2 ring-green-400 backdrop-blur" style={{ left: pos.left, top: pos.top }}>✅</div>;
        const glow = s.flash === 'bad' ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] animate-[lep1-shake_0.4s_ease-in-out]' : s.flash === 'good' ? 'drop-shadow-[0_0_18px_rgba(34,197,94,0.9)]' : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]';
        return (
          <button key={s.idx} onPointerDown={onDown(s.idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className={`absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 touch-none select-none bg-transparent p-0 transition sm:h-48 sm:w-48 ${glow} ${s.dragging ? 'z-20 scale-125' : 'hover:scale-110 animate-[lep1-float_3s_ease-in-out_infinite]'}`}
            style={{ left: pos.left, top: pos.top, animationDelay: `${(i % 4) * 0.3}s`, transform: s.dragging ? `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px)) scale(1.25) rotate(-4deg)` : `translate(-50%, -50%) rotate(${pos.rot}deg)`, transition: s.dragging ? 'none' : 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)' }}
            aria-label={s.it.word}
          >
            {s.it.img ? <img src={s.it.img} alt={s.it.word} draggable={false} className="pointer-events-none h-full w-full object-contain" /> : <span className="pointer-events-none grid h-full w-full place-items-center text-7xl">{s.it.emoji}</span>}
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">✨ Portal open! Next →</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Trace ---------- */

function TraceScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'trace' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentPath = useRef<string>('');

  type TraceSegment = { from: { x: number; y: number }; to: { x: number; y: number } };
  const TRACE_SEGMENTS: Record<string, TraceSegment[]> = {
    H: [{ from: { x: 170, y: 130 }, to: { x: 170, y: 470 } }, { from: { x: 430, y: 130 }, to: { x: 430, y: 470 } }, { from: { x: 175, y: 305 }, to: { x: 425, y: 305 } }],
    M: [{ from: { x: 155, y: 470 }, to: { x: 195, y: 130 } }, { from: { x: 195, y: 130 }, to: { x: 300, y: 455 } }, { from: { x: 300, y: 455 }, to: { x: 405, y: 130 } }, { from: { x: 405, y: 130 }, to: { x: 455, y: 235 } }],
    A: [{ from: { x: 300, y: 130 }, to: { x: 150, y: 470 } }, { from: { x: 300, y: 130 }, to: { x: 450, y: 470 } }, { from: { x: 205, y: 340 }, to: { x: 395, y: 340 } }],
    S: [{ from: { x: 400, y: 175 }, to: { x: 200, y: 175 } }, { from: { x: 200, y: 175 }, to: { x: 200, y: 295 } }, { from: { x: 200, y: 295 }, to: { x: 400, y: 295 } }, { from: { x: 400, y: 295 }, to: { x: 400, y: 415 } }, { from: { x: 400, y: 415 }, to: { x: 200, y: 415 } }],
    T: [{ from: { x: 150, y: 150 }, to: { x: 450, y: 150 } }, { from: { x: 300, y: 150 }, to: { x: 300, y: 470 } }],
    B: [
      { from: { x: 180, y: 130 }, to: { x: 180, y: 470 } },
      { from: { x: 180, y: 130 }, to: { x: 380, y: 130 } }, { from: { x: 380, y: 130 }, to: { x: 380, y: 290 } }, { from: { x: 380, y: 290 }, to: { x: 180, y: 290 } },
      { from: { x: 180, y: 290 }, to: { x: 400, y: 290 } }, { from: { x: 400, y: 290 }, to: { x: 400, y: 470 } }, { from: { x: 400, y: 470 }, to: { x: 180, y: 470 } },
    ],
  };
  const HIT_RADIUS = 72;
  const BUCKETS_PER_SEGMENT = 16;
  const MIN_SEGMENT_COVERAGE = 0.38;
  const segments = TRACE_SEGMENTS[scene.letter.toUpperCase()] ?? TRACE_SEGMENTS.H;
  const segmentBuckets = useRef<Set<number>[]>(segments.map(() => new Set<number>()));
  const [zonesDone, setZonesDone] = useState(0);

  useEffect(() => {
    segmentBuckets.current = segments.map(() => new Set<number>());
    setZonesDone(0); setStrokes([]); setDone(false);
  }, [scene.id]);

  const localPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 600, y: ((e.clientY - rect.top) / rect.height) * 600 };
  };
  const segmentHit = (p: { x: number; y: number }, s: TraceSegment) => {
    const vx = s.to.x - s.from.x, vy = s.to.y - s.from.y;
    const lenSq = vx * vx + vy * vy;
    const rawT = lenSq === 0 ? 0 : ((p.x - s.from.x) * vx + (p.y - s.from.y) * vy) / lenSq;
    const t = Math.max(0, Math.min(1, rawT));
    const closest = { x: s.from.x + vx * t, y: s.from.y + vy * t };
    return { t, distance: Math.hypot(p.x - closest.x, p.y - closest.y) };
  };
  const start = (e: React.PointerEvent) => {
    if (done) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    const p = localPoint(e);
    lastPoint.current = p;
    currentPath.current = `M ${p.x} ${p.y}`;
    setStrokes((s) => [...s, currentPath.current]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing || done) return;
    const p = localPoint(e);
    const last = lastPoint.current;
    if (!last) return;
    const dx = p.x - last.x, dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) return;
    lastPoint.current = p;
    currentPath.current += ` L ${p.x} ${p.y}`;
    setStrokes((s) => { const copy = [...s]; copy[copy.length - 1] = currentPath.current; return copy; });
    let changed = false;
    const samples = Math.max(1, Math.ceil(dist / 12));
    for (let step = 0; step <= samples; step += 1) {
      const t = step / samples;
      const sample = { x: last.x + dx * t, y: last.y + dy * t };
      let best: { i: number; t: number; distance: number } | undefined;
      for (let i = 0; i < segments.length; i += 1) {
        const hit = segmentHit(sample, segments[i]);
        if (!best || hit.distance < best.distance) best = { i, ...hit };
      }
      if (best && best.distance <= HIT_RADIUS) {
        const bucket = Math.max(0, Math.min(BUCKETS_PER_SEGMENT - 1, Math.floor(best.t * BUCKETS_PER_SEGMENT)));
        const before = segmentBuckets.current[best.i].size;
        segmentBuckets.current[best.i].add(bucket);
        if (segmentBuckets.current[best.i].size !== before) changed = true;
      }
    }
    const doneCount = segmentBuckets.current.filter((set) => set.size / BUCKETS_PER_SEGMENT >= MIN_SEGMENT_COVERAGE).length;
    if (changed) setZonesDone(doneCount);
    if (doneCount >= segments.length && !done) {
      setDone(true); sfx.gem(); onWin(true);
      void safeSpeak(`${scene.letter}! ${scene.phoneme} ${scene.word}!`, scene.who);
      void playLetterPhonic(scene.letter);
    }
  };
  const end = () => { setDrawing(false); lastPoint.current = null; };
  const reset = () => { setStrokes([]); segmentBuckets.current = segments.map(() => new Set<number>()); setZonesDone(0); setDone(false); };

  const pct = Math.round((zonesDone / segments.length) * 100);
  const c = CAST[scene.who];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">✍️ {scene.teacher}</div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center px-4">
        <div className="relative aspect-square w-full touch-none rounded-3xl border-4 border-white/60 bg-white/25 shadow-2xl backdrop-blur" style={{ boxShadow: done ? `0 0 60px ${c.color}aa` : undefined }}>
          <svg ref={svgRef} viewBox="0 0 600 600" className="h-full w-full select-none" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
            <text x="300" y="470" textAnchor="middle" fontSize="520" fontWeight="900" fontFamily="system-ui, sans-serif" fill="none" stroke={c.color} strokeWidth="12" strokeDasharray="18 14" opacity="0.85">{scene.letter}</text>
            <text x="300" y="470" textAnchor="middle" fontSize="520" fontWeight="900" fontFamily="system-ui, sans-serif" fill={c.color} opacity={pct / 100}>{scene.letter}</text>
            {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />)}
          </svg>
          <div className="pointer-events-none absolute inset-x-4 bottom-3 h-3 overflow-hidden rounded-full bg-white/50">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c.color}, #fff)` }} />
          </div>
        </div>
        <div className="mt-4 flex w-full items-center gap-2">
          <button onClick={reset} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🧽 Erase</button>
          <button onClick={() => { void playLetterPhonic(scene.letter); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
        </div>
        <button
          onClick={() => { if (!done) { setDone(true); sfx.gem(); onWin(true); void safeSpeak(`${scene.letter}! ${scene.phoneme} ${scene.word}!`, scene.who); } onNext(); }}
          className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95"
        >
          Great tracing! ⭐ Next
        </button>
      </div>
    </div>
  );
}

/* ---------- Sound sort ---------- */

function SoundSortScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'sound-sort' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [hotLetter, setHotLetter] = useState<string | null>(null);
  const [gemAwarded, setGemAwarded] = useState(false);
  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const done = slots.every((s) => s.collected);

  useEffect(() => { if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak('Amazing! All sounds sorted!', 'teacher'); } }, [done, gemAwarded]);

  function hitTest(x: number, y: number, itemEl?: Element | null): string | null {
    let cx = x, cy = y;
    if (itemEl) { const r = (itemEl as HTMLElement).getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    const PAD = 48;
    let best: { letter: string; dist: number } | null = null;
    for (const t of scene.targets) {
      const el = targetRefs.current[t.letter];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const inside = (cx >= b.left - PAD && cx <= b.right + PAD && cy >= b.top - PAD && cy <= b.bottom + PAD) || (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD);
      if (!inside) continue;
      const d = Math.hypot(cx - (b.left + b.width / 2), cy - (b.top + b.height / 2));
      if (!best || d < best.dist) best = { letter: t.letter, dist: d };
    }
    return best?.letter ?? null;
  }

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = slots.find((x) => x.idx === idx);
    if (!s || s.collected) return;
    sfx.pop();
    const speaker = scene.targets.find((t) => t.letter === s.it.letter)?.who ?? 'pip';
    cueSpeakOnce(s.it.word, speaker);
    dragIdx.current = idx;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    setHotLetter(hitTest(e.clientX, e.clientY, e.currentTarget));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    dragIdx.current = null;
    const dropLetter = hitTest(e.clientX, e.clientY, e.currentTarget);
    setHotLetter(null);
    if (idx === null) return;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropLetter) return { ...x, dragging: false, dx: 0, dy: 0 };
      if (dropLetter === x.it.letter) { sfx.match(); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
    window.setTimeout(() => setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, flash: 'none' } : x))), 700);
  };

  const orbit = scatterPositions(scene.items.length, [16, 84], 14);

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-0 z-0 bg-white/25 backdrop-blur-md" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-bold text-orange-700 shadow-xl backdrop-blur sm:text-base">🎧 {scene.teacher}</div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center gap-6 px-4 sm:gap-10">
        {scene.targets.map((t) => {
          const c = CAST[t.who];
          const hot = hotLetter === t.letter;
          const collected = slots.filter((s) => s.collected && s.it.letter === t.letter).length;
          const total = slots.filter((s) => s.it.letter === t.letter).length;
          return (
            <button key={t.letter} type="button" ref={(el) => { targetRefs.current[t.letter] = el; }} onClick={() => void playLetterPhonic(t.letter)}
              className={`relative grid h-40 w-40 place-items-center rounded-full border-4 border-dashed shadow-2xl backdrop-blur transition-all sm:h-48 sm:w-48 cursor-pointer active:scale-95 ${hot ? 'scale-110 border-green-400 bg-green-100/90' : 'border-white/80 bg-white/40'}`}>
              <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full opacity-60" style={{ background: `radial-gradient(circle at center, ${c.color}cc, transparent 70%)` }} />
              <div className="pointer-events-none relative flex flex-col items-center gap-1">
                <span className="grid h-24 w-24 place-items-center rounded-3xl text-6xl font-black text-white shadow-lg sm:h-28 sm:w-28 sm:text-7xl" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>{t.letter}</span>
                <p className="text-sm font-black leading-none" style={{ color: c.color }}>{t.phoneme}</p>
                <p className="text-[10px] font-bold text-orange-700">⭐ {collected}/{total}</p>
              </div>
            </button>
          );
        })}
      </div>
      {slots.map((s, i) => {
        const pos = orbit[i % orbit.length];
        if (s.collected) return <div key={s.idx} className="absolute grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-green-300/60 text-4xl opacity-70 ring-2 ring-green-400 backdrop-blur" style={{ left: pos.left, top: pos.top }}>✅</div>;
        const glow = s.flash === 'bad' ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] animate-[lep1-shake_0.4s_ease-in-out]' : s.flash === 'good' ? 'drop-shadow-[0_0_18px_rgba(34,197,94,0.9)]' : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]';
        return (
          <button key={s.idx} onPointerDown={onDown(s.idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className={`absolute h-40 w-40 sm:h-52 sm:w-52 -translate-x-1/2 -translate-y-1/2 touch-none select-none bg-transparent p-0 transition ${glow} ${s.dragging ? 'z-20 scale-125' : 'hover:scale-110 animate-[lep1-float_3s_ease-in-out_infinite]'}`}
            style={{ left: pos.left, top: pos.top, animationDelay: `${(i % 4) * 0.3}s`, transform: s.dragging ? `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px)) scale(1.25) rotate(-4deg)` : `translate(-50%, -50%) rotate(${pos.rot}deg)`, transition: s.dragging ? 'none' : 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)' }}
            aria-label={s.it.word}
          >
            {s.it.img ? <img src={s.it.img} alt={s.it.word} draggable={false} className="pointer-events-none h-full w-full object-contain" /> : <span className="pointer-events-none grid h-full w-full place-items-center text-6xl">{s.it.emoji}</span>}
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">✨ All sounds matched! Next →</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Word build ---------- */

function WordBuildScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'word-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => {
    if (complete) return;
    setFilled(null); setWrong(null);
    const t = window.setTimeout(() => void safeSpeak(r.word, 'pip'), 350);
    return () => window.clearTimeout(t);
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (filled || complete) return;
    if (letter.toLowerCase() === r.answer.toLowerCase()) {
      sfx.match(); setFilled(letter); await safeSpeak(r.word, 'pip');
      window.setTimeout(() => {
        const next = round + 1;
        if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
        setRound(next);
      }, 900);
    } else { sfx.wrong(); onLose(); setWrong(letter); window.setTimeout(() => setWrong(null), 500); }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built {total} words! ⭐ Next</button>
      </div>
    );
  }

  const letters = r.word.split('');
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧩 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-6 px-4">
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="grid h-44 w-44 place-items-center rounded-3xl p-2 transition active:scale-95 sm:h-52 sm:w-52" aria-label={`Hear ${r.word}`}>
          {r.img ? <img src={r.img} alt={r.word} className="h-full w-full object-contain drop-shadow-2xl" draggable={false} /> : <span className="text-7xl drop-shadow-2xl">{r.emoji}</span>}
        </button>
        <div className="flex items-end gap-2">
          {letters.map((ch, i) => {
            const isBlank = i === r.blankIndex;
            const display = isBlank ? (filled ?? '_') : ch;
            return <div key={i} className={`grid place-items-center rounded-2xl border-4 font-black uppercase shadow-lg ${isBlank ? (filled ? 'border-green-400 bg-green-100 text-green-700' : 'border-dashed border-white bg-white/70 text-orange-700') : 'border-white bg-white/90 text-orange-700'}`} style={{ width: 62, height: 78, fontSize: 42 }}>{display}</div>;
          })}
        </div>
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="rounded-full bg-white/95 px-6 py-2 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
        <div className="flex flex-wrap justify-center gap-3">
          {r.choices.map((L) => (
            <button key={L} onClick={() => tap(L)} disabled={!!filled} className={`grid h-20 w-20 place-items-center rounded-2xl border-4 border-white text-4xl font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40 sm:h-24 sm:w-24 sm:text-5xl ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ background: L === 'H' ? 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' : 'linear-gradient(135deg,#B85CD1,#D57BE6)' }}>{L}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Who said it ---------- */

function WhoSaidItScene({ scene, onWin, onNext }: { scene: Extract<Scene, { kind: 'who-said-it' }>; onWin: (gem: boolean) => void; onNext: () => void }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'prompt' | 'playing' | 'repeat' | 'done'>('prompt');
  const [tapped, setTapped] = useState<CharKey | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;

  const roster = useMemo(() => {
    const seen = new Set<string>();
    const list: CharKey[] = [];
    for (const r of scene.rounds) if (!seen.has(r.who)) { seen.add(r.who); list.push(r.who); }
    return list;
  }, [scene.rounds]);

  const spots = useMemo(() => {
    const n = roster.length;
    const leftPad = n <= 3 ? 18 : 10;
    const usable = 100 - leftPad * 2;
    const step = n > 1 ? usable / (n - 1) : 0;
    const sizeVh = n <= 3 ? 62 : 54;
    const widthVw = n <= 3 ? 30 : 24;
    return roster.map((who, i) => ({ who, leftPct: leftPad + step * i, bottomPct: 12, sizeVh, widthVw }));
  }, [roster]);

  const target = scene.rounds[round]?.who ?? null;
  const targetLine = scene.rounds[round]?.line ?? '';

  const pick = async (choice: CharKey) => {
    if (phase !== 'prompt' || !target) return;
    setTapped(choice);
    if (choice !== target) { sfx.wrong(); setTapped(null); return; }
    sfx.match(); setPhase('playing');
    await safeSpeak(targetLine, target);
    setPhase('repeat');
    await new Promise((r) => window.setTimeout(r, 1600));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setTapped(null); setRound(next); setPhase(next >= total ? 'done' : 'prompt');
  };

  const replayModel = async () => { if (target) await safeSpeak(targetLine, target); };

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      {spots.map((s) => {
        const c = CAST[s.who];
        const isTarget = !finished && s.who === target;
        const isTapped = tapped === s.who;
        const speaking = (phase === 'playing' || phase === 'repeat') && s.who === target;
        const scale = isTapped ? 1.12 : speaking ? 1.08 : 1;
        return (
          <button key={s.who} onClick={() => pick(s.who)} disabled={phase !== 'prompt'} aria-label={`Tap ${c.name}`}
            className="absolute z-20 -translate-x-1/2 grid place-items-end cursor-pointer disabled:cursor-default"
            style={{ left: `${s.leftPct}%`, bottom: `${s.bottomPct}%`, height: `${s.sizeVh}vh`, width: `min(${s.widthVw}vw, ${s.sizeVh * 0.68}vh)`, transform: `translateX(-50%) scale(${scale})`, transition: 'transform 0.3s ease-out', transformOrigin: '50% 100%' }}
          >
            <img src={c.img} alt={c.name} className="pointer-events-none block h-full w-full select-none object-contain" style={{ filter: speaking ? 'drop-shadow(0 12px 18px rgba(254,106,47,0.85))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }} />
            <span className={`pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black shadow-lg whitespace-nowrap ${isTarget && phase === 'prompt' ? 'bg-orange-500 text-white animate-pulse' : 'bg-white/90 text-neutral-800'}`}>{c.name}</span>
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <div className="pointer-events-auto rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur">🎧 Listen & repeat — Round {Math.min(round + 1, total)} / {total}</div>
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-6">
        {!finished && phase === 'prompt' && target && (
          <div className="w-full max-w-md rounded-3xl bg-white/85 p-3 text-center shadow-2xl backdrop-blur-md">
            <p className="text-base font-bold text-neutral-800">👉 Tap <span className="text-orange-600">{CAST[target].name}</span> to hear them.</p>
          </div>
        )}
        {!finished && (phase === 'playing' || phase === 'repeat') && (
          <button onClick={replayModel} className="rounded-full bg-white/90 px-5 py-2 text-sm font-black text-orange-700 shadow-md backdrop-blur active:scale-95">🔊 Hear again</button>
        )}
        {finished && <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Great job! Next →</button>}
      </div>
    </div>
  );
}

/* ---------- Gather ---------- */

function GatherScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'gather' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const IMG_W = 1920, IMG_H = 1152;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [spoken, setSpoken] = useState<Set<CharKey>>(new Set());
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Measure our own bounded container (not the browser window) so hotspot
  // math stays correct when this scene is embedded in the smaller classroom
  // stage rather than filling the whole viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const project = (x: number, y: number, r: number) => {
    const w = viewport.w || IMG_W, h = viewport.h || IMG_H;
    return { left: (x / IMG_W) * w, top: (y / IMG_H) * h, size: (r / IMG_W) * w * 2 };
  };
  const stagePos = project(scene.stage.x, scene.stage.y, scene.stage.r);

  const tapHotspot = async (h: (typeof scene.hotspots)[number]) => { sfx.match(); setSpoken((s) => new Set(s).add(h.who)); await safeSpeak(h.line, h.who); };

  const startCamera = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
      setCamActive(true); sfx.gem();
      if (!gemDone) { setGemDone(true); onWin(true); }
    } catch {
      setCamError('Camera unavailable — you can still say your name out loud!');
      setCamActive(true);
      if (!gemDone) { setGemDone(true); onWin(true); }
    }
  };

  // All pointer coordinates below are converted from viewport-relative
  // (e.clientX/Y) to container-relative, matching the container-relative
  // `project()` math above.
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (camActive) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const rect = containerRef.current?.getBoundingClientRect();
    setDragging(true);
    setDragPos({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    setDragPos({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const rect = containerRef.current?.getBoundingClientRect();
    const dx = (e.clientX - (rect?.left ?? 0)) - stagePos.left, dy = (e.clientY - (rect?.top ?? 0)) - stagePos.top;
    const inside = Math.hypot(dx, dy) <= stagePos.size / 2 + 40;
    setDragPos(null);
    if (inside) void startCamera(); else sfx.wrong();
  };
  const allSpoken = spoken.size >= scene.hotspots.length;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {scene.hotspots.map((h) => {
        const p = project(h.x, h.y, h.r);
        return <button key={h.who} onClick={() => tapHotspot(h)} aria-label={`Tap ${CAST[h.who].name}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent" style={{ left: p.left, top: p.top, width: p.size, height: p.size }}><span className="sr-only">{CAST[h.who].name}</span></button>;
      })}
      {scene.hotspots.map((h) => {
        if (!spoken.has(h.who)) return null;
        const p = project(h.x, h.y, h.r);
        const c = CAST[h.who];
        return (
          <div key={`bubble-${h.who}`} className="absolute z-30 -translate-x-1/2 animate-[lep1-slide-up_0.35s_ease-out]" style={{ left: p.left, top: p.top - p.size / 2 - 20 }}>
            <div className="relative max-w-[16rem] rounded-2xl bg-white/95 px-4 py-2 text-center text-sm font-black shadow-2xl ring-4 backdrop-blur sm:text-base" style={{ color: c.color, borderColor: c.color }}>{h.line}</div>
          </div>
        );
      })}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: stagePos.left, top: stagePos.top, width: stagePos.size, height: stagePos.size, boxShadow: camActive ? '0 0 0 6px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.55)' : dragging ? '0 0 0 8px rgba(254,106,47,0.85), 0 0 60px rgba(254,106,47,0.55)' : '0 0 0 4px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.4)', transition: 'box-shadow 0.2s' }}>
        {camActive ? (
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-2xl bg-black">
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-black uppercase text-white shadow-lg">You ⭐</span>
          </div>
        ) : (
          <div className="pointer-events-none flex h-full w-full items-center justify-center"><span className="text-4xl animate-bounce">📸</span></div>
        )}
      </div>
      {!camActive && (
        <button onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          className="absolute z-30 flex select-none items-center gap-2 rounded-full bg-white/95 px-4 py-3 font-black text-orange-700 shadow-2xl backdrop-blur-md ring-4 ring-orange-400 active:scale-95"
          style={{ left: dragPos ? dragPos.x : 24, top: dragPos ? dragPos.y : (viewport.h || 600) - 120, transform: dragging ? 'translate(-50%, -50%) scale(1.1)' : undefined, touchAction: 'none', transition: dragging ? 'none' : 'transform 0.15s' }}
        >
          <span className="text-3xl">🎥</span><span className="text-sm">Drag me!</span>
        </button>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="pointer-events-auto max-w-lg rounded-3xl bg-white/90 px-5 py-3 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur">
          {camActive ? '🌟 Your turn! Say: Hello, my name is ______.' : allSpoken ? 'Great! Now drag 🎥 to the daisy circle for your turn.' : scene.teacher}
        </div>
      </div>
      {camError && <div className="absolute inset-x-0 bottom-24 flex justify-center px-4"><div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-900 shadow">{camError}</div></div>}
      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); onNext(); }} disabled={!camActive && !allSpoken} className="rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-orange-600">
          {camActive ? 'I did it! ➜' : 'Next ➜'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Memory ---------- */

function MemoryScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'memory' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  type Card = { key: string; pairId: string; label: string; emoji: string; img?: string };
  const deck = useMemo<Card[]>(() => {
    const base = scene.pairs.flatMap((p) => [{ key: `${p.id}-a`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img }, { key: `${p.id}-b`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img }]);
    return base.map((c, i) => ({ c, r: (i * 9301 + 49297) % 233280 })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }, [scene.id]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [gemDone, setGemDone] = useState(false);


  const tap = async (card: Card) => {
    if (busy || matched.has(card.pairId) || flipped.includes(card.key)) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    void safeSpeak(card.label, 'teacher');
    if (next.length === 2) {
      setBusy(true);
      const a = deck.find((c) => c.key === next[0])!, b = deck.find((c) => c.key === next[1])!;
      await new Promise((r) => setTimeout(r, 700));
      if (a.pairId === b.pairId) {
        sfx.match();
        setMatched((m) => {
          const copy = new Set(m); copy.add(a.pairId);
          if (copy.size === scene.pairs.length && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
          return copy;
        });
      } else { sfx.wrong(); onLose(); }
      setFlipped([]); setBusy(false);
    }
  };
  const complete = matched.size === scene.pairs.length;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧠 {scene.teacher}</div>
      <div className="relative z-10 grid w-full max-w-[860px] grid-cols-4 gap-5 px-4 sm:gap-6">
        {deck.map((card) => {
          const isMatched = matched.has(card.pairId);
          const isFlipped = flipped.includes(card.key) || isMatched;
          return (
            <button key={card.key} onClick={() => tap(card)} disabled={busy || isMatched} className="relative aspect-square [perspective:800px]" aria-label={isFlipped ? card.label : 'Hidden card'}>
              <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-white text-3xl font-black text-white shadow-xl [backface-visibility:hidden]" style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>?</div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-4 bg-white p-2 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${isMatched ? 'border-green-400 ring-4 ring-green-300/60' : 'border-white'}`}>
                  {card.img ? <img src={card.img} alt="" className="h-3/4 w-3/4 object-contain" draggable={false} /> : <span className="text-4xl">{card.emoji}</span>}
                  <span className="mt-1 text-[10px] font-black text-orange-700 sm:text-xs">{card.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {complete && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95">All pairs! ⭐ Next</button></div>}
    </div>
  );
}

/* ---------- Dash ---------- */

type DashItem = { id: number; word: string; letter: string; img?: string; emoji: string; lane: number; x: number; correct: boolean; taken: boolean };

function DashScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'dash' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [rings, setRings] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [time, setTime] = useState(scene.seconds);
  const [status, setStatus] = useState<'ready' | 'play' | 'win' | 'lose'>('ready');
  const [items, setItems] = useState<DashItem[]>([]);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const nextIdRef = useRef(1);
  const gemDoneRef = useRef(false);
  const heroSrc = CAST[scene.who].img;


  const start = () => { setRings(0); setHearts(3); setTime(scene.seconds); setItems([]); gemDoneRef.current = false; setStatus('play'); };

  useEffect(() => {
    if (status !== 'play') return;
    const spawn = window.setInterval(() => {
      const pick = scene.items[Math.floor(Math.random() * scene.items.length)];
      setItems((prev) => [...prev, { id: nextIdRef.current++, word: pick.word, letter: pick.letter, img: pick.img, emoji: pick.emoji, lane: Math.floor(Math.random() * 3), x: -8, correct: pick.letter === scene.targetLetter, taken: false }]);
    }, 1100);
    return () => window.clearInterval(spawn);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    const t = window.setInterval(() => {
      setItems((prev) => prev.map((it) => (it.taken ? it : { ...it, x: it.x + 1.6 })).filter((it) => it.x < 108));
      setTime((s) => (s > 0 ? s - 0.1 : 0));
    }, 100);
    return () => window.clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    if (rings >= scene.goal) { setStatus('win'); sfx.gem(); if (!gemDoneRef.current) { gemDoneRef.current = true; onWin(true); } }
    else if (hearts <= 0 || time <= 0) { setStatus('lose'); sfx.wrong(); onLose(); }
  }, [rings, hearts, time, status]);

  const tap = (id: number) => {
    if (status !== 'play') return;
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (!it || it.taken) return prev;
      if (it.correct) { sfx.ring(); setRings((r) => r + 1); setFlash('good'); void safeSpeak(it.word, scene.who); }
      else { sfx.wrong(); setHearts((h) => h - 1); setFlash('bad'); }
      window.setTimeout(() => setFlash(null), 200);
      return prev.map((x) => (x.id === id ? { ...x, taken: true } : x));
    });
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,0.35) 40px 42px)', animation: 'lep1-dashScroll 0.6s linear infinite' }} />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-center justify-between px-4">
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl backdrop-blur">💍 {rings} / {scene.goal}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-pink-600 shadow-xl backdrop-blur">{'❤️'.repeat(Math.max(0, hearts))}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-slate-700 shadow-xl backdrop-blur">⏱ {Math.ceil(time)}s</div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-5 py-2 text-base font-black text-white shadow-2xl">
        Tap only <span className="mx-1 rounded-lg bg-white px-2 py-0.5 text-orange-600">{scene.targetLetter}</span> {scene.targetPhoneme}
      </div>
      {flash && <div className={`pointer-events-none absolute inset-0 z-20 ${flash === 'good' ? 'bg-yellow-200/30' : 'bg-rose-500/25'}`} />}
      <div className="pointer-events-none absolute left-4 bottom-16 z-20 sm:left-8" style={{ animation: 'lep1-heroBounce 0.45s ease-in-out infinite' }}>
        <img src={heroSrc} alt={scene.who} className="h-40 w-40 object-contain drop-shadow-2xl sm:h-52 sm:w-52" draggable={false} />
      </div>
      {[0, 1, 2].map((lane) => (
        <div key={lane} className="absolute left-0 right-0" style={{ top: `${30 + lane * 20}%`, height: 0 }}>
          {items.filter((it) => it.lane === lane && !it.taken).map((it) => (
            <button key={it.id} onClick={() => tap(it.id)} className="absolute grid h-24 w-24 -translate-y-1/2 place-items-center rounded-3xl border-4 border-white bg-white/95 shadow-2xl active:scale-90 sm:h-28 sm:w-28" style={{ right: `${it.x}%`, animation: 'lep1-itemBob 0.8s ease-in-out infinite' }} aria-label={it.word}>
              {it.img ? <img src={it.img} alt={it.word} className="h-16 w-16 object-contain sm:h-20 sm:w-20" draggable={false} /> : <span className="text-4xl">{it.emoji}</span>}
              <span className="pointer-events-none absolute -bottom-6 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow">{it.word}</span>
            </button>
          ))}
        </div>
      ))}
      {status === 'ready' && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 backdrop-blur-sm">
          <button onClick={start} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">▶ Start Dash!</button>
        </div>
      )}
      {(status === 'win' || status === 'lose') && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex flex-col items-center gap-3 px-6">
          <div className={`rounded-2xl px-5 py-2 text-lg font-black text-white shadow-xl ${status === 'win' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{status === 'win' ? `⭐ Great dash! ${rings} rings!` : `Nice try! ${rings} rings.`}</div>
          <div className="flex gap-3">
            <button onClick={start} className="rounded-full bg-white/95 px-6 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Again</button>
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-base font-black text-white shadow-2xl active:scale-95">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Feelings ---------- */

function FeelingsScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'feelings' }>; onNext: () => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const choose = async (idx: number) => {
    setPick(idx);
    const label = scene.options[idx].label.toLowerCase();
    const voice: Character = label.includes('happy') ? 'mia' : label.includes('sad') ? 'bella' : 'pip';
    await safeSpeak(scene.options[idx].reply, voice);
  };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 max-w-lg rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher}</div>
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {scene.options.map((o, idx) => (
          <button key={idx} onClick={() => choose(idx)} className={`grid aspect-square w-24 place-items-center rounded-3xl bg-white/95 shadow-xl transition active:scale-95 sm:w-28 ${pick === idx ? 'ring-4 ring-orange-500 scale-105' : 'hover:scale-105'}`}>
            <span className="text-5xl sm:text-6xl">{o.emoji}</span>
            <span className="mt-1 text-xs font-bold text-neutral-700 sm:text-sm">{o.label}</span>
          </button>
        ))}
      </div>
      {pick !== null && (
        <div className="relative z-20 max-w-md rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
          <p className="text-lg font-bold text-orange-700">{scene.options[pick].reply}</p>
        </div>
      )}
      <button onClick={onNext} disabled={pick === null} className="relative z-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">Finish 🎉</button>
    </div>
  );
}

/* ---------- Puzzle ---------- */

function PuzzleScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'puzzle' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [pick, setPick] = useState<CharKey | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const GRID = 9;

  useEffect(() => {
    if (finished) return;
    setRevealed(new Set()); setPick(null); setCorrect(null);
  }, [round, finished]);

  const tapPiece = (i: number) => { if (!r || correct !== null) return; setRevealed((s) => { const c = new Set(s); c.add(i); return c; }); sfx.match(); };
  const guess = async (who: CharKey) => {
    if (!r || correct !== null) return;
    setPick(who);
    const ok = who === r.who;
    setCorrect(ok);
    if (ok) {
      sfx.match(); setRevealed(new Set(Array.from({ length: GRID }, (_, i) => i))); sfx.gem();
      window.setTimeout(() => { const next = round + 1; if (next >= total && !gemDone) { setGemDone(true); onWin(true); } setRound(next); }, 2200);
    } else { sfx.wrong(); onLose(); window.setTimeout(() => { setPick(null); setCorrect(null); }, 700); }
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You guessed them all! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧩 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className="relative z-10 mt-16 h-[46vh] w-[46vh] max-w-[92vw] overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
        <img src={r!.emotion ? getEmotionSprite(r!.who, r!.emotion) : r!.img} alt="mystery friend" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: GRID }, (_, i) => {
            const isRev = revealed.has(i);
            return <button key={i} onClick={() => tapPiece(i)} disabled={isRev} className={`border border-white/50 transition-opacity duration-300 ${isRev ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ background: 'linear-gradient(135deg,#FE6A2F,#FEBE4C)' }} aria-label={`Reveal piece ${i + 1}`}><span className="text-2xl font-black text-white drop-shadow">?</span></button>;
          })}
        </div>
      </div>
      <p className="relative z-10 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-neutral-800 shadow backdrop-blur">💡 {r!.hint}</p>
      <div className="relative z-10 flex flex-wrap justify-center gap-3">
        {Array.from(new Set(scene.rounds.map((rd) => rd.who))).map((who) => {
          const c = CAST[who];
          const isPick = pick === who;
          const showWrong = isPick && correct === false;
          return (
            <button key={who} onClick={() => guess(who)} disabled={correct !== null} className={`flex flex-col items-center rounded-2xl border-4 bg-white/95 px-4 py-3 shadow-xl active:scale-95 ${isPick && correct ? 'border-green-400 ring-4 ring-green-300/60' : showWrong ? 'border-red-400 animate-[lep1-shake_0.4s_ease-out]' : 'border-white'}`}>
              <img src={c.img} alt={c.name} className="h-16 w-16 object-contain" draggable={false} />
              <span className="mt-1 text-sm font-black text-orange-700">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Roleplay ---------- */

function RoleplayScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'roleplay' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [step, setStep] = useState(-1);
  const [awaitingRepeat, setAwaitingRepeat] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const stopRef = useRef(false);
  const runRef = useRef<((i: number) => void) | null>(null);

  useEffect(() => {
    stopRef.current = false;
    async function run(i: number) {
      if (stopRef.current) return;
      if (i >= scene.script.length) { setStep(scene.script.length); return; }
      setStep(i);
      const line = scene.script[i];
      await new Promise((r) => setTimeout(r, 350));
      if (stopRef.current) return;
      await safeSpeak(line.line, line.who);
      if (stopRef.current) return;
      if (line.repeat) setAwaitingRepeat(true);
      else { await new Promise((r) => setTimeout(r, 500)); run(i + 1); }
    }
    runRef.current = run;
    run(0);
    return () => { stopRef.current = true; stopSpeaking(); };
  }, [scene.id]);

  const confirmRepeat = () => {
    if (!awaitingRepeat) return;
    setAwaitingRepeat(false);
    if (!gemDone) { onWin(true); setGemDone(true); }
    const next = step + 1;
    setTimeout(() => runRef.current?.(next), 250);
  };

  const positions: Record<string, { left: string; bottom: string; scale: number }> = {
    pip: { left: '12%', bottom: '10vh', scale: 1.35 },
    mia: { left: '34%', bottom: '9vh', scale: 1.15 },
    bella: { left: '58%', bottom: '10vh', scale: 1.3 },
    willow: { left: '82%', bottom: '11vh', scale: 1.2 },
  };
  const current = step >= 0 && step < scene.script.length ? scene.script[step] : null;
  const replayCurrent = () => { if (current) void safeSpeak(current.line, current.who); };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Roleplay · Say Hello</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Listen · Repeat · Play</span>
      </div>
      {current && <button onClick={replayCurrent} className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 shadow-2xl ring-2 ring-orange-200 active:scale-95" aria-label="Repeat what the character said">🔁 Play again</button>}
      {current && !awaitingRepeat && (
        <div className="absolute z-20 max-w-[520px] -translate-x-1/2 px-4 transition-all duration-300" style={{ left: positions[current.who]?.left ?? '50%', bottom: `calc(${positions[current.who]?.bottom ?? '12vh'} + clamp(240px, 40vh, 460px) * ${positions[current.who]?.scale ?? 1} + 20px)` }}>
          <div className="relative rounded-3xl bg-white/95 px-5 py-3 text-center text-xl font-black text-orange-800 shadow-2xl sm:text-2xl">“{current.line}”</div>
        </div>
      )}
      {awaitingRepeat && current && (
        <>
          <div className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[2px]" />
          <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
            <div className="relative w-full max-w-xl rounded-[36px] bg-white/98 p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-4 ring-orange-300">
              <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn!</div>
              <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-orange-400/40 animate-ping" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-4xl shadow-xl">🎤</div>
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-neutral-500">Say it like {CAST[current.who].name}</div>
              <div className="mt-1 text-3xl font-black text-orange-700 sm:text-4xl">“{current.line}”</div>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button onClick={replayCurrent} className="flex items-center gap-2 rounded-full bg-orange-100 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-200 active:scale-95">🔁 Hear again</button>
                <button onClick={confirmRepeat} className="flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I said it</button>
              </div>
            </div>
          </div>
        </>
      )}
      {step >= scene.script.length && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Join stage ---------- */

function JoinStageScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'join-stage' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [turnIdx, setTurnIdx] = useState(0);
  const [gemDone, setGemDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => { stopSpeaking(); streamRef.current?.getTracks().forEach((t) => t.stop()); }, [scene.id]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480 }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play().catch(() => {}); }
      } catch { /* fallback: no video */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentTurn = turnIdx < scene.turns.length ? scene.turns[turnIdx] : null;
  const isStudentTurn = currentTurn?.who === 'student';
  const isFriendTurn = !!currentTurn && !isStudentTurn;
  const friendKey = isFriendTurn ? (currentTurn!.who as CharKey) : null;
  const friendMeta = friendKey ? CAST[friendKey] : null;
  const done = turnIdx >= scene.turns.length;

  useEffect(() => { if (isFriendTurn && friendKey && currentTurn) cueSpeakOnce(currentTurn.line, friendKey); }, [turnIdx, isFriendTurn, friendKey]);

  const advance = () => {
    if (isStudentTurn && !gemDone) { onWin(true); setGemDone(true); }
    stopSpeaking();
    setTurnIdx((i) => i + 1);
  };

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Live Stage · Your Turn</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">🎤 Listen · Answer · Talk</span>
      </div>
      {currentTurn && isFriendTurn && (
        <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
          <div className="max-w-[720px] rounded-[28px] bg-white/98 px-8 py-5 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-4 ring-orange-200">
            <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: friendMeta?.color ?? '#FE6A2F' }}><span className="text-lg">{friendMeta?.emoji ?? '🎓'}</span> {friendMeta?.name ?? 'Teacher'} asks</div>
            <div className="text-3xl font-black text-orange-800 sm:text-4xl">“{currentTurn.line}”</div>
            {friendKey && <button onClick={() => cueSpeakOnce(currentTurn.line, friendKey)} className="mt-3 mr-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-300 shadow active:scale-95">🔊 Hear again</button>}
            <button onClick={advance} className="mt-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl active:scale-95">🎤 My turn</button>
          </div>
        </div>
      )}
      {currentTurn && isStudentTurn && (
        <div className="absolute inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="w-full max-w-[700px] rounded-[32px] bg-white/98 p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] ring-4 ring-orange-300">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn — say it!</div>
            <div className="mt-1 text-3xl font-black text-orange-700 sm:text-4xl">“{currentTurn.line}”</div>
            <button onClick={advance} className="mt-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I answered</button>
          </div>
        </div>
      )}
      <div className="absolute left-1/2 z-30" style={{ top: '58%', transform: 'translate(-50%, -50%)' }}>
        <div className={`relative flex items-center justify-center overflow-hidden rounded-full border-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-all ${isStudentTurn ? 'border-orange-400 ring-8 ring-orange-300/70' : 'border-white/95 ring-4 ring-white/40'}`} style={{ width: 'clamp(300px, 46vw, 500px)', height: 'clamp(300px, 46vw, 500px)', background: 'linear-gradient(135deg, #FE6A2F, #FEBE4C)' }}>
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <span className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-48px' }}>
          <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 shadow-2xl ring-4 ring-white transition-transform ${isStudentTurn ? 'scale-110' : ''}`} style={{ width: 96, height: 96 }}>
            {isStudentTurn && <span className="absolute inset-0 rounded-full bg-orange-400/50 animate-ping" />}
            <span className="relative text-5xl drop-shadow-md">🎤</span>
          </div>
        </div>
      </div>
      {done && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button></div>}
    </div>
  );
}

/* ---------- Hello doors ---------- */

function HelloDoorsScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'hello-doors' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<CharKey[]>(scene.cast);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<'reveal' | 'shuffle' | 'prompt' | 'greet' | 'echo' | 'done'>('reveal');
  const [score, setScore] = useState(0);
  const [gemDone, setGemDone] = useState(false);
  const answeredRef = useRef(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  const shuffle = (arr: CharKey[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    answeredRef.current = false; setOpenIdx(null); setWrongIdx(null);
    (async () => {
      if (round === 0) {
        setOrder(scene.cast); setPhase('reveal');
        for (const who of scene.cast) { await safeSpeak(CAST[who].name, who); if (cancelled) return; }
        await new Promise((res) => setTimeout(res, 400));
        if (cancelled) return;
      }
      setPhase('shuffle');
      if (cancelled) return;
      for (let k = 0; k < 3; k++) { setOrder((o) => shuffle(o)); await new Promise((res) => setTimeout(res, 420)); if (cancelled) return; }
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setPhase('prompt');
      await new Promise((res) => setTimeout(res, 200));
      await safeSpeak(r.prompt, r.target);
    })();
    return () => { cancelled = true; };
  }, [round]);

  const tap = async (idx: number) => {
    if (!r || answeredRef.current) return;
    const who = order[idx];
    if (who !== r.target) { setWrongIdx(idx); sfx.wrong(); onLose(); window.setTimeout(() => setWrongIdx(null), 500); return; }
    answeredRef.current = true; setOpenIdx(idx); setPhase('greet'); sfx.match();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.helloLine, who);
    setPhase('echo');
    await new Promise((res) => setTimeout(res, 250));
    await safeSpeak(r.echoLine, r.target);
    setScore((s) => s + 1);
    await new Promise((res) => setTimeout(res, 1400));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setRound(next);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Wonderful hellos!</div>
            <div className="text-lg font-bold text-neutral-700">You greeted every friend! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const doorPositions = [17, 50, 83];
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-xl">
        {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r!.prompt, r!.target)} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      {phase === 'echo' && <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-3xl bg-white px-6 py-4 text-2xl font-black text-orange-600 shadow-2xl ring-4 ring-orange-200">🎤 {r!.echoLine}</div>}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 z-10 h-[82%] ${phase === 'shuffle' ? 'animate-[lep1-shuffleShake_0.42s_ease-in-out_infinite]' : ''}`}>
        {doorPositions.map((left, i) => {
          const who = order[i];
          const c = CAST[who];
          const isOpen = openIdx === i || phase === 'reveal';
          const isWrong = wrongIdx === i;
          const isIdle = openIdx === null && !answeredRef.current && phase === 'prompt';
          const stepOutside = i === doorPositions.length - 1 ? '28%' : '72%';
          const showChar = openIdx === i || phase === 'reveal';
          return (
            <div key={i} className="absolute bottom-0" style={{ left: `${left}%`, transform: 'translateX(-50%)', width: '28%', maxWidth: 320, height: 'clamp(260px, 52vh, 480px)' }}>
              <div className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2" style={{ left: phase === 'reveal' ? '50%' : openIdx === i ? stepOutside : '50%', bottom: '-14%', width: 'clamp(420px, 42vw, 620px)', height: 'clamp(420px, 42vw, 620px)', transform: showChar ? 'translateY(0) scale(1)' : 'translateY(10%) scale(0.96)', opacity: showChar ? 1 : 0, transition: 'left 0.45s ease-out, transform 0.45s ease-out, opacity 0.25s ease-out', transitionDelay: openIdx === i ? '0.35s' : '0s' }}>
                <img src={c.img} alt={c.name} draggable={false} className="h-full w-full max-w-none object-contain" style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))' }} />
                {phase === 'reveal' && <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-lg font-black text-neutral-800 shadow-xl ring-2 ring-white" style={{ color: c.color }}>{c.name}</div>}
                {(phase === 'greet' || phase === 'echo') && openIdx === i && <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-base font-black text-neutral-800 shadow-xl ring-2 ring-white">{r!.helloLine}</div>}
              </div>
              <button onClick={() => tap(i)} disabled={answeredRef.current || phase !== 'prompt'} aria-label={`Door ${i + 1}`} className={`absolute inset-0 ${isWrong ? 'animate-[lep1-shake_0.5s]' : ''} ${isIdle ? 'hover:-translate-y-1' : ''} transition-transform active:scale-95`}>
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-t-full" style={{ width: '112%', height: '20%', background: `linear-gradient(180deg, ${c.color} 0%, ${c.color}dd 100%)`, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} />
                <div className="absolute left-1/2 top-[16%] h-[84%] w-[94%] -translate-x-1/2 overflow-hidden rounded-t-[46%] border-[7px] border-amber-950 shadow-2xl" style={{ background: 'radial-gradient(ellipse at 50% 70%, #4a2c14 0%, #1a0d05 100%)' }}>
                  <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0, background: `radial-gradient(circle at 50% 65%, ${c.color}ee 0%, ${c.color}88 35%, rgba(0,0,0,0.4) 90%)` }} />
                  <div className="absolute inset-y-0 left-0 w-1/2 origin-left transition-transform duration-[700ms]" style={{ transform: isOpen ? 'perspective(800px) rotateY(-110deg)' : 'rotateY(0deg)', background: 'linear-gradient(90deg, #8A5028 0%, #A76A3D 60%, #C68B58 100%)' }} />
                  <div className="absolute inset-y-0 right-0 w-1/2 origin-right transition-transform duration-[700ms]" style={{ transform: isOpen ? 'perspective(800px) rotateY(110deg)' : 'rotateY(0deg)', background: 'linear-gradient(270deg, #8A5028 0%, #A76A3D 60%, #C68B58 100%)' }} />
                </div>
                {isWrong && <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center text-8xl font-black text-red-500 drop-shadow-lg">✗</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Color friends ---------- */

function ColorFriendsScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'color-friends' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const CHARS = scene.cast;
  const PAINT_COLORS = ['#FE6A2F', '#F59E0B', '#FACC15', '#84CC16', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#78350F', '#111827'];
  const BRUSHES = [18, 30, 46];
  const [idx, setIdx] = useState(0);
  const [color, setColor] = useState(PAINT_COLORS[0]);
  const [brush, setBrush] = useState(BRUSHES[1]);
  const [gemDone, setGemDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const who = CHARS[idx] ?? 'pip';
  const c = CAST[who];
  const sketch = COLOR_SKETCH[who];

  useEffect(() => { clearCanvas(); if (idx > 0) cueSpeak(`${c.name}!`, who); }, [idx]);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;
  const clearCanvas = () => { const canvas = canvasRef.current; const ctx = getCtx(); if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); };
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  useEffect(() => { resizeCanvas(); const onResize = () => resizeCanvas(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [who]);

  const localPoint = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const strokeTo = (x: number, y: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    const from = lastPtRef.current ?? { x, y };
    ctx.strokeStyle = color; ctx.lineWidth = brush; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(x, y); ctx.stroke();
    lastPtRef.current = { x, y };
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); paintingRef.current = true; const p = localPoint(e); lastPtRef.current = p; strokeTo(p.x, p.y); };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!paintingRef.current) return; const p = localPoint(e); strokeTo(p.x, p.y); };
  const endStroke = () => { paintingRef.current = false; lastPtRef.current = null; };
  const handleDone = () => { if (!gemDone) { setGemDone(true); onWin(true); } if (idx + 1 < CHARS.length) setIdx(idx + 1); else onNext(); };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/15 to-white/50" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">🎨 Color {c.name}!</div>
      <div className="absolute inset-x-0 top-14 bottom-36 z-10 flex items-center justify-center">
        <div key={who} className="relative aspect-[400/520] h-full max-h-full max-w-[96vw] overflow-hidden rounded-3xl bg-[#FFFDF7] shadow-2xl ring-2 ring-white/70">
          <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endStroke} onPointerCancel={endStroke} onPointerLeave={endStroke} className="absolute inset-0 h-full w-full touch-none" style={{ cursor: 'crosshair' }} />
          <img src={sketch} alt={c.name} className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" draggable={false} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-3 z-30 flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-2xl">
          {PAINT_COLORS.map((col) => <button key={col} onClick={() => setColor(col)} aria-label={`Color ${col}`} className={`h-10 w-10 rounded-full transition-transform active:scale-90 ${col === color ? 'ring-4 ring-orange-500 scale-110' : 'ring-2 ring-white'}`} style={{ backgroundColor: col }} />)}
          <div className="mx-2 h-8 w-px bg-neutral-300" />
          {BRUSHES.map((size) => <button key={size} onClick={() => setBrush(size)} aria-label={`Brush ${size}`} className={`flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition-transform active:scale-90 ${size === brush ? 'ring-4 ring-orange-500 scale-110' : 'ring-2 ring-white'}`}><span className="block rounded-full bg-neutral-800" style={{ width: size * 0.5, height: size * 0.5 }} /></button>)}
          <button onClick={clearCanvas} className="ml-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-700 shadow active:scale-95">↺ Clear</button>
        </div>
        <div className="flex items-center gap-2">
          {idx + 1 < CHARS.length && <button onClick={() => setIdx(idx + 1)} className="rounded-full bg-white/95 px-5 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">Next Friend →</button>}
          <button onClick={handleDone} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Done ⭐</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Alphabet blocks ---------- */

function AlphabetBlocksScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'alphabet-blocks' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  type Phase = 'intro' | 'tap' | 'stack' | 'done';
  const [phase, setPhase] = useState<Phase>('intro');
  const [tapIdx, setTapIdx] = useState(0);
  const [tapWrong, setTapWrong] = useState<string | null>(null);
  const [tapWinLetter, setTapWinLetter] = useState<string | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongBankIdx, setWrongBankIdx] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const introRef = useRef(false);

  const BLOCK_COLORS = ['#FE6A2F', '#F59E0B', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];
  const colorFor = (letter: string) => { const i = scene.letters.indexOf(letter); return BLOCK_COLORS[Math.max(0, i) % BLOCK_COLORS.length]; };

  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      setPhase('tap');
      await new Promise((r) => setTimeout(r, 300));
      await playLetterPhonic(scene.tapRounds[0].letter);
    })();
  }, []);

  const tapPromptRef = useRef(0);
  useEffect(() => {
    if (phase !== 'tap' || tapIdx === 0) return;
    tapPromptRef.current += 1;
    const token = tapPromptRef.current;
    (async () => { await new Promise((r) => setTimeout(r, 250)); if (token !== tapPromptRef.current) return; await playLetterPhonic(scene.tapRounds[tapIdx].letter); })();
  }, [tapIdx, phase]);

  const handleTapLetter = async (letter: string) => {
    if (phase !== 'tap' || tapWinLetter) return;
    const target = scene.tapRounds[tapIdx].letter;
    if (letter === target) {
      setTapWinLetter(letter); sfx.gem();
      await new Promise((r) => setTimeout(r, 700));
      setTapWinLetter(null);
      if (tapIdx + 1 < scene.tapRounds.length) setTapIdx(tapIdx + 1);
      else {
        setPhase('stack'); setWordIdx(0); setPlaced([]);
        await new Promise((r) => setTimeout(r, 300));
        await safeSpeak(scene.words[0].word, 'pip');
      }
    } else { setTapWrong(letter); sfx.wrong(); window.setTimeout(() => setTapWrong(null), 450); }
  };

  const currentWord = scene.words[wordIdx]?.word ?? '';
  const bank = useMemo(() => {
    if (phase !== 'stack' || !currentWord) return [] as string[];
    const need = currentWord.split('');
    const distractors = scene.letters.filter((l) => !need.includes(l)).slice(0, 3);
    const arr = [...need, ...distractors];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }, [phase, wordIdx]);

  const [usedBank, setUsedBank] = useState<Set<number>>(new Set());
  useEffect(() => { setUsedBank(new Set()); setPlaced([]); }, [wordIdx, phase]);

  const handleBankTap = async (bIdx: number, letter: string) => {
    if (phase !== 'stack' || celebrate || usedBank.has(bIdx)) return;
    const target = currentWord[placed.length];
    if (letter === target) {
      const nextPlaced = [...placed, letter];
      setPlaced(nextPlaced);
      setUsedBank((s) => new Set(s).add(bIdx));
      sfx.pop();
      if (nextPlaced.length === currentWord.length) {
        setCelebrate(true); sfx.gem();
        await new Promise((r) => setTimeout(r, 350));
        await safeSpeak(currentWord, 'pip');
        await new Promise((r) => setTimeout(r, 700));
        setCelebrate(false);
        if (wordIdx + 1 < scene.words.length) { setWordIdx(wordIdx + 1); await new Promise((r) => setTimeout(r, 300)); await safeSpeak(scene.words[wordIdx + 1].word, 'pip'); }
        else { setPhase('done'); if (!gemDone) { setGemDone(true); onWin(true); } }
      }
    } else { setWrongBankIdx(bIdx); sfx.wrong(); window.setTimeout(() => setWrongBankIdx(null), 450); }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">
        🧱 Alphabet Blocks{phase === 'tap' && <span className="ml-2 text-orange-500">— Tap the sound!</span>}{phase === 'stack' && <span className="ml-2 text-orange-500">— Stack the word!</span>}
      </div>
      {phase === 'tap' && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-center gap-6 px-4">
          <button onClick={() => playLetterPhonic(scene.tapRounds[tapIdx].letter)} className="rounded-full bg-white/95 px-6 py-3 text-lg font-black text-orange-700 shadow-xl active:scale-95">🔊 Play sound again</button>
          <div className="grid max-w-[92vw] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {scene.letters.map((L) => (
              <button key={L} onClick={() => handleTapLetter(L)} className="relative flex h-28 w-28 items-center justify-center rounded-2xl text-6xl font-black text-white transition-transform active:scale-95 sm:h-32 sm:w-32"
                style={{ backgroundColor: colorFor(L), animation: tapWrong === L ? 'lep1-blockShake 0.4s ease-in-out' : tapWinLetter === L ? 'lep1-blockWin 0.7s ease-out' : undefined }}>
                {L}{tapWinLetter === L && <span className="absolute -right-2 -top-2 text-4xl">✨</span>}
              </button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">{tapIdx + 1} / {scene.tapRounds.length}</div>
        </div>
      )}
      {phase === 'stack' && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-between gap-4 px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-7xl drop-shadow-lg">{scene.words[wordIdx].emoji}</div>
            <button onClick={() => safeSpeak(currentWord, 'pip')} className="rounded-full bg-white/90 px-4 py-1 text-xs font-black text-orange-700 shadow active:scale-95">🔊 Hear word</button>
          </div>
          <div className="flex items-end gap-3 rounded-2xl px-6 pb-3 pt-8" style={{ background: 'linear-gradient(180deg, #b45309 0%, #7c2d12 100%)' }}>
            {currentWord.split('').map((tgt, i) => {
              const filled = placed[i];
              const bg = filled ? colorFor(filled) : '#3f2314';
              return <div key={i} className="relative flex h-24 w-20 items-center justify-center rounded-xl text-5xl font-black text-white sm:h-28 sm:w-24 sm:text-6xl" style={{ backgroundColor: bg, animation: filled ? 'lep1-blockDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined, opacity: filled ? 1 : 0.85 }}>{filled ?? <span className="text-2xl opacity-60">{tgt}</span>}</div>;
            })}
          </div>
          <div className="flex max-w-[92vw] flex-wrap items-center justify-center gap-3">
            {bank.map((L, i) => (
              <button key={`${i}-${L}`} onClick={() => handleBankTap(i, L)} disabled={usedBank.has(i)} className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black text-white transition-transform active:scale-90 sm:h-24 sm:w-24 sm:text-5xl"
                style={{ backgroundColor: colorFor(L), opacity: usedBank.has(i) ? 0.25 : 1, animation: wrongBankIdx === i ? 'lep1-blockShake 0.4s ease-in-out' : undefined }}>{L}</button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">Word {wordIdx + 1} / {scene.words.length}</div>
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl animate-bounce">🏆</div>
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-3xl font-black text-orange-600 shadow-2xl">All blocks stacked!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Continue ⭐</button>
        </div>
      )}
      {celebrate && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"><div className="rounded-full bg-white/95 px-6 py-3 text-3xl font-black text-orange-600 shadow-2xl animate-bounce">✨ {currentWord}! ✨</div></div>}
    </div>
  );
}

/* ---------- Alphabet order ---------- */

function AlphabetOrderScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'alphabet-order' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [seqIdx, setSeqIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);
  const gemRef = useRef(false);
  const current = scene.sequences[seqIdx];
  const target = current.split('');

  const shuffled = useMemo(() => {
    const arr = target.slice();
    for (let tries = 0; tries < 8; tries++) {
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
      if (arr.join('') !== current) break;
    }
    return arr;
  }, [seqIdx]);

  const [used, setUsed] = useState<Set<number>>(new Set());
  useEffect(() => { setPlaced([]); setUsed(new Set()); }, [seqIdx]);

  const COLORS = ['#FE6A2F', '#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6'];
  const colorFor = (L: string) => COLORS[(L.charCodeAt(0) - 65) % COLORS.length];

  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [zoneHot, setZoneHot] = useState(false);

  const isOverZone = (x: number, y: number) => {
    const b = dropZoneRef.current?.getBoundingClientRect();
    return !!b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
  };

  const place = async (idx: number, L: string) => {
    if (used.has(idx) || celebrate || done) return;
    const nextExpected = target[placed.length];
    if (L === nextExpected) {
      const nextPlaced = [...placed, L];
      setPlaced(nextPlaced);
      setUsed((s) => new Set(s).add(idx));
      sfx.pop();
      await playLetterName(L);
      if (nextPlaced.length === target.length) {
        setCelebrate(true); sfx.gem();
        await new Promise((r) => setTimeout(r, 400));
        for (const ch of target) await playLetterName(ch);
        await new Promise((r) => setTimeout(r, 500));
        setCelebrate(false);
        if (seqIdx + 1 < scene.sequences.length) { setSeqIdx(seqIdx + 1); }
        else { setDone(true); if (!gemRef.current) { gemRef.current = true; onWin(true); } }
      }
    } else { setWrongLetter(L); sfx.wrong(); window.setTimeout(() => setWrongLetter(null), 450); }
  };

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (used.has(idx) || celebrate || done) return;
    setDragging(idx);
    dragIdx.current = idx;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragIdx.current === null) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setZoneHot(isOverZone(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    dragIdx.current = null;
    setDragging(null);
    setZoneHot(false);
    setDragOffset({ dx: 0, dy: 0 });
    if (idx === null) return;
    if (isOverZone(e.clientX, e.clientY)) void place(idx, shuffled[idx]);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">🔤 Alphabet Order — Drag A → B → C!</div>
      {!done && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-between gap-3 px-3 py-3">
          <div ref={dropZoneRef} className={`flex flex-wrap items-end justify-center gap-3 rounded-2xl px-6 py-4 backdrop-blur transition-all ${zoneHot ? 'scale-105 bg-white/70 ring-4 ring-emerald-300' : 'bg-white/40'}`}>
            {target.map((tgt, i) => {
              const filled = placed[i];
              const bg = filled ? colorFor(filled) : 'rgba(255,255,255,0.5)';
              return <div key={i} className="flex h-24 w-20 items-center justify-center rounded-xl text-5xl font-black text-white sm:h-28 sm:w-24 sm:text-6xl" style={{ backgroundColor: bg, animation: filled ? 'lep1-blockDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined, color: filled ? 'white' : 'rgba(0,0,0,0.35)' }}>{filled ?? tgt}</div>;
            })}
          </div>
          <div className="text-3xl font-black text-white drop-shadow-lg">↓ Next: <span className="text-orange-300">{target[placed.length] ?? '✓'}</span></div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {shuffled.map((L, i) => (
              <button key={`${i}-${L}`} onPointerDown={onDown(i)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} disabled={used.has(i)}
                className={`flex h-24 w-24 touch-none select-none items-center justify-center rounded-2xl text-5xl font-black text-white shadow-lg sm:h-28 sm:w-28 sm:text-6xl ${dragging === i ? 'z-20 scale-125' : ''}`}
                style={{
                  backgroundColor: colorFor(L), opacity: used.has(i) ? 0.25 : 1,
                  animation: wrongLetter === L && !used.has(i) ? 'lep1-blockShake 0.4s ease-in-out' : undefined,
                  transform: dragging === i ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.25)` : undefined,
                  transition: dragging === i ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
                }}>{L}</button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">Round {seqIdx + 1} / {scene.sequences.length}</div>
        </div>
      )}
      {done && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-3xl font-black text-orange-600 shadow-2xl">ABC master!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Continue ⭐</button>
        </div>
      )}
      {celebrate && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"><div className="rounded-full bg-white/95 px-6 py-3 text-3xl font-black text-orange-600 shadow-2xl animate-bounce">✨ {current}! ✨</div></div>}
    </div>
  );
}

/* ---------- Trophy chest ---------- */

function TrophyChestScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'trophy-chest' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const gemDone = useRef(false);
  const round = scene.rounds[roundIdx];
  const c = CAST[scene.who];

  useEffect(() => { if (round && !revealed) cueSpeakOnce(`Find the ${round.letter} sound!`, scene.who); }, [roundIdx]);

  const pick = async (choice: string) => {
    if (revealed || finished || !round) return;
    if (choice !== round.letter) { sfx.wrong(); onLose(); setWrongPick(choice); window.setTimeout(() => setWrongPick(null), 450); return; }
    sfx.match();
    setRevealed(true);
    await safeSpeak(round.word, scene.who);
    await new Promise((r) => window.setTimeout(r, 1300));
    const next = roundIdx + 1;
    if (next >= scene.rounds.length) {
      setFinished(true);
      if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    } else {
      setRevealed(false);
      setRoundIdx(next);
    }
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        🗝️ {scene.teacher} {!finished && <span className="ml-1 opacity-60">({roundIdx + 1}/{scene.rounds.length})</span>}
      </div>

      {!finished ? (
        <div className="absolute inset-x-0 top-24 bottom-28 z-10 flex flex-col items-center justify-center gap-5 px-4">
          <div className="relative flex flex-col items-center">
            <TrophyChestArt open={revealed} />
            {revealed && round && (
              <div className="absolute -top-16 left-1/2 flex -translate-x-1/2 flex-col items-center" style={{ animation: 'lep1-pop 0.5s ease-out' }}>
                {round.img ? <img src={round.img} alt={round.word} className="h-20 w-20 object-contain drop-shadow-xl" /> : <span className="text-6xl">{round.emoji}</span>}
                <span className="mt-1 rounded-full bg-white/95 px-3 py-1 text-sm font-black text-orange-700 shadow">{round.word}</span>
              </div>
            )}
          </div>
          <img src={c.img} alt={c.name} width={64} height={64} className="h-16 w-16 object-contain animate-[lep1-hop_1.6s_ease-in-out_infinite]" />
          <button onClick={() => round && safeSpeak(round.word, scene.who)} disabled={revealed} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-orange-700 shadow-lg ring-2 ring-orange-200 backdrop-blur disabled:opacity-40">
            🔊 Hear it again
          </button>
          <div className="flex gap-3">
            {round?.choices.map((L) => (
              <button key={L} onClick={() => pick(L)} disabled={revealed}
                className={`grid h-20 w-20 place-items-center rounded-2xl text-4xl font-black text-white shadow-xl transition active:scale-90 disabled:opacity-50 sm:h-24 sm:w-24 sm:text-5xl ${wrongPick === L ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #C97A2F, #F5B942)' }}>
                {L}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <TrophyChestArt open />
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-2xl font-black text-orange-700 shadow-2xl sm:text-3xl">🏆 The Trophy Chest is unlocked!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Song ---------- */

function SongScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'song' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'done' | 'error'>('idle');
  const [idx, setIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const totalLines = scene.lyrics.length;
  const totalDuration = scene.durationSeconds ?? 30;

  const playSong = useCallback(async () => {
    if (!scene.songUrl) { setStatus('error'); return; }
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = scene.songUrl;
    audio.currentTime = 0;
    audio.onended = () => { setStatus('done'); setIdx(totalLines - 1); if (rafRef.current) cancelAnimationFrame(rafRef.current); onWin(true); };
    try {
      await audio.play();
      setStatus('playing'); setIdx(0);
      const dur = () => (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : totalDuration);
      const tick = () => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        const perLine = dur() / totalLines;
        const i = Math.min(totalLines - 1, Math.floor(t / perLine));
        setIdx(i);
        if (!audioRef.current.paused && !audioRef.current.ended) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch { setStatus('error'); }
  }, [scene.songUrl, totalDuration, totalLines]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } }, []);

  const current = idx >= 0 ? scene.lyrics[idx] : null;
  const isPlaying = status === 'playing';
  const isDone = status === 'done';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }} />
      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/85 px-5 py-2 text-lg font-black text-[#FE6A2F] shadow-lg backdrop-blur-md ring-2 ring-white/70">{scene.title}</div>
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          {['🎵', '🎶', '🎵', '🎶', '🎵'].map((n, i) => <span key={i} className="absolute text-3xl" style={{ left: `${10 + i * 18}%`, bottom: '45%', animation: `lep1-noteFloat ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite` }}>{n}</span>)}
        </div>
      )}
      <div className="absolute left-1/2 w-[94%] max-w-5xl -translate-x-1/2 rounded-[2rem] bg-white/95 p-8 text-center shadow-2xl ring-8 ring-[#FE6A2F]/40 backdrop-blur-md" style={{ top: '40vh', zIndex: 15 }}>
        {status === 'error' ? (
          <div className="text-xl font-bold text-red-600">Song unavailable — try again in a moment.</div>
        ) : current ? (
          <>
            <div className="mb-3 text-sm font-black uppercase tracking-widest text-[#FE6A2F] sm:text-base">🎤 {current.who.toUpperCase()} sings</div>
            <div key={idx} className="font-black leading-tight text-slate-800" style={{ fontSize: 'clamp(28px, 5vw, 64px)', animation: 'lep1-lyricPop 0.4s ease-out' }}>{current.text}</div>
            <div className="mt-5 flex justify-center gap-2">
              {scene.lyrics.map((_, i) => <span key={i} className={`h-3 w-10 rounded-full ${i <= idx ? 'bg-[#FE6A2F]' : 'bg-slate-200'}`} />)}
            </div>
          </>
        ) : isDone ? (
          <div className="text-3xl font-black text-slate-700">Amazing singing! 🎉</div>
        ) : (
          <div className="text-3xl font-black text-slate-700">Ready to sing? Tap ▶️ Play the Song</div>
        )}
      </div>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {(status === 'idle' || status === 'done' || status === 'error') && (
          <button onClick={playSong} className="rounded-full bg-[#FE6A2F] px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">
            {status === 'done' ? '🔁 Sing Again' : status === 'error' ? '🔁 Retry' : '▶️ Play the Song'}
          </button>
        )}
        {isDone && <button onClick={onNext} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Continue ➜</button>}
      </div>
    </div>
  );
}

/* ---------- Finale ---------- */

function FinaleScene({ scene, hearts, gems, onRestart }: { scene: Extract<Scene, { kind: 'finale' }>; hearts: number; gems: number; onRestart: () => void }) {
  useEffect(() => { cueSpeak(scene.line, scene.who); }, [scene.id]);
  const stars = 1 + Math.min(2, Math.floor(hearts / 2)) + (gems >= 3 ? 1 : 0);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <Confetti />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/40 bg-white/95 p-5 text-center text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30">
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Lesson Complete!</p>
        <h2 className="mt-1 text-4xl font-black text-orange-800">You did it!</h2>
        <div className="my-4 flex justify-center gap-2 text-5xl">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < stars ? '' : 'opacity-20'}>⭐</span>)}
        </div>
        <div className="mx-auto grid grid-cols-3 gap-2 rounded-3xl bg-white/70 p-3">
          {(['pip', 'mia', 'bella'] as const).map((k) => {
            const c = CAST[k];
            return (
              <div key={k} className="grid place-items-center">
                <img src={c.img} alt={c.name} width={72} height={72} className="h-16 w-16 object-contain animate-[lep1-hop_1.6s_ease-in-out_infinite]" />
                <span className="text-xs font-black" style={{ color: c.color }}>💎 {c.name}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-lg font-bold text-orange-700">"{scene.line}"</p>
        <button onClick={onRestart} className="mt-5 w-full rounded-full bg-white py-3 font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Play again</button>
      </div>
    </div>
  );
}

/* ---------- Name gate ---------- */

function NameGateScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'name-gate' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const [gateOpening, setGateOpening] = useState(false);

  const handleOpenGate = () => {
    if (gateOpening) return;
    setGateOpening(true);
    sfx.reveal();
    setTimeout(() => onNext(), 1400);
  };


  const boothSpots: Record<string, { left: string; top: string; size: number }> = {
    pip: { left: '16%', top: '55%', size: 170 },
    mia: { left: '83%', top: '40%', size: 140 },
    bella: { left: '72%', top: '66%', size: 170 },
  };

  const openBooth = async (idx: number) => {
    const round = scene.rounds[idx];
    if (!round) return;
    setActive(idx);
    sfx.reveal();
    await safeSpeak(round.question, 'teacher');
    await safeSpeak(round.answer, round.who);
    setOpened((prev) => {
      const next = new Set(prev).add(idx);
      if (next.size >= scene.rounds.length && !gemDone) {
        setGemDone(true); sfx.gem(); onWin(true); cueSpeak('What is your name?', 'pip');
      }
      return next;
    });
  };

  const done = opened.size >= scene.rounds.length;

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-black">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: '1600 / 1008', width: 'min(100vw, calc(100vh * 1600 / 1008))', height: 'min(100vh, calc(100vw * 1008 / 1600))' }}>
        <img src={scene.bg} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-orange-950/35" />
        {scene.rounds.map((round, idx) => {
          const c = CAST[round.who];
          const spot = boothSpots[round.who] ?? { left: '50%', top: '50%', size: 160 };
          const isOpen = opened.has(idx);
          const isActive = active === idx;
          return (
            <button key={round.who} onClick={() => openBooth(idx)} className="absolute z-20 touch-manipulation rounded-full transition active:scale-95"
              style={{ left: spot.left, top: spot.top, width: spot.size, height: spot.size, transform: 'translate(-50%, -50%)', background: 'transparent' }}
              aria-label={`Tap ${c.name} to hear the question and answer`}
            >
              {!isOpen && <span className="pointer-events-none absolute inset-0 rounded-full animate-ping" style={{ background: `radial-gradient(circle, ${c.color}66 0%, transparent 65%)` }} />}
              <span className="pointer-events-none absolute inset-0 rounded-full ring-4" style={{ boxShadow: isActive ? `0 0 40px ${c.color}` : 'none', borderColor: 'transparent' }} />
              {!isOpen ? (
                <span className="pointer-events-none absolute left-1/2 -top-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-black shadow-lg animate-bounce" style={{ color: c.color }}>👆 Tap {c.name}!</span>
              ) : (
                <span className="pointer-events-none absolute left-1/2 -bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-black text-white shadow-lg">{c.emoji} {c.name} ✓</span>
              )}
            </button>
          );
        })}
        {active !== null && (() => {
          const round = scene.rounds[active];
          const spot = boothSpots[round?.who ?? 'pip'] ?? { left: '50%', top: '50%', size: 160 };
          if (!round) return null;
          return (
            <div key={`bubble-${active}-${opened.has(active) ? 'a' : 'q'}`} className="pointer-events-none absolute z-30" style={{ left: spot.left, top: `calc(${spot.top} - 18%)`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative max-w-[280px] rounded-3xl bg-white/95 px-5 py-3 text-center text-lg font-black text-orange-800 shadow-2xl">
                “{opened.has(active) ? round.answer : round.question}”
              </div>
            </div>
          );
        })()}
      </div>
      <div className="absolute inset-x-0 bottom-7 z-30 flex justify-center px-4">
        {!done && <div className="rounded-full bg-white/90 px-5 py-2 text-sm font-black text-orange-700 shadow-xl">Name tickets {opened.size}/{scene.rounds.length}</div>}
      </div>
      {done && (
        <div onClick={handleOpenGate} className={`absolute inset-0 z-40 flex items-center justify-center ${gateOpening ? 'pointer-events-none' : 'cursor-pointer'}`}>
          <div className="pointer-events-none absolute inset-0 bg-black/25" />
          <div className="relative flex flex-col items-center gap-4">
            <img src={comicPointForward} alt="Your turn" draggable={false} className="h-[62vh] w-auto object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)] animate-bounce" />
            <div className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-3xl font-black uppercase tracking-widest text-white shadow-2xl ring-4 ring-white/70 animate-pulse">Your turn!</div>
            <div className="rounded-full bg-white/95 px-5 py-2 text-sm font-black uppercase tracking-widest text-orange-700 shadow">Tap to continue</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Meet group (multi-character question chain) ---------- */

function MeetGroupScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'meet-group' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  type Phase = 'idle' | 'asker-said' | 'student-asked' | 'answer-said' | 'student-answered' | 'done';
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0);
  const [bubble, setBubble] = useState<{ who: string; line: string; color: string } | null>(null);
  const [xpBurst, setXpBurst] = useState(false);


  const allAsked = step >= scene.askers.length;

  const tapAsker = async (i: number) => {
    if (i !== step || phase !== 'idle') return;
    sfx.pop();
    const c = CAST[scene.askers[i].who];
    setBubble({ who: c.name, line: scene.question, color: c.color });
    setPhase('asker-said');
    await safeSpeak(scene.question, scene.askers[i].who);
    setPhase('student-asked');
  };

  const repeatQuestion = async () => { sfx.click(); await safeSpeak(scene.question, 'teacher'); };

  const confirmStudentAsked = () => {
    sfx.gem(); setXpBurst(true); setTimeout(() => setXpBurst(false), 900);
    const next = step + 1;
    setStep(next); setBubble(null);
    if (next >= scene.askers.length) { setPhase('idle'); setTimeout(() => tapNewcomer(), 400); }
    else setPhase('idle');
  };

  const tapNewcomer = async () => {
    if (!allAsked && step + 1 < scene.askers.length) return;
    sfx.pop();
    const c = CAST[scene.newcomer.who];
    setBubble({ who: c.name, line: scene.answer, color: c.color });
    setPhase('answer-said');
    await safeSpeak(scene.answer, scene.newcomer.who);
    setPhase('student-answered');
  };

  const repeatAnswer = async () => { sfx.click(); await safeSpeak(scene.answer, 'teacher'); };

  const confirmStudentAnswered = () => {
    sfx.gem(); setXpBurst(true); setTimeout(() => setXpBurst(false), 1000);
    setPhase('done'); onWin(true);
  };

  const newcomerColor = CAST[scene.newcomer.who].color;

  return (
    <div className="relative h-full min-h-[400px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${newcomerColor}, #FEBE4C)` }}>⚔️ Quest · Meet {CAST[scene.newcomer.who].name}</div>
      </div>
      <div className="mx-auto mt-8 max-w-xl">
        <div className="rounded-2xl px-4 py-3 text-center text-lg font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)' }}>{scene.teacher}</div>
      </div>
      {scene.phonics && (
        <span className="absolute right-3 top-16 z-20 grid h-16 w-16 place-items-center rounded-full bg-white text-2xl font-black shadow-2xl ring-4" style={{ color: newcomerColor, borderColor: newcomerColor }}>{CAST[scene.newcomer.who].name[0]}</span>
      )}
      {scene.askers.map((a, i) => {
        const doneAsker = i < step;
        const active = i === step && phase === 'idle' && !allAsked;
        const c = CAST[a.who];
        return (
          <button key={a.who} onClick={() => tapAsker(i)} disabled={!active} aria-label={`Tap ${c.name}`} className="absolute z-10 -translate-x-1/2 -translate-y-full rounded-b-full"
            style={{ left: `${a.xPct}%`, top: `${a.yPct}%`, width: 'clamp(200px, 30vh, 320px)', height: 'clamp(240px, 36vh, 380px)' }}>
            {scene.showSprites && <img src={getEmotionSprite(a.who, 'happy')} alt={c.name} draggable={false} className="pointer-events-none absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-2xl" />}
            {active && (
              <>
                <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c.color}66, transparent 65%)`, animation: 'ping 2s ease-out infinite' }} />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-sm font-black shadow-xl" style={{ color: c.color }}>👆 Tap {c.name}</span>
              </>
            )}
            {doneAsker && <span className="absolute -top-2 left-1/2 -translate-x-1/2 grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white text-xl font-black shadow-lg ring-2 ring-white">✓</span>}
          </button>
        );
      })}
      <button onClick={tapNewcomer} disabled={!(allAsked && phase === 'idle')} aria-label={`Tap ${CAST[scene.newcomer.who].name}`} className="absolute z-10 -translate-x-1/2 -translate-y-full rounded-b-full"
        style={{ left: `${scene.newcomer.xPct}%`, top: `${scene.newcomer.yPct}%`, width: 'clamp(220px, 34vh, 360px)', height: 'clamp(260px, 40vh, 420px)' }}>
        {scene.showSprites && <img src={getEmotionSprite(scene.newcomer.who, 'happy')} alt={CAST[scene.newcomer.who].name} draggable={false} className="pointer-events-none absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-2xl" />}
        {allAsked && phase === 'idle' && (
          <>
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${newcomerColor}77, transparent 65%)`, animation: 'ping 1.5s ease-out infinite' }} />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-sm font-black shadow-xl" style={{ color: newcomerColor }}>👆 Tap {CAST[scene.newcomer.who].name}</span>
          </>
        )}
      </button>
      {bubble && (
        <div className="absolute top-[14vh] left-4 sm:left-8 z-20 max-w-[44%] sm:max-w-[36%]">
          <button onClick={() => (phase === 'answer-said' || phase === 'student-answered' ? repeatAnswer() : repeatQuestion())} className="relative w-full rounded-3xl border-4 bg-white px-5 py-4 text-left text-xl sm:text-2xl font-black shadow-2xl active:scale-95" style={{ color: bubble.color, borderColor: bubble.color }} aria-label="Hear again">
            <span className="mr-2 text-sm font-bold uppercase tracking-wider opacity-70">{bubble.who}</span><br />"{bubble.line}"
          </button>
        </div>
      )}
      {xpBurst && <div className="pointer-events-none absolute inset-x-0 top-[32vh] z-30 grid place-items-center"><div className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div></div>}
      {(phase === 'student-asked' || phase === 'student-answered') && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-lg">
          <div className="mx-3 mb-4 rounded-3xl border-4 border-white/60 bg-white/95 p-4 shadow-2xl">
            <div className="text-center text-sm font-bold uppercase tracking-widest text-slate-500">Your turn — repeat!</div>
            <div className="mt-1 text-center text-2xl font-black" style={{ color: newcomerColor }}>"{phase === 'student-asked' ? scene.question : scene.answer}"</div>
            <div className="mt-3 flex gap-2">
              <button onClick={phase === 'student-asked' ? repeatQuestion : repeatAnswer} className="flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 active:scale-95">🔁 Hear it</button>
              <PrimaryButton onClick={phase === 'student-asked' ? confirmStudentAsked : confirmStudentAnswered}>✅ I said it!</PrimaryButton>
            </div>
          </div>
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-md">
          <div className="mx-3 mb-4 rounded-3xl border-4 border-white/60 bg-white/95 p-4 shadow-2xl">
            <div className="text-center text-2xl font-black text-emerald-600">🎉 You met {CAST[scene.newcomer.who].name}!</div>
            <div className="mt-3"><PrimaryButton onClick={onNext}>Next Quest →</PrimaryButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Voice stage ---------- */

function VoiceStageScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'voice-stage' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'listening' | 'guess' | 'reveal' | 'pleasantry' | 'done'>('ready');
  const [feedback, setFeedback] = useState<null | { who: CharKey; ok: boolean }>(null);
  const [gemDone, setGemDone] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 12, y: 82 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }; }, [scene.id]);

  useEffect(() => {
    if (!placed) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320 }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play().catch(() => {}); }
      } catch { /* fallback: no video */ }
    })();
    return () => { cancelled = true; };
  }, [placed]);

  const DROP = { cx: 50, cy: 78, r: 12 };
  const onPointerDown = (e: React.PointerEvent) => { if (placed) return; setDragging(true); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || placed) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const dx = pos.x - DROP.cx, dy = pos.y - DROP.cy;
    if (Math.hypot(dx, dy) <= DROP.r + 4) { setPlaced(true); setPos({ x: DROP.cx, y: DROP.cy }); }
  };

  const stageSpots = [{ left: '22%', top: '48%' }, { left: '50%', top: '44%' }, { left: '78%', top: '48%' }];

  const playRound = useCallback(async () => {
    const current = scene.rounds[round];
    if (!current || phase === 'listening') return;
    setFeedback(null); setPhase('listening');
    await safeSpeak(scene.question, 'teacher');
    await safeSpeak(current.answer, current.who);
    setPhase('guess');
  }, [phase, round, scene.question, scene.rounds]);

  const advanceAfterRound = useCallback(() => {
    const next = round + 1;
    if (next >= scene.rounds.length) {
      setPhase('done');
      if (!gemDone) { setGemDone(true); sfx.gem(); onWin(true); }
    } else { setRound(next); setPhase('ready'); }
  }, [round, scene.rounds.length, gemDone, onWin]);

  const finishPleasantry = useCallback(() => { if (phase !== 'pleasantry') return; sfx.match(); advanceAfterRound(); }, [phase, advanceAfterRound]);

  const choose = async (who: CharKey) => {
    if (phase !== 'guess') return;
    const current = scene.rounds[round];
    const ok = current.who === who;
    setFeedback({ who, ok });
    setPhase('reveal');
    if (ok) {
      sfx.match();
      await safeSpeak('Yes! My name!', who);
      if (scene.niceToMeet) { await safeSpeak('Nice to meet you!', who); setFeedback(null); setPhase('pleasantry'); return; }
    } else { sfx.wrong(); onLose(); }
    window.setTimeout(() => {
      setFeedback(null);
      if (!ok) { setPhase('ready'); return; }
      advanceAfterRound();
    }, 950);
  };

  const currentRound = scene.rounds[Math.min(round, scene.rounds.length - 1)];

  return (
    <div className="absolute inset-0 z-10 overflow-hidden select-none" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/45" />
      <div className="absolute inset-x-0 top-5 z-30 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-2xl ring-2 ring-orange-200 sm:text-base">🎤 Name Stage · Round {Math.min(round + 1, scene.rounds.length)}/{scene.rounds.length}</div>
      </div>
      {scene.rounds.map((r, idx) => {
        const c = CAST[r.who];
        const spot = stageSpots[idx] ?? stageSpots[0];
        const fb = feedback?.who === r.who ? feedback : null;
        const isTarget = currentRound?.who === r.who;
        return (
          <button key={`${r.who}-${idx}`} onClick={() => choose(r.who)} disabled={phase !== 'guess'} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent p-0 transition active:scale-95 disabled:cursor-default" style={{ left: spot.left, top: spot.top }} aria-label={`Choose ${c.name}`}>
            <div className="relative grid h-56 w-56 place-items-center rounded-full border-4 bg-white/90 shadow-2xl sm:h-64 sm:w-64" style={{ borderColor: fb ? (fb.ok ? '#22C55E' : '#EF4444') : c.color, boxShadow: phase === 'guess' && isTarget ? `0 0 45px ${c.color}` : '0 24px 44px rgba(0,0,0,0.35)' }}>
              <span className="absolute -top-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow">🎙️ {r.cue}</span>
              <img src={c.img} alt={c.name} className="h-44 w-44 object-contain drop-shadow-xl sm:h-52 sm:w-52" />
              {fb && <span className="absolute -bottom-5 rounded-full px-4 py-1 text-sm font-black text-white shadow-lg" style={{ backgroundColor: fb.ok ? '#22C55E' : '#EF4444' }}>{fb.ok ? 'Yes!' : 'Try again'}</span>}
            </div>
          </button>
        );
      })}
      <div className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed transition ${placed ? 'border-orange-400/70 bg-orange-300/10' : 'border-white/85 bg-white/10'} backdrop-blur-sm`} style={{ left: `${DROP.cx}%`, top: `${DROP.cy}%`, width: `${DROP.r * 2}vw`, height: `${DROP.r * 2}vw`, maxWidth: 220, maxHeight: 220, minWidth: 140, minHeight: 140 }}>
        {!placed && <div className="flex h-full w-full items-center justify-center text-center text-[11px] font-black uppercase tracking-widest text-white drop-shadow">🎤 Drop your<br />camera here</div>}
      </div>
      <div onPointerDown={onPointerDown} className={`absolute z-30 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-4 shadow-2xl transition-transform sm:h-32 sm:w-32 ${placed ? 'border-orange-400 ring-4 ring-orange-300/60' : 'border-white cursor-grab active:cursor-grabbing'} ${dragging ? 'scale-110' : ''}`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: 'linear-gradient(135deg, #FE6A2F, #FEBE4C)', touchAction: 'none' }}>
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-4 top-1/2 z-30 flex w-[240px] -translate-y-1/2 flex-col items-stretch gap-3 sm:right-8 sm:w-[280px]">
        <div className="rounded-3xl bg-white/95 px-4 py-3 text-center shadow-2xl ring-2 ring-orange-200">
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">Listen & Repeat</div>
          <div className="mt-1 text-base font-black text-orange-800 sm:text-lg">
            {phase === 'guess' ? 'Who answered? Tap a friend.' : phase === 'pleasantry' ? 'Say: Nice to meet you too!' : phase === 'done' ? 'Great job! ⭐' : `“${scene.question}”`}
          </div>
        </div>
        {phase === 'done' ? (
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">⭐ Stage complete →</button>
        ) : phase === 'pleasantry' ? (
          <button onClick={finishPleasantry} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">🎤 I said it! →</button>
        ) : (
          <button onClick={() => void playRound()} disabled={phase === 'listening' || phase === 'guess'} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95 disabled:opacity-60">
            {phase === 'listening' ? 'Listening…' : phase === 'guess' ? 'Your turn 🎤' : '🔊 Ask & repeat'}
          </button>
        )}
        {!placed && <div className="rounded-2xl bg-black/50 px-3 py-2 text-center text-[11px] font-black uppercase tracking-widest text-white shadow">⬅ Drag your camera into the circle</div>}
      </div>
      {phase === 'pleasantry' && currentRound && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-40 flex justify-center px-4">
          <div className="rounded-[36px] bg-white/95 px-8 py-5 text-center shadow-2xl ring-4 ring-emerald-300">
            <div className="text-[11px] font-black uppercase tracking-widest text-emerald-600">{CAST[currentRound.who].name} said: “Nice to meet you!”</div>
            <div className="mt-2 text-2xl font-black text-emerald-800 sm:text-3xl">🎤 Say: “Nice to meet you too!”</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sound pop ---------- */

type PopMode = 'balloon' | 'bubble' | 'butterfly' | 'apple' | 'rocket';
const MODE_FOR_LETTER: Record<string, PopMode> = { B: 'balloon', H: 'balloon', S: 'bubble', N: 'bubble', T: 'butterfly', W: 'butterfly', A: 'apple', M: 'rocket' };
type PopBalloon = { key: number; word: string; letter: string; img?: string; emoji: string; xPct: number; hue: number; duration: number; born: number; popped: null | 'hit' | 'miss'; mode: PopMode };

function SoundPopScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'sound-pop' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [targetIdx, setTargetIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(scene.seconds);
  const [balloons, setBalloons] = useState<PopBalloon[]>([]);
  const [phase, setPhase] = useState<'intro' | 'play' | 'win' | 'lose'>('intro');
  const [gemDone, setGemDone] = useState(false);
  const [flash, setFlash] = useState<null | 'hit' | 'miss'>(null);
  const nextKey = useRef(1);
  const attemptsByLetter = useRef<Record<string, number>>({});
  const [hitsForTarget, setHitsForTarget] = useState(0);
  const [masteryTick, setMasteryTick] = useState(0);
  useEffect(() => {
    const h = () => setMasteryTick((n) => n + 1);
    window.addEventListener('pg-mastery-changed', h);
    return () => window.removeEventListener('pg-mastery-changed', h);
  }, []);
  const mastered = useMemo(() => getMastered(), [masteryTick]);

  const c = CAST[scene.who];
  const target = scene.targets[targetIdx];
  const phonemeSound = (letter: string) => {
    const L = letter.toUpperCase();
    const map: Record<string, string> = { S: 'sss, sss', A: 'ah, ah', H: 'h, h, h', M: 'mmm, mmm', N: 'nnn, nnn', W: 'wuh, wuh', R: 'rrr, rrr' };
    return map[L] ?? `${L.toLowerCase()}, ${L.toLowerCase()}`;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase('intro'); setHitsForTarget(0); setBalloons([]);
      if (cancelled) return;
      await safeSpeak(phonemeSound(target.letter), scene.who);
      if (!cancelled) setPhase('play');
    })();
    return () => { cancelled = true; };
  }, [scene.id, targetIdx]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const isTargetMastered = mastered.has(target.letter.toUpperCase());
  const tier: 0 | 1 | 2 = isTargetMastered ? 2 : hitsForTarget >= 2 ? 1 : 0;
  const spawnMs = tier === 2 ? 620 : tier === 1 ? 820 : 1100;
  const targetWeight = tier === 2 ? 0.65 : tier === 1 ? 0.5 : 0.35;
  const modeDur = tier === 2 ? 4200 : tier === 1 ? 4800 : 5600;

  useEffect(() => {
    if (phase !== 'play') return;
    const spawn = () => {
      const pool = scene.items;
      const targets = pool.filter((p) => p.letter === target.letter);
      const others = pool.filter((p) => p.letter !== target.letter);
      const useTarget = targets.length > 0 && Math.random() < targetWeight;
      const bucket = useTarget ? targets : (others.length ? others : pool);
      const it = bucket[Math.floor(Math.random() * bucket.length)];
      let xPct = 8 + Math.random() * 84;
      setBalloons((prev) => {
        const recent = prev.filter((p) => !p.popped && performance.now() - p.born < 2200);
        for (let tries = 0; tries < 8; tries++) {
          if (recent.every((p) => Math.abs(p.xPct - xPct) > 18)) break;
          xPct = 8 + Math.random() * 84;
        }
        const mode: PopMode = MODE_FOR_LETTER[target.letter.toUpperCase()] ?? 'balloon';
        const baseDur = mode === 'butterfly' ? modeDur + 1200 : mode === 'apple' ? modeDur - 1000 : mode === 'rocket' ? Math.round(modeDur * 0.55) : modeDur;
        const b: PopBalloon = { key: nextKey.current++, word: it.word, letter: it.letter, img: it.img, emoji: it.emoji, xPct, hue: [12, 40, 200, 280, 330, 150][Math.floor(Math.random() * 6)], duration: baseDur + Math.random() * 1500, born: performance.now(), popped: null, mode };
        return [...prev.filter((p) => performance.now() - p.born < 8000), b];
      });
    };
    spawn();
    const id = window.setInterval(spawn, spawnMs);
    return () => window.clearInterval(id);
  }, [phase, scene.items, target.letter, spawnMs, targetWeight, modeDur]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (score >= scene.goal) {
      setPhase('win');
      if (!gemDone) { setGemDone(true); sfx.gem(); onWin(true); }
      void safeSpeak('Perfect ears! You popped the sounds!', scene.who);
    } else if (timeLeft <= 0) {
      setPhase('lose'); onLose();
      void safeSpeak("Nice try! Let's pop more next time.", 'teacher');
    }
  }, [score, timeLeft, phase, scene.goal, scene.who, onWin, onLose, gemDone]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (score > 0 && score % 4 === 0 && targetIdx < scene.targets.length - 1) setTargetIdx((i) => Math.min(scene.targets.length - 1, i + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const pop = async (b: PopBalloon) => {
    if (phase !== 'play' || b.popped) return;
    const isHit = b.letter === target.letter;
    const rt = Math.max(0, Math.round(performance.now() - b.born));
    const key = target.letter.toUpperCase();
    attemptsByLetter.current[key] = (attemptsByLetter.current[key] ?? 0) + 1;
    logMicroCheck({ ts: Date.now(), sceneId: scene.id, lesson: 2, letter: key, tappedLetter: b.letter.toUpperCase(), correct: isHit, attemptForLetter: attemptsByLetter.current[key], responseTimeMs: rt });
    setBalloons((prev) => prev.map((p) => (p.key === b.key ? { ...p, popped: isHit ? 'hit' : 'miss' } : p)));
    if (isHit) {
      sfx.pop(); sfx.match(); setFlash('hit'); setScore((s) => s + 1); setHitsForTarget((h) => h + 1);
      await safeSpeak(phonemeSound(target.letter), scene.who);
    } else { sfx.wrong(); setFlash('miss'); setMisses((m) => m + 1); }
    window.setTimeout(() => setFlash(null), 220);
    window.setTimeout(() => setBalloons((prev) => prev.filter((p) => p.key !== b.key)), 350);
  };

  return (
    <div className="absolute inset-0 z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
      {flash && <div className="pointer-events-none absolute inset-0 z-40 transition-opacity" style={{ background: flash === 'hit' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.20)' }} />}
      <div className="absolute inset-x-0 top-4 z-30 flex items-center justify-between px-4">
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-2xl ring-2 ring-orange-200">🎈 {score}/{scene.goal}</div>
        <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-black text-white shadow-2xl">⏱ {timeLeft}s</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-red-500 shadow-2xl ring-2 ring-red-200">✖ {misses}</div>
      </div>
      <div className="absolute inset-x-0 top-16 z-30 flex justify-center px-4">
        <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-2 shadow-2xl ring-4" style={{ borderColor: c.color, boxShadow: `0 12px 30px ${c.color}55` }}>
          <img src={c.img} alt={c.name} className="h-10 w-10 rounded-full object-contain" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-600">Pop the sound</span>
          <span className="rounded-2xl px-3 py-1 text-2xl font-black text-white" style={{ backgroundColor: c.color }}>{target.letter} · {target.phoneme}</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest" style={{ background: tier === 2 ? '#22c55e' : tier === 1 ? '#f59e0b' : '#e2e8f0', color: tier === 0 ? '#334155' : '#fff' }}>{tier === 2 ? '⚡ fast' : tier === 1 ? '▶ go' : '🐢 easy'}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 top-28 z-30 flex justify-center px-4">
        <div className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 shadow-xl ring-1 ring-white/20 backdrop-blur">
          <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-white/80">Mastered</span>
          {UNIT1_PHONICS.map((L) => {
            const on = mastered.has(L);
            const isCur = L === target.letter.toUpperCase();
            return <span key={L} title={on ? `${L} · mastered` : `${L} · not yet`} className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-black transition" style={{ background: on ? '#22c55e' : 'rgba(255,255,255,0.15)', color: on ? '#fff' : 'rgba(255,255,255,0.75)', outline: isCur ? '2px solid #FFD447' : 'none', outlineOffset: 1 }}>{on ? '✓' : L}</span>;
          })}
        </div>
      </div>
      {phase === 'play' && balloons.map((b) => {
        const isFall = b.mode === 'apple';
        const anim = b.mode === 'balloon' ? `sp-rise ${b.duration}ms linear forwards, sp-sway 2.4s ease-in-out infinite`
          : b.mode === 'bubble' ? `sp-rise ${b.duration}ms linear forwards, sp-wobble 1.6s ease-in-out infinite`
          : b.mode === 'butterfly' ? `sp-rise ${b.duration}ms linear forwards, sp-zig 1.6s ease-in-out infinite`
          : b.mode === 'rocket' ? `sp-shoot ${b.duration}ms cubic-bezier(.55,0,.85,.35) forwards, sp-wiggle 0.35s ease-in-out infinite`
          : `sp-fall ${b.duration}ms linear forwards, sp-spin 2.2s linear infinite`;
        const posStyle: React.CSSProperties = isFall ? { left: `${b.xPct}%`, top: '-180px' } : { left: `${b.xPct}%`, bottom: '-180px' };
        return (
          <button key={b.key} onClick={() => void pop(b)} className="absolute z-20 -translate-x-1/2 select-none focus:outline-none" style={{ ...posStyle, animation: anim, transform: b.popped ? 'scale(1.6)' : undefined, opacity: b.popped ? 0 : 1, transition: 'opacity 260ms ease, transform 260ms ease', touchAction: 'manipulation' }} aria-label={`${b.mode} ${b.word}`}>
            {b.mode === 'balloon' && (
              <div className="relative flex flex-col items-center">
                <div className="grid h-48 w-44 place-items-center rounded-[50%] shadow-2xl ring-2 ring-white/70" style={{ background: `radial-gradient(circle at 32% 28%, hsla(${b.hue},95%,82%,1) 0%, hsla(${b.hue},85%,55%,1) 65%, hsla(${b.hue},75%,42%,1) 100%)` }}>
                  <span className="text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
                </div>
                <div className="h-4 w-[7px]" style={{ background: `hsl(${b.hue},70%,40%)` }} />
                <div className="-mt-0.5 text-2xl leading-none">🎀</div>
              </div>
            )}
            {b.mode === 'bubble' && (
              <div className="grid h-44 w-44 place-items-center rounded-full shadow-2xl" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.55) 40%, rgba(56,189,248,0.35) 75%, rgba(2,132,199,0.25) 100%)', border: '2px solid rgba(255,255,255,0.85)' }}>
                <span className="text-7xl font-black text-sky-900/90" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
              </div>
            )}
            {b.mode === 'butterfly' && (
              <div className="relative flex flex-col items-center">
                <div className="relative h-40 w-52">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[6.5rem] leading-none" style={{ animation: 'sp-wingL 260ms ease-in-out infinite', color: `hsl(${b.hue},80%,55%)` }}>🦋</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 -scale-x-100 text-[6.5rem] leading-none" style={{ animation: 'sp-wingR 260ms ease-in-out infinite', color: `hsl(${b.hue},80%,55%)` }}>🦋</span>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-4xl font-black text-white shadow-xl ring-4 ring-white/85" style={{ backgroundColor: `hsl(${b.hue},70%,45%)`, fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</div>
              </div>
            )}
            {b.mode === 'apple' && (
              <div className="grid h-40 w-40 place-items-center rounded-[42%] shadow-2xl ring-2 ring-white/60" style={{ background: 'radial-gradient(circle at 30% 25%, #fecaca 0%, #ef4444 55%, #991b1b 100%)' }}>
                <span className="text-7xl font-black text-white" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
                <div className="absolute -top-3 text-2xl">🍃</div>
              </div>
            )}
            {b.mode === 'rocket' && (
              <div className="relative flex flex-col items-center">
                <div className="absolute left-1/2 top-full h-24 w-6 -translate-x-1/2 rounded-b-full" style={{ background: 'linear-gradient(180deg, #fde68a 0%, #f97316 55%, #dc2626 100%)', filter: 'blur(3px)' }} />
                <span className="pointer-events-none absolute top-full mt-1 text-2xl">🔥</span>
                <div className="relative grid h-44 w-28 place-items-center rounded-[46%_46%_38%_38%/60%_60%_40%_40%] shadow-2xl ring-4 ring-white/70" style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 45%, #64748b 100%)' }}>
                  <span className="pointer-events-none absolute -top-2 text-3xl">🚀</span>
                  <span className="mt-2 text-6xl font-black text-slate-900" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
                </div>
              </div>
            )}
          </button>
        );
      })}
      {phase === 'intro' && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="rounded-3xl bg-white/95 px-6 py-4 text-center text-lg font-black text-orange-800 shadow-2xl ring-4 ring-orange-200">🎈 Listen to {c.name}… get ready to POP!</div>
        </div>
      )}
      {(phase === 'win' || phase === 'lose') && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/55 px-6 text-center">
          <div className="text-5xl font-black text-white drop-shadow-lg">{phase === 'win' ? '⭐ Sound Master! ⭐' : "⏰ Time's up!"}</div>
          <div className="rounded-2xl bg-white/95 px-5 py-3 text-base font-black text-orange-700 shadow-2xl">Score: {score}/{scene.goal}</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-7 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">{phase === 'win' ? 'Next →' : 'Keep going →'}</button>
        </div>
      )}
      <style>{`
        @keyframes sp-rise { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(-50%, calc(-100vh - 260px), 0); } }
        @keyframes sp-sway { 0%,100% { margin-left: -6px; } 50% { margin-left: 6px; } }
        @keyframes sp-fall { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(-50%, calc(100vh + 260px), 0); } }
        @keyframes sp-wobble { 0%,100% { margin-left: -10px; } 50% { margin-left: 10px; } }
        @keyframes sp-spin { from { margin-left: -4px; } 50% { margin-left: 4px; } to { margin-left: -4px; } }
        @keyframes sp-zig { 0% { margin-left: -34px; } 25% { margin-left: 10px; } 50% { margin-left: 34px; } 75% { margin-left: -12px; } 100% { margin-left: -34px; } }
        @keyframes sp-wingL { 0%,100% { transform: translateY(-50%) rotateY(0deg); } 50% { transform: translateY(-50%) rotateY(70deg); } }
        @keyframes sp-wingR { 0%,100% { transform: translateY(-50%) scaleX(-1) rotateY(0deg); } 50% { transform: translateY(-50%) scaleX(-1) rotateY(70deg); } }
        @keyframes sp-shoot { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(-50%, calc(-100vh - 260px), 0); } }
        @keyframes sp-wiggle { 0%,100% { margin-left: -3px; } 50% { margin-left: 3px; } }
      `}</style>
    </div>
  );
}

/* ---------- Brick crush ---------- */

type Brick = { id: number; letter: string; color: string; crashed: boolean; wobble: boolean };

function BrickCrushScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'brick-crush' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const LETTER_COLORS: Record<string, string> = { H: '#FF6B6B', M: '#4DABF7', N: '#FFD43B', W: '#9775FA', A: '#51CF66', S: '#FF922B' };
  const phonemeFor = (L: string) => {
    const map: Record<string, string> = { H: 'h, h', M: 'mmm', N: 'nnn', W: 'wuh', A: 'ah', S: 'sss' };
    return map[L] ?? L.toLowerCase();
  };

  const buildGrid = useCallback(() => {
    const out: Brick[] = [];
    let id = 1;
    for (let r = 0; r < scene.rows; r++) for (let c = 0; c < scene.cols; c++) {
      const L = scene.letters[Math.floor(Math.random() * scene.letters.length)];
      out.push({ id: id++, letter: L, color: LETTER_COLORS[L] ?? '#FE6A2F', crashed: false, wobble: false });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.rows, scene.cols]);

  const [bricks, setBricks] = useState<Brick[]>(() => buildGrid());
  const [targetLetter, setTargetLetter] = useState<string>(scene.letters[0]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(scene.seconds);
  const [phase, setPhase] = useState<'intro' | 'play' | 'win' | 'lose'>('intro');
  const [gemDone, setGemDone] = useState(false);
  const [flash, setFlash] = useState<null | 'hit' | 'miss'>(null);
  const [combo, setCombo] = useState(0);
  const c = CAST[scene.who];

  const callNewSound = useCallback(async () => {
    const remaining = bricks.filter((b) => !b.crashed);
    if (remaining.length === 0) return;
    const available = Array.from(new Set(remaining.map((b) => b.letter)));
    const next = available[Math.floor(Math.random() * available.length)];
    setTargetLetter(next);
    await safeSpeak(phonemeFor(next), scene.who);
  }, [bricks, scene.who]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase('intro');
      const first = scene.letters[Math.floor(Math.random() * scene.letters.length)];
      setTargetLetter(first);
      await safeSpeak(phonemeFor(first), scene.who);
      if (!cancelled) setPhase('play');
    })();
    return () => { cancelled = true; };
  }, [scene.id]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (score >= scene.goal) {
      setPhase('win');
      if (!gemDone) { setGemDone(true); onWin(true); sfx.gem(); cueSpeak('Amazing! Brick crush champion!', 'teacher'); }
    } else if (timeLeft <= 0) { setPhase('lose'); cueSpeak('Great try!', 'teacher'); }
  }, [score, timeLeft, phase, scene.goal, gemDone, onWin]);

  const tapBrick = (b: Brick) => {
    if (phase !== 'play' || b.crashed) return;
    if (b.letter === targetLetter) {
      sfx.pop();
      setBricks((prev) => prev.map((x) => (x.id === b.id ? { ...x, crashed: true } : x)));
      setScore((s) => s + 1); setCombo((k) => k + 1); setFlash('hit');
      window.setTimeout(() => setFlash(null), 220);
      const remainingOfTarget = bricks.filter((x) => !x.crashed && x.letter === targetLetter && x.id !== b.id).length;
      const nextScore = score + 1;
      if (remainingOfTarget === 0 || nextScore % 4 === 0) window.setTimeout(() => { void callNewSound(); }, 400);
    } else {
      sfx.wrong(); onLose(); setMisses((m) => m + 1); setCombo(0);
      setBricks((prev) => prev.map((x) => (x.id === b.id ? { ...x, wobble: true } : x)));
      setFlash('miss');
      window.setTimeout(() => { setBricks((prev) => prev.map((x) => (x.id === b.id ? { ...x, wobble: false } : x))); setFlash(null); }, 400);
    }
  };

  const replaySound = () => { void safeSpeak(phonemeFor(targetLetter), scene.who); };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-between px-4">
        <div className="pointer-events-auto rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl backdrop-blur">⭐ {score}/{scene.goal} · ⏱ {timeLeft}s{combo >= 3 ? ` · 🔥 x${combo}` : ''}</div>
        <button onClick={replaySound} className="pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-lg font-black text-white shadow-2xl ring-4 ring-white/60 active:scale-95" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>🔊 Sound: <span className="text-2xl">{phonemeFor(targetLetter)}</span></button>
      </div>
      <div className="absolute inset-x-0 top-20 bottom-6 z-10 grid place-items-center px-4">
        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${scene.cols}, minmax(0, 1fr))`, width: 'min(96vw, 900px)' }}>
          {bricks.map((b) => {
            if (b.crashed) return <div key={b.id} className="aspect-square rounded-2xl bg-transparent" aria-hidden />;
            const isTarget = b.letter === targetLetter;
            return (
              <button key={b.id} onClick={() => tapBrick(b)} className={`relative aspect-square rounded-2xl border-b-[6px] border-black/25 shadow-xl transition-all active:translate-y-1 active:border-b-2 ${isTarget ? 'ring-4 ring-white/80 animate-pulse' : ''} ${b.wobble ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`} style={{ background: `linear-gradient(160deg, ${b.color}, ${b.color}dd 60%, ${b.color}99)` }} aria-label={`Brick ${b.letter}`}>
                <span className="grid h-full w-full place-items-center text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl">{b.letter}</span>
                <span className="pointer-events-none absolute inset-x-2 top-2 h-1/3 rounded-xl bg-white/25 blur-sm" />
              </button>
            );
          })}
        </div>
      </div>
      {flash && <div className="pointer-events-none absolute inset-0 z-20" style={{ background: flash === 'hit' ? 'radial-gradient(circle at center, rgba(34,197,94,0.35), transparent 60%)' : 'radial-gradient(circle at center, rgba(239,68,68,0.35), transparent 60%)' }} />}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-3xl bg-white/95 px-8 py-6 text-center shadow-2xl">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500">Get ready</div>
            <div className="mt-1 text-3xl font-black text-orange-800">🧱 Brick Crush</div>
            <div className="mt-2 text-sm font-bold text-orange-700">Listen to {c.name}. Tap the matching letter bricks!</div>
          </div>
        </div>
      )}
      {(phase === 'win' || phase === 'lose') && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">{phase === 'win' ? '✨ Champion! Next →' : `Nice try (${score}/${scene.goal}) — Next →`}</button>
        </div>
      )}
      {misses > 0 && <div className="pointer-events-none absolute right-4 bottom-4 z-30 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white">Misses: {misses}</div>}
    </div>
  );
}

/* ---------- Friend pop ---------- */

function FriendPopScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'friend-pop' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const GENDER: Record<string, 'she' | 'he'> = { bella: 'she', mia: 'she', willow: 'she', leo: 'he', pip: 'he' };
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [tapped, setTapped] = useState<{ who: CharKey; ok: boolean } | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const answeredRef = useRef(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  const roundEmotion = (prompt: string, explicit?: 'happy' | 'sad' | 'angry' | 'neutral'): 'happy' | 'sad' | 'angry' | 'neutral' => {
    if (explicit) return explicit;
    if (/(angry|grrr|mad)/i.test(prompt)) return 'angry';
    if (/sad/i.test(prompt)) return 'sad';
    if (/happy/i.test(prompt)) return 'happy';
    return 'neutral';
  };

  const targetGender = r ? GENDER[r.target as string] ?? 'she' : 'she';
  const roundEmo = r ? roundEmotion(r.prompt, r.emotion) : 'happy';
  const helloMode = !!r && !!r.sayLine && /hello|hi\b/i.test(r.sayLine);
  const pronounMode = !!r && !helloMode && /^\s*(he|she)\b/i.test(r.prompt);

  const lineup: { who: CharKey; emo: 'happy' | 'sad' | 'angry' | 'neutral' }[] = useMemo(() => {
    if (!r) return [];
    const cast = scene.cast;
    if (helloMode) {
      const target = r.target;
      const others = cast.filter((c) => c !== target);
      const pickA = others[round % Math.max(1, others.length)] ?? target;
      const pickB = others[(round + 1) % Math.max(1, others.length)] ?? target;
      const arr: CharKey[] = [target, pickA, pickB];
      const swap = (a: number, b: number) => { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; };
      swap(0, round % 3);
      return arr.map((who) => ({ who, emo: 'happy' as const }));
    }
    if (pronounMode) {
      const boys = cast.filter((c) => GENDER[c] === 'he');
      const girls = cast.filter((c) => GENDER[c] === 'she');
      const targetPool = targetGender === 'he' ? boys : girls;
      const otherPool = targetGender === 'he' ? girls : boys;
      const target = targetPool.includes(r.target) ? r.target : targetPool[round % Math.max(1, targetPool.length)];
      const others: CharKey[] = [];
      for (let i = 0; i < 2; i++) {
        const pool = otherPool.length ? otherPool : targetPool.filter((c) => c !== target);
        others.push(pool[(round + i) % pool.length]);
      }
      const arr = [target, ...others];
      const swap = (a: number, b: number) => { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; };
      swap(0, round % 3); swap(1, (round + 1) % 3);
      const allEmos: ('happy' | 'sad' | 'angry')[] = ['happy', 'sad', 'angry'];
      const otherEmos = allEmos.filter((e) => e !== roundEmo);
      return arr.map((who) => ({ who, emo: who === target ? roundEmo : (otherEmos[(round + arr.indexOf(who)) % otherEmos.length] as 'happy' | 'sad' | 'angry') }));
    }
    const emotions: ('happy' | 'sad' | 'angry')[] = ['happy', 'sad', 'angry'];
    const target = r.target;
    const others = cast.filter((c) => c !== target).slice(0, 2);
    const otherEmos = emotions.filter((e) => e !== roundEmo);
    const arr = [
      { who: target, emo: roundEmo },
      { who: others[0] ?? target, emo: otherEmos[0] },
      { who: others[1] ?? target, emo: otherEmos[1] ?? otherEmos[0] },
    ];
    const swap = (a: number, b: number) => { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; };
    swap(0, round % 3); swap(1, (round + 1) % 3);
    return arr;
  }, [round, r, targetGender, scene.cast, pronounMode, helloMode, roundEmo]);

  useEffect(() => {
    if (!r) return;
    answeredRef.current = false; setTapped(null);
    void safeSpeak(r.prompt, r.target);
  }, [round, r]);

  const tap = async (who: CharKey, emo: 'happy' | 'sad' | 'angry' | 'neutral') => {
    if (!r || answeredRef.current) return;
    const isCorrect = helloMode ? who === r.target : pronounMode ? GENDER[who] === targetGender : emo === roundEmo;
    if (isCorrect) {
      answeredRef.current = true; setTapped({ who, ok: true }); sfx.match(); setScore((s) => s + 1);
      const line = helloMode ? (r.sayLine ?? `Hello, ${CAST[who].name}!`) : pronounMode ? `${GENDER[who] === 'he' ? 'He' : 'She'} is ${roundEmo}!` : `${CAST[who].name} is ${roundEmo}!`;
      await safeSpeak(line, who);
      window.setTimeout(() => {
        const next = round + 1;
        if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
        setRound(next);
      }, 700);
    } else {
      setTapped({ who, ok: false }); sfx.wrong(); onLose();
      window.setTimeout(() => setTapped(null), 500);
    }
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Amazing!</div>
            <div className="text-lg font-bold text-neutral-700">You found all your friends! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <button onClick={() => cueSpeak(r!.prompt, r!.target)} className="absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-lg font-black text-orange-700 shadow-xl backdrop-blur active:scale-95 sm:text-2xl">
        🔊 {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </button>
      <div className="relative z-10 mt-20 flex w-full items-end justify-center gap-2 sm:gap-6">
        {lineup.map((item, i) => {
          const { who, emo } = item;
          const isFlash = tapped?.who === who;
          return (
            <button key={`${round}-${i}-${who}`} onClick={() => tap(who, emo)} className="relative transition-transform active:scale-95" style={{ width: 'clamp(180px, 30vw, 340px)', height: 'clamp(280px, 55vh, 500px)' }} aria-label={CAST[who].name}>
              <img src={getEmotionSprite(who, emo)} alt={CAST[who].name} className="h-full w-full object-contain drop-shadow-2xl" draggable={false} />
              {isFlash && <div className={`pointer-events-none absolute inset-0 flex items-center justify-center text-8xl font-black ${tapped!.ok ? 'text-green-400' : 'text-red-500'}`}>{tapped!.ok ? '✓' : '✗'}</div>}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-sm font-black text-orange-700 shadow">⭐ {score}/{total}</div>
    </div>
  );
}

/* =========================================================================
 * Feelings vocabulary pack — ported (interaction design only, not code) from
 * the reference "Little Explorers Phonics" Lesson 3 feelings progression.
 * Field shapes and every implementation below are our own, matching this
 * file's existing conventions (GlassCard/PrimaryButton chrome, CAST sprites,
 * safeSpeak/sfx audio, lep1-* CSS keyframes, Confetti on big completions).
 * ========================================================================= */

const FEELING_EMOJI: Record<'happy' | 'sad' | 'angry', string> = { happy: '\u{1F60A}', sad: '\u{1F622}', angry: '\u{1F620}' };

/* ---------- Feelings tap ---------- */

function FeelingsTapScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'feelings-tap' }>; onNext: () => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [talkingIdx, setTalkingIdx] = useState<number | null>(null);
  const total = scene.cast.length;
  const spots = useMemo(() => {
    const leftPad = total <= 3 ? 18 : 12;
    const step = total > 1 ? (100 - leftPad * 2) / (total - 1) : 0;
    return scene.cast.map((_, i) => ({ leftPct: leftPad + step * i }));
  }, [scene.cast, total]);

  const tap = async (i: number) => {
    setActive(i);
    setTapped((s) => new Set(s).add(i));
    sfx.pop();
    const { who, label } = scene.cast[i];
    setTalkingIdx(i);
    await safeSpeak(label, who);
    setTalkingIdx((cur) => (cur === i ? null : cur));
  };

  const allTapped = tapped.size >= total;

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="pointer-events-auto max-w-lg rounded-3xl bg-white/90 px-5 py-3 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur sm:text-base">{scene.teacher}</div>
      </div>
      {scene.cast.map((c, i) => {
        const cast = CAST[c.who];
        const isActive = active === i;
        const isDone = tapped.has(i);
        return (
          <button key={i} onClick={() => tap(i)} aria-label={`Tap ${cast.name}`}
            className="absolute bottom-8 z-20 grid place-items-end"
            style={{ left: `${spots[i].leftPct}%`, height: '58%', width: 'auto', aspectRatio: '0.72', transform: `translateX(-50%) scale(${isActive ? 1.1 : 1})`, transition: 'transform 0.3s ease-out' }}
          >
            <div className="pointer-events-none h-full w-full" style={{ filter: isDone ? 'drop-shadow(0 12px 18px rgba(34,197,94,0.55))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }}>
              <SpriteMascot
                profile={{ src: getEmotionSprite(c.who, c.emotion), eyeBand: MASCOT_EYE_BANDS[c.who] }}
                emotion={c.emotion}
                isTalking={talkingIdx === i}
                alt={cast.name}
              />
            </div>
            {isDone && (
              <div className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-2 text-center shadow-2xl ring-2 ring-orange-200 animate-[lep1-pop_0.4s_ease-out]">
                <span className="text-2xl">{FEELING_EMOJI[c.emotion]}</span>
                <p className="text-sm font-black" style={{ color: cast.color }}>{c.label}</p>
              </div>
            )}
          </button>
        );
      })}
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        {allTapped
          ? <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">Great job! Next →</button>
          : <div className="rounded-full bg-white/85 px-4 py-2 text-xs font-black text-orange-700 shadow">👉 Tap each friend ({tapped.size}/{total})</div>}
      </div>
    </div>
  );
}

/* ---------- Feelings wheel ---------- */

function FeelingsWheelScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'feelings-wheel' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const n = scene.slots.length;
  const slice = 360 / n;
  const colors = ['#FE6A2F', '#4FA9E0', '#B85CD1', '#FFC93C', '#7BE0FF', '#E76FA5'];
  const gradient = scene.slots.map((_, i) => `${colors[i % colors.length]} ${i * slice}deg ${(i + 1) * slice}deg`).join(', ');
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [said, setSaid] = useState(false);

  const spin = () => {
    if (spinning || landed !== null) return;
    const target = Math.floor(Math.random() * n);
    const finalAngle = 360 * 5 - (target * slice + slice / 2);
    sfx.pop();
    setSpinning(true);
    setRotation(finalAngle);
    window.setTimeout(async () => {
      setSpinning(false);
      setLanded(target);
      sfx.match();
      await safeSpeak(scene.slots[target].label, scene.slots[target].who);
    }, 2200);
  };

  const replay = () => { if (landed !== null) void safeSpeak(scene.slots[landed].label, scene.slots[landed].who); };
  const confirm = () => { if (landed === null || said) return; setSaid(true); sfx.gem(); onWin(true); };
  const slot = landed !== null ? scene.slots[landed] : null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-10 max-w-lg rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher}</div>

      <div className="relative z-10 mx-auto my-2" style={{ width: 'clamp(260px, 40vh, 340px)', height: 'clamp(260px, 40vh, 340px)' }}>
        {/* Pointer — a small carnival-style teardrop instead of a bare emoji glyph. */}
        <div
          className="pointer-events-none absolute -top-2 left-1/2 z-20 h-8 w-8 -translate-x-1/2 rounded-full shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF8A4C, #E5561A)', clipPath: 'polygon(50% 100%, 0% 15%, 100% 15%)', border: '3px solid white' }}
        />
        <div
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 2.2s cubic-bezier(0.15,0.65,0.25,1)' : 'none',
            border: '10px solid white',
            boxShadow: '0 20px 45px -12px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(0,0,0,0.08)',
          }}
        >
          {scene.slots.map((s, i) => {
            const angleDeg = i * slice + slice / 2 - 90;
            const rad = (angleDeg * Math.PI) / 180;
            const radius = 34; // % of wheel radius
            return (
              <div
                key={i}
                className="absolute grid place-items-center rounded-2xl border-2 border-white bg-white/90 shadow-lg"
                style={{
                  left: `${50 + radius * Math.cos(rad)}%`,
                  top: `${50 + radius * Math.sin(rad)}%`,
                  width: '26%',
                  height: '26%',
                  transform: 'translate(-50%,-50%)',
                }}
              >
                <img src={getEmotionSprite(s.who, s.emotion)} alt={`${CAST[s.who].name} ${s.emotion}`} className="h-full w-full object-contain p-0.5" draggable={false} />
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-12 w-12 rounded-full border-4 border-orange-400 bg-white shadow-lg" style={{ background: 'radial-gradient(circle at 35% 30%, #fff 0%, #FFE8B0 55%, #FEBE4C 100%)' }} />
        </div>
      </div>

      {landed === null ? (
        <button onClick={spin} disabled={spinning} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 disabled:opacity-60">
          {spinning ? '🌀 Spinning…' : '🎡 Spin the wheel!'}
        </button>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3 shadow-xl">
            <img src={getEmotionSprite(slot!.who, slot!.emotion)} alt={CAST[slot!.who].name} className="h-14 w-14 object-contain" draggable={false} />
            <p className="text-2xl font-black" style={{ color: CAST[slot!.who].color }}>{slot!.label}!</p>
          </div>
          {!said ? (
            <div className="flex gap-3">
              <button onClick={replay} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Hear again</button>
              <button onClick={confirm} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base font-black text-white shadow-xl active:scale-95">✅ I said it!</button>
            </div>
          ) : (
            <PrimaryButton onClick={onNext}>Next →</PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Modeled "X is feeling" rounds (shared by x-is-feeling & he-she-model) ---------- */

function ModeledFeelingRounds<R extends { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }>({
  teacher, rounds, badge, onNext, onWin,
}: {
  teacher: string;
  rounds: R[];
  badge?: (r: R) => string;
  onNext: () => void;
  onWin: (gem: boolean) => void;
}) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'model' | 'repeat'>('model');
  const [gemDone, setGemDone] = useState(false);
  const total = rounds.length;
  const finished = round >= total;
  const r = !finished ? rounds[round] : null;

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    setPhase('model');
    (async () => {
      await new Promise((res) => setTimeout(res, 300));
      if (cancelled) return;
      await safeSpeak(r.sentence, r.who);
      if (cancelled) return;
      setPhase('repeat');
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const replay = () => { if (r) void safeSpeak(r.sentence, r.who); };
  const confirm = () => {
    if (!r || phase !== 'repeat') return;
    sfx.match();
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setRound(next);
  };

  if (finished) {
    return (
      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">Great job! Next →</button>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="max-w-lg rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur sm:text-base">{teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span></div>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="h-56 w-56 drop-shadow-2xl sm:h-64 sm:w-64">
          <SpriteMascot
            profile={{ src: getEmotionSprite(r!.who, r!.emotion), eyeBand: MASCOT_EYE_BANDS[r!.who] }}
            emotion={r!.emotion}
            isTalking={phase === 'model'}
            alt={c.name}
          />
        </div>
        {badge && <span className="absolute -right-2 top-4 rounded-full bg-orange-500 px-3 py-1 text-sm font-black uppercase text-white shadow-lg">{badge(r!)}</span>}
      </div>
      <div className="mt-4 rounded-3xl bg-white/95 px-6 py-3 text-center shadow-2xl">
        <p className="text-2xl font-black sm:text-3xl" style={{ color: c.color }}>“{r!.sentence}”</p>
      </div>
      {phase === 'repeat' && (
        <div className="mt-5 flex gap-3">
          <button onClick={replay} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Hear again</button>
          <button onClick={confirm} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3 text-base font-black text-white shadow-xl active:scale-95">✅ I said it!</button>
        </div>
      )}
    </div>
  );
}

function XIsFeelingScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'x-is-feeling' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  return <ModeledFeelingRounds teacher={scene.teacher} rounds={scene.rounds} onNext={onNext} onWin={onWin} />;
}

function HeSheModelScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'he-she-model' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  return <ModeledFeelingRounds teacher={scene.teacher} rounds={scene.rounds} badge={(r) => r.pronoun} onNext={onNext} onWin={onWin} />;
}

/* ---------- Free production "say it & check" (feelings-dice, he-she-say, i-am-feeling) ---------- */

function ProduceSentenceScene({
  teacher, icon, rounds, announce, onNext, onWin,
}: {
  teacher: string;
  icon: string;
  rounds: { key: string; who?: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[];
  announce?: { who: CharKey; text: string };
  onNext: () => void;
  onWin: (gem: boolean) => void;
}) {
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const [talking, setTalking] = useState(false);
  const total = rounds.length;
  const finished = round >= total;
  const r = !finished ? rounds[round] : null;

  useEffect(() => {
    setRevealed(false);
    if (!r) return;
    if (announce) void safeSpeak(announce.text, announce.who);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const reveal = async () => {
    if (!r) return;
    setRevealed(true);
    sfx.pop();
    setTalking(true);
    await safeSpeak(r.sentence, r.who ?? 'teacher');
    setTalking(false);
  };
  const confirm = () => {
    if (!r) return;
    if (!revealed) { void reveal(); return; }
    sfx.match();
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setRound(next);
  };

  if (finished) {
    return (
      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">Great job! Next →</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="max-w-lg rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur sm:text-base">{teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span></div>
      </div>
      <div className="flex flex-col items-center">
        {r!.who ? (
          <div className="h-56 w-56 drop-shadow-2xl sm:h-64 sm:w-64">
            <SpriteMascot
              profile={{ src: getEmotionSprite(r!.who, r!.emotion), eyeBand: MASCOT_EYE_BANDS[r!.who] }}
              emotion={r!.emotion}
              isTalking={talking}
              alt={CAST[r!.who].name}
            />
          </div>
        ) : (
          <div className="grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-orange-300 to-pink-300 text-7xl shadow-2xl" style={{ animation: 'lep1-float 3s ease-in-out infinite' }}>🌟</div>
        )}
        <span className="mt-2 text-5xl">{FEELING_EMOJI[r!.emotion]}</span>
      </div>
      <div className="mt-4 min-h-[4.5rem] w-full max-w-md rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
        {revealed
          ? <p className="text-2xl font-black text-orange-700 sm:text-3xl">“{r!.sentence}”</p>
          : <p className="text-lg font-bold text-neutral-500">{icon} Say it out loud, then tap to check!</p>}
      </div>
      <div className="mt-5 flex gap-3">
        {revealed && <button onClick={() => void reveal()} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Hear it again</button>}
        <button onClick={confirm} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3 text-base font-black text-white shadow-xl active:scale-95">
          {revealed ? '➜ Next round' : '✅ Check my answer'}
        </button>
      </div>
    </div>
  );
}

function FeelingsDiceScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'feelings-dice' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const rounds = useMemo(() => scene.rounds.map((r, i) => ({ key: `${i}`, who: r.who, emotion: r.emotion, sentence: r.sentence })), [scene.rounds]);
  return <ProduceSentenceScene teacher={scene.teacher} icon="🎲" rounds={rounds} onNext={onNext} onWin={onWin} />;
}

function HeSheSayScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'he-she-say' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const rounds = useMemo(() => scene.rounds.map((r, i) => ({ key: `${i}`, who: r.who, emotion: r.emotion, sentence: `${r.pronoun} is ${r.emotion}.` })), [scene.rounds]);
  return <ProduceSentenceScene teacher={scene.teacher} icon="🗣️" rounds={rounds} onNext={onNext} onWin={onWin} />;
}

function IAmFeelingScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'i-am-feeling' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const rounds = useMemo(() => scene.rounds.map((r, i) => ({ key: `${i}`, who: undefined, emotion: r.emotion, sentence: `I am ${r.label.toLowerCase()}!` })), [scene.rounds]);
  return <ProduceSentenceScene teacher={scene.teacher} icon="🌟" rounds={rounds} announce={{ who: scene.asker, text: 'How are you?' }} onNext={onNext} onWin={onWin} />;
}

/* ---------- Feed the mood monsters ---------- */

/**
 * bg-mood-monsters.jpg already has three fully-painted monster characters
 * (yellow/happy far left, blue/sad center, red/angry far right) merged into
 * the illustration. These are their approximate on-image positions, used to
 * place invisible tap zones directly over the real art instead of drawing a
 * second, flatter set of "monster" buttons on top of it.
 */
const MONSTER_META: Record<'happy' | 'sad' | 'angry', { label: string; color: string; xPct: number }> = {
  happy: { label: 'Happy Monster', color: '#FFC93C', xPct: 19 },
  sad: { label: 'Sad Monster', color: '#4FA9E0', xPct: 51 },
  angry: { label: 'Angry Monster', color: '#E5561A', xPct: 81 },
};

function FeedMonstersScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'feed-monsters' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feeding, setFeeding] = useState<'happy' | 'sad' | 'angry' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotMonster, setHotMonster] = useState<'happy' | 'sad' | 'angry' | null>(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const monsterRefs = useRef<Record<'happy' | 'sad' | 'angry', HTMLDivElement | null>>({ happy: null, sad: null, angry: null });
  const dragStart = useRef({ x: 0, y: 0 });
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  useEffect(() => {
    if (!r) return;
    setFeeding(null); setWrongShake(false); setDragOffset({ dx: 0, dy: 0 });
    const t = window.setTimeout(() => void safeSpeak(r.sentence, r.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const hitTest = (x: number, y: number): 'happy' | 'sad' | 'angry' | null => {
    for (const m of ['happy', 'sad', 'angry'] as const) {
      const el = monsterRefs.current[m];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 30;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return m;
    }
    return null;
  };

  const feed = async (monster: 'happy' | 'sad' | 'angry') => {
    if (!r || feeding) return;
    if (monster === r.emotion) {
      sfx.match(); setFeeding(monster); setScore((s) => s + 1);
      await new Promise((res) => setTimeout(res, 700));
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      setRound(next);
    } else {
      sfx.wrong(); onLose(); setWrongShake(true); setDragOffset({ dx: 0, dy: 0 });
      window.setTimeout(() => setWrongShake(false), 500);
    }
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!r || feeding) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragOffset({ dx: e.clientX - dragStart.current.x, dy: e.clientY - dragStart.current.y });
    setHotMonster(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const target = hitTest(e.clientX, e.clientY);
    setHotMonster(null);
    if (!target) { setDragOffset({ dx: 0, dy: 0 }); return; }
    void feed(target);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/25" />
        <Confetti />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Yum yum!</div>
            <div className="text-lg font-bold text-neutral-700">You fed the monsters {score}/{total}!</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

      {/* Drop zones over the monsters already painted into scene.bg — no separate monster art drawn on top. */}
      {(['happy', 'sad', 'angry'] as const).map((m) => {
        const meta = MONSTER_META[m];
        const isHot = hotMonster === m;
        const isFed = feeding === m;
        return (
          <div
            key={m}
            ref={(el) => { monsterRefs.current[m] = el; }}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 top-[10%] z-10"
            style={{ left: `${meta.xPct - 16}%`, width: '32%' }}
          >
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform"
              style={{
                background: `radial-gradient(circle, ${meta.color}${isHot ? '66' : '33'} 0%, transparent 68%)`,
                animation: !feeding ? 'lep1-ping 2.4s ease-out infinite' : undefined,
                transform: isHot ? 'scale(1.15)' : 'scale(1)',
              }}
            />
            {isFed && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-emerald-400/90" style={{ animation: 'lep1-pop-fade 0.7s ease-out forwards' }} />
            )}
          </div>
        );
      })}

      <button onClick={() => void safeSpeak(r!.sentence, r!.who)} className="absolute inset-x-0 top-2 z-20 mx-auto max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur active:scale-95 sm:text-lg">
        🔊 {r!.sentence} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span>
      </button>

      {/* Friend stands grounded on the grass in front of the monsters — grab and drag onto the matching monster. */}
      <button
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        disabled={!!feeding}
        aria-label={`Drag ${c.name} to the matching monster`}
        className="absolute z-20 flex touch-none select-none flex-col items-center border-0 bg-transparent p-0 disabled:cursor-default"
        style={{
          left: feeding ? `${MONSTER_META[feeding].xPct}%` : '50%',
          top: feeding ? '58%' : '82%',
          transform: dragging
            ? `translate(calc(-50% + ${dragOffset.dx}px), calc(-50% + ${dragOffset.dy}px)) scale(1.15)`
            : `translate(-50%, -50%) scale(${feeding ? 0.3 : 1})`,
          opacity: feeding ? 0 : 1,
          transition: dragging ? 'none' : 'all 0.7s cubic-bezier(0.3,0,0.2,1)',
          animation: wrongShake ? 'lep1-shake 0.4s ease-in-out' : undefined,
        }}
      >
        {!feeding && (
          <span
            className="absolute left-1/2 top-[86%] -translate-x-1/2 rounded-full"
            style={{ width: '70%', height: '18%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.32) 0%, transparent 72%)' }}
          />
        )}
        <img src={getEmotionSprite(r!.who, r!.emotion)} alt={c.name} draggable={false} className="pointer-events-none relative h-32 w-32 object-contain drop-shadow-2xl sm:h-40 sm:w-40" style={{ animation: feeding || dragging ? undefined : 'lep1-float 2.6s ease-in-out infinite' }} />
        <span className="pointer-events-none relative mt-0.5 rounded-full bg-white/90 px-3 py-1 text-sm font-black shadow" style={{ color: c.color }}>{c.name}</span>
      </button>

      {feeding && (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 text-4xl" style={{ left: `${MONSTER_META[feeding].xPct}%`, top: '58%', animation: 'lep1-pop 0.5s ease-out 0.35s both' }}>
          😋
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 z-30 rounded-full bg-white/90 px-4 py-1 text-sm font-black text-orange-700 shadow">⭐ {score}/{total}</div>
    </div>
  );
}

/* ---------- He / She sort ---------- */

function HeSheSortScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'he-she-sort' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<'He' | 'She' | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotBox, setHotBox] = useState<'He' | 'She' | null>(null);
  const boxRefs = useRef<Record<'He' | 'She', HTMLDivElement | null>>({ He: null, She: null });
  const start = useRef({ x: 0, y: 0 });
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  useEffect(() => {
    if (!r) return;
    setPicked(null); setCorrect(null); setDragOffset({ dx: 0, dy: 0 });
    const t = window.setTimeout(() => void safeSpeak(`I am ${r.emotion}.`, r.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const hitTest = (x: number, y: number): 'He' | 'She' | null => {
    for (const p of ['He', 'She'] as const) {
      const el = boxRefs.current[p];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 20;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return p;
    }
    return null;
  };

  const pick = async (choice: 'He' | 'She') => {
    if (!r || picked) return;
    setPicked(choice);
    const ok = choice === r.pronoun;
    setCorrect(ok);
    if (ok) {
      sfx.match(); setScore((s) => s + 1);
      await safeSpeak(`Yes! ${choice} is ${r.emotion}.`, r.who);
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      window.setTimeout(() => setRound(next), 400);
    } else {
      sfx.wrong(); onLose();
      window.setTimeout(() => { setPicked(null); setCorrect(null); setDragOffset({ dx: 0, dy: 0 }); }, 700);
    }
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!r || picked) return;
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setHotBox(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const target = hitTest(e.clientX, e.clientY);
    setHotBox(null);
    if (!target) { setDragOffset({ dx: 0, dy: 0 }); return; }
    void pick(target);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Nice sorting! {score}/{total} ⭐ Next</button>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-cover bg-center px-4 py-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 mt-2 max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span></div>
      <button
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        disabled={!!picked}
        aria-label={`Drag ${c.name} to He or She`}
        className="relative z-10 flex touch-none select-none flex-col items-center border-0 bg-transparent p-0 disabled:cursor-default"
        style={{
          transform: dragging ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.1)` : undefined,
          transition: dragging ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          animation: picked && !correct ? 'lep1-shake 0.4s ease-out' : undefined,
        }}
      >
        <img src={getEmotionSprite(r!.who, r!.emotion)} alt={c.name} draggable={false} className="pointer-events-none h-48 w-48 object-contain drop-shadow-2xl sm:h-60 sm:w-60" />
        <div className="pointer-events-none mt-2 rounded-full bg-white/95 px-4 py-1 text-lg font-black" style={{ color: c.color }}>“I am {r!.emotion}.”</div>
      </button>
      <div className="relative z-10 flex w-full max-w-md gap-4 pb-2">
        {(['He', 'She'] as const).map((p) => (
          <div key={p} ref={(el) => { boxRefs.current[p] = el; }}
            className={`flex-1 rounded-3xl border-4 border-white py-8 text-center text-3xl font-black text-white shadow-2xl transition ${hotBox === p ? 'scale-110 ring-4 ring-white' : ''} ${picked === p ? (correct ? 'ring-4 ring-green-300 scale-105' : '') : ''}`}
            style={{ background: p === 'He' ? 'linear-gradient(135deg,#4FA9E0,#7BE0FF)' : 'linear-gradient(135deg,#E76FA5,#FF9EC4)' }}
          >{p}</div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Feeling quiz ---------- */

const EMOTION_WORD: Record<'happy' | 'sad' | 'angry', string> = { happy: 'Happy', sad: 'Sad', angry: 'Angry' };

function FeelingQuizScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'feeling-quiz' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<'happy' | 'sad' | 'angry' | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  const options = useMemo(() => {
    if (!r) return [] as ('happy' | 'sad' | 'angry')[];
    const others = (['happy', 'sad', 'angry'] as const).filter((e) => e !== r.emotion);
    const arr = [r.emotion, ...others];
    const seed = round * 7 + 3;
    return arr.map((e, i) => ({ e, k: (i * 131 + seed * 97) % 991 })).sort((a, b) => a.k - b.k).map((x) => x.e);
  }, [round, r]);

  useEffect(() => {
    if (!r) return;
    setPicked(null); setCorrect(null);
    const t = window.setTimeout(() => void safeSpeak(r.prompt, 'teacher'), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const pick = async (choice: 'happy' | 'sad' | 'angry') => {
    if (!r || picked) return;
    setPicked(choice);
    const ok = choice === r.emotion;
    setCorrect(ok);
    if (ok) {
      sfx.match(); setScore((s) => s + 1);
      await safeSpeak(`${CAST[r.who].name} is ${r.emotion}!`, r.who);
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      window.setTimeout(() => setRound(next), 300);
    } else {
      sfx.wrong(); onLose();
      window.setTimeout(() => { setPicked(null); setCorrect(null); }, 700);
    }
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Great quiz! {score}/{total} ⭐ Next</button>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-cover bg-center px-4 py-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <button onClick={() => void safeSpeak(r!.prompt, 'teacher')} className="relative z-20 mt-2 max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur active:scale-95 sm:text-lg">
        🔊 {r!.prompt} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span>
      </button>
      <img src={getEmotionSprite(r!.who, r!.emotion)} alt={c.name} className="relative z-10 h-48 w-48 object-contain drop-shadow-2xl sm:h-60 sm:w-60" />
      <div className="relative z-10 flex w-full max-w-lg gap-3 pb-2">
        {options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
            className={`flex flex-1 flex-col items-center gap-1 rounded-3xl border-4 border-white p-3 shadow-2xl transition active:scale-95 disabled:opacity-60 ${picked === opt ? (correct ? 'ring-4 ring-green-300 scale-105' : 'animate-[lep1-shake_0.4s_ease-out]') : ''}`}
            style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}
          >
            <span className="text-5xl">{FEELING_EMOJI[opt]}</span>
            <span className="text-xs font-black uppercase text-white drop-shadow">{EMOTION_WORD[opt]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Feelings bingo ---------- */

function FeelingsBingoScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'feelings-bingo' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [callIdx, setCallIdx] = useState(0);
  const [hits, setHits] = useState<Set<number>>(new Set());
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = callIdx >= total;
  const round = !finished ? scene.rounds[callIdx] : null;
  const cols = scene.tiles.length > 4 ? 3 : 2;

  useEffect(() => {
    if (!round) return;
    const t = window.setTimeout(() => void safeSpeak(round.prompt, 'teacher'), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callIdx]);

  const tapTile = async (i: number) => {
    if (!round || finished) return;
    const tile = scene.tiles[i];
    if (tile.who === round.who && tile.emotion === round.emotion) {
      sfx.match();
      setHits((s) => new Set(s).add(i));
      await safeSpeak(`Yes! ${CAST[tile.who].name} is ${tile.emotion}!`, tile.who);
      const next = callIdx + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      setCallIdx(next);
    } else {
      sfx.wrong(); onLose(); setWrongTile(i);
      window.setTimeout(() => setWrongTile(null), 500);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 max-w-lg rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">
        {finished ? '🎉 BINGO! You found every friend!' : <>🔊 {round!.prompt} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{callIdx + 1}/{total}</span></>}
      </div>
      <div className="relative z-10 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {scene.tiles.map((tile, i) => {
          const c = CAST[tile.who];
          const isHit = hits.has(i);
          return (
            <button key={i} onClick={() => tapTile(i)} disabled={finished}
              className={`relative grid aspect-square w-24 place-items-center rounded-3xl border-4 bg-white/90 p-2 shadow-xl transition active:scale-95 disabled:opacity-90 sm:w-28 ${wrongTile === i ? 'animate-[lep1-shake_0.4s_ease-out] border-rose-400' : isHit ? 'border-green-400 ring-4 ring-green-300/60' : 'border-white'}`}
            >
              <img src={getEmotionSprite(tile.who, tile.emotion)} alt={c.name} className="h-full w-full object-contain" draggable={false} />
              {isHit && <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-green-500 text-lg text-white shadow-lg">✓</span>}
            </button>
          );
        })}
      </div>
      {finished && (
        <div className="relative z-30 flex flex-col items-center">
          <Confetti />
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Numbers / age (Lesson 4 birthday block) ---------- */

function NumbersLearnScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'numbers-learn' }>; onNext: () => void }) {
  const numbers = useMemo(() => Array.from({ length: scene.to - scene.from + 1 }, (_, i) => scene.from + i), [scene.from, scene.to]);
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const [popN, setPopN] = useState<number | null>(null);

  const tapNumber = async (n: number) => {
    setHeard((s) => new Set(s).add(n));
    setPopN(n);
    sfx.pop();
    await safeSpeak(numberSpeech(n), scene.who);
    setPopN((cur) => (cur === n ? null : cur));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">Numbers 1 → {scene.to}</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{scene.teacher}</span>
      </div>
      {popN !== null && (
        <div key={popN} className="pointer-events-none absolute inset-x-0 top-1/3 z-20 flex flex-col items-center" style={{ animation: 'lep1-pop 0.4s ease-out' }}>
          <span className="text-7xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">{popN}</span>
          <span className="mt-1 rounded-full bg-white/90 px-4 py-1 text-lg font-black text-orange-700 shadow">{NUMBER_WORDS[popN - 1]}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-24 flex flex-wrap items-center justify-center gap-2 px-4 sm:gap-3">
        {numbers.map((n) => {
          const color = RAINBOW_10[(n - 1) % RAINBOW_10.length];
          return (
            <button key={n} onClick={() => void tapNumber(n)}
              className="rounded-2xl border-4 font-black text-white shadow-lg transition-transform active:scale-95"
              style={{ width: 'min(11vw, 74px)', height: 'min(11vw, 74px)', fontSize: 'min(6vw, 32px)', background: color, borderColor: 'rgba(255,255,255,0.85)', opacity: heard.has(n) ? 0.6 : 1 }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <button onClick={onNext} className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-xl transition hover:bg-orange-600 active:scale-95">Next →</button>
    </div>
  );
}

function NumbersReviewScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'numbers-review' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const numbers = useMemo(() => Array.from({ length: scene.to - scene.from + 1 }, (_, i) => scene.from + i), [scene.from, scene.to]);
  const [target, setTarget] = useState<number>(() => numbers[Math.floor(Math.random() * numbers.length)]);
  const [correct, setCorrect] = useState(0);
  const [wrongTap, setWrongTap] = useState<number | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const ready = correct >= 8;

  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => void safeSpeak(numberSpeech(target), scene.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const tapNumber = (n: number) => {
    if (ready) return;
    if (n === target) {
      sfx.match();
      const next = correct + 1;
      setCorrect(next);
      if (next >= 8 && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      setTarget(numbers[Math.floor(Math.random() * numbers.length)]);
    } else {
      sfx.wrong(); setWrongTap(n);
      window.setTimeout(() => setWrongTap(null), 400);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">Tap the number</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{ready ? '🎉 Great counting!' : scene.teacher}</span>
        {!ready && (
          <button onClick={() => void safeSpeak(numberSpeech(target), scene.who)} className="mt-0.5 rounded-full bg-orange-500 px-4 py-1 text-sm font-black text-white shadow active:scale-95">
            🔊 {NUMBER_WORDS[target - 1]}
          </button>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-40 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-sm font-black text-orange-700 shadow">{correct}/8</div>
      <div className="absolute inset-x-0 bottom-24 flex flex-wrap items-center justify-center gap-2 px-4 sm:gap-3">
        {numbers.map((n) => {
          const color = RAINBOW_10[(n - 1) % RAINBOW_10.length];
          return (
            <button key={n} onClick={() => tapNumber(n)} disabled={ready}
              className={`rounded-2xl border-4 font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-70 ${wrongTap === n ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`}
              style={{ width: 'min(13vw, 92px)', height: 'min(13vw, 92px)', fontSize: 'min(7vw, 42px)', background: color, borderColor: wrongTap === n ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.55)' }}
            >
              {n}
            </button>
          );
        })}
      </div>
      {ready && <button onClick={onNext} className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">I'm ready! →</button>}
    </div>
  );
}

function CandleCakeScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'candle-cake' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [round, setRound] = useState(0);
  const [candles, setCandles] = useState(0);
  const [studentAge, setStudentAge] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const target = r?.isStudent ? (studentAge ?? 0) : (r?.target ?? 0);

  useEffect(() => {
    setCandles(0); setStudentAge(null); setCelebrating(false);
    if (!r) return;
    const t = window.setTimeout(() => void safeSpeak(r.prompt, r.asker), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const tapCake = async () => {
    if (!r || celebrating || target <= 0 || candles >= target) return;
    sfx.pop();
    const next = candles + 1;
    setCandles(next);
    if (next >= target) {
      setCelebrating(true);
      sfx.gem();
      await safeSpeak(r.celebrate, r.asker);
      if (round === total - 1 && !gemDone) { setGemDone(true); onWin(true); }
      window.setTimeout(() => setRound((x) => x + 1), 900);
    }
  };

  if (finished) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <Confetti />
        <div className="relative z-20 rounded-3xl bg-white/95 px-8 py-6 text-center text-2xl font-black text-orange-700 shadow-2xl">🎂 Happy birthday to YOU! 🎂</div>
        <button onClick={onNext} className="relative z-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
      </div>
    );
  }

  const askerColor = r!.isStudent ? '#FE6A2F' : CAST[r!.asker].color;
  const candleSpacing = Math.min(9, 30 / Math.max(target - 1, 1));

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-between px-4">
        <div className="rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl">🎂 Round {round + 1}/{total}</div>
        <div className="flex items-center gap-2 rounded-full px-5 py-3 text-lg font-black text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${askerColor}, #FEBE4C)` }}>
          🕯️ {candles}/{target || '?'}
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[16%] z-30 max-w-[92%] -translate-x-1/2 rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
        <div className="text-xl font-black text-orange-700 sm:text-2xl">🔊 {r!.prompt}</div>
      </div>
      {r!.isStudent && studentAge === null ? (
        <div className="absolute inset-x-0 bottom-10 z-30 flex max-w-md flex-wrap justify-center gap-2 px-4" style={{ margin: '0 auto' }}>
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button key={n} onClick={() => setStudentAge(n)} className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-white bg-white/95 text-xl font-black text-orange-700 shadow-xl active:scale-95">{n}</button>
          ))}
        </div>
      ) : (
        <>
          {!r!.isStudent && BIRTHDAY_SPRITE[r!.asker] && (
            <img
              src={BIRTHDAY_SPRITE[r!.asker]}
              alt={CAST[r!.asker].name}
              className="pointer-events-none absolute bottom-[6%] left-[2%] z-20 drop-shadow-2xl"
              style={{ width: 'min(46vh, 460px)', animation: celebrating ? 'lep1-pop 0.5s ease-in-out 2' : 'lep1-cakeBounce 1.6s ease-in-out infinite' }}
            />
          )}
          <div className="absolute inset-x-0 bottom-[4%] z-10 grid place-items-center">
            <button
              onClick={() => void tapCake()}
              aria-label="Tap the cake to add a candle"
              className="relative cursor-pointer touch-none select-none"
              style={{ width: 'min(88vw, 760px)', height: 'min(56vh, 560px)', animation: 'lep1-cakeIdle 2.6s ease-in-out infinite', transformOrigin: '50% 100%' }}
            >
              <img src={cakeSticker} alt="Birthday cake" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ objectFit: 'contain', objectPosition: 'center bottom' }} />
              {candles < target && (
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ border: '4px solid rgba(255,255,255,0.9)', animation: 'lep1-tapRipple 1.4s ease-out infinite' }}
                />
              )}
              {Array.from({ length: candles }).map((_, i) => (
                <div
                  key={i}
                  className="absolute z-[5]"
                  style={{ left: `${50 + (i - (target - 1) / 2) * candleSpacing}%`, bottom: '82%', transform: 'translateX(-50%)', width: 'clamp(70px, 13%, 120px)', transformOrigin: '50% 100%', animation: 'lep1-candleDrop 0.55s cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                  <div className="relative w-full" style={{ animation: 'lep1-candleWiggle 2.4s ease-in-out infinite' }}>
                    <img src={candleSticker} alt="" draggable={false} className="block w-full select-none" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))' }} />
                  </div>
                </div>
              ))}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CountBalloonsScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'count-balloons' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [gemDone, setGemDone] = useState(false);
  const count = popped.size;
  const finished = count >= scene.total;

  const popNext = async (i: number) => {
    if (finished || popped.has(i) || i !== count) return;
    sfx.pop();
    const next = new Set(popped).add(i);
    setPopped(next);
    await safeSpeak(numberSpeech(next.size), scene.who);
    if (next.size >= scene.total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">Pop & Count · 1 → {scene.total}</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{scene.teacher}</span>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center font-black text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
        <span className="text-7xl sm:text-8xl">{count}</span>
        <span className="text-3xl sm:text-4xl">/{scene.total}</span>
      </div>
      {Array.from({ length: scene.total }).map((_, i) => {
        const perRow = Math.min(5, scene.total);
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const rowCount = Math.min(perRow, scene.total - row * perRow);
        const x = ((col + 0.5) / rowCount) * 100;
        const y = 40 + row * 20;
        const rot = (col % 2 === 0 ? -1 : 1) * (4 + col * 2);
        const isPopped = popped.has(i);
        const color = RAINBOW_10[i % RAINBOW_10.length];
        return (
          <button
            key={i}
            onClick={() => void popNext(i)}
            disabled={isPopped || i !== count}
            aria-label={`Balloon ${i + 1}`}
            className="absolute select-none"
            style={{
              left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              width: 'min(18vw, 130px)', height: 'min(30vw, 228px)',
              opacity: isPopped ? 0 : 1, pointerEvents: isPopped ? 'none' : 'auto',
              transition: 'opacity 220ms',
              animation: `lep1-balloonFloat 3.6s ease-in-out ${(i % perRow) * 0.35}s infinite`,
              filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.3))',
            }}
          >
            <Balloon color={color} />
          </button>
        );
      })}
      <button onClick={finished ? onNext : undefined} disabled={!finished}
        className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-xl transition hover:bg-orange-600 active:scale-95 disabled:opacity-50"
      >
        {finished ? 'Next →' : `Pop them all… (${scene.total - count} left)`}
      </button>
    </div>
  );
}

function AgeBalloonsScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'age-balloons' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const total = scene.friends.length;
  const allDone = tapped.size >= total;

  const tapFriend = async (i: number) => {
    if (tapped.has(i)) return;
    setActive(i);
    const f = scene.friends[i];
    const next = new Set(tapped).add(i);
    setTapped(next);
    sfx.pop();
    await safeSpeak(`${CAST[f.who].name} is ${f.age}!`, f.who);
    if (next.size >= total) { sfx.gem(); onWin(true); }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">🎈 {tapped.size}/{total}</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{scene.teacher}</span>
      </div>
      {scene.friends.map((f, i) => {
        const c = CAST[f.who];
        const isDone = tapped.has(i);
        const n = scene.friends.length;
        return (
          <button
            key={i}
            onClick={() => void tapFriend(i)}
            className="absolute bottom-0 flex flex-col items-center pb-4"
            style={{ left: `${(i / n) * 100}%`, width: `${(1 / n) * 100 * 1.35}%` }}
          >
            <img
              src={BALLOONS_SPRITE[f.who] ?? c.img}
              alt={c.name}
              className="pointer-events-none w-full object-contain drop-shadow-2xl"
              style={{ animation: active === i ? 'lep1-pop 0.4s ease-out' : undefined }}
            />
            <span className="mt-2 rounded-full bg-white/95 px-4 py-1 text-sm font-black shadow" style={{ color: isDone ? undefined : c.color }}>
              {isDone ? `${c.name} is ${f.age}! ⭐` : c.name}
            </span>
          </button>
        );
      })}
      {allDone && <button onClick={onNext} className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>}
    </div>
  );
}

function AgeSentenceMatchScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'age-sentence-match' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const cards = useMemo(() => {
    const arr = scene.friends.map((f, i) => ({ i, text: `${CAST[f.who].name} is ${f.age}!` }));
    return [...arr].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongCard, setWrongCard] = useState<number | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const allMatched = matched.size >= scene.friends.length;

  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotFriend, setHotFriend] = useState<number | null>(null);
  const friendRefs = useRef<Record<number, HTMLElement | null>>({});
  const start = useRef({ x: 0, y: 0 });

  const hitTest = (x: number, y: number): number | null => {
    for (let i = 0; i < scene.friends.length; i++) {
      const el = friendRefs.current[i];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 24;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return i;
    }
    return null;
  };

  const attemptMatch = async (cardIdx: number, friendIdx: number) => {
    const card = cards[cardIdx];
    if (card.i === friendIdx) {
      sfx.match();
      const next = new Set(matched).add(card.i);
      setMatched(next);
      const f = scene.friends[card.i];
      await safeSpeak(card.text, f.who);
      if (next.size >= scene.friends.length && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    } else {
      sfx.wrong(); onLose(); setWrongCard(cardIdx);
      window.setTimeout(() => setWrongCard(null), 400);
    }
  };

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (matched.has(cards[idx].i)) return;
    setDragging(idx);
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    void safeSpeak(cards[idx].text, scene.friends[cards[idx].i].who);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging === null) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setHotFriend(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragging;
    setDragging(null);
    setHotFriend(null);
    setDragOffset({ dx: 0, dy: 0 });
    if (idx === null) return;
    const friendIdx = hitTest(e.clientX, e.clientY);
    if (friendIdx !== null) void attemptMatch(idx, friendIdx);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-between px-4">
        <div className="rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl">🎯 {matched.size}/{scene.friends.length}</div>
        <div className="max-w-[70%] rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl">{scene.teacher}</div>
      </div>
      <div className="absolute inset-x-0 top-20 z-20 flex flex-wrap justify-center gap-4 px-6">
        {cards.map((card, idx) => {
          const f = scene.friends[card.i];
          const color = CAST[f.who].color;
          const isMatched = matched.has(card.i);
          if (isMatched) return null;
          return (
            <button
              key={idx}
              onPointerDown={onDown(idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              className={`touch-none select-none rounded-2xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur ${dragging === idx ? 'z-30 scale-110' : ''} ${wrongCard === idx ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`}
              style={{
                outline: `3px solid ${wrongCard === idx ? '#f43f5e' : color}`, boxShadow: `0 6px 18px ${color}55`,
                transform: dragging === idx ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.15)` : undefined,
                transition: dragging === idx ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div className="flex items-center justify-center gap-1.5">
                <div className="pointer-events-none text-center font-black leading-none" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)' }}>
                  <span style={{ color }}>{CAST[f.who].name}</span>
                  <span className="text-slate-800"> is </span>
                  <span className="text-orange-600" style={{ WebkitTextStroke: '1px #FE6A2F' }}>{f.age}</span>
                  <span className="text-slate-800">!</span>
                </div>
                <span className="pointer-events-none text-sm">🔊</span>
              </div>
              <div className="pointer-events-none mt-0.5 text-center text-[9px] font-black uppercase tracking-widest text-slate-500">grab & drag me!</div>
            </button>
          );
        })}
      </div>
      {scene.friends.map((f, i) => {
        const c = CAST[f.who];
        const isDone = matched.has(i);
        const isHot = hotFriend === i;
        return (
          <div
            key={i}
            ref={(el) => { friendRefs.current[i] = el; }}
            aria-hidden={isDone}
            className="absolute z-10 select-none transition-transform"
            style={{ left: `${(i / scene.friends.length) * 100}%`, bottom: '6%', width: `${(1 / scene.friends.length) * 100 * 1.35}%`, opacity: isDone ? 0.5 : 1, transform: isHot ? 'scale(1.1)' : undefined }}
          >
            <img
              src={BALLOONS_SPRITE[f.who] ?? c.img}
              alt={c.name}
              className="pointer-events-none relative w-full drop-shadow-2xl"
              style={{ animation: 'lep1-float 2.6s ease-in-out infinite', transformOrigin: '50% 90%' }}
            />
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-base font-black shadow-lg"
              style={{ bottom: -10, color: c.color, border: `2px solid ${c.color}`, whiteSpace: 'nowrap', boxShadow: `0 4px 14px ${c.color}66`, outline: isHot ? `3px solid ${c.color}` : undefined }}
            >
              {isDone ? `${c.name} is ${f.age}! ⭐` : c.name}
            </div>
          </div>
        );
      })}
      {allMatched && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}

function MeetGreetScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'meet-greet' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.friends.length;
  const finished = idx >= total;
  const f = !finished ? scene.friends[idx] : null;
  const c = f ? CAST[f.who] : null;

  const steps = f ? [
    { line: "What's your name?", who: 'teacher' as const },
    { line: `My name is ${c!.name}.`, who: f.who },
    { line: 'How old are you?', who: 'teacher' as const },
    { line: `I am ${f.age}.`, who: f.who },
    { line: 'Nice to meet you!', who: 'teacher' as const },
  ] : [];

  useEffect(() => {
    if (!f) return;
    const t = window.setTimeout(() => void safeSpeak(steps[step].line, steps[step].who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, step]);

  const advance = () => {
    if (step < steps.length - 1) { setStep(step + 1); return; }
    const nextIdx = idx + 1;
    if (nextIdx >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setIdx(nextIdx);
    setStep(0);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Confetti />
          <button onClick={onNext} className="pointer-events-auto rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const current = steps[step];
  const isTeacherLine = current.who === 'teacher';
  const bubbleColor = isTeacherLine ? '#FE6A2F' : c!.color;

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Age Stage · Meet &amp; Greet</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Friend {idx + 1}/{total} · {c!.name}</span>
      </div>
      <img
        src={c!.img}
        alt={c!.name}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-2xl"
        style={{ width: 'clamp(220px, 46vw, 460px)', animation: 'lep1-float 3.4s ease-in-out infinite' }}
      />
      <div className="absolute inset-x-0 top-24 z-20 mx-auto flex max-w-lg flex-col gap-3 px-6">
        <button
          key={step}
          onClick={() => void safeSpeak(current.line, current.who)}
          className="group relative flex justify-start text-left outline-none"
          style={{ animation: 'lep1-pop 0.35s ease-out' }}
        >
          <div className="max-w-[85%] rounded-3xl px-5 py-3 text-left shadow-2xl ring-2 ring-white/40" style={{ background: bubbleColor }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">{isTeacherLine ? 'You ask' : `${c!.name} answers`}</div>
            <div className="text-lg font-bold text-white">{current.line}</div>
            <div className="mt-1 text-[10px] font-bold text-white/80">🔁 tap to replay</div>
          </div>
        </button>
      </div>
      <button onClick={advance} className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-8 py-4 text-lg font-black uppercase text-orange-700 shadow-2xl transition hover:scale-105 active:scale-95">
        {step < steps.length - 1 ? '🎤 Your turn — say it, then tap ▶' : idx < total - 1 ? 'Next friend →' : 'Finish →'}
      </button>
    </div>
  );
}

/** Mini candle cake — the age-quiz answer cards draw one live cake per choice, candle count matching the number. */
function MiniCake({ candles }: { candles: number }) {
  return (
    <svg viewBox="0 0 140 110" style={{ width: 'clamp(120px, 15vw, 170px)', height: 'auto' }} className="mt-1">
      <rect x="10" y="60" width="120" height="40" rx="6" fill="#f4a3c7" stroke="#3b1e08" strokeWidth={3} />
      <rect x="10" y="72" width="120" height="6" fill="#fff" opacity={0.7} />
      <rect x="10" y="40" width="120" height="24" rx="6" fill="#fde68a" stroke="#3b1e08" strokeWidth={3} />
      {Array.from({ length: candles }).map((_, i) => {
        const x = 22 + i * 15;
        return (
          <g key={i}>
            <rect x={x} y="20" width="6" height="22" fill="#fff" stroke="#3b1e08" strokeWidth={1.5} />
            <path d={`M ${x + 3} 8 Q ${x + 7} 14 ${x + 3} 20 Q ${x - 1} 14 ${x + 3} 8`} fill="#FE6A2F" stroke="#3b1e08" strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
}

function AgeQuizScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'age-quiz' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [opened, setOpened] = useState(false);
  const [pickedAge, setPickedAge] = useState<number | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.friends.length + 1;
  const isStudentTurn = idx >= scene.friends.length;
  const f = !isStudentTurn ? scene.friends[idx] : null;
  const finished = idx >= total;
  const askLine = isStudentTurn ? 'What is your age?' : `How old is ${f ? CAST[f.who].name : ''}? \u{1F382}`;
  const sayPrefix = isStudentTurn ? 'I am' : `${f ? CAST[f.who].name : ''} is`;

  useEffect(() => {
    setOpened(false);
    setPickedAge(null);
  }, [idx]);

  const openPresent = async () => {
    setOpened(true);
    sfx.pop();
    await safeSpeak(askLine, 'teacher');
  };

  const pickAge = async (age: number) => {
    if (pickedAge !== null) return;
    setPickedAge(age);
    sfx.match();
    if (f) await safeSpeak(`${CAST[f.who].name} is ${age}!`, f.who);
    else await safeSpeak(`I am ${age}!`, 'teacher');
  };

  const advance = () => {
    const next = idx + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setIdx(next);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Confetti />
          <button onClick={onNext} className="pointer-events-auto rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Age Party · Guess My Candles</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Present {idx + 1} / {total}</span>
      </div>

      {!opened ? (
        <div className="absolute inset-x-0 bottom-[18%] top-[20%] z-20 flex items-end justify-center">
          <button onClick={() => void openPresent()} aria-label="Open the present" className="relative outline-none active:scale-95" style={{ animation: 'lep1-wiggle 1.4s ease-in-out infinite' }}>
            <PresentBox />
            <div className="mt-3 rounded-full bg-orange-500 px-4 py-1 text-center text-[11px] font-black uppercase tracking-widest text-white shadow">Tap to open!</div>
          </button>
        </div>
      ) : (
        <>
          <button onClick={() => void safeSpeak(askLine, 'teacher')} className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-[2rem] bg-white/95 px-8 py-5 text-center shadow-2xl ring-4 ring-orange-300 active:scale-95">
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-700">You ask</div>
            <div className="text-2xl font-black text-slate-800">{askLine}</div>
            <div className="mt-1 text-[10px] font-bold text-slate-500">🔁 tap to replay</div>
          </button>
          <div className="absolute left-1/2 top-44 z-30 -translate-x-1/2 rounded-[2rem] bg-gradient-to-b from-yellow-100 to-orange-100 px-8 py-4 text-center shadow-xl ring-4 ring-orange-200">
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">You say</div>
            <div className="flex items-center gap-3 text-3xl font-black text-orange-800">
              <span>{sayPrefix}</span>
              <span className="inline-flex h-14 w-20 items-center justify-center rounded-2xl border-4 border-dashed border-orange-300 bg-white/70 text-2xl">{pickedAge ?? '___'}</span>
              <span>!</span>
            </div>
          </div>
          {!isStudentTurn && (
            <img src={CAST[f!.who].img} alt={CAST[f!.who].name} className="absolute inset-x-0 bottom-[16%] mx-auto object-contain drop-shadow-2xl" style={{ width: 'clamp(200px, 32vw, 325px)', animation: 'lep1-float 3s ease-in-out infinite' }} />
          )}
          {pickedAge === null ? (
            <div className="absolute inset-x-0 bottom-6 z-30 flex flex-wrap items-center justify-center gap-4 px-6">
              {scene.studentAges.map((age) => (
                <button key={age} onClick={() => void pickAge(age)}
                  className="relative flex flex-col items-center rounded-3xl bg-white/95 px-4 pb-2 pt-3 shadow-2xl ring-4 ring-orange-100 transition active:scale-95"
                >
                  <span className="text-6xl font-black leading-none text-orange-700 drop-shadow-sm">{age}</span>
                  <MiniCake candles={age} />
                  <span className="mt-1 text-[11px] font-black uppercase tracking-widest text-orange-600">{NUMBER_WORDS[age - 1]?.toLowerCase()}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
              <button onClick={advance} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Shared keyframes ---------- */

export function Lep1Keyframes() {
  return (
    <style>{`
      @keyframes lep1-fade-slide { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes lep1-pop { 0% { opacity: 0; transform: scale(0.6) translateY(-10px); } 20% { opacity: 1; transform: scale(1.15) translateY(0); } 60% { transform: scale(1); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes lep1-pop-fade { 0% { opacity: 0; transform: scale(0.6) translateY(-10px); } 20% { opacity: 1; transform: scale(1.15) translateY(0); } 60% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1) translateY(-10px); } }
      @keyframes lep1-float { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
      @keyframes lep1-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-8px); } 80% { transform: translateX(8px); } }
      @keyframes lep1-hop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-walk { 0% { transform: translateX(-60%) rotate(-4deg); } 25% { transform: translateX(-20%) rotate(3deg) translateY(-6px); } 50% { transform: translateX(20%) rotate(-3deg); } 75% { transform: translateX(60%) rotate(3deg) translateY(-6px); } 100% { transform: translateX(-60%) rotate(-4deg); } }
      @keyframes lep1-wiggle { 0%,100% { transform: rotate(-3deg) translateY(0); } 25% { transform: rotate(3deg) translateY(-4px); } 50% { transform: rotate(-2deg) translateY(0); } 75% { transform: rotate(4deg) translateY(-4px); } }
      @keyframes lep1-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      @keyframes lep1-slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes lep1-dashScroll { from { background-position: 0 0; } to { background-position: -80px 0; } }
      @keyframes lep1-heroBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-itemBob { 0%,100% { transform: translateY(-50%) rotate(-4deg); } 50% { transform: translateY(-58%) rotate(4deg); } }
      @keyframes lep1-shuffleShake { 0%,100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-8px) rotate(-1deg); } 75% { transform: translateX(8px) rotate(1deg); } }
      @keyframes lep1-blockShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-3deg); } 75% { transform: translateX(6px) rotate(3deg); } }
      @keyframes lep1-blockWin { 0% { transform: scale(1); } 40% { transform: scale(1.25) rotate(-6deg); } 70% { transform: scale(1.15) rotate(6deg); } 100% { transform: scale(1); } }
      @keyframes lep1-blockDrop { 0% { transform: translateY(-40px) scale(1.1); opacity: 0; } 60% { transform: translateY(4px) scale(0.98); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      @keyframes lep1-lyricPop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes lep1-noteFloat { 0% { transform: translateY(0) rotate(-8deg); opacity: 0; } 20% { opacity: 0.9; } 100% { transform: translateY(-160px) rotate(12deg); opacity: 0; } }
      @keyframes lep1-balloonFloat { 0%, 100% { translate: 0px; } 50% { translate: 0px -10px; } }
      @keyframes lep1-cakeBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-cakeIdle { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-8px) scale(1.015, 0.985); } }
      @keyframes lep1-tapRipple { 0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; } }
      @keyframes lep1-candleDrop { 0% { transform: translateX(-50%) translateY(-140px) rotate(-25deg) scale(0.7); opacity: 0; } 60% { transform: translateX(-50%) translateY(8px) rotate(6deg) scale(1.1); opacity: 1; } 100% { transform: translateX(-50%) translateY(0) rotate(0deg) scale(1); opacity: 1; } }
      @keyframes lep1-candleWiggle { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
    `}</style>
  );
}
