import React, { useState, useMemo } from 'react';
import { ContextGame as ContextGameType, TargetGroup, GameResult } from '@/types/ironLMS';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, X, RotateCcw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextGameProps {
  game: ContextGameType;
  targetGroup: TargetGroup;
  onComplete?: (result: GameResult) => void;
  onProgress?: (current: number, total: number) => void;
}

export function ContextGame({ game, targetGroup, onComplete, onProgress }: ContextGameProps) {
  const [exploredWords, setExploredWords] = useState<Set<string>>(new Set());
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const styles = getStyles(targetGroup);
  const totalWords = game.clickableWords.length;

  // Create a map for quick lookup
  const wordMap = useMemo(() => {
    const map = new Map<string, string>();
    game.clickableWords.forEach(cw => {
      map.set(cw.word.toLowerCase(), cw.definition);
    });
    return map;
  }, [game.clickableWords]);

  // Parse story text and identify clickable words
  const parsedContent = useMemo(() => {
    const words = game.storyText.split(/(\s+)/);
    return words.map((segment, idx) => {
      const cleanWord = segment.replace(/[.,!?;:'"]/g, '').toLowerCase();
      const isClickable = wordMap.has(cleanWord);
      return { segment, isClickable, cleanWord, key: idx };
    });
  }, [game.storyText, wordMap]);

  const handleWordClick = (word: string) => {
    setActiveWord(word);
    
    if (!exploredWords.has(word)) {
      const newExplored = new Set(exploredWords).add(word);
      setExploredWords(newExplored);
      onProgress?.(newExplored.size, totalWords);

      if (newExplored.size >= totalWords) {
        setTimeout(() => {
          setIsComplete(true);
          onComplete?.({
            score: totalWords,
            maxScore: totalWords
          });
        }, 500);
      }
    }
  };

  const handleRestart = () => {
    setExploredWords(new Set());
    setActiveWord(null);
    setIsComplete(false);
    onProgress?.(0, totalWords);
  };

  const getDefinition = (word: string) => wordMap.get(word) || '';

  if (isComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("text-center py-8 px-6 rounded-2xl", styles.completeBg)}
      >
        <div className="mb-4">
          {targetGroup === 'playground' ? (
            <span className="text-6xl">📚✨</span>
          ) : (
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          )}
        </div>
        <h3 className={cn("text-2xl font-bold mb-2", styles.completeTitle)}>
          {targetGroup === 'playground' ? '🌟 You Found All Words! 🌟' : 
           targetGroup === 'academy' ? 'All Words Explored!' : 'Reading Complete'}
        </h3>
        <p className="text-lg text-muted-foreground mb-4">
          You discovered <span className="font-bold text-primary">{totalWords}</span> new words!
        </p>
        <Button onClick={handleRestart} className={styles.button}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {targetGroup === 'playground' ? 'Read Again! 📖' : 'Read Again'}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className={cn("h-6 w-6", styles.icon)} />
          <h3 className={cn("text-xl font-bold", styles.title)}>
            {targetGroup === 'playground' && '📖 '}{game.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Found: {exploredWords.size}/{totalWords}
          </span>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-2">
        {game.clickableWords.map((cw, idx) => (
          <motion.div 
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: exploredWords.has(cw.word.toLowerCase()) ? 1.2 : 1 }}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              exploredWords.has(cw.word.toLowerCase()) 
                ? styles.dotActive 
                : styles.dotInactive
            )}
          />
        ))}
      </div>

      {/* Story text */}
      <div className={cn("p-6 rounded-xl", styles.storyBg)}>
        <p className="text-lg leading-relaxed">
          {parsedContent.map(({ segment, isClickable, cleanWord, key }) => {
            if (!isClickable) {
              return <span key={key}>{segment}</span>;
            }

            const isExplored = exploredWords.has(cleanWord);
            const isActive = activeWord === cleanWord;

            return (
              <motion.span
                key={key}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleWordClick(cleanWord)}
                className={cn(
                  "cursor-pointer px-1 py-0.5 rounded transition-all inline-block",
                  isExplored ? styles.wordExplored : styles.wordClickable,
                  isActive && styles.wordActive
                )}
              >
                {segment}
              </motion.span>
            );
          })}
        </p>
      </div>

      {/* Instruction */}
      <p className={cn("text-sm text-center", styles.instruction)}>
        {targetGroup === 'playground' 
          ? '👆 Tap the colorful words to learn what they mean!' 
          : 'Click on the highlighted words to see their definitions.'}
      </p>

      {/* Word definition popup */}
      <AnimatePresence>
        {activeWord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn("p-5 rounded-xl shadow-lg border", styles.definitionCard)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {targetGroup === 'playground' && <span className="text-xl">📝</span>}
                <h4 className="font-bold text-lg capitalize">{activeWord}</h4>
              </div>
              <button 
                onClick={() => setActiveWord(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-muted-foreground">{getDefinition(activeWord)}</p>
            <div className="mt-3 flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Future: Add text-to-speech
                }}
              >
                <Volume2 className="h-4 w-4" />
                Listen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStyles(group: TargetGroup) {
  switch (group) {
    case 'playground':
      return {
        icon: 'text-orange-500',
        title: 'text-orange-600',
        storyBg: 'bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200',
        wordClickable: 'bg-orange-200 text-orange-800 hover:bg-orange-300 font-medium',
        wordExplored: 'bg-green-200 text-green-800 font-medium',
        wordActive: 'ring-2 ring-orange-500',
        dotActive: 'bg-green-500',
        dotInactive: 'bg-orange-200',
        instruction: 'text-orange-600',
        definitionCard: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200',
        button: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white',
        completeBg: 'bg-gradient-to-br from-orange-100 to-yellow-100',
        completeTitle: 'text-orange-600'
      };
    case 'academy':
      return {
        icon: 'text-purple-500',
        title: 'text-purple-600',
        storyBg: 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200',
        wordClickable: 'bg-purple-200 text-purple-800 hover:bg-purple-300 font-medium',
        wordExplored: 'bg-green-200 text-green-800 font-medium',
        wordActive: 'ring-2 ring-purple-500',
        dotActive: 'bg-green-500',
        dotInactive: 'bg-purple-200',
        instruction: 'text-purple-600',
        definitionCard: 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200',
        button: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
        completeBg: 'bg-gradient-to-br from-purple-100 to-blue-100',
        completeTitle: 'text-purple-600'
      };
    default: // hub
      return {
        icon: 'text-primary',
        title: 'text-foreground',
        storyBg: 'bg-muted/50 border border-border',
        wordClickable: 'bg-primary/20 text-primary hover:bg-primary/30 font-medium',
        wordExplored: 'bg-green-100 text-green-800 font-medium',
        wordActive: 'ring-2 ring-primary',
        dotActive: 'bg-green-500',
        dotInactive: 'bg-muted-foreground/30',
        instruction: 'text-muted-foreground',
        definitionCard: 'bg-card border-border',
        button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        completeBg: 'bg-muted',
        completeTitle: 'text-foreground'
      };
  }
}
