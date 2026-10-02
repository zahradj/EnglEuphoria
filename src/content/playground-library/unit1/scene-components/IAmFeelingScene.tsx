import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { type ActivitySync } from '../../sceneActivitySync';
import { ProduceSentenceScene } from './ProduceSentenceScene';

export function IAmFeelingScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'i-am-feeling' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const rounds = useMemo(() => scene.rounds.map((r, i) => ({ key: `${i}`, who: undefined, emotion: r.emotion, sentence: `I am ${r.label.toLowerCase()}!` })), [scene.rounds]);
  return <ProduceSentenceScene teacher={scene.teacher} icon="🌟" rounds={rounds} announce={{ who: scene.asker, text: 'How are you?' }} onNext={onNext} onWin={onWin} sync={sync} />;
}
