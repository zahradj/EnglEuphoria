import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { getWarmUpMystery, MistakeAsset } from '@/services/mistakeRepositoryService';
import { Eye, EyeOff, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface WarmUpMysteryProps {
  studentId: string;
  studentName: string;
  isTeacher: boolean;
  onComplete?: (word: string, correct: boolean) => void;
}

export const WarmUpMystery: React.FC<WarmUpMysteryProps> = ({
  studentId,
  studentName,
  isTeacher,
  onComplete,
}) => {
  const [mystery, setMystery] = useState<MistakeAsset | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const asset = await getWarmUpMystery(studentId);
      setMystery(asset);
      setLoading(false);
    };
    load();
  }, [studentId]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleComplete = useCallback((correct: boolean) => {
    setCompleted(true);
    onComplete?.(mystery?.word || '', correct);
  }, [mystery, onComplete]);

  if (loading) return null;
  if (!mystery) return null;

  return (
    <AnimatePresence>
      {!completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-2 border-[#6B21A8]/20 bg-gradient-to-br from-[#6B21A8]/[0.03] to-transparent shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#6B21A8] flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                🕵️ Warm-Up Mystery
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isTeacher
                  ? `${studentName} struggled with this sound last session. Can they remember it today?`
                  : 'The Wizard has a mystery for you! Can you remember this sound?'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mystery display */}
              <div className="flex items-center justify-center py-6">
                {!revealed ? (
                  <motion.div
                    className="h-24 w-24 rounded-2xl bg-[#6B21A8]/10 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isTeacher ? handleReveal : undefined}
                  >
                    <HelpCircle className="h-12 w-12 text-[#6B21A8]/40" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-bold text-[#6B21A8] font-inter">
                      {mystery.word}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Sound: /{mystery.word?.charAt(0).toLowerCase()}/
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Teacher context */}
              {isTeacher && (
                <div className="p-2 rounded-lg bg-muted/30 border border-border">
                  <p className="text-[10px] text-muted-foreground">
                    <strong>Previous error:</strong> {mystery.context || 'Pronunciation difficulty'}
                    {mystery.errorType && ` (${mystery.errorType})`}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isTeacher && !revealed && (
                  <Button
                    size="sm"
                    onClick={handleReveal}
                    className="flex-1 bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Reveal to Student
                  </Button>
                )}
                {revealed && isTeacher && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleComplete(true)}
                      className="flex-1 bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Correct!
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(false)}
                      className="flex-1 border-[#EF5350]/30 text-[#EF5350] gap-1"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Needs More Practice
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
