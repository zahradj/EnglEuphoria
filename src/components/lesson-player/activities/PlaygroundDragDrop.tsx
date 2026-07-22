import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { VocabularyImage } from '@/components/ui/VocabularyImage';
import { GameFX } from '@/components/creator-studio/shared/GameFX';
import { ArcadeFrame, ArcadeChip, ArcadeDropZone, ComboFlash, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';


interface DragItem {
  text: string;
  target: string;
  emoji?: string;
  imageKeywords?: string;
  description?: string;
  imageUrl?: string;
}

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const DIFFICULTY_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  easy:   { label: 'Easy · A1–A2',   bg: '#dcfce7', color: '#14532d' },
  medium: { label: 'Medium · B1–B2', bg: '#fef3c7', color: '#854d0e' },
  hard:   { label: 'Hard · C1–C2',   bg: '#fee2e2', color: '#7f1d1d' },
};

export default function PlaygroundDragDrop({ slide, onCorrect, onIncorrect }: Props) {
  // Source priority: AI ai-core/director output (`interactive_data.pairs` with
  // {draggable, target_zone, image_url?}) → legacy creator data (`content.dragItems`).
  const interactive: any = (slide as any).interactive_data || {};
  const aiPairs: any[] = Array.isArray(interactive.pairs) ? interactive.pairs : [];

  const items: DragItem[] = aiPairs.length
    ? aiPairs
        .filter((p) => p && (p.draggable || p.left_item) && (p.target_zone || p.right_item))
        .map((p) => ({
          text: String(p.draggable ?? p.left_item),
          target: String(p.target_zone ?? p.right_item),
          imageUrl: p.image_url || p.imageUrl || undefined,
        }))
    : (slide.content?.dragItems || [
        { text: 'Apple', target: 'Fruit', emoji: '🍎' },
        { text: 'Dog', target: 'Animal', emoji: '🐕' },
        { text: 'Sun', target: 'Nature', emoji: '☀️' },
      ]);

  const difficulty: string | undefined = (slide as any).difficulty || (slide as any).content?.difficulty;
  const diffMeta = difficulty ? DIFFICULTY_STYLES[String(difficulty).toLowerCase()] : null;

  const promptText: string =
    interactive.instruction ||
    slide.content?.prompt ||
    'Drag each item to the correct category.';

  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [popFx, setPopFx] = useState(0);
  const [winFx, setWinFx] = useState(0);
  const [combo, setCombo] = useState(0);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const completedRef = useRef(false);

  const targets = [...new Set(items.map((i) => i.target))];

  const handleDragEnd = (item: DragItem, info: PanInfo) => {
    if (completedRef.current) return;
    setActiveTarget(null);

    const targetEls = document.querySelectorAll('[data-droptarget]');
    targetEls.forEach((t) => {
      const rect = t.getBoundingClientRect();
      const cx = info.point.x;
      const cy = info.point.y;
      if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
        const targetId = t.getAttribute('data-droptarget');
        if (targetId === item.target) {
          const newPlaced = { ...placed, [item.text]: targetId! };
          setPlaced(newPlaced);
          setCelebrating(item.text);
          setCombo((c) => c + 1);
          soundEffectsService.playCorrect();
          setPopFx((n) => n + 1);
          setTimeout(() => setCelebrating(null), 1200);

          if (Object.keys(newPlaced).length === items.length) {
            completedRef.current = true;
            setWinFx((n) => n + 1);
            setTimeout(() => onCorrect(), 1100);
          }
        } else {
          setCombo(0);
          soundEffectsService.playIncorrect();
        }
      }
    });
  };

  const allPlaced = Object.keys(placed).length === items.length;

  return (
    <div className="w-full relative">
      <ArcadeFrame
        title={slide.title || 'Drag & Drop'}
        emoji="🎯"
        score={Object.keys(placed).length}
        total={items.length}
        hud={diffMeta ? <ArcadeChip tone="purple">{diffMeta.label}</ArcadeChip> : <ArcadeChip tone="green">Drag It!</ArcadeChip>}
      >
        <GameFX trigger={popFx} variant="pop" />
        <GameFX trigger={winFx} variant="confetti" message="All matched! 🎉" durationMs={1800} />
        <ComboFlash combo={combo} />

        <p
          className="text-center mb-5 font-bold text-base md:text-lg"
          style={{ fontFamily: "'Fredoka','Quicksand',sans-serif", color: ARCADE.navy }}
        >
          {promptText}
        </p>

        <div className="flex gap-5 flex-wrap justify-center">
          {targets.map((t) => {
            const isPlaced = Object.values(placed).includes(t);
            const placedItems = Object.entries(placed).filter(([, v]) => v === t).map(([k]) => k);
            return (
              <div key={t} data-droptarget={t} className="w-44">
                <ArcadeDropZone filled={isPlaced} active={activeTarget === t} style={{ minHeight: 180, padding: 12 }}>
                  <VocabularyImage
                    prompt={`Colorful flat 2D vector icon of "${t}", vibrant saturated colors, bold clean outlines, isolated on a pure transparent background, no shadows, no gradients, no 3D, professional educational asset for kids`}
                    alt={t}
                    style="minimalist"
                    className="w-20 h-20"
                  />
                  <ArcadeChip tone={isPlaced ? 'green' : 'blue'} className="mt-1">{t}</ArcadeChip>
                  {placedItems.map((word) => (
                    <motion.span
                      key={word}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1 px-3 py-1 rounded-xl text-sm font-black"
                      style={{
                        background: ARCADE.green,
                        color: '#fff',
                        boxShadow: `0 2px 0 #048A66`,
                        fontFamily: "'Fredoka','Quicksand',sans-serif",
                      }}
                    >
                      {word} ✅
                    </motion.span>
                  ))}
                </ArcadeDropZone>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 flex-wrap justify-center mt-6">
          {items
            .filter((i) => !placed[i.text])
            .map((item) => (
              <motion.div
                key={item.text}
                drag
                dragSnapToOrigin
                onDrag={(_, info) => {
                  const targetEls = document.querySelectorAll('[data-droptarget]');
                  let hover: string | null = null;
                  targetEls.forEach((t) => {
                    const r = t.getBoundingClientRect();
                    if (info.point.x >= r.left && info.point.x <= r.right && info.point.y >= r.top && info.point.y <= r.bottom) {
                      hover = t.getAttribute('data-droptarget');
                    }
                  });
                  setActiveTarget(hover);
                }}
                onDragEnd={(e, info) => handleDragEnd(item, info)}
                whileDrag={{ scale: 1.12, rotate: 3, boxShadow: `0 18px 50px ${ARCADE.pink}99`, zIndex: 50 }}
                whileHover={{ scale: 1.06, y: -4 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ y: { repeat: Infinity, duration: 2 + Math.random(), ease: 'easeInOut' } }}
                className="rounded-2xl cursor-grab active:cursor-grabbing select-none flex flex-col items-center overflow-hidden"
                style={{
                  background: '#fff',
                  border: `4px solid ${ARCADE.yellow}`,
                  boxShadow: `0 6px 0 ${ARCADE.pink}`,
                  width: 140,
                }}
              >
                <div className="w-full h-24 flex items-center justify-center" style={{ background: 'rgba(255,214,10,0.15)' }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.text}
                      className="w-full h-full object-contain"
                      draggable={false}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <VocabularyImage
                      prompt={`Colorful flat 2D vector illustration of "${item.text}", vibrant bright colors, bold clean outlines, isolated on a pure transparent background, no shadows, no gradients, no 3D, clear and simple, professional educational asset for young children`}
                      alt={item.text}
                      style="minimalist"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div
                  className="w-full text-center py-2 font-black text-base uppercase tracking-wide"
                  style={{
                    background: `linear-gradient(135deg, ${ARCADE.pink}, ${ARCADE.yellow})`,
                    color: ARCADE.navy,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  {item.text}
                </div>
              </motion.div>
            ))}
        </div>

        {celebrating && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.4, 1], rotate: 0 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none"
          >
            ⭐
          </motion.div>
        )}

        {allPlaced && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
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
