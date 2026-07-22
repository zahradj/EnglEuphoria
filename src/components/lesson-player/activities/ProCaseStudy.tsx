import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onComplete?: () => void;
}

export default function ProCaseStudy({ slide, onCorrect, onComplete }: Props) {
  const scenario = slide.content?.caseStudy || slide.content?.prompt || slide.title;
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [response]);

  const handleSubmit = () => {
    if (!response.trim() || submitted) return;
    setSubmitted(true);
    // Provide structured feedback without silly animations
    const wordCount = response.trim().split(/\s+/).length;
    const quality = wordCount >= 20 ? 'strong' : wordCount >= 10 ? 'adequate' : 'needs improvement';
    setFeedback(
      `Assessment: Your response demonstrates ${quality} engagement with the scenario. ` +
      `Word count: ${wordCount}. ` +
      (wordCount >= 10
        ? 'Your analysis shows professional-level thinking. Well done.'
        : 'Consider expanding your response with specific examples and actionable steps.')
    );
    onCorrect();
    onComplete?.();
  };

  return (
    <div className="flex flex-col gap-6 p-10 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ background: '#059669' }} />
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: '#1e293b' }}>
          Case Study
        </h2>
      </div>

      <div
        className="p-6 rounded-xl"
        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
      >
        <p className="text-base leading-relaxed" style={{ color: '#334155' }}>
          {scenario}
        </p>
      </div>

      <textarea
        ref={textareaRef}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        disabled={submitted}
        placeholder="Type your professional response here..."
        className="w-full min-h-[120px] p-5 rounded-xl text-base resize-none outline-none transition-all"
        style={{
          background: '#fff',
          color: '#1e293b',
          border: '1px solid #cbd5e1',
        }}
      />

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!response.trim()}
          className="self-end px-8 py-3 rounded-lg font-medium text-sm tracking-wide transition-all disabled:opacity-40"
          style={{
            background: response.trim() ? '#059669' : '#94a3b8',
            color: '#fff',
          }}
        >
          Submit Response
        </button>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl"
          style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: '#065f46' }}>
            Executive Feedback
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#047857' }}>
            {feedback}
          </p>
        </motion.div>
      )}
    </div>
  );
}
