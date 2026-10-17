// Scene registry (concept from the Playground's SceneRenderer): kind -> module { view, spoken, validate }. Add a kind here when a lesson needs it.
import type { SceneBase, SceneModule } from '../types';
import { lobbyScene } from './lobby/Lobby';
import { comicScene } from './comic/Comic';
import { ruleScene } from './rule/Rule';
import { modelScene } from './model/Model';
import { sortScene } from './sort/Sort';
import { choiceScene } from './choice/Choice';
import { wrapScene } from './wrap/Wrap';
import { buildScene } from './build/Build';
import { speakScene } from './speak/Speak';
import { matchScene } from './match/Match';
import { forgeScene } from './forge/Forge';
import { bossScene } from './boss/Boss';
import { rapportScene } from './rapport/Rapport';
import { writeScene } from './write/Write';
import { teachScene } from './teach/Teach';
import { memoryScene } from './memory/Memory';
import { huntScene } from './hunt/Hunt';
import { inspectScene } from './inspect/Inspect';
import { interviewScene } from './interview/Interview';
import { objectionScene } from './objection/Objection';
import { cipherScene } from './cipher/Cipher';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Record<string, SceneModule<any>> = {
  lobby: lobbyScene,
  comic: comicScene,
  rule: ruleScene,
  model: modelScene,
  sort: sortScene,
  choice: choiceScene,
  wrap: wrapScene,
  build: buildScene,
  speak: speakScene,
  match: matchScene,
  forge: forgeScene,
  boss: bossScene,
  rapport: rapportScene,
  write: writeScene,
  teach: teachScene,
  memory: memoryScene,
  hunt: huntScene,
  inspect: inspectScene,
  interview: interviewScene,
  objection: objectionScene,
  cipher: cipherScene,
};

export const sceneKinds = () => Object.keys(SCENES);
export const moduleFor = (kind: string): SceneModule<SceneBase> | undefined => SCENES[kind];
