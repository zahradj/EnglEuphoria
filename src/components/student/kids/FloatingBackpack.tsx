import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Backpack, Map, User, X, Star, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Badge {
  id: string;
  emoji: string;
  name: string;
  unlocked: boolean;
}

interface FloatingBackpackProps {
  badges?: Badge[];
  totalStars?: number;
  onMapClick?: () => void;
  onAvatarClick?: () => void;
}

export const FloatingBackpack: React.FC<FloatingBackpackProps> = ({
  badges = [
    { id: '1', emoji: '🥇', name: 'First Steps', unlocked: true },
    { id: '2', emoji: '🌟', name: 'Star Reader', unlocked: true },
    { id: '3', emoji: '🎨', name: 'Color Master', unlocked: true },
    { id: '4', emoji: '🏆', name: 'Champion', unlocked: false },
    { id: '5', emoji: '🚀', name: 'Rocket Learner', unlocked: false },
    { id: '6', emoji: '🎭', name: 'Drama Star', unlocked: false },
  ],
  totalStars = 1234,
  onMapClick,
  onAvatarClick,
}) => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const unlockedBadges = badges.filter(b => b.unlocked);

  return (
    <>
      {/* Floating Backpack Menu */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-4 bg-white/95 backdrop-blur-lg rounded-full px-6 py-3 shadow-2xl border-4 border-purple-300">
          {/* Backpack Button - Opens Inventory */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsInventoryOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Backpack className="w-8 h-8 text-white" />
            {unlockedBadges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unlockedBadges.length}
              </span>
            )}
          </motion.button>

          {/* Divider */}
          <div className="w-px h-10 bg-purple-200" />

          {/* Map Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMapClick}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Map className="w-7 h-7 text-white" />
          </motion.button>

          {/* Avatar Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAvatarClick}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow text-2xl"
          >
            🦁
          </motion.button>

          {/* Stars Counter */}
          <div className="flex items-center gap-2 bg-yellow-100 rounded-full px-4 py-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-bold text-yellow-700">{totalStars.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {isInventoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setIsInventoryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Backpack className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-800" style={{ fontFamily: "'Fredoka', cursive" }}>
                      My Backpack
                    </h2>
                    <p className="text-purple-600 text-sm">Your amazing collection!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsInventoryOpen(false)}
                  className="rounded-full hover:bg-purple-200"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Badges Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-purple-700">Badges & Stickers</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={badge.unlocked ? { scale: 1.1, rotate: 5 } : {}}
                      className={`
                        flex flex-col items-center p-3 rounded-2xl transition-all
                        ${badge.unlocked 
                          ? 'bg-gradient-to-br from-yellow-100 to-amber-200 cursor-pointer hover:shadow-lg' 
                          : 'bg-gray-200 opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <span className="text-4xl mb-1">{badge.unlocked ? badge.emoji : '🔒'}</span>
                      <span className="text-xs font-medium text-center text-purple-700">
                        {badge.unlocked ? badge.name : '???'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stars Count */}
              <div className="bg-gradient-to-r from-yellow-200 to-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-700">Total Stars Collected</p>
                    <p className="text-2xl font-bold text-yellow-800">{totalStars.toLocaleString()} ⭐</p>
                  </div>
                </div>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4">
                  Shop
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
