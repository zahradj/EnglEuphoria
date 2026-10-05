import { ACADEMY_SAMPLE_SCENES, ACADEMY_SAMPLE_TITLE } from '@/content/playground-library/welcome-town/academySample';
import PlayWelcomeTownLesson from './PlayWelcomeTownLesson';

/** Comparison sample: the Academy A1 U1 L1 lesson on the Playground scene player. Not part of the curriculum. */
export default function PlayAcademySample() {
  return (
    <PlayWelcomeTownLesson
      scenes={ACADEMY_SAMPLE_SCENES}
      sessionKey="academy-sample-scene-idx"
      pageTitle={`${ACADEMY_SAMPLE_TITLE} — sample on the Playground player — EnglEuphoria`}
      pageDescription="Sample: the Academy lesson 'My Name Is…' rebuilt on the Playground scene player for comparison."
    />
  );
}
