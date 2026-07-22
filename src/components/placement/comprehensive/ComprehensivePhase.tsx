import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ComprehensiveProgressBar, { type StageKey } from './ComprehensiveProgressBar';
import ComprehensiveChatIntro from './ComprehensiveChatIntro';
import ListeningPhase, { type ListeningResult } from './ListeningPhase';
import ReadingPhase, { type ReadingResult } from './ReadingPhase';
import WritingPhase, { type WritingResult } from './WritingPhase';
import SpeakingPhase, { type SpeakingResult } from './SpeakingPhase';
import type { TestResult } from '../TestPhase';
import type { Hub } from '../questionBanks';

export interface ComprehensiveSubmission {
  listening: ListeningResult[];
  reading: ReadingResult[];
  writing: WritingResult | null;
  speaking: SpeakingResult | null;
}

interface Props {
  onComplete: (results: TestResult[], submission: ComprehensiveSubmission) => void;
  /** Offset for questionIndex so 4-skill results can be appended after prior MCQ results. */
  indexOffset?: number;
  /** Hub context (academy | professional) — drives chat-intro voice and brand colors. */
  hub?: Hub;
}

function toLegacyResults(sub: ComprehensiveSubmission, offset = 0): TestResult[] {
  const results: TestResult[] = [];
  sub.listening.forEach((r, idx) => {
    results.push({
      questionIndex: offset + results.length,
      selectedOption: 0,
      correctOption: r.correct ? 0 : 1,
      isCorrect: r.correct,
      difficulty: 0.5 + idx * 0.1,
      targetLevel: idx === 2 ? 'B2' : 'A2',
    });
  });
  sub.reading.forEach((r, idx) => {
    results.push({
      questionIndex: offset + results.length,
      selectedOption: r.choice,
      correctOption: r.correct ? r.choice : -1,
      isCorrect: r.correct,
      difficulty: 0.5 + idx * 0.1,
      targetLevel: 'B1',
    });
  });
  if (sub.writing) {
    const sentences = (sub.writing.text.match(/[.!?]+/g) || []).length;
    const strong = sub.writing.text.length >= 240 && sentences >= 4;
    results.push({
      questionIndex: offset + results.length,
      selectedOption: 0,
      correctOption: 0,
      isCorrect: strong,
      difficulty: 0.7,
      targetLevel: 'B2',
    });
  }
  if (sub.speaking) {
    const ok = sub.speaking.audioBlob !== null && sub.speaking.durationMs >= 10000;
    results.push({
      questionIndex: offset + results.length,
      selectedOption: 0,
      correctOption: 0,
      isCorrect: ok,
      difficulty: 0.7,
      targetLevel: 'B2',
    });
  }
  return results;
}

const ComprehensivePhase: React.FC<Props> = ({ onComplete, indexOffset = 0, hub }) => {
  const [stage, setStage] = useState<StageKey>('listening');
  const [introDone, setIntroDone] = useState<Record<StageKey, boolean>>({
    listening: false,
    reading: false,
    writing: false,
    speaking: false,
  });
  const [submission, setSubmission] = useState<ComprehensiveSubmission>({
    listening: [],
    reading: [],
    writing: null,
    speaking: null,
  });

  const advance = (next: StageKey) => setStage(next);
  const markIntroDone = (key: StageKey) => setIntroDone((prev) => ({ ...prev, [key]: true }));

  const showIntro = !introDone[stage];

  return (
    <div className="h-full flex flex-col">
      <ComprehensiveProgressBar current={stage} />
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showIntro && (
            <motion.div
              key={`intro-${stage}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="h-full"
            >
              <ComprehensiveChatIntro hub={hub} stage={stage} onStart={() => markIntroDone(stage)} />
            </motion.div>
          )}

          {!showIntro && stage === 'listening' && (
            <motion.div key="L" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full">
              <ListeningPhase
                hub={hub}
                onComplete={(r) => { setSubmission((s) => ({ ...s, listening: r })); advance('reading'); }}
              />
            </motion.div>
          )}
          {!showIntro && stage === 'reading' && (
            <motion.div key="R" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full">
              <ReadingPhase
                hub={hub}
                onComplete={(r) => { setSubmission((s) => ({ ...s, reading: r })); advance('writing'); }}
              />
            </motion.div>
          )}
          {!showIntro && stage === 'writing' && (
            <motion.div key="W" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full">
              <WritingPhase
                hub={hub}
                onComplete={(r) => { setSubmission((s) => ({ ...s, writing: r })); advance('speaking'); }}
              />
            </motion.div>
          )}
          {!showIntro && stage === 'speaking' && (
            <motion.div key="S" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full">
              <SpeakingPhase
                hub={hub}
                onComplete={(r) => {
                  const final: ComprehensiveSubmission = { ...submission, speaking: r };
                  setSubmission(final);
                  onComplete(toLegacyResults(final, indexOffset), final);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComprehensivePhase;
