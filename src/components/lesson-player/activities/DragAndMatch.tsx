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
import { ArcadeFrame, ARCADE, ComboFlash } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Pair {
  left_item: string;
  right_item: string;
  left_thumbnail_url?: string;
  right_thumbnail_url?: string;
}

interface Props {
  slide: GeneratedSlide;
  hub?: HubType;
  onCorrect: () => void;
  onIncorrect?: () => void;
  /** Called when all pairs are matched, carrying the final star count (1-3). */
  onStarsAwarded?: (stars: number) => void;
}

/**
 * Drag & Match — touch-friendly two-column matcher.
 * Reads pairs from slide.interactive_data.pairs (capped at 3 for tablet visibility).
 * On a correct match: snap animation, ding sound. When all pairs are matched, fires onCorrect()
 * (the parent then handles confetti + next-slide unlock — same pipeline as Multiple Choice).
 */
export default function DragAndMatch({ slide, hub = 'academy', onCorrect, onIncorrect, onStarsAwarded }: Props) {
  const config = HUB_CONFIGS[hub] || HUB_CONFIGS.academy;
  const primary = (config as any)?.primaryColor || '#6366f1';
  const accent = (config as any)?.accentColor || '#a855f7';

  const data: any = (slide as any).interactive_data || (slide as any).content || {};
  const instruction: string = data.instruction || 'Drag each word to its match!';

  const pairs: Pair[] = useMemo(() => {
    const raw: any[] = Array.isArray(data.pairs) ? data.pairs : [];
    return raw
      .filter((p) => p && (p.left_item || p.left) && (p.right_item || p.right))
      .slice(0, 3)
      .map((p) => ({
        left_item: p.left_item ?? p.left,
        right_item: p.right_item ?? p.right,
        left_thumbnail_url: p.left_thumbnail_url,
        right_thumbnail_url: p.right_thumbnail_url,
      })) as Pair[];
  }, [slide.id]);

  if (pairs.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{slide.title || 'Match Activity'}</h2>
        {(slide as any).description && <p className="text-muted-foreground text-lg max-w-xl">{(slide as any).description}</p>}
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  // Shuffle right column once so the order doesn't telegraph the answer.
  const rightItems: string[] = useMemo(() => {
    const arr = pairs.map((p) => p.right_item);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [pairs]);

  const [matched, setMatched] = useState<Record<string, string>>({}); // left_item -> right_item
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [popFx, setPopFx] = useState(0);
  const [winFx, setWinFx] = useState(0);
  const firedRef = useRef(false);
  const tracker = useStarHintTracker();
  const hintText = (slide as any).hint_text as string | undefined;
  const isPlayground = hub === 'playground';

  // Reset star/hint state whenever the active slide changes.
  useEffect(() => {
    tracker.reset();
    firedRef.current = false;
    setMatched({});
    setSelectedLeft(null);
    setCombo(0);
  }, [slide.id]);

  const allMatched = pairs.length > 0 && Object.keys(matched).length === pairs.length;

  useEffect(() => {
    if (allMatched && !firedRef.current) {
      firedRef.current = true;
      onStarsAwarded?.(tracker.stars);
      setWinFx((v) => v + 1);
      // SRS: report mastery progress for every paired word.
      const items = pairs.map((p) => p.left_item).filter(Boolean);
      reportSrsForCurrentUser({
        hub,
        items,
        stars: Math.max(1, Math.min(3, tracker.stars)) as 1 | 2 | 3,
        item_type: 'vocabulary',
      }).catch(() => {});
      // Slight delay so the user sees the final snap animation before the parent advances.
      const t = setTimeout(() => onCorrect(), isPlayground ? 1100 : 600);
      return () => clearTimeout(t);
    }
  }, [allMatched, onCorrect, onStarsAwarded, tracker.stars, pairs, hub, isPlayground]);

  const tryMatch = (leftItem: string, rightItem: string) => {
    if (matched[leftItem]) return;
    const correct = pairs.find((p) => p.left_item === leftItem)?.right_item === rightItem;
    if (correct) {
      soundEffectsService.playCorrect();
      setMatched((m) => ({ ...m, [leftItem]: rightItem }));
      setSelectedLeft(null);
      setPopFx((v) => v + 1);
      setCombo((c) => c + 1);
    } else {
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      tracker.registerWrong();
      setCombo(0);
      setShake(leftItem + '|' + rightItem);
      setTimeout(() => setShake(null), 400);
    }
  };

  const handleLeftTap = (leftItem: string) => {
    if (matched[leftItem]) return;
    setSelectedLeft((cur) => (cur === leftItem ? null : leftItem));
  };

  const handleRightTap = (rightItem: string) => {
    // If already used, ignore.
    if (Object.values(matched).includes(rightItem)) return;
    if (!selectedLeft) return;
    tryMatch(selectedLeft, rightItem);
  };

  // Drag handlers (HTML5 DnD — works on desktop; tap-to-match handles touch).
  const handleDragStart = (e: React.DragEvent, leftItem: string) => {
    e.dataTransfer.setData('text/plain', leftItem);
    setSelectedLeft(leftItem);
  };
  const handleDrop = (e: React.DragEvent, rightItem: string) => {
    e.preventDefault();
    const leftItem = e.dataTransfer.getData('text/plain');
    if (leftItem) tryMatch(leftItem, rightItem);
  };

  if (pairs.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: '#cbd5e1' }}>
        No matching pairs available for this slide.
      </div>
    );
  }

  // PLAYGROUND arcade variant ────────────────────────────────────────
  if (isPlayground) {
    const tones: Array<'pink' | 'yellow' | 'green' | 'blue' | 'purple'> =
      ['pink', 'yellow', 'green', 'blue', 'purple'];
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <ArcadeFrame
          title={instruction || 'Match Up!'}
          emoji="🔗"
          score={Object.keys(matched).length}
          total={pairs.length}
        >
          <div className="relative">
            <GameFX trigger={popFx} variant="pop" durationMs={500} />
            <GameFX trigger={winFx} variant="confetti" message="All matched! 🎉" />
            <ComboFlash combo={combo} />

            <p className="text-center text-sm font-bold mb-4" style={{ color: ARCADE.navy, opacity: 0.75 }}>
              Tap a card on the left, then tap its pair on the right!
            </p>

            <div className="grid grid-cols-2 gap-5 md:gap-7 w-full">
              {/* LEFT */}
              <div className="flex flex-col gap-3">
                {pairs.map((p, idx) => {
                  const isMatched = !!matched[p.left_item];
                  const isSelected = selectedLeft === p.left_item;
                  const isShaking = shake?.startsWith(p.left_item + '|');
                  const thumb = (p as any).left_thumbnail_url as string | undefined;
                  const tone = tones[idx % tones.length];
                  const t = isMatched ? ARCADE.green : isSelected ? ARCADE.yellow : tone === 'yellow' ? ARCADE.yellow : tone === 'green' ? ARCADE.green : tone === 'blue' ? ARCADE.blue : tone === 'purple' ? ARCADE.purple : ARCADE.pink;
                  const shadow = isMatched ? '#048A66' : isSelected ? '#C49A00' : '#00000044';
                  return (
                    <motion.button
                      key={`L-${p.left_item}`}
                      draggable={!isMatched}
                      onDragStart={(e) => handleDragStart(e as any, p.left_item)}
                      onClick={() => handleLeftTap(p.left_item)}
                      animate={
                        isShaking ? { x: [0, -10, 10, -8, 8, 0] }
                        : isMatched ? { scale: [1, 1.12, 1] }
                        : { scale: 1 }
                      }
                      transition={{ duration: 0.35 }}
                      whileHover={!isMatched ? { scale: 1.04, y: -2 } : undefined}
                      whileTap={!isMatched ? { scale: 0.96 } : undefined}
                      className="px-4 py-4 min-h-[72px] rounded-2xl text-lg md:text-xl font-black flex flex-col items-center justify-center gap-1.5 select-none border-4"
                      style={{
                        background: '#fff',
                        color: ARCADE.navy,
                        borderColor: t,
                        boxShadow: `0 6px 0 ${shadow}`,
                        cursor: isMatched ? 'default' : 'grab',
                        touchAction: 'manipulation',
                        fontFamily: "'Fredoka','Quicksand',sans-serif",
                        opacity: isMatched ? 0.85 : 1,
                      }}
                    >
                      {thumb && <img src={thumb} alt="" className="w-14 h-14 object-cover rounded-xl" />}
                      <span>{p.left_item}{isMatched && <span className="ml-1">✅</span>}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-3">
                {rightItems.map((right, idx) => {
                  const isUsed = Object.values(matched).includes(right);
                  const isShakeTarget = shake?.endsWith('|' + right);
                  const thumb = (pairs.find((pp) => pp.right_item === right) as any)?.right_thumbnail_url as string | undefined;
                  const tone = tones[(idx + 2) % tones.length];
                  const t = isUsed ? ARCADE.green : tone === 'yellow' ? ARCADE.yellow : tone === 'green' ? ARCADE.green : tone === 'blue' ? ARCADE.blue : tone === 'purple' ? ARCADE.purple : ARCADE.pink;
                  return (
                    <motion.div
                      key={`R-${right}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, right)}
                      onClick={() => handleRightTap(right)}
                      animate={
                        isShakeTarget ? { x: [0, 10, -10, 8, -8, 0] }
                        : isUsed ? { scale: [1, 1.12, 1] }
                        : { scale: 1 }
                      }
                      transition={{ duration: 0.35 }}
                      whileHover={!isUsed ? { scale: 1.04, y: -2 } : undefined}
                      whileTap={!isUsed ? { scale: 0.96 } : undefined}
                      className="px-4 py-4 min-h-[72px] rounded-2xl text-lg md:text-xl font-black flex flex-col items-center justify-center gap-1.5 select-none border-4 border-dashed"
                      style={{
                        background: isUsed ? 'rgba(6,214,160,0.18)' : 'rgba(255,255,255,0.85)',
                        color: ARCADE.navy,
                        borderColor: t,
                        boxShadow: isUsed ? `0 6px 0 #048A66` : `0 4px 0 #00000022`,
                        cursor: isUsed ? 'default' : 'pointer',
                        touchAction: 'manipulation',
                        fontFamily: "'Fredoka','Quicksand',sans-serif",
                      }}
                    >
                      {thumb && <img src={thumb} alt="" className="w-14 h-14 object-cover rounded-xl" />}
                      <span>{right}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Star meter / hint live inside the cabinet for playground */}
            <div className="mt-5 flex flex-col items-center gap-2">
              <StarMeter stars={tracker.stars} />
              <HintBubble visible={tracker.showHint && !allMatched} text={hintText} />
            </div>
          </div>
        </ArcadeFrame>
      </div>
    );
  }

  // ACADEMY / SUCCESS variant (unchanged) ────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full h-full max-w-4xl mx-auto">
      <StarMeter stars={tracker.stars} />
      <HintBubble visible={tracker.showHint && !allMatched} text={hintText} />
      <h2 className="text-2xl md:text-3xl font-bold text-center" style={{ color: '#e2e8f0' }}>
        🔗 {instruction}
      </h2>
      <p className="text-sm md:text-base" style={{ color: '#94a3b8' }}>
        Tap a word on the left, then tap its match on the right (or drag & drop).
      </p>

      <div className="grid grid-cols-2 gap-6 md:gap-8 w-full">
        <div className="flex flex-col gap-4">
          {pairs.map((p) => {
            const isMatched = !!matched[p.left_item];
            const isSelected = selectedLeft === p.left_item;
            const isShaking = shake?.startsWith(p.left_item + '|');
            const thumb = (p as any).left_thumbnail_url as string | undefined;
            return (
              <motion.button
                key={`L-${p.left_item}`}
                draggable={!isMatched}
                onDragStart={(e) => handleDragStart(e as any, p.left_item)}
                onClick={() => handleLeftTap(p.left_item)}
                animate={
                  isShaking ? { x: [0, -10, 10, -8, 8, 0] }
                  : isMatched ? { scale: [1, 1.06, 1], opacity: 0.85 }
                  : { scale: 1 }
                }
                transition={{ duration: 0.35 }}
                whileHover={!isMatched ? { scale: 1.03 } : undefined}
                whileTap={!isMatched ? { scale: 0.97 } : undefined}
                className="px-5 py-5 md:py-6 min-h-[72px] rounded-2xl text-xl md:text-2xl font-bold flex flex-col items-center justify-center gap-2 select-none"
                style={{
                  background: isMatched
                    ? `linear-gradient(135deg, ${primary}33, ${accent}33)`
                    : isSelected
                    ? `linear-gradient(135deg, ${primary}, ${accent})`
                    : '#1e1b4b',
                  color: '#fff',
                  border: `2px solid ${isMatched ? '#22c55e' : isSelected ? '#fff' : primary + '88'}`,
                  cursor: isMatched ? 'default' : 'grab',
                  touchAction: 'manipulation',
                }}
              >
                {thumb && <img src={thumb} alt="" className="w-16 h-16 object-cover rounded-md" />}
                <span>{p.left_item}{isMatched && <span className="ml-2">✅</span>}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {rightItems.map((right) => {
            const isUsed = Object.values(matched).includes(right);
            const isShakeTarget = shake?.endsWith('|' + right);
            const thumb = (pairs.find((pp) => pp.right_item === right) as any)?.right_thumbnail_url as string | undefined;
            return (
              <motion.div
                key={`R-${right}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, right)}
                onClick={() => handleRightTap(right)}
                animate={
                  isShakeTarget ? { x: [0, 10, -10, 8, -8, 0] }
                  : isUsed ? { scale: [1, 1.06, 1] }
                  : { scale: 1 }
                }
                transition={{ duration: 0.35 }}
                whileHover={!isUsed ? { scale: 1.03 } : undefined}
                whileTap={!isUsed ? { scale: 0.97 } : undefined}
                className="px-5 py-5 md:py-6 min-h-[72px] rounded-2xl text-xl md:text-2xl font-bold flex flex-col items-center justify-center gap-2 select-none"
                style={{
                  background: isUsed
                    ? `linear-gradient(135deg, #22c55e44, #16a34a44)`
                    : '#1e1b4b',
                  color: '#fff',
                  border: `2px dashed ${isUsed ? '#22c55e' : accent + '88'}`,
                  cursor: isUsed ? 'default' : 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                {thumb && <img src={thumb} alt="" className="w-16 h-16 object-cover rounded-md" />}
                <span>{right}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {allMatched && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xl font-bold mt-2"
            style={{ color: '#22c55e' }}
          >
            ✨ All matched! Amazing work!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
