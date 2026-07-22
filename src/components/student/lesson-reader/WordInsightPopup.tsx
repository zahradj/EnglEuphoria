import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface WordInsightPopupProps {
  word: string;
  x: number;
  y: number;
  level: string;
  onClose: () => void;
}

interface Insight {
  meaning: string;
  pronunciation: string;
  example: string;
}

export const WordInsightPopup: React.FC<WordInsightPopupProps> = ({
  word,
  x,
  y,
  level,
  onClose,
}) => {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('studio-ai-copilot', {
          body: { mode: 'word-insight', word, level },
        });

        if (fnError) throw fnError;
        setInsight(data);
      } catch (e) {
        console.error('Word insight error:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [word, level]);

  // Position the popup above the selected word
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(Math.max(x - 140, 16), window.innerWidth - 296),
    top: Math.max(y - 180, 16),
    zIndex: 60,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={popupStyle}
        className={cn(
          'w-[280px] rounded-2xl border border-border/40',
          'backdrop-blur-xl bg-card/90 shadow-2xl p-4'
        )}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {/* Word header */}
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-base font-bold text-foreground capitalize">{word}</h4>
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">Couldn't fetch word insight</p>
        ) : insight ? (
          <div className="space-y-2.5">
            {/* Pronunciation */}
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Pronunciation</span>
              <p className="text-sm text-primary font-mono">{insight.pronunciation}</p>
            </div>

            {/* Meaning */}
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Meaning</span>
              <p className="text-sm text-foreground/90">{insight.meaning}</p>
            </div>

            {/* Example */}
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Example</span>
              <p className="text-sm text-foreground/80 italic">"{insight.example}"</p>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
};
