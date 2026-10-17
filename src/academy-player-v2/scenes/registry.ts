// Scene registry (concept from the Playground's SceneRenderer): kind -> module { view, spoken, validate }. Add a kind here when a lesson needs it.
import type { SceneBase, SceneModule } from '../types';
import { lobbyScene } from './lobby/Lobby';
import { comicScene } from './comic/Comic';
import { ruleScene } from './rule/Rule';
import { modelScene } from './model/Model';
import { sortScene } from './sort/Sort';
import { choiceScene } from './choice/Choice';
import { wrapScene } from './wrap/Wrap';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Record<string, SceneModule<any>> = {
  lobby: lobbyScene,
  comic: comicScene,
  rule: ruleScene,
  model: modelScene,
  sort: sortScene,
  choice: choiceScene,
  wrap: wrapScene,
};

export const sceneKinds = () => Object.keys(SCENES);
export const moduleFor = (kind: string): SceneModule<SceneBase> | undefined => SCENES[kind];
