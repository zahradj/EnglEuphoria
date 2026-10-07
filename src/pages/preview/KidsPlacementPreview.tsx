import { useState } from 'react';
import KidsPlacementPhase from '@/components/placement/kids/KidsPlacementPhase';
import type { TestResult } from '@/components/placement/TestPhase';
import type { KidsSummary } from '@/components/placement/kids/kidsEngine';

/** Public try-out of the Playground placement test for owners and teachers. Saves nothing. */
export default function KidsPlacementPreview() {
  const [run, setRun] = useState(0);
  const [out, setOut] = useState<{ results: TestResult[]; summary: KidsSummary } | null>(null);

  if (out) {
    const s = out.summary;
    return (
      <div className="mx-auto max-w-xl p-6 font-sans">
        <h1 className="text-2xl font-bold">Preview result (nothing was saved)</h1>
        <p className="mt-3 text-4xl font-extrabold">{s.cefr}</p>
        <ul className="mt-4 space-y-1 text-slate-700">
          <li>Listening band: <b>{s.listenBand}</b> (ability {s.theta}, error {s.se})</li>
          <li>Reading stage: <b>{s.literacyStage}</b> (ability {s.literacyTheta}, error {s.literacySe})</li>
          <li>Questions answered: {s.itemsAnswered}</li>
          <li>Strong listener, cannot read yet: {s.strongListener ? 'yes' : 'no'}</li>
          <li>Borderline (teacher confirms in lesson 1): {s.borderline ? 'yes' : 'no'}</li>
          <li>"I do not know" taps: {s.unsureCount} · Very fast taps: {s.fastCount}</li>
        </ul>
        <table className="mt-4 w-full text-sm">
          <thead><tr className="text-left"><th>Item</th><th>Correct</th><th>ms</th></tr></thead>
          <tbody>
            {out.results.map((r, i) => (
              <tr key={i}><td>{r.itemId}</td><td>{r.isCorrect ? "yes" : "no"}</td><td>{r.responseMs}</td></tr>
            ))}
          </tbody>
        </table>
        <button className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" onClick={() => { setOut(null); setRun((n) => n + 1); }}>Try again</button>
      </div>
    );
  }
  return <KidsPlacementPhase key={run} onComplete={(results, summary) => setOut({ results, summary: summary as unknown as KidsSummary })} />;
}
