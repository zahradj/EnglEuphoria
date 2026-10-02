import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { type ActivitySync } from '../../sceneActivitySync';
import { ProduceSentenceScene } from './ProduceSentenceScene';

export function FeelingsDiceScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'feelings-dice' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const rounds = useMemo(() => scene.rounds.map((r, i) => ({ key: `${i}`, who: r.who, emotion: r.emotion, sentence: r.sentence })), [scene.rounds]);
  return <ProduceSentenceScene teacher={scene.teacher} icon="🎲" rounds={rounds} onNext={onNext} onWin={onWin} sync={sync} />;
}
