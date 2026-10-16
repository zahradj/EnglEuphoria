import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/* Owner 2026-10-14: "in some activities the background images are fully charged and there are some items floating to
 * be matched — it's very difficult to see. Fix this." Games whose pieces float over a detailed scene picture draw it
 * with CalmBg (soft blur + veil, unit1/scene-components/gameFx.tsx). Add any new floating-pieces game here.
 * Rule: CLAUDE.md "Aesthetic pass on every activity". */
const NEEDS_CALM_BG = [
  'unit1/scene-components/ListenMatchScene.tsx',
  'PictureMatchScene.tsx',
  'unit1/scene-components/TrainRecallScene.tsx',
  'welcome-town/scene-components/LetterBubblesScene.tsx',
  'unit1/scene-components/WindCatchScene.tsx',
  'unit1/scene-components/ShapeBubblesScene.tsx',
  'unit1/scene-components/PluralSortScene.tsx',
  'unit1/scene-components/SizeLineScene.tsx',
  'unit1/scene-components/DuckFeedScene.tsx',
  'unit1/scene-components/MysteryBagScene.tsx',
  'welcome-town/scene-components/MoodMachineScene.tsx',
  'welcome-town/scene-components/LiveReefScene.tsx',
  'welcome-town/scene-components/ReefDetectiveScene.tsx',
  'welcome-town/scene-components/MonsterBuilderScene.tsx',
  'welcome-town/scene-components/MonsterMixUpScene.tsx',
  'welcome-town/scene-components/FeelingsMeterScene.tsx',
  'welcome-town/scene-components/GuessWhoScene.tsx',
  'welcome-town/scene-components/HotCoconutScene.tsx',
  'welcome-town/scene-components/RisingRiverScene.tsx',
];

describe('floating pieces sit on a calm background', () => {
  it.each(NEEDS_CALM_BG)('%s draws its picture with CalmBg', (file) => {
    const src = readFileSync(join(__dirname, file), 'utf8');
    expect(src, `${file}: render the scene picture with <CalmBg img={scene.bg} />`).toMatch(/<CalmBg\b/);
  });
});
