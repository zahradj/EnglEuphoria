import { useState } from 'react';
import { Backpack, Clock, Sparkles, Mic, Headphones, BookText, PenLine, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import type { HomeworkTask } from '@/coherence/types';

import { HUB_THEME, type HomeworkPreviewHub } from './interactive-homework/types';
import { PeerMessageChat } from './interactive-homework/PeerMessageChat';
import { EmailDraft } from './interactive-homework/EmailDraft';
import { ParentScript } from './interactive-homework/ParentScript';
import { VocabRecall } from './interactive-homework/VocabRecall';
import { SentenceBuild } from './interactive-homework/SentenceBuild';
import { MiniRecording } from './interactive-homework/MiniRecording';
import { ListeningRecap } from './interactive-homework/ListeningRecap';
import { MicroReading } from './interactive-homework/MicroReading';
import { MicroWriting } from './interactive-homework/MicroWriting';

interface HomeworkSlideLivePreviewProps {
  hub: HomeworkPreviewHub;
  task: HomeworkTask;
  taskNumber: number;
}

const MODALITY_ICON: Record<HomeworkTask['modality'], typeof Mic> = {
  speaking: Mic,
  listening: Headphones,
  reading: BookText,
  writing: PenLine,
  mixed: Sparkles,
};

function renderActivity(hub: HomeworkPreviewHub, task: HomeworkTask, onComplete: () => void) {
  const props = { hub, task, onComplete };
  switch (task.type) {
    case 'peer_message':     return <PeerMessageChat {...props} />;
    case 'email_draft':      return <EmailDraft {...props} />;
    case 'parent_script':    return <ParentScript {...props} />;
    case 'vocab_recall':     return <VocabRecall {...props} />;
    case 'sentence_build':   return <SentenceBuild {...props} />;
    case 'mini_recording':   return <MiniRecording {...props} />;
    case 'listening_recap':  return <ListeningRecap {...props} />;
    case 'micro_reading':    return <MicroReading {...props} />;
    case 'micro_writing':    return <MicroWriting {...props} />;
    default:                 return <SentenceBuild {...props} />;
  }
}

export function HomeworkSlideLivePreview({ hub, task, taskNumber }: HomeworkSlideLivePreviewProps) {
  const style = HUB_THEME[hub];
  const Icon = MODALITY_ICON[task.modality] || Sparkles;
  const [completed, setCompleted] = useState(false);
  const [key, setKey] = useState(0);

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch { /* noop */ }
  };

  const reset = () => { setCompleted(false); setKey((k) => k + 1); };

  return (
    <div className={cn('mx-auto w-full max-w-[920px] rounded-2xl border-2 p-5 flex flex-col gap-4', style.frame)}>
      {/* Header chip */}
      <div className="flex items-center justify-between gap-3">
        <div className={cn('inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide', style.text)}>
          <Backpack className="w-4 h-4" /> Homework Slide {taskNumber}
        </div>
        <div className="inline-flex items-center gap-3">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize', style.badge)}>
            <Icon className="w-3.5 h-3.5" /> {task.modality}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
            <Clock className="w-3.5 h-3.5" /> {task.estimated_minutes} min
          </span>
          {completed && (
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600">
              <Trophy className="w-3.5 h-3.5" /> +{Math.round(task.educational_value * 50)} XP
            </span>
          )}
        </div>
      </div>

      {/* Interactive activity */}
      <div key={key} className="flex items-center justify-center">
        {renderActivity(hub, task, handleComplete)}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="font-bold uppercase tracking-wide">
          {task.type.replace(/_/g, ' ')}
        </span>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/60 font-semibold"
        >
          <RotateCcw className="w-3 h-3" /> Reset activity
        </button>
      </div>
    </div>
  );
}
