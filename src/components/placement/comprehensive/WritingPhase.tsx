import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VocabularyImage } from '@/components/ui/VocabularyImage';
import { WRITING_PROMPT } from './content';
import { accentFor } from '../hubAccent';
import type { Hub } from '../questionBanks';

export interface WritingResult {
  prompt: string;
  text: string;
}

interface Props {
  hub?: Hub;
  onComplete: (result: WritingResult) => void;
}

const WritingPhase: React.FC<Props> = ({ hub, onComplete }) => {
  const accent = accentFor(hub);
  const [text, setText] = useState('');
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const ok = text.length >= WRITING_PROMPT.minChars && sentences >= 3;

  return (
    <div className="h-full flex flex-col p-5 sm:p-6 text-white overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold mb-1">Writing</h2>
      <p className="text-xs text-white/70 mb-3">{WRITING_PROMPT.prompt}</p>

      <div className="flex-1 flex flex-col gap-3 overflow-auto">
        <VocabularyImage
          prompt="A small group of friends sitting at a sunlit café table, talking and laughing, modern editorial illustration"
          alt="Writing prompt"
          style="flat2d"
          aspectRatio="16:9"
          className="w-full h-40 sm:h-48 object-cover rounded-2xl bg-white/5 border border-white/15"
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your description here…"
          className={`flex-1 min-h-[140px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40 ${accent.inputBorder}`}
        />
        <div className="text-[11px] text-white/60 flex justify-between">
          <span>{text.length} / {WRITING_PROMPT.minChars} characters</span>
          <span>{sentences} / 3 sentences</span>
        </div>
      </div>

      <div className="pt-3">
        <Button
          onClick={() => onComplete({ prompt: WRITING_PROMPT.prompt, text })}
          disabled={!ok}
          className={`w-full text-white border-0 bg-gradient-to-r ${accent.cta} shadow-lg ${accent.ctaShadow}`}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default WritingPhase;
