// Live preview of the shared alphabet/phonics games (first-sound, letter-match,
// letter-blocks). Route: /games-preview — no auth, no lesson needed.
import { useState } from 'react';
import { GamesShelf } from '@/components/student/kids/GamesShelf';
import { FirstSoundScene, type FirstSoundSceneData } from '@/content/playground-library/FirstSoundScene';
import { LetterMatchScene, LetterBlocksScene, type LetterMatchSceneData, type LetterBlocksSceneData } from '@/content/playground-library/LetterTilesScene';

const I = '/lep1/items';
const firstSound: FirstSoundSceneData = {
  id: 'prev-first-sound', kind: 'first-sound', teacher: 'Hear the word, pick its first letter.',
  rounds: [
    { word: 'moon', letter: 'M', choices: ['M', 'H', 'S'], img: `${I}/item-moon.png` },
    { word: 'hat', letter: 'H', choices: ['H', 'M', 'T'], img: `${I}/item-hat.png` },
    { word: 'cat', letter: 'C', choices: ['C', 'S', 'M'], img: `${I}/item-cat.png` },
  ],
};
const letterMatch: LetterMatchSceneData = { id: 'prev-letter-match', kind: 'letter-match', teacher: 'Match big and small.', letters: ['A', 'B', 'M', 'S', 'T'] };
const blocksLetters: LetterBlocksSceneData = {
  id: 'prev-blocks-letters', kind: 'letter-blocks', mode: 'letters', teacher: 'ABC order.',
  rounds: [{ blocks: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') }],
};
const blocksSounds: LetterBlocksSceneData = {
  id: 'prev-blocks-sounds', kind: 'letter-blocks', mode: 'sounds', teacher: 'Letter sounds in ABC order.',
  rounds: [{ blocks: 'abcdefghijklmnopqrstuvwxyz'.split('') }],
};

const TABS = ['First Sound', 'Big & Small', 'ABC Blocks', 'Sound Blocks', 'Student shelf'] as const;

export default function GamesPreview() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('First Sound');
  const [nonce, setNonce] = useState(0);
  const noop = () => setNonce((n) => n + 1); // "Next" restarts the game
  return (
    <div className="min-h-screen bg-slate-900 p-4 text-white">
      <div className="mx-auto mb-3 flex max-w-5xl flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setNonce((n) => n + 1); }} className={`rounded-full px-4 py-2 font-bold ${tab === t ? 'bg-orange-500' : 'bg-slate-700'}`}>{t}</button>
        ))}
        <button onClick={noop} className="ml-auto rounded-full bg-slate-700 px-4 py-2 font-bold">↻ Restart</button>
      </div>
      <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl" key={`${tab}-${nonce}`}>
        {tab === 'First Sound' && <FirstSoundScene scene={firstSound} onNext={noop} onWin={() => {}} />}
        {tab === 'Big & Small' && <LetterMatchScene scene={letterMatch} onNext={noop} onWin={() => {}} />}
        {tab === 'ABC Blocks' && <LetterBlocksScene scene={blocksLetters} onNext={noop} onWin={() => {}} />}
        {tab === 'Student shelf' && <div className="absolute inset-0 overflow-auto bg-[#FFF8E7] p-4"><GamesShelf /></div>}
        {tab === 'Sound Blocks' && <LetterBlocksScene scene={blocksSounds} onNext={noop} onWin={() => {}} />}
      </div>
    </div>
  );
}
