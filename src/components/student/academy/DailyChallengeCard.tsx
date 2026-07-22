import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ThumbsUp, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDailyQuest } from '@/hooks/useDailyQuest';

interface DailyChallengeCardProps {
  isDarkMode?: boolean;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  isDarkMode = true,
}) => {
  const { questContext, lastMistake, loading } = useDailyQuest();
  const [reactions, setReactions] = useState({ fire: 0, thumbs: 0, zap: 0 });
  const [accepted, setAccepted] = useState(false);

  const handleReaction = (type: 'fire' | 'thumbs' | 'zap') => {
    setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const challengeText = lastMistake?.word
    ? `Fix your weak spot! Use "${lastMistake.word}" correctly in 3 sentences.`
    : questContext || 'Daily vocab boost: learn 5 new words today!';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.05 }}
    >
      <Card className={`overflow-hidden ${
        isDarkMode
          ? 'bg-[#1a1a2e] border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
          : 'bg-white border-purple-200'
      }`}>
        <CardContent className="p-5">
          {/* Header - like a social post */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Coach
              </p>
              <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock className="w-3 h-3" /> Posted 2h ago
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
              DAILY
            </span>
          </div>

          {/* Challenge body */}
          <div className={`p-4 rounded-xl mb-4 ${
            isDarkMode ? 'bg-[#0f0f1a] border border-purple-500/20' : 'bg-purple-50 border border-purple-100'
          }`}>
            <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {loading ? '⏳ Loading your challenge...' : `🎯 ${challengeText}`}
            </p>
          </div>

          {/* Reaction bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { key: 'fire' as const, emoji: '🔥', count: reactions.fire },
                { key: 'thumbs' as const, emoji: '👍', count: reactions.thumbs },
                { key: 'zap' as const, emoji: '⚡', count: reactions.zap },
              ].map(({ key, emoji, count }) => (
                <button
                  key={key}
                  onClick={() => handleReaction(key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                    isDarkMode
                      ? 'bg-[#0f0f1a] hover:bg-purple-900/30 text-gray-300'
                      : 'bg-gray-100 hover:bg-purple-100 text-gray-600'
                  }`}
                >
                  {emoji} {count > 0 && <span className="text-xs font-bold">{count}</span>}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setAccepted(true)}
              disabled={accepted}
              size="sm"
              className={`font-bold ${
                accepted
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : isDarkMode
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
              }`}
            >
              {accepted ? '✅ Accepted!' : '🚀 Accept Challenge'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
