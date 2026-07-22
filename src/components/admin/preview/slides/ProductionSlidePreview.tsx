import React from 'react';
import { Sparkles, Target, Users } from 'lucide-react';

interface ProductionSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      scenario?: string;
      task?: string;
      targetOutput?: string;
      peerReviewCriteria?: string[];
      rubric?: { criterion: string; points: number }[];
    };
  };
}

export function ProductionSlidePreview({ slide }: ProductionSlidePreviewProps) {
  const { scenario, task, targetOutput, peerReviewCriteria, rubric } = slide.content || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Free Production'}
        </h2>
      </div>

      {scenario && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
          <h3 className="font-semibold text-purple-700 mb-2">Scenario</h3>
          <p className="text-foreground text-lg">{scenario}</p>
        </div>
      )}

      {task && (
        <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Task</h3>
          </div>
          <p className="text-foreground">{task}</p>
        </div>
      )}

      {targetOutput && (
        <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/20">
          <h3 className="font-semibold text-green-700 mb-2">Target Output Example</h3>
          <p className="text-foreground italic">"{targetOutput}"</p>
        </div>
      )}

      {peerReviewCriteria && peerReviewCriteria.length > 0 && (
        <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-700">Peer Review Criteria</h3>
          </div>
          <ul className="space-y-2">
            {peerReviewCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground">
                <span className="text-blue-600">•</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rubric && rubric.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Assessment Rubric</h3>
          <div className="space-y-2">
            {rubric.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-background rounded-lg p-3 border">
                <span className="text-foreground">{item.criterion}</span>
                <span className="font-semibold text-primary">{item.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
