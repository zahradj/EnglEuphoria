import React from 'react';
import { BookMarked, Award, Home } from 'lucide-react';

interface SummarySlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      keyVocabulary?: string[];
      grammarReminder?: string;
      homework?: string;
      nextLesson?: string;
      achievements?: string[];
    };
  };
  stats?: {
    correctCount: number;
    totalAnswered: number;
    scorePercentage: number;
  };
}

export function SummarySlidePreview({ slide, stats }: SummarySlidePreviewProps) {
  const { keyVocabulary, grammarReminder, homework, nextLesson, achievements } = slide.content || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Lesson Summary'}
        </h2>
      </div>

      {stats && stats.totalAnswered > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-foreground">Your Score</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary">
              {Math.round(stats.scorePercentage)}%
            </div>
            <div className="text-muted-foreground">
              {stats.correctCount} of {stats.totalAnswered} correct
            </div>
          </div>
        </div>
      )}

      {keyVocabulary && keyVocabulary.length > 0 && (
        <div className="bg-primary/5 rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Key Vocabulary</h3>
          <div className="flex flex-wrap gap-2">
            {keyVocabulary.map((word, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {grammarReminder && (
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20">
          <h3 className="font-semibold text-amber-700 mb-2">Grammar Reminder</h3>
          <p className="text-foreground">{grammarReminder}</p>
        </div>
      )}

      {homework && (
        <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-700">Homework</h3>
          </div>
          <p className="text-foreground">{homework}</p>
        </div>
      )}

      {nextLesson && (
        <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/20">
          <h3 className="font-semibold text-green-700 mb-2">Coming Up Next</h3>
          <p className="text-foreground">{nextLesson}</p>
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-5 border border-yellow-500/20">
          <h3 className="font-semibold text-yellow-700 mb-3">Achievements Unlocked!</h3>
          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg"
              >
                <span className="text-xl">🏆</span>
                <span className="font-medium text-yellow-800">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
