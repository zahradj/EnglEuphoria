import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { type ActivitySync } from '../../sceneActivitySync';
import { ProduceSentenceScene } from './ProduceSentenceScene';

export function HeSheSayScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'he-she-say' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const rounds = useMemo(() => scene.rounds.map((r, i) => ({ key: `${i}`, who: r.who, emotion: r.emotion, sentence: `${r.pronoun} is ${r.emotion}.` })), [scene.rounds]);
  return <ProduceSentenceScene teacher={scene.teacher} icon="🗣️" rounds={rounds} onNext={onNext} onWin={onWin} sync={sync} />;
}
