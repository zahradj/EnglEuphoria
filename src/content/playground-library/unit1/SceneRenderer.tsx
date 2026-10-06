import { useState } from 'react';
import type { Scene } from './scenes';
import { type ActivitySync } from '../sceneActivitySync';
import { SpinWheelScene } from '../SpinWheelScene';
import { PictureMatchScene } from '../PictureMatchScene';
import { FirstSoundScene } from '../FirstSoundScene';
import { LetterMatchScene, LetterBlocksScene } from '../LetterTilesScene';
import { WhatsMissingScene } from '../WhatsMissingScene';
import { SortBasketScene } from '../SortBasketScene';
import { GrammarGapScene } from '../GrammarGapScene';
import { TitleCardScene } from './scene-components/TitleCardScene';
import { CinematicScene } from './scene-components/CinematicScene';
import { MeetScene } from './scene-components/MeetScene';
import { SoundModelScene } from './scene-components/SoundModelScene';
import { EchoScene } from './scene-components/EchoScene';
import { BasketScene } from './scene-components/BasketScene';
import { TraceScene } from './scene-components/TraceScene';
import { SoundSortScene } from './scene-components/SoundSortScene';
import { WordBuildScene } from './scene-components/WordBuildScene';
import { VideoStoryScene } from './scene-components/VideoStoryScene';
import { VideoCheckScene } from './scene-components/VideoCheckScene';
import { SentenceBuildScene } from './scene-components/SentenceBuildScene';
import { WhoSaidItScene } from './scene-components/WhoSaidItScene';
import { GatherScene } from './scene-components/GatherScene';
import { MemoryScene } from './scene-components/MemoryScene';
import { DashScene } from './scene-components/DashScene';
import { CatchSortScene } from './scene-components/CatchSortScene';
import { FeelingsScene } from './scene-components/FeelingsScene';
import { PuzzleScene } from './scene-components/PuzzleScene';
import { JigsawPuzzleScene } from './scene-components/JigsawPuzzleScene';
import { RoleplayScene } from './scene-components/RoleplayScene';
import { JoinStageScene } from './scene-components/JoinStageScene';
import { HelloDoorsScene } from './scene-components/HelloDoorsScene';
import { ColorFriendsScene } from './scene-components/ColorFriendsScene';
import { AlphabetBlocksScene } from './scene-components/AlphabetBlocksScene';
import { AlphabetOrderScene } from './scene-components/AlphabetOrderScene';
import { TrophyChestScene } from './scene-components/TrophyChestScene';
import { ColorModelScene } from './scene-components/ColorModelScene';
import { ColorSortScene } from './scene-components/ColorSortScene';
import { ColorQuizScene } from './scene-components/ColorQuizScene';
import { WordPictureMatchScene } from './scene-components/WordPictureMatchScene';
import { ListenRepeatCardsScene } from './scene-components/ListenRepeatCardsScene';
import { ColorSpotScene } from './scene-components/ColorSpotScene';
import { ShapeModelScene } from './scene-components/ShapeModelScene';
import { ToyModelScene } from './scene-components/ToyModelScene';
import { PluralSortScene } from './scene-components/PluralSortScene';
import { TrainRecallScene } from './scene-components/TrainRecallScene';
import { ShapeSortScene } from './scene-components/ShapeSortScene';
import { ColorSpyScene } from './scene-components/ColorSpyScene';
import { ColorSimonScene } from './scene-components/ColorSimonScene';
import { ShapeBuilderScene } from './scene-components/ShapeBuilderScene';
import { SecretCardScene } from './scene-components/SecretCardScene';
import { ListenColourScene } from './scene-components/ListenColourScene';
import { ShapeFishingScene } from './scene-components/ShapeFishingScene';
import { PatternTrainScene } from './scene-components/PatternTrainScene';
import { TickCrossScene } from './scene-components/TickCrossScene';
import { StoryOrderScene } from './scene-components/StoryOrderScene';
import { StoryVideoScene } from './scene-components/StoryVideoScene';
import { OddOneOutScene } from './scene-components/OddOneOutScene';
import { ShapeTorchScene } from './scene-components/ShapeTorchScene';
import { MysteryBagScene } from './scene-components/MysteryBagScene';
import { TprActionsScene } from './scene-components/TprActionsScene';
import { RapidRecallScene } from './scene-components/RapidRecallScene';
import { StickerRewardScene } from './scene-components/StickerRewardScene';
import { HomeMissionScene } from './scene-components/HomeMissionScene';
import { LiftFlapScene } from './scene-components/LiftFlapScene';
import { DrawPathScene } from './scene-components/DrawPathScene';
import { TileRevealScene } from './scene-components/TileRevealScene';
import { TidyUpScene } from './scene-components/TidyUpScene';
import { ColorMonstersScene } from './scene-components/ColorMonstersScene';
import { PeekPopScene } from './scene-components/PeekPopScene';
import { ClawMachineScene } from './scene-components/ClawMachineScene';
import { SimonTouchScene } from './scene-components/SimonTouchScene';
import { BodyStackScene } from './scene-components/BodyStackScene';
import { FaceBuilderScene } from './scene-components/FaceBuilderScene';
import { SoundPickScene } from './scene-components/SoundPickScene';
import { SandPrintsScene } from './scene-components/SandPrintsScene';
import { ShapeMagicScene } from './scene-components/ShapeMagicScene';
import { ShapePeekScene } from './scene-components/ShapePeekScene';
import { ShapeSorterScene } from './scene-components/ShapeSorterScene';
import { ShapeBubblesScene } from './scene-components/ShapeBubblesScene';
import { RingTossScene } from './scene-components/RingTossScene';
import { ShadowMatchScene } from './scene-components/ShadowMatchScene';
import { SteppingStonesScene } from './scene-components/SteppingStonesScene';
import { ColorMixScene } from './scene-components/ColorMixScene';
import { FlipbookScene } from './scene-components/FlipbookScene';
import { SongScene } from './scene-components/SongScene';
import { FinaleScene } from './scene-components/FinaleScene';
import { NameGateScene } from './scene-components/NameGateScene';
import { MeetGroupScene } from './scene-components/MeetGroupScene';
import { VoiceStageScene } from './scene-components/VoiceStageScene';
import { SoundPopScene } from './scene-components/SoundPopScene';
import { BrickCrushScene } from './scene-components/BrickCrushScene';
import { FriendPopScene } from './scene-components/FriendPopScene';
import { FeelingsTapScene } from './scene-components/FeelingsTapScene';
import { FeelingsWheelScene } from './scene-components/FeelingsWheelScene';
import { XIsFeelingScene } from './scene-components/XIsFeelingScene';
import { HeSheModelScene } from './scene-components/HeSheModelScene';
import { FeelingsDiceScene } from './scene-components/FeelingsDiceScene';
import { HeSheSayScene } from './scene-components/HeSheSayScene';
import { IAmFeelingScene } from './scene-components/IAmFeelingScene';
import { FeedMonstersScene } from './scene-components/FeedMonstersScene';
import { HeSheSortScene } from './scene-components/HeSheSortScene';
import { FeelingQuizScene } from './scene-components/FeelingQuizScene';
import { FeelingsBingoScene } from './scene-components/FeelingsBingoScene';
import { NumbersLearnScene } from './scene-components/NumbersLearnScene';
import { NumbersReviewScene } from './scene-components/NumbersReviewScene';
import { CandleCakeScene } from './scene-components/CandleCakeScene';
import { CountBalloonsScene } from './scene-components/CountBalloonsScene';
import { AgeBalloonsScene } from './scene-components/AgeBalloonsScene';
import { AgeSentenceMatchScene } from './scene-components/AgeSentenceMatchScene';
import { MeetGreetScene } from './scene-components/MeetGreetScene';
import { AgeQuizScene } from './scene-components/AgeQuizScene';
export { MAX_HEARTS, Hearts, GlassCard, Lep1Keyframes } from './scene-components/shared';

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
  activitySync?: ActivitySync;
}) {
  const { scene, lessonNumber } = props;
  const teacherTip = lessonNumber === 3 ? L3_TEACHER_TIPS[scene.id] : undefined;
  const instruction = (scene as { teacher?: string }).teacher;
  const tipOverlay = (instruction || teacherTip) ? <TeacherTip key={scene.id} instruction={instruction} tip={teacherTip} /> : null;
  const content = (() => {
  switch (scene.kind) {
    case 'title-card': return <TitleCardScene scene={scene} onNext={props.onNext} />;
    case 'cinematic': return <CinematicScene scene={scene} onNext={props.onNext} />;
    case 'meet': return <MeetScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'sound-model': return <SoundModelScene scene={scene} onNext={props.onNext} sync={props.activitySync} />;
    case 'echo': return <EchoScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'basket': return <BasketScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'trace': return <TraceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'sound-sort': return <SoundSortScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'word-build': return <WordBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'video-story': return <VideoStoryScene scene={scene} onNext={props.onNext} />;
    case 'video-check': return <VideoCheckScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'sentence-build': return <SentenceBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'who-said-it': return <WhoSaidItScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'gather': return <GatherScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'memory': return <MemoryScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'dash': return <DashScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'catch-sort': return <CatchSortScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'feelings': return <FeelingsScene scene={scene} onNext={props.onNext} />;
    case 'puzzle': return <PuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'jigsaw-puzzle': return <JigsawPuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'trophy-chest': return <TrophyChestScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'flipbook': return <FlipbookScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'color-model': return <ColorModelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'color-sort': return <ColorSortScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'color-quiz': return <ColorQuizScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'word-picture-match': return <WordPictureMatchScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'listen-repeat-cards': return <ListenRepeatCardsScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'color-spot': return <ColorSpotScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-model': return <ShapeModelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'toy-model': return <ToyModelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'plural-sort': return <PluralSortScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'train-recall': return <TrainRecallScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'shape-sort': return <ShapeSortScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'color-spy': return <ColorSpyScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'color-simon': return <ColorSimonScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'color-mix': return <ColorMixScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-builder': return <ShapeBuilderScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'secret-card': return <SecretCardScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'listen-colour': return <ListenColourScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-fishing': return <ShapeFishingScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'pattern-train': return <PatternTrainScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'tick-cross': return <TickCrossScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'story-order': return <StoryOrderScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'story-video': return <StoryVideoScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'odd-one-out': return <OddOneOutScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'tpr-actions': return <TprActionsScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'rapid-recall': return <RapidRecallScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'sticker-reward': return <StickerRewardScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'home-mission': return <HomeMissionScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'lift-flap': return <LiftFlapScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'draw-path': return <DrawPathScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'simon-touch': return <SimonTouchScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'body-stack': return <BodyStackScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'face-builder': return <FaceBuilderScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'claw-machine': return <ClawMachineScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'sand-prints': return <SandPrintsScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-magic': return <ShapeMagicScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-peek': return <ShapePeekScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-sorter': return <ShapeSorterScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-bubbles': return <ShapeBubblesScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'sound-pick': return <SoundPickScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
    case 'ring-toss': return <RingTossScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'color-monsters': return <ColorMonstersScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'tidy-up': return <TidyUpScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'peek-pop': return <PeekPopScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'tile-reveal': return <TileRevealScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'shadow-match': return <ShadowMatchScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'stepping-stones': return <SteppingStonesScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'mystery-bag': return <MysteryBagScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'shape-torch': return <ShapeTorchScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} sync={props.activitySync} />;
    case 'roleplay': return <RoleplayScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'join-stage': return <JoinStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'hello-doors': return <HelloDoorsScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'color-friends': return <ColorFriendsScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'alphabet-blocks': return <AlphabetBlocksScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'alphabet-order': return <AlphabetOrderScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'song': return <SongScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'finale': return <FinaleScene scene={scene} hearts={props.heartsRemaining} gems={props.gemsCollected} onRestart={props.onRestart} />;
    case 'name-gate': return <NameGateScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'meet-group': return <MeetGroupScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'voice-stage': return <VoiceStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'sound-pop': return <SoundPopScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'brick-crush': return <BrickCrushScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'friend-pop': return <FriendPopScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'feelings-tap': return <FeelingsTapScene scene={scene} onNext={props.onNext} sync={props.activitySync} />;
    case 'feelings-wheel': return <FeelingsWheelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'x-is-feeling': return <XIsFeelingScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'feelings-dice': return <FeelingsDiceScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'feed-monsters': return <FeedMonstersScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'he-she-model': return <HeSheModelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'he-she-sort': return <HeSheSortScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'he-she-say': return <HeSheSayScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'feeling-quiz': return <FeelingQuizScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'i-am-feeling': return <IAmFeelingScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'feelings-bingo': return <FeelingsBingoScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'numbers-learn': return <NumbersLearnScene scene={scene} onNext={props.onNext} sync={props.activitySync} />;
    case 'numbers-review': return <NumbersReviewScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'candle-cake': return <CandleCakeScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'count-balloons': return <CountBalloonsScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'age-balloons': return <AgeBalloonsScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'age-sentence-match': return <AgeSentenceMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'meet-greet': return <MeetGreetScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'age-quiz': return <AgeQuizScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'spin-wheel': return <SpinWheelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'picture-match': return <PictureMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
    case 'first-sound': return <FirstSoundScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'letter-match': return <LetterMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'letter-blocks': return <LetterBlocksScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'whats-missing': return <WhatsMissingScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'sort-basket': return <SortBasketScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
    case 'grammar-gap': return <GrammarGapScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
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
