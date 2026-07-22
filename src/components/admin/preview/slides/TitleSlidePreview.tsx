import React from 'react';
import { Target, MessageCircle } from 'lucide-react';

interface TitleSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      objectives?: string[];
      warmup?: { prompt?: string };
      level?: string;
      duration?: number;
    };
  };
  lessonTitle: string;
}

export function TitleSlidePreview({ slide, lessonTitle }: TitleSlidePreviewProps) {
  const objectives = slide.content?.objectives || [];
  const warmup = slide.content?.warmup?.prompt || '';
  const level = slide.content?.level || '';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          {slide.title || lessonTitle}
        </h1>
        {level && (
          <p className="text-lg text-muted-foreground">{level} Level</p>
        )}
      </div>

      {objectives.length > 0 && (
        <div className="bg-primary/5 rounded-xl p-6 max-w-lg w-full">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Learning Objectives</h2>
          </div>
          <ul className="space-y-2 text-left">
            {objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-primary font-bold">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warmup && (
        <div className="bg-amber-500/10 rounded-xl p-6 max-w-lg w-full">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-700">Warmup</h2>
          </div>
          <p className="text-amber-800 italic">{warmup}</p>
        </div>
      )}
    </div>
  );
}
