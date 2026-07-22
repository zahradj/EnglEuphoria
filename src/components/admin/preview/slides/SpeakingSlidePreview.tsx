import React from 'react';
import { Mic, MessageCircle, Users } from 'lucide-react';

interface SpeakingSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      prompt?: string;
      sentenceStarters?: string[];
      partnerInstructions?: string;
      modelResponse?: string;
      tips?: string[];
    };
  };
}

export function SpeakingSlidePreview({ slide }: SpeakingSlidePreviewProps) {
  const { prompt, sentenceStarters, partnerInstructions, modelResponse, tips } = slide.content || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Mic className="h-6 w-6 text-violet-600" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Speaking Practice'}
        </h2>
      </div>

      {prompt && (
        <div className="bg-violet-500/10 rounded-xl p-6 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold text-violet-700">Your Task</h3>
          </div>
          <p className="text-foreground text-lg">{prompt}</p>
        </div>
      )}

      {sentenceStarters && sentenceStarters.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Sentence Starters</h3>
          <div className="grid gap-2">
            {sentenceStarters.map((starter, idx) => (
              <div 
                key={idx}
                className="bg-background rounded-lg p-3 border text-foreground"
              >
                {starter}...
              </div>
            ))}
          </div>
        </div>
      )}

      {partnerInstructions && (
        <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-700">Partner Activity</h3>
          </div>
          <p className="text-foreground">{partnerInstructions}</p>
        </div>
      )}

      {modelResponse && (
        <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/20">
          <h3 className="font-semibold text-green-700 mb-2">Model Response</h3>
          <p className="text-foreground italic">"{modelResponse}"</p>
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-5">
          <h3 className="font-semibold text-amber-700 mb-3">Speaking Tips</h3>
          <ul className="space-y-2">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground">
                <span className="text-amber-600">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
