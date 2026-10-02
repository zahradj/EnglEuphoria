import type { Scene } from '../scenes';
import { type ActivitySync } from '../../sceneActivitySync';
import { ModeledFeelingRounds } from './shared';

export function HeSheModelScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'he-she-model' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  return <ModeledFeelingRounds teacher={scene.teacher} rounds={scene.rounds} badge={(r) => r.pronoun} onNext={onNext} onWin={onWin} sync={sync} />;
}
