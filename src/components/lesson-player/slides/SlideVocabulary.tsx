import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import PipMascot from '../PipMascot';
import { Volume2, Loader2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { SlideBrandHeader } from './SlideBrandHeader';

const HUB_VOCAB_LABEL: Record<HubType, string> = {
  playground: 'Playground Vocabulary Card',
  academy: 'Academy Vocabulary Card',
  professional: 'Success Hub Vocabulary Card',
};

// Kid-friendly voice IDs from ElevenLabs
const VOICE_IDS = {
  girl: 'pFZP5JQG7iQjIQuC4Bku', // Lily
  boy: 'IKne3meq5aSn9XLyUdCD',  // Charlie
};

interface Props {
  slide: GeneratedSlide;
  hub: HubType;
}

export default function SlideVocabulary({ slide, hub }: Props) {
  const config = HUB_CONFIGS[hub];
  const [flipped, setFlipped] = useState(false);
  const [voiceType, setVoiceType] = useState<'girl' | 'boy'>('girl');
  const { speak, isLoading, isPlaying } = useTextToSpeech();

  const word = slide.content?.word || slide.title;
  const definition = slide.content?.definition || '';
  const sentence = slide.content?.sentence || '';
  const hasImage = slide.imageUrl && slide.imageUrl.length > 10;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word, { voiceId: VOICE_IDS[voiceType], speed: 0.9 });
  };

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full text-center">
      <SlideBrandHeader hub={hub} label={HUB_VOCAB_LABEL[hub]} />

      <h1
        className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight"
        style={{ color: config.colorPalette.primary }}
      >
        {word}
      </h1>

      {/* Voice Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setVoiceType('girl')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${voiceType === 'girl' ? 'bg-pink-400 text-white shadow-md scale-105' : 'bg-pink-100 text-pink-500'}`}
        >
          👧 Girl
        </button>
        <button
          onClick={() => setVoiceType('boy')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${voiceType === 'boy' ? 'bg-blue-400 text-white shadow-md scale-105' : 'bg-blue-100 text-blue-500'}`}
        >
          👦 Boy
        </button>
      </div>

      {/* Vertical Rectangle Flashcard */}
      <div
        className="cursor-pointer"
        style={{ perspective: 1200, width: 320, height: 460 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* ── FRONT: Word + Image ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between rounded-2xl p-5 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              background: hub === 'playground' ? '#fffcf0' : hub === 'academy' ? '#1e1b4b' : '#ffffff',
              border: hub === 'academy' ? '1.5px solid #6366f1' : '1.5px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              color: hub === 'playground' ? '#1a1a2e' : hub === 'academy' ? '#e2e8f0' : '#1e293b',
            }}
          >
            <div className="w-full flex-1 min-h-0 flex items-center justify-center rounded-xl overflow-hidden bg-black/5" style={{ maxHeight: 240 }}>
              {hasImage ? (
                <motion.img
                  src={slide.imageUrl}
                  alt={word}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-6xl opacity-30">📷</div>
              )}
            </div>

            <div className="mt-3 flex flex-col items-center gap-1">
              <span className="text-3xl font-bold leading-tight">{word}</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleSpeak}
                  disabled={isLoading || isPlaying}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Volume2 size={16} className={isPlaying ? 'text-green-500' : ''} />
                  )}
                </button>
                <span className="text-[11px] opacity-40">Tap to flip</span>
              </div>
            </div>

            {hub === 'playground' && !hasImage && <PipMascot size={48} animation="wave" />}
          </div>

          {/* ── BACK: Definition + Example ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl p-5 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: hub === 'playground' ? '#fff8e1' : hub === 'academy' ? '#312e81' : '#f8fafc',
              border: hub === 'academy' ? '1.5px solid #818cf8' : '1.5px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              color: hub === 'playground' ? '#1a1a2e' : hub === 'academy' ? '#e2e8f0' : '#1e293b',
            }}
          >
            {definition && (
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Definition</span>
                <span className="text-lg font-semibold leading-snug">{definition}</span>
              </div>
            )}

            {sentence && (
              <div className="px-3 py-2.5 rounded-xl bg-black/8 w-full text-center">
                <span className="text-[10px] uppercase tracking-widest opacity-40 block mb-1">Example</span>
                <span className="text-sm italic leading-snug">"{sentence}"</span>
              </div>
            )}

            {hasImage && (
              <img src={slide.imageUrl} alt={word} className="w-24 h-24 object-cover rounded-xl opacity-80" loading="lazy" />
            )}

            {hub === 'playground' && !hasImage && <PipMascot size={40} animation="celebrate" />}
            <span className="text-[10px] opacity-40">Tap to flip back</span>
          </div>
        </motion.div>
      </div>

      {slide.keywords?.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {slide.keywords.map((kw) => (
            <span
              key={kw}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: config.colorPalette.highlight, color: config.colorPalette.primary }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
