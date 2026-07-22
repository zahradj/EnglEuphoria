import React, { useState } from 'react';
import { Headphones, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorialAudioListeningProps {
  slide: any;
  onCorrect?: () => void;
}

export default function EditorialAudioListening({ slide, onCorrect }: EditorialAudioListeningProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const audioScript = payload.audio_script || payload.script || '';
  const title = slide?.title || 'Listening Activity';
  const description = payload.description || slide?.description || '';
  const audioUrl = payload.audio_url || null; // Will be populated when ElevenLabs is wired

  const [showScript, setShowScript] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <Headphones className="w-8 h-8 text-violet-500 mt-1 flex-shrink-0" />
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-slate-500 text-base">{description}</p>
          )}
        </div>
      </div>

      {/* Audio Player Area */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-8 border border-violet-200 flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-violet-100 border-2 border-violet-300 flex items-center justify-center">
          <Volume2 className="w-10 h-10 text-violet-500" />
        </div>

        {audioUrl ? (
          <audio controls className="w-full max-w-md" src={audioUrl}>
            Your browser does not support audio.
          </audio>
        ) : (
          <div className="text-center">
            <p className="text-violet-600 font-semibold text-lg">🎧 Audio will be generated here</p>
            <p className="text-violet-400 text-sm mt-1">ElevenLabs TTS integration coming soon</p>
          </div>
        )}

        {/* Listen instruction */}
        <p className="text-sm text-slate-500 italic">Listen carefully, then answer the questions on the next slide.</p>
      </div>

      {/* Script (hidden by default — teacher toggle) */}
      {audioScript && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowScript(!showScript)}
            className="text-slate-400 hover:text-slate-600 text-xs gap-1"
          >
            {showScript ? 'Hide Script (Teacher Only)' : 'Show Script (Teacher Only)'}
          </Button>
          {showScript && (
            <div className="mt-2 bg-slate-50 rounded-lg p-5 border border-slate-200">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{audioScript}</p>
            </div>
          )}
        </div>
      )}

      {!audioScript && !audioUrl && (
        <p className="text-sm text-amber-600 italic text-center">Audio script data not available for this slide.</p>
      )}
    </div>
  );
}
