import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import StarMeter from '../StarMeter';
import HintBubble from '../HintBubble';
import { useStarHintTracker } from '@/hooks/useStarHintTracker';
import { reportSrsForCurrentUser } from '@/lib/srs';
import { ArcadeFrame, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';


interface Props {
  slide: GeneratedSlide;
  hub?: HubType;
  onCorrect: () => void;
  onIncorrect?: () => void;
  /** Called when the slide is solved, carrying the final star count (1-3). */
  onStarsAwarded?: (stars: number) => void;
}

/**
 * Fill in the Gaps — sentence with a Drop Zone + bouncy pill word options.
 * Reads from slide.interactive_data: { sentence_parts, missing_word, distractors }.
 * Tap or drag a pill into the gap. On correct: snap-in animation, ding, then onCorrect()
 * (parent handles confetti + Next Slide unlock).
 */
export default function FillInTheGaps({ slide, hub = 'academy', onCorrect, onIncorrect, onStarsAwarded }: Props) {
  const config = HUB_CONFIGS[hub] || HUB_CONFIGS.academy;
  const primary = (config as any)?.primaryColor || '#6366f1';
  const accent = (config as any)?.accentColor || '#a855f7';

  const data: any = (slide as any).interactive_data || (slide as any).content || {};
  const instruction: string = data.instruction || 'Fill in the gap!';
  const missingWord: string = data.missing_word || data.correctAnswer || data.blankWord || '';

  if (!missingWord && !data.sentence && !Array.isArray(data.sentence_parts)) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{slide.title || 'Fill in the Gaps'}</h2>
        {(slide as any).description && <p className="text-muted-foreground text-lg max-w-xl">{(slide as any).description}</p>}
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  const sentenceParts: string[] = useMemo(() => {
    if (Array.isArray(data.sentence_parts) && data.sentence_parts.length > 0) {
      return data.sentence_parts;
    }
    // Fallback: split data.sentence on the missing word.
    const sentence: string = data.sentence || '';
    if (sentence && missingWord) {
      const re = new RegExp(`\\b${missingWord}\\b`, 'i');
      const idx = sentence.search(re);
      if (idx >= 0) {
        return [sentence.slice(0, idx), sentence.slice(idx + missingWord.length)];
      }
    }
    return [sentence || '___ ', ''];
  }, [slide.id]);

  const distractors: string[] = useMemo(() => {
    const d = Array.isArray(data.distractors) ? data.distractors : [];
    return d.filter((x: any) => typeof x === 'string' && x.length > 0).slice(0, 3);
  }, [slide.id]);

  // Shuffle the answer pool once.
  const choices: string[] = useMemo(() => {
    const arr = [missingWord, ...distractors].filter(Boolean);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [missingWord, distractors]);

  const [filled, setFilled] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [shakeGap, setShakeGap] = useState(false);
  const firedRef = useRef(false);
  const tracker = useStarHintTracker();
  const hintText = (slide as any).hint_text as string | undefined;

  // Reset star/hint state whenever the active slide changes.
  useEffect(() => {
    tracker.reset();
    firedRef.current = false;
    setFilled(null);
  }, [slide.id]);

  const isCorrect = !!filled && filled.toLowerCase() === missingWord.toLowerCase();

  useEffect(() => {
    if (isCorrect && !firedRef.current) {
      firedRef.current = true;
      onStarsAwarded?.(tracker.stars);
      // SRS: report mastery progress for the missing word.
      if (missingWord) {
        reportSrsForCurrentUser({
          hub,
          items: [missingWord],
          stars: Math.max(1, Math.min(3, tracker.stars)) as 1 | 2 | 3,
          item_type: 'vocabulary',
        }).catch(() => {});
      }
      const t = setTimeout(() => onCorrect(), 700);
      return () => clearTimeout(t);
    }
  }, [isCorrect, onCorrect, onStarsAwarded, tracker.stars, missingWord, hub]);

  const tryWord = (word: string) => {
    if (filled && filled.toLowerCase() === missingWord.toLowerCase()) return;
    if (word.toLowerCase() === missingWord.toLowerCase()) {
      soundEffectsService.playCorrect();
      setFilled(word);
    } else {
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      tracker.registerWrong();
      setWrongFlash(true);
      setShakeGap(true);
      setTimeout(() => setWrongFlash(false), 500);
      setTimeout(() => setShakeGap(false), 500);
    }
  };

  // HTML5 drag for desktop; tap works for touch.
  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (word) tryWord(word);
  };

  if (!missingWord) {
    return (
      <div className="p-8 text-center" style={{ color: '#cbd5e1' }}>
        Missing word data unavailable for this slide.
      </div>
    );
  }

  const pillUsed = (word: string) => isCorrect && word.toLowerCase() === missingWord.toLowerCase();

  return (
    <div className="w-full">
      <ArcadeFrame
        title={instruction || 'Fill the Gap'}
        emoji="✍️"
        hud={<ArcadeChip tone="yellow">{hub === 'playground' ? 'Word Quest' : 'Word Match'}</ArcadeChip>}
      >
        <div className="flex flex-col items-center gap-6">
          <StarMeter stars={tracker.stars} />
          <HintBubble visible={tracker.showHint && !isCorrect} text={hintText} />

          {/* SENTENCE WITH DROP ZONE */}
          <div
            className="text-2xl md:text-4xl font-black flex items-center gap-3 flex-wrap justify-center leading-relaxed text-center"
            style={{ color: ARCADE.navy, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
          >
            <span>{sentenceParts[0]}</span>
            <motion.div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              animate={
                shakeGap ? { x: [0, -10, 10, -8, 8, 0] }
                : isCorrect ? { scale: [1, 1.18, 1], rotate: [0, -3, 3, 0] }
                : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
              className={[
                'inline-flex items-center justify-center px-8 py-4 rounded-2xl min-w-[180px] min-h-[72px]',
                shakeGap && 'wrong-shake',
                tracker.showTargetHighlight && !isCorrect && 'hint-target-pulse',
              ].filter(Boolean).join(' ')}
              style={{
                background: isCorrect
                  ? `linear-gradient(135deg, ${ARCADE.green}, #048A66)`
                  : 'rgba(255,255,255,0.9)',
                border: `4px dashed ${isCorrect ? ARCADE.green : ARCADE.pink}`,
                color: isCorrect ? '#fff' : ARCADE.pink,
                boxShadow: isCorrect
                  ? `0 6px 0 #048A66`
                  : `inset 0 0 20px rgba(255,77,109,0.18)`,
              }}
            >
              {filled && isCorrect ? filled : '___'}
            </motion.div>
            <span>{sentenceParts[1] || ''}</span>
          </div>

          {/* WORD PILLS */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {choices.map((word, i) => {
              const used = pillUsed(word);
              const tones = [ARCADE.pink, ARCADE.blue, ARCADE.purple, ARCADE.green];
              const tShadow = ['#B8002E', '#0A5F7E', '#432F5E', '#048A66'];
              const c = tones[i % tones.length];
              const s = tShadow[i % tShadow.length];
              return (
                <motion.button
                  key={word}
                  draggable={!used}
                  onDragStart={(e) => handleDragStart(e as any, word)}
                  onClick={() => tryWord(word)}
                  disabled={isCorrect}
                  animate={
                    used
                      ? { scale: 0.85, opacity: 0.35, y: 0 }
                      : { y: [0, -5, 0], scale: 1, opacity: 1 }
                  }
                  transition={
                    used
                      ? { duration: 0.3 }
                      : { y: { repeat: Infinity, duration: 1.6 + i * 0.1, ease: 'easeInOut' } }
                  }
                  whileHover={!isCorrect ? { scale: 1.12, rotate: -2 } : undefined}
                  whileTap={!isCorrect ? { scale: 0.92 } : undefined}
                  className="px-7 py-4 rounded-full text-2xl md:text-3xl font-black select-none min-h-[64px] min-w-[100px] uppercase tracking-wide"
                  style={{
                    background: c,
                    color: '#fff',
                    boxShadow: `0 6px 0 ${s}, 0 0 0 3px rgba(255,255,255,0.25) inset`,
                    textShadow: '2px 2px 0 rgba(0,0,0,0.25)',
                    cursor: isCorrect ? 'default' : 'grab',
                    touchAction: 'manipulation',
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  {word}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {isCorrect && (
              <motion.p
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-black"
                style={{
                  color: ARCADE.green,
                  fontFamily: "'Fredoka','Quicksand',sans-serif",
                  textShadow: `2px 2px 0 ${ARCADE.yellow}`,
                }}
              >
                ✨ +{tracker.stars * 10} XP · {tracker.stars}/3 ⭐
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
