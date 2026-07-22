import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ChatBubble from '../ChatBubble';
import { accentFor } from '../hubAccent';
import type { Hub } from '../questionBanks';
import type { StageKey } from './ComprehensiveProgressBar';

interface Props {
  hub?: Hub;
  stage: StageKey;
  onStart: () => void;
}

const STAGE_COPY: Record<StageKey, { line: string; cta: string }> = {
  listening: {
    line: "Nice work so far. Let's try a quick listening task — press play, then pick the picture that matches what you hear.",
    cta: "I'm ready to listen",
  },
  reading: {
    line: "Great. Now let's read a short passage together and I'll ask you a few questions about it.",
    cta: "Show me the passage",
  },
  writing: {
    line: "Let's see how you write. I'll give you a small prompt — just a few sentences in your own words.",
    cta: "I'll start writing",
  },
  speaking: {
    line: "Last one — speaking. Don't worry about being perfect. Just talk to me for a few seconds.",
    cta: "I'm ready to speak",
  },
};

const ComprehensiveChatIntro: React.FC<Props> = ({ hub, stage, onStart }) => {
  const accent = accentFor(hub);
  const [typingDone, setTypingDone] = useState(false);
  const copy = STAGE_COPY[stage];

  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <div className="flex-1 flex flex-col justify-end gap-4 overflow-y-auto">
        <ChatBubble
          role="guide"
          message={copy.line}
          animate
          hub={hub}
          onTypingComplete={() => setTypingDone(true)}
        />
      </div>

      {typingDone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="pt-4"
        >
          <Button
            onClick={onStart}
            className={`w-full text-white bg-gradient-to-r ${accent.cta} shadow-lg ${accent.ctaShadow} border-0`}
          >
            {copy.cta}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ComprehensiveChatIntro;
