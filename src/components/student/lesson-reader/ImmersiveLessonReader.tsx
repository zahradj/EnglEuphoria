import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingToolbar } from './FloatingToolbar';
import { QuizReveal } from './QuizReveal';
import { WordInsightPopup } from './WordInsightPopup';
import { cn } from '@/lib/utils';

interface ImmersiveLessonReaderProps {
  lessonId: string;
  title: string;
  content: string;
  track: 'kids' | 'teens' | 'adults';
  level: string;
  coverImageUrl?: string | null;
  durationMinutes?: number | null;
  onBack: () => void;
}

const TRACK_GLOW: Record<string, string> = {
  kids: 'from-emerald-400/10 via-amber-300/10 to-orange-300/10',
  teens: 'from-indigo-500/10 via-purple-500/10 to-violet-400/10',
  adults: 'from-amber-500/10 via-yellow-600/10 to-amber-700/10',
};

const TRACK_ACCENT: Record<string, string> = {
  kids: 'text-emerald-500 dark:text-emerald-400',
  teens: 'text-indigo-500 dark:text-indigo-400',
  adults: 'text-amber-600 dark:text-amber-400',
};

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc leading-relaxed">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-5 list-decimal leading-relaxed">$2</li>')
    .replace(/✅/g, '<span class="text-emerald-500 font-bold">✅</span>')
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
    .replace(/\n/g, '<br/>');
}

function extractQuiz(content: string): { mainContent: string; quizQuestions: any[] } {
  const quizMatch = content.match(/##\s*🧠\s*Quick Quiz([\s\S]*?)(?=##\s|$)/i);
  if (!quizMatch) return { mainContent: content, quizQuestions: [] };

  const mainContent = content.replace(quizMatch[0], '');
  const quizText = quizMatch[1];

  // Parse quiz questions
  const questions: any[] = [];
  const qBlocks = quizText.split(/\d+\.\s+/).filter(Boolean);

  for (const block of qBlocks) {
    const lines = block.trim().split('\n').filter(Boolean);
    if (lines.length < 2) continue;

    const questionText = lines[0].trim();
    const options: string[] = [];
    let correctIndex = -1;
    let explanation = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const optMatch = line.match(/^([a-d])\)\s*(.+)/i);
      if (optMatch) {
        const optText = optMatch[2].replace(/✅/g, '').trim();
        if (line.includes('✅')) correctIndex = options.length;
        options.push(optText);
      }
      if (line.toLowerCase().startsWith('explanation') || line.toLowerCase().startsWith('*explanation')) {
        explanation = line.replace(/^\*?explanation:?\*?\s*/i, '').trim();
      }
    }

    if (options.length >= 2) {
      questions.push({ question: questionText, options, correctIndex, explanation });
    }
  }

  return { mainContent, quizQuestions: questions };
}

export const ImmersiveLessonReader: React.FC<ImmersiveLessonReaderProps> = ({
  lessonId,
  title,
  content,
  track,
  level,
  coverImageUrl,
  durationMinutes,
  onBack,
}) => {
  const [fontSize, setFontSize] = useState(18);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { mainContent, quizQuestions } = useMemo(() => extractQuiz(content), [content]);
  const html = useMemo(() => DOMPurify.sanitize(markdownToHtml(mainContent)), [mainContent]);

  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, (scrollTop / docHeight) * 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for quiz reveal
  useEffect(() => {
    if (!endRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setReachedEnd(true); },
      { threshold: 0.5 }
    );
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, []);

  // Word selection handler
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedWord(null);
      return;
    }
    const word = selection.toString().trim();
    if (word && word.length > 1 && word.length < 30 && /^[a-zA-Z'-]+$/.test(word)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedWord({ word, x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  return (
    <div className={cn('min-h-dvh relative bg-background')}>
      {/* Ambient glow background */}
      <div className={cn(
        'fixed inset-0 bg-gradient-to-br opacity-60 pointer-events-none transition-opacity duration-1000',
        TRACK_GLOW[track]
      )} />

      {/* Vertical scroll progress bar */}
      <div className="fixed left-0 top-0 w-1 h-full z-50 bg-muted/30">
        <motion.div
          className="w-full bg-primary rounded-b-full"
          style={{ height: `${scrollProgress}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>

      {/* Back button */}
      <div className="fixed top-4 left-4 z-40">
        <Button variant="ghost" size="sm" onClick={onBack} className="backdrop-blur-md bg-background/50 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      {/* Main content container */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-20 pb-32">
        {/* Glassmorphic hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/40 backdrop-blur-xl bg-card/60 p-8 mb-10 shadow-xl"
        >
          {coverImageUrl && (
            <div className="relative -mx-8 -mt-8 mb-6 rounded-t-2xl overflow-hidden">
              <img src={coverImageUrl} alt="" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className={cn(
              'text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider',
              track === 'kids' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
              track === 'teens' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' :
              'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            )}>
              {level}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {durationMinutes || readingTime} min read
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground leading-tight">{title}</h1>
        </motion.div>

        {/* Lesson content */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose-custom"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          onMouseUp={handleMouseUp}
        >
          <div
            className="text-foreground/85 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>

        {/* End-of-content marker */}
        <div ref={endRef} className="h-4" />

        {/* Quiz reveal */}
        {quizQuestions.length > 0 && (
          <QuizReveal
            lessonId={lessonId}
            questions={quizQuestions}
            visible={reachedEnd}
            track={track}
          />
        )}
      </div>

      {/* Floating toolbar */}
      <FloatingToolbar
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        content={content}
      />

      {/* Word insight popup */}
      {selectedWord && (
        <WordInsightPopup
          word={selectedWord.word}
          x={selectedWord.x}
          y={selectedWord.y}
          level={level}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
};
