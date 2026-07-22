import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Volume2, Star, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { playSound } from '@/constants/soundEffects';
import confetti from 'canvas-confetti';
import pipMascotImg from '@/assets/pip-mascot.png';
import type { CanvasElementData, Slide } from '@/components/admin/lesson-builder/types';

interface CanvasLessonPlayerProps {
  slides: Slide[];
  lessonTitle?: string;
  onComplete?: (score: number) => void;
  onClose?: () => void;
}

const CANVAS_W = 1920;
const CANVAS_H = 1080;

/* ─── Helpers ─── */
const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getItemText = (item: any): string => typeof item === 'string' ? item : item?.text || '';

/* ─── Interactive Element Renderers ─── */

const QuizPlayer: React.FC<{
  element: CanvasElementData;
  onComplete: (correct: boolean) => void;
}> = ({ element, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleClick = (opt: any) => {
    if (done || wrongIds.includes(opt.id)) return;
    setSelected(opt.id);
    if (opt.isCorrect) {
      setDone(true);
      onComplete(true);
    } else {
      setWrongIds(prev => [...prev, opt.id]);
      onComplete(false);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col justify-center gap-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl">
      <p className="text-2xl font-bold text-foreground">{element.content?.question || 'Question?'}</p>
      <div className="grid grid-cols-2 gap-3">
        {(element.content?.options || []).map((opt: any, i: number) => {
          const isCorrectDone = done && opt.isCorrect;
          const isWrong = wrongIds.includes(opt.id);
          return (
            <motion.button
              key={opt.id || i}
              whileTap={{ scale: 0.95 }}
              animate={isWrong ? { x: [-8, 8, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
              onClick={() => handleClick(opt)}
              disabled={done || isWrong}
              className={`p-4 rounded-xl text-lg font-semibold border-2 transition-all flex items-center gap-3
                ${isCorrectDone ? 'bg-green-500 border-green-600 text-white scale-105' : ''}
                ${isWrong ? 'bg-red-400/60 border-red-500 text-white opacity-60' : ''}
                ${!isCorrectDone && !isWrong ? 'bg-white border-primary/30 hover:border-primary text-foreground hover:shadow-md' : ''}
              `}
            >
              {opt.image && <img src={opt.image} alt="" className="h-12 w-16 object-cover rounded" />}
              <span>{String.fromCharCode(65 + i)}. {opt.text}</span>
              {isCorrectDone && <Check className="h-5 w-5 ml-auto" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const MatchingPlayer: React.FC<{
  element: CanvasElementData;
  onComplete: (correct: boolean) => void;
}> = ({ element, onComplete }) => {
  const pairs = element.content?.pairs || [];
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const shuffledRight = useMemo(() => shuffleArray(pairs.map((_: any, i: number) => i)), [pairs]);

  const handleRightClick = (rightOrigIdx: number) => {
    if (selectedLeft === null || matched.includes(rightOrigIdx)) return;
    if (selectedLeft === rightOrigIdx) {
      const newMatched = [...matched, rightOrigIdx];
      setMatched(newMatched);
      setSelectedLeft(null);
      if (newMatched.length === pairs.length) onComplete(true);
    } else {
      setSelectedLeft(null);
      onComplete(false);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col justify-center gap-4">
      <p className="text-xl font-bold text-foreground">{element.content?.title || 'Match the pairs'}</p>
      <div className="flex gap-6 justify-center">
        <div className="flex flex-col gap-2">
          {pairs.map((pair: any, i: number) => (
            <motion.button
              key={`l-${i}`}
              onClick={() => !matched.includes(i) && setSelectedLeft(i)}
              className={`px-5 py-3 rounded-lg border-2 text-left font-medium transition-all flex items-center gap-2
                ${matched.includes(i) ? 'bg-green-100 border-green-400 opacity-60' : ''}
                ${selectedLeft === i ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-white'}
              `}
            >
              {pair.leftImage && <img src={pair.leftImage} alt="" className="h-10 w-14 object-cover rounded" />}
              {pair.left}
            </motion.button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {shuffledRight.map((origIdx: number) => {
            const pair = pairs[origIdx];
            return (
              <motion.button
                key={`r-${origIdx}`}
                onClick={() => handleRightClick(origIdx)}
                className={`px-5 py-3 rounded-lg border-2 text-left font-medium transition-all flex items-center gap-2
                  ${matched.includes(origIdx) ? 'bg-green-100 border-green-400 opacity-60' : 'border-border bg-white hover:border-accent'}
                `}
              >
                {pair.rightImage && <img src={pair.rightImage} alt="" className="h-10 w-14 object-cover rounded" />}
                {pair.right}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FillBlankPlayer: React.FC<{
  element: CanvasElementData;
  onComplete: (correct: boolean) => void;
}> = ({ element, onComplete }) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const check = () => {
    const answer = (element.content?.answer || '').trim().toLowerCase();
    if (value.trim().toLowerCase() === answer) {
      setStatus('correct');
      onComplete(true);
    } else {
      setStatus('wrong');
      onComplete(false);
      setTimeout(() => setStatus('idle'), 800);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col justify-center items-center gap-4">
      <p className="text-2xl font-medium text-foreground">{element.content?.sentence?.replace('___', '______') || ''}</p>
      <div className="flex gap-3 items-center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="Type your answer..."
          className={`text-lg w-64 ${status === 'correct' ? 'border-green-500' : status === 'wrong' ? 'border-red-500' : ''}`}
          disabled={status === 'correct'}
        />
        <Button onClick={check} disabled={status === 'correct'}>Check</Button>
      </div>
      {status === 'correct' && <p className="text-green-600 font-bold text-lg">✓ Correct!</p>}
      {status === 'wrong' && <p className="text-red-500 font-bold text-lg">Try again!</p>}
    </div>
  );
};

const SortingPlayer: React.FC<{
  element: CanvasElementData;
  onComplete: (correct: boolean) => void;
}> = ({ element, onComplete }) => {
  const correctOrder = element.content?.items || [];
  const [items, setItems] = useState(() => shuffleArray([...correctOrder]));
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDrop = (i: number) => {
    if (dragIdx === null) return;
    const newItems = [...items];
    const [removed] = newItems.splice(dragIdx, 1);
    newItems.splice(i, 0, removed);
    setItems(newItems);
    setDragIdx(null);
  };

  const check = () => {
    const isCorrect = items.every((item: string, i: number) => item === correctOrder[i]);
    setStatus(isCorrect ? 'correct' : 'wrong');
    onComplete(isCorrect);
    if (!isCorrect) setTimeout(() => setStatus('idle'), 800);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col justify-center items-center gap-4">
      <p className="text-xl font-bold">{element.content?.instruction || 'Put in the correct order'}</p>
      <div className="flex flex-col gap-2 w-80">
        {items.map((item: string, i: number) => (
          <div
            key={`${item}-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="px-4 py-3 bg-white border-2 border-border rounded-lg cursor-grab active:cursor-grabbing text-lg font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            {i + 1}. {item}
          </div>
        ))}
      </div>
      <Button onClick={check} disabled={status === 'correct'}>Check Order</Button>
      {status === 'correct' && <p className="text-green-600 font-bold">✓ Perfect order!</p>}
      {status === 'wrong' && <p className="text-red-500 font-bold">Not quite, try again!</p>}
    </div>
  );
};

const SentenceBuilderPlayer: React.FC<{
  element: CanvasElementData;
  onComplete: (correct: boolean) => void;
}> = ({ element, onComplete }) => {
  const words = element.content?.words || [];
  const correctSentence = element.content?.correctSentence || '';
  const [available, setAvailable] = useState(() => shuffleArray([...words]));
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const addWord = (word: string, idx: number) => {
    setSelected([...selected, word]);
    setAvailable(available.filter((_: string, i: number) => i !== idx));
  };

  const removeWord = (idx: number) => {
    const word = selected[idx];
    setAvailable([...available, word]);
    setSelected(selected.filter((_: string, i: number) => i !== idx));
  };

  const check = () => {
    const built = selected.join(' ');
    if (built.toLowerCase() === correctSentence.toLowerCase()) {
      setStatus('correct');
      onComplete(true);
    } else {
      setStatus('wrong');
      onComplete(false);
      setTimeout(() => setStatus('idle'), 800);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col justify-center items-center gap-4">
      <p className="text-xl font-bold">{element.content?.instruction || 'Build the sentence'}</p>
      <div className="min-h-[48px] w-full max-w-lg border-2 border-dashed border-primary/40 rounded-xl p-3 flex flex-wrap gap-2">
        {selected.map((word, i) => (
          <motion.button
            key={`s-${i}`}
            layout
            onClick={() => removeWord(i)}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-medium text-sm"
          >
            {word} ×
          </motion.button>
        ))}
        {selected.length === 0 && <span className="text-muted-foreground text-sm">Tap words below to build...</span>}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {available.map((word: string, i: number) => (
          <motion.button
            key={`a-${i}`}
            layout
            onClick={() => addWord(word, i)}
            className="px-4 py-2 bg-white border-2 border-border rounded-full font-medium hover:border-primary transition-colors"
          >
            {word}
          </motion.button>
        ))}
      </div>
      {selected.length > 0 && <Button onClick={check} disabled={status === 'correct'}>Check</Button>}
      {status === 'correct' && <p className="text-green-600 font-bold">✓ Great sentence!</p>}
      {status === 'wrong' && <p className="text-red-500 font-bold">Not quite, try rearranging!</p>}
    </div>
  );
};

/* ─── Static Element Renderer ─── */
const StaticElement: React.FC<{ element: CanvasElementData }> = ({ element }) => {
  switch (element.elementType) {
    case 'text':
      return (
        <div
          className="w-full h-full flex items-center justify-center p-2"
          style={{
            fontSize: element.content?.fontSize || 24,
            fontWeight: element.content?.bold ? 'bold' : 'normal',
            fontStyle: element.content?.italic ? 'italic' : 'normal',
            color: element.content?.color || 'hsl(var(--foreground))',
            textAlign: element.content?.align || 'center',
          }}
        >
          {element.content?.text || ''}
        </div>
      );
    case 'image':
      return element.content?.src ? (
        <img src={element.content.src} alt="" className="w-full h-full object-cover rounded" />
      ) : null;
    case 'shape':
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: element.content?.fill || 'hsl(var(--primary))',
            borderRadius: element.content?.shape === 'circle' ? '50%' : element.content?.shape === 'rounded' ? 12 : 0,
            opacity: element.content?.opacity ?? 1,
          }}
        />
      );
    case 'video': {
      let url = element.content?.url || '';
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (ytMatch) url = `https://www.youtube.com/embed/${ytMatch[1]}`;
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) url = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      return url ? <iframe src={url} className="w-full h-full rounded" allowFullScreen /> : null;
    }
    case 'audio':
      return (
        <button
          onClick={() => { if (element.content?.src) new Audio(element.content.src).play(); }}
          className="w-full h-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/30 hover:shadow-md transition-shadow"
        >
          <Volume2 className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold">{element.content?.label || 'Play Audio'}</span>
        </button>
      );
    case 'character': {
      const anim = element.content?.animation || 'idle';
      const cls = anim === 'wave' ? 'animate-pip-wave' : anim === 'jump' ? 'animate-pip-jump' : anim === 'shake' ? 'animate-pip-shake' : 'animate-pip-idle';
      return (
        <div className="w-full h-full relative flex items-center justify-center">
          <img src={element.content?.src || pipMascotImg} alt="Pip" className={`max-w-full max-h-full object-contain ${cls}`} />
          {element.content?.speechBubble && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-white border-2 border-primary rounded-xl px-4 py-2 text-base font-bold shadow-lg max-w-[250px] text-center">
              {element.content.speechBubble}
            </div>
          )}
        </div>
      );
    }
    default:
      return null;
  }
};

/* ─── INTERACTIVE ELEMENTS LIST ─── */
const INTERACTIVE_TYPES = ['quiz', 'matching', 'fill-blank', 'drag-drop', 'sorting', 'sentence-builder'];

/* ─── Main Player ─── */
export const CanvasLessonPlayer: React.FC<CanvasLessonPlayerProps> = ({
  slides,
  lessonTitle,
  onComplete,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [score, setScore] = useState(0);
  const [totalInteractive, setTotalInteractive] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [pipAnimation, setPipAnimation] = useState<string>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentIndex];
  const elements = slide?.canvasElements || [];
  const progress = slides.length > 0 ? ((currentIndex + 1) / slides.length) * 100 : 0;

  // Count total interactive elements across all slides
  useEffect(() => {
    let count = 0;
    slides.forEach(s => {
      (s.canvasElements || []).forEach(el => {
        if (INTERACTIVE_TYPES.includes(el.elementType)) count++;
      });
    });
    setTotalInteractive(count);
  }, [slides]);

  // Scale canvas to fit viewport
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setScale(Math.min(rect.width / CANVAS_W, rect.height / CANVAS_H));
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Check if current slide has unfinished interactive elements
  const hasUnfinishedActivity = elements.some(
    el => INTERACTIVE_TYPES.includes(el.elementType) && !completedActivities.has(el.id)
  );

  const handleActivityResult = useCallback((elementId: string, correct: boolean) => {
    if (correct) {
      setScore(s => s + 1);
      setCompletedActivities(prev => new Set(prev).add(elementId));
      setPipAnimation('jump');
      playSound('correct', 0.7);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ['#FFD700', '#4ECDC4', '#FF6B6B'] });
      setTimeout(() => setPipAnimation('idle'), 1500);
    } else {
      setPipAnimation('shake');
      playSound('incorrect', 0.5);
      setTimeout(() => setPipAnimation('idle'), 800);
    }
  }, []);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // Finished!
      setShowCelebration(true);
      playSound('fanfare', 0.8);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
      setTimeout(() => {
        onComplete?.(totalInteractive > 0 ? Math.round((score / totalInteractive) * 100) : 100);
      }, 3000);
    }
  };

  const goPrev = () => currentIndex > 0 && setCurrentIndex(i => i - 1);

  const renderElement = (el: CanvasElementData) => {
    const isInteractive = INTERACTIVE_TYPES.includes(el.elementType);
    const isCompleted = completedActivities.has(el.id);

    if (isInteractive && !isCompleted) {
      const commonProps = {
        element: el,
        onComplete: (correct: boolean) => handleActivityResult(el.id, correct),
      };
      switch (el.elementType) {
        case 'quiz': return <QuizPlayer {...commonProps} />;
        case 'matching': return <MatchingPlayer {...commonProps} />;
        case 'fill-blank': return <FillBlankPlayer {...commonProps} />;
        case 'sorting': return <SortingPlayer {...commonProps} />;
        case 'sentence-builder': return <SentenceBuilderPlayer {...commonProps} />;
        default: return <StaticElement element={el} />;
      }
    }

    // Override character animation with feedback
    if (el.elementType === 'character' && pipAnimation !== 'idle') {
      return <StaticElement element={{ ...el, content: { ...el.content, animation: pipAnimation } }} />;
    }

    return <StaticElement element={el} />;
  };

  if (showCelebration) {
    const stars = totalInteractive > 0 ? (score / totalInteractive >= 0.8 ? 3 : score / totalInteractive >= 0.5 ? 2 : 1) : 3;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center"
      >
        <div className="text-center text-white">
          <motion.img
            src={pipMascotImg}
            alt="Pip"
            className="w-40 h-40 mx-auto mb-6 object-contain animate-pip-jump"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold mb-4"
            style={{ fontFamily: "'Fredoka', cursive" }}
          >
            Amazing! 🎉
          </motion.h1>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <motion.div key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
                <Star className={`w-12 h-12 ${i <= stars ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} />
              </motion.div>
            ))}
          </div>
          <p className="text-2xl opacity-90 mb-6">
            {totalInteractive > 0 ? `Score: ${score}/${totalInteractive}` : 'Lesson Complete!'}
          </p>
          <Button onClick={() => onClose?.()} size="lg" variant="secondary" className="text-lg px-8">
            Done
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-black/80 shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
          ✕ Close
        </Button>
        <span className="text-white/80 text-sm font-medium truncate flex-1">{lessonTitle || 'Lesson'}</span>
        <span className="text-white/60 text-xs">{currentIndex + 1} / {slides.length}</span>
        <div className="w-32">
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Canvas viewport */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div
          className="relative bg-white rounded-lg overflow-hidden shadow-2xl"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {slide?.imageUrl && (
            <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {elements.map(el => (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                zIndex: el.zIndex,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              }}
            >
              {renderElement(el)}
            </div>
          ))}

          {elements.length === 0 && !slide?.imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
              <p className="text-3xl font-light">Empty Slide</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 shrink-0">
        <Button
          variant="ghost"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6 mr-1" /> Back
        </Button>
        <Button
          size="lg"
          onClick={goNext}
          disabled={hasUnfinishedActivity}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 disabled:opacity-50"
        >
          {currentIndex === slides.length - 1 ? 'Finish 🎉' : 'Next'}
          {currentIndex < slides.length - 1 && <ChevronRight className="h-6 w-6 ml-1" />}
        </Button>
      </div>
    </div>
  );
};
