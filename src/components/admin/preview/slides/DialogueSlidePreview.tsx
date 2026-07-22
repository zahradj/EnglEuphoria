import React from 'react';
import { MessageSquare, User } from 'lucide-react';

interface DialogueLine {
  speaker: string;
  text: string;
  translation?: string;
}

interface DialogueSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      context?: string;
      lines?: DialogueLine[];
      comprehensionQuestions?: string[];
    };
  };
}

export function DialogueSlidePreview({ slide }: DialogueSlidePreviewProps) {
  const { context, lines, comprehensionQuestions } = slide.content || {};

  const getSpeakerColor = (speaker: string, idx: number) => {
    const colors = [
      'bg-blue-500/10 border-blue-500/30 text-blue-700',
      'bg-purple-500/10 border-purple-500/30 text-purple-700',
      'bg-green-500/10 border-green-500/30 text-green-700',
      'bg-amber-500/10 border-amber-500/30 text-amber-700'
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Dialogue Practice'}
        </h2>
      </div>

      {context && (
        <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground italic">
          <strong>Context:</strong> {context}
        </div>
      )}

      <div className="space-y-4">
        {lines?.map((line, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div 
              key={idx}
              className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] ${isEven ? '' : 'text-right'}`}>
                <div className={`flex items-center gap-2 mb-1 ${isEven ? '' : 'flex-row-reverse'}`}>
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {line.speaker}
                  </span>
                </div>
                <div className={`rounded-xl p-4 border ${getSpeakerColor(line.speaker, idx)}`}>
                  <p className="text-foreground">{line.text}</p>
                  {line.translation && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      ({line.translation})
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {comprehensionQuestions && comprehensionQuestions.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-5 mt-6">
          <h3 className="font-semibold text-amber-700 mb-3">Comprehension Questions</h3>
          <ol className="space-y-2 list-decimal list-inside">
            {comprehensionQuestions.map((question, idx) => (
              <li key={idx} className="text-foreground">{question}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
