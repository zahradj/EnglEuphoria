import { useState } from 'react';
import type { Scene } from './scenes';
import { Hearts, MAX_HEARTS, Lep1Keyframes } from '../unit1/SceneRenderer';
import { type ActivitySync } from '../sceneActivitySync';
import { SpinWheelScene } from '../SpinWheelScene';
import { PictureMatchScene } from '../PictureMatchScene';
import { FirstSoundScene } from '../FirstSoundScene';
import { LetterMatchScene, LetterBlocksScene } from '../LetterTilesScene';
import { WhatsMissingScene } from '../WhatsMissingScene';
import { PlaceItScene, TorchHuntScene, WhereCastleScene } from './WhereGames';
import { TitleCardScene } from './scene-components/TitleCardScene';
import { CinematicScene } from './scene-components/CinematicScene';
import { MeetScene } from './scene-components/MeetScene';
import { VocabSpotScene } from './scene-components/VocabSpotScene';
import { EchoScene } from './scene-components/EchoScene';
import { MemoryScene } from './scene-components/MemoryScene';
import { DragMatchScene } from './scene-components/DragMatchScene';
import { DragStickerScene } from './scene-components/DragStickerScene';
import { ChoiceScene } from './scene-components/ChoiceScene';
import { ListenTapScene } from './scene-components/ListenTapScene';
import { TrueFalseScene } from './scene-components/TrueFalseScene';
import { FrequencyLadderScene } from './scene-components/FrequencyLadderScene';
import { PronounSortScene } from './scene-components/PronounSortScene';
import { RoleplayScene } from './scene-components/RoleplayScene';
import { JoinStageScene } from './scene-components/JoinStageScene';
import { HelloDoorsScene } from './scene-components/HelloDoorsScene';
import { FlipbookScene } from './scene-components/FlipbookScene';
import { SongScene } from './scene-components/SongScene';
import { SoundModelScene } from './scene-components/SoundModelScene';
import { TraceScene } from './scene-components/TraceScene';
import { WordBuildScene } from './scene-components/WordBuildScene';
import { SentenceBuildScene } from './scene-components/SentenceBuildScene';
import { TongueTwisterScene } from './scene-components/TongueTwisterScene';
import { LetterGameScene } from './scene-components/LetterGameScene';
import { JigsawPuzzleScene } from './scene-components/JigsawPuzzleScene';
import { FinaleScene } from './scene-components/FinaleScene';
export { GlassCard } from './scene-components/shared';
export type { ActivitySync };
export { Hearts, MAX_HEARTS, Lep1Keyframes };

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

function TeacherTip({ instruction }: { instruction?: string }) {
  const [open, setOpen] = useState(false);
  if (!instruction) return null;
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
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">Say to student</div>
          <div className="rounded-lg bg-white/10 px-3 py-2 text-white/95">{instruction}</div>
          <div className="mt-3 text-[10px] italic text-white/50">Only visible to you. Tap the icon to hide.</div>
        </div>
      )}
    </>
  );
}

/* ---------- Dispatcher ---------- */

export function SceneRenderer(props: {
  scene: Scene;
  onWin: (gem: boolean) => void;
  onLose: () => void;
  onNext: () => void;
  onRestart: () => void;
  gemsCollected: number;
  heartsRemaining: number;
  activitySync?: ActivitySync;
}) {
  const { scene } = props;
  const instruction = (scene as { teacher?: string }).teacher;
  const content = (() => {
    switch (scene.kind) {
      case 'title-card': return <TitleCardScene scene={scene} onNext={props.onNext} />;
      case 'cinematic': return <CinematicScene scene={scene} onNext={props.onNext} />;
      case 'meet': return <MeetScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'echo': return <EchoScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
      case 'memory': return <MemoryScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'drag-match': return <DragMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'drag-sticker': return <DragStickerScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'vocab-spot': return <VocabSpotScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'choice': return <ChoiceScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'listen-tap': return <ListenTapScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'true-false': return <TrueFalseScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'frequency-ladder': return <FrequencyLadderScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'pronoun-sort': return <PronounSortScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'roleplay': return <RoleplayScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'join-stage': return <JoinStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'hello-doors': return <HelloDoorsScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'flipbook': return <FlipbookScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'song': return <SongScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'sound-model': return <SoundModelScene scene={scene} onNext={props.onNext} sync={props.activitySync} />;
      case 'trace': return <TraceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'tongue-twister': return <TongueTwisterScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'word-build': return <WordBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'sentence-build': return <SentenceBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'letter-game': return <LetterGameScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'jigsaw-puzzle': return <JigsawPuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'spin-wheel': return <SpinWheelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'picture-match': return <PictureMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'first-sound': return <FirstSoundScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'letter-match': return <LetterMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'letter-blocks': return <LetterBlocksScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'whats-missing': return <WhatsMissingScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'place-it': return <PlaceItScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'torch-hunt': return <TorchHuntScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'where-castle': return <WhereCastleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'finale': return <FinaleScene scene={scene} hearts={props.heartsRemaining} gems={props.gemsCollected} onRestart={props.onRestart} />;
      default: return null;
    }
  })();
  return (
    <>
      {content}
      {instruction && <TeacherTip instruction={instruction} />}
    </>
  );
}
