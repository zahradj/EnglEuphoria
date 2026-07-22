import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onComplete?: () => void;
}

export default function ProBusinessEmail({ slide, onCorrect, onComplete }: Props) {
  const [reply, setReply] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scenario = slide.content?.prompt
    || slide.interaction?.data?.email_scenario
    || 'A client has requested an update on the project timeline. Compose a professional response.';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [reply]);

  const handleSubmit = () => {
    if (reply.trim().length < 20) return;
    setSubmitted(true);

    // Structured feedback based on content analysis
    const wordCount = reply.trim().split(/\s+/).length;
    const hasGreeting = /dear|hi|hello/i.test(reply);
    const hasClosing = /regards|sincerely|best|thank/i.test(reply);
    const hasModal = /would|could|should|might|may/i.test(reply);

    const points: string[] = [];
    if (hasGreeting) points.push('✓ Professional greeting detected');
    else points.push('△ Consider adding a formal greeting (e.g., "Dear...")');

    if (hasClosing) points.push('✓ Appropriate closing included');
    else points.push('△ Add a professional sign-off (e.g., "Best regards")');

    if (hasModal) points.push('✓ Effective use of modal verbs for tone');
    else points.push('△ Use modal verbs (would, could, should) for a diplomatic tone');

    if (wordCount >= 30) points.push('✓ Sufficient detail provided');
    else points.push('△ Consider elaborating — aim for 30+ words');

    setFeedback(points.join('\n'));
    onCorrect();
    onComplete?.();
  };

  return (
    <div className="w-full h-full flex flex-col p-8 rounded-xl" style={{ background: '#f8fafc', color: '#1e293b' }}>
      <h2 className="text-xl font-semibold mb-1" style={{ letterSpacing: '-0.02em' }}>
        📧 Business Email Response
      </h2>
      <p className="text-sm mb-5" style={{ color: '#64748b' }}>
        Read the scenario and compose a professional reply.
      </p>

      {/* Email scenario */}
      <div className="mb-5 p-5 rounded-lg" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Incoming Email
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#334155' }}>
          {scenario}
        </p>
      </div>

      {/* Reply area */}
      {!submitted ? (
        <>
          <div className="flex-1 mb-4">
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Dear...\n\nThank you for your email...\n\nBest regards,"
              className="w-full min-h-[140px] p-4 rounded-lg text-sm leading-relaxed resize-none focus:outline-none focus:ring-2"
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={reply.trim().length < 20}
            className="self-end px-6 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: '#059669', color: '#fff' }}
          >
            Submit Response →
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-5 rounded-lg"
          style={{ background: '#ecfdf5', border: '1px solid #059669' }}
        >
          <p className="text-xs font-medium mb-3" style={{ color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Assessment
          </p>
          <pre className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#1e293b', fontFamily: "'Inter', sans-serif" }}>
            {feedback}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
