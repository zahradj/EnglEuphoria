import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { GameFX } from '@/components/creator-studio/shared/GameFX';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ComboFlash, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';

interface MatchPair {
  word: string;
  image: string; // emoji or image URL
  imageKeywords?: string;
}

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function PlaygroundMatchPictures({ slide, onCorrect, onIncorrect }: Props) {
  const pairs: MatchPair[] = slide.content?.matchPairs || [
    { word: 'Apple', image: '🍎' },
    { word: 'Dog', image: '🐕' },
    { word: 'Sun', image: '☀️' },
  ];

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [combo, setCombo] = useState(0);
  const [popFx, setPopFx] = useState(0);
  const [winFx, setWinFx] = useState(0);

  const shuffledImages = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), []);
  const isImageUrl = (str: string) => str.startsWith('http') || str.startsWith('data:');

  const handleWordClick = (word: string) => {
    if (matched.has(word)) return;
    setSelectedWord(word);
    soundEffectsService.playPop?.();
  };

  const handleImageClick = (pair: MatchPair) => {
    if (!selectedWord || matched.has(pair.word)) return;
    if (selectedWord === pair.word) {
      const next = new Set([...matched, pair.word]);
      setMatched(next);
      setCombo((c) => c + 1);
      setPopFx((n) => n + 1);
      soundEffectsService.playCorrect();
      onCorrect();
      setSelectedWord(null);
      if (next.size === pairs.length) {
        setWinFx((n) => n + 1);
      }
    } else {
      setCombo(0);
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setSelectedWord(null);
    }
  };

  return (
    <div className="w-full">
      <ArcadeFrame
        title={slide.title || 'Match the Pictures'}
        emoji="🧩"
        score={matched.size}
        total={pairs.length}
        hud={<ArcadeChip tone="purple">Tap → Tap</ArcadeChip>}
      >
        <GameFX trigger={popFx} variant="sparkle" />
        <GameFX trigger={winFx} variant="confetti" message="Perfect Match! 🎉" durationMs={1800} />
        <ComboFlash combo={combo} />

        <div className="grid grid-cols-2 gap-6 md:gap-10">
          {/* Words */}
          <div className="flex flex-col gap-3">
            <ArcadeChip tone="pink" className="self-center">Words</ArcadeChip>
            {pairs.map((p) => (
              <ArcadeButton
                key={p.word}
                tone="yellow"
                size="lg"
                active={selectedWord === p.word}
                matched={matched.has(p.word)}
                disabled={matched.has(p.word)}
                onClick={() => handleWordClick(p.word)}
                className="w-full"
              >
                {p.word} {matched.has(p.word) && '✅'}
              </ArcadeButton>
            ))}
          </div>

          {/* Pictures */}
          <div className="flex flex-col gap-3">
            <ArcadeChip tone="blue" className="self-center">Pictures</ArcadeChip>
            {shuffledImages.map((p, idx) => (
              <motion.button
                key={`img-${idx}`}
                whileHover={!matched.has(p.word) ? { scale: 1.06, rotate: -1 } : {}}
                whileTap={!matched.has(p.word) ? { scale: 0.94 } : {}}
                onClick={() => handleImageClick(p)}
                disabled={matched.has(p.word)}
                className="relative py-3 px-5 rounded-3xl flex items-center justify-center min-h-[78px]"
                style={{
                  background: matched.has(p.word) ? ARCADE.green : '#fff',
                  border: `4px solid ${matched.has(p.word) ? '#048A66' : ARCADE.blue}`,
                  boxShadow: matched.has(p.word)
                    ? `0 4px 0 #048A66`
                    : `0 5px 0 ${ARCADE.purple}`,
                  opacity: matched.has(p.word) ? 0.85 : 1,
                }}
              >
                {isImageUrl(p.image) ? (
                  <img src={p.image} alt={p.word} className="w-20 h-20 object-contain rounded-xl" />
                ) : (
                  <span className="text-5xl drop-shadow">{p.image || '❓'}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {matched.size === pairs.length && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="mt-6 text-center text-3xl font-black"
            style={{
              fontFamily: "'Fredoka','Quicksand',sans-serif",
              color: ARCADE.green,
              textShadow: `2px 2px 0 ${ARCADE.yellow}`,
            }}
          >
            🏆 LEVEL CLEAR!
          </motion.div>
        )}
      </ArcadeFrame>
    </div>
  );
}
