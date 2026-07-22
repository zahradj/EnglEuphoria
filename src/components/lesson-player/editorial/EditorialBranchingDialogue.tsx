import React, { useState } from 'react';
import { MessageCircle, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DialogueOption {
  text: string;
  consequence_feedback: string;
}

interface EditorialBranchingDialogueProps {
  slide: any;
  onCorrect?: () => void;
}

export default function EditorialBranchingDialogue({ slide, onCorrect }: EditorialBranchingDialogueProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const scenarioContext = payload.scenario_context || slide?.description || '';
  const aiStartingMessage = payload.ai_starting_message || '';
  const options: DialogueOption[] = Array.isArray(payload.options) ? payload.options : [];
  const title = slide?.title || 'Conversation Simulator';

  const [selectedOption, setSelectedOption] = useState<DialogueOption | null>(null);

  if (!aiStartingMessage || options.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">{slide.title}</h2>
        <p className="text-slate-600">{slide.description}</p>
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  const handleSelect = (option: DialogueOption) => {
    if (selectedOption) return;
    setSelectedOption(option);
    onCorrect?.();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <MessageCircle className="w-8 h-8 text-purple-500 mt-1 flex-shrink-0" />
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
            {title}
          </h2>
          {scenarioContext && (
            <p className="mt-1 text-slate-500 text-sm italic">{scenarioContext}</p>
          )}
        </div>
      </div>

      {/* Chat interface */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4 min-h-[200px]">
        {/* AI starting message */}
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 border border-slate-200 shadow-sm">
            <p className="text-slate-700 text-base leading-relaxed">{aiStartingMessage}</p>
          </div>
        </div>

        {/* Student response (after selection) */}
        {selectedOption && (
          <div className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <div className="bg-sky-500 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
              <p className="text-base leading-relaxed">{selectedOption.text}</p>
            </div>
          </div>
        )}

        {/* AI consequence reaction */}
        {selectedOption && (
          <div className="flex items-start gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-purple-50 rounded-2xl rounded-tl-sm px-5 py-3 border border-purple-200">
              <p className="text-purple-800 text-base leading-relaxed">{selectedOption.consequence_feedback}</p>
            </div>
          </div>
        )}
      </div>

      {/* Response options */}
      {!selectedOption && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Choose your response</p>
          {options.map((opt, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={() => handleSelect(opt)}
              className="w-full text-left justify-start px-5 py-4 h-auto text-base font-medium border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all rounded-xl whitespace-normal"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mr-3">
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
