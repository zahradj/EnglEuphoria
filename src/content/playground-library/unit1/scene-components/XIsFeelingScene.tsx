import type { Scene } from '../scenes';
import { type ActivitySync } from '../../sceneActivitySync';
import { ModeledFeelingRounds } from './shared';

export function XIsFeelingScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'x-is-feeling' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  return <ModeledFeelingRounds teacher={scene.teacher} rounds={scene.rounds} onNext={onNext} onWin={onWin} sync={sync} />;
}
