import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Sparkles, MapPin } from 'lucide-react';

interface GhostVector {
  id: string;
  word: string;
  imageUrl?: string;
  phoneme: string;
}

interface GhostVectorRevealProps {
  vectors: GhostVector[];
  isTeacher: boolean;
  onCorrectGuess?: (word: string) => void;
}

export const GhostVectorReveal: React.FC<GhostVectorRevealProps> = ({
  vectors,
  isTeacher,
  onCorrectGuess,
}) => {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleTeacherReveal = (id: string) => {
    if (!isTeacher) return;
    setActiveId(id);
  };

  const handleStudentGuess = (id: string) => {
    if (isTeacher) return;
    setRevealedIds(prev => new Set([...prev, id]));
    const vec = vectors.find(v => v.id === id);
    if (vec) onCorrectGuess?.(vec.word);
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          🗺️ Memory Map — Ghost Vectors
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {isTeacher
            ? 'Click a shadow to give clues. The student must identify the hidden word.'
            : 'Tap the shadow when you know the answer!'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {vectors.map(vec => {
            const isRevealed = revealedIds.has(vec.id);
            const isActive = activeId === vec.id;

            return (
              <motion.div
                key={vec.id}
                className={`relative aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isRevealed
                    ? 'border-[#2E7D32]/30 bg-[#2E7D32]/5'
                    : isActive
                    ? 'border-[#6B21A8]/40 bg-[#6B21A8]/10'
                    : 'border-border bg-muted/20 hover:border-[#6B21A8]/20'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => isTeacher ? handleTeacherReveal(vec.id) : handleStudentGuess(vec.id)}
              >
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.div
                      key="revealed"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-center p-2"
                    >
                      {vec.imageUrl ? (
                        <img src={vec.imageUrl} alt={vec.word} className="w-16 h-16 object-contain mx-auto" />
                      ) : (
                        <Sparkles className="h-8 w-8 text-[#2E7D32] mx-auto" />
                      )}
                      <p className="text-xs font-bold text-[#2E7D32] mt-1">{vec.word}</p>
                      <p className="text-[10px] text-muted-foreground">/{vec.phoneme}/</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hidden"
                      className="text-center"
                    >
                      {/* Ghost silhouette */}
                      <div className="h-16 w-16 mx-auto rounded-full bg-[#6B21A8]/10 flex items-center justify-center">
                        <Eye className={`h-6 w-6 ${isActive ? 'text-[#6B21A8]' : 'text-muted-foreground/30'}`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {isActive ? '🔍 Giving clues...' : '?'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
