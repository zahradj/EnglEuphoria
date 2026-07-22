import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star, MessageCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VirtualPetWidgetProps {
  petType?: 'lion' | 'panda' | 'bunny';
  petHappiness?: number;
  wordsLearnedToday?: number;
  wordsGoal?: number;
  onFeedPet?: () => void;
}

const petEmojis = {
  lion: '🦁',
  panda: '🐼',
  bunny: '🐰',
};

const petNames = {
  lion: 'Leo',
  panda: 'Bamboo',
  bunny: 'Fluffy',
};

const moodMessages = {
  happy: "I'm so happy! 🎉",
  hungry: "Feed me words! 📚",
  sleepy: "Let's learn together... 💤",
};

const WORDS_OF_THE_DAY = [
  { word: 'Adventure', meaning: 'An exciting experience' },
  { word: 'Curious', meaning: 'Wanting to learn more' },
  { word: 'Brave', meaning: 'Not afraid to try new things' },
  { word: 'Imagine', meaning: 'To create pictures in your mind' },
  { word: 'Explore', meaning: 'To discover new places or ideas' },
  { word: 'Wonderful', meaning: 'Something amazing and great' },
  { word: 'Discover', meaning: 'To find something new' },
];

export const VirtualPetWidget: React.FC<VirtualPetWidgetProps> = ({
  petType = 'lion',
  petHappiness = 50,
  wordsLearnedToday = 0,
  wordsGoal = 5,
  onFeedPet,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const todaysWord = useMemo(() => {
    const dayIndex = new Date().getDate() % WORDS_OF_THE_DAY.length;
    return WORDS_OF_THE_DAY[dayIndex];
  }, []);
  
  const progress = Math.min((wordsLearnedToday / wordsGoal) * 100, 100);
  const canFeed = wordsLearnedToday >= wordsGoal;
  
  const getMood = () => {
    if (petHappiness >= 70) return 'happy';
    if (petHappiness >= 40) return 'hungry';
    return 'sleepy';
  };
  
  const mood = getMood();
  
  const handleFeed = () => {
    if (!canFeed) return;
    setIsAnimating(true);
    onFeedPet?.();
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl p-5 shadow-lg border-2 border-pink-200/50"
      style={{ fontFamily: "'Fredoka', cursive" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          My Pet
        </h3>
        <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-purple-700">{petHappiness}%</span>
        </div>
      </div>
      
      {/* Pet Display */}
      <div className="relative flex flex-col items-center mb-4">
        {/* Pet Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: mood === 'happy' ? [1, 1.1, 1] : 1,
              opacity: mood === 'happy' ? [0.5, 0.8, 0.5] : 0.3,
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full blur-xl"
          />
        </div>
        
        {/* Pet */}
        <motion.div
          animate={{
            y: mood === 'happy' ? [0, -5, 0] : [0, -2, 0],
            rotate: isAnimating ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{
            y: { repeat: Infinity, duration: mood === 'happy' ? 1 : 2 },
            rotate: { duration: 0.5 },
          }}
          className="relative z-10 text-6xl select-none cursor-pointer"
          onClick={handleFeed}
        >
          {petEmojis[petType]}
        </motion.div>
        
        {/* Pet Name */}
        <p className="text-sm font-bold text-purple-700 mt-2">{petNames[petType]}</p>
        
        {/* Mood Bubble */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-white rounded-2xl px-3 py-1 shadow-md border border-pink-200"
        >
          <p className="text-xs text-gray-700">{moodMessages[mood]}</p>
        </motion.div>
        
        {/* Word of the Day Speech Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 bg-white/80 rounded-2xl px-4 py-2 shadow-md border border-purple-200 relative"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white/80" />
          <div className="flex items-center gap-1 mb-1">
            <MessageCircle className="w-3 h-3 text-purple-500" />
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Word of the Day</span>
          </div>
          <p className="text-sm font-bold text-purple-800">{todaysWord.word}</p>
          <p className="text-[10px] text-purple-600">{todaysWord.meaning}</p>
        </motion.div>
        
        {/* Celebration particles */}
        <AnimatePresence>
          {isAnimating && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, y: 0, x: 0, scale: 0 }}
                  animate={{
                    opacity: 0,
                    y: -60,
                    x: (i % 2 === 0 ? 1 : -1) * (20 + i * 10),
                    scale: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="absolute text-2xl"
                >
                  {['⭐', '✨', '💖', '🌟', '💕', '🎉'][i]}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-700 font-medium">Feed me by learning words!</span>
          <span className="text-purple-800 font-bold">
            {wordsLearnedToday}/{wordsGoal}
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-4 bg-pink-200/50 rounded-full overflow-hidden"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Feed Button */}
        <motion.button
          whileHover={canFeed ? { scale: 1.05 } : {}}
          whileTap={canFeed ? { scale: 0.95 } : {}}
          onClick={handleFeed}
          disabled={!canFeed}
          className={`w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
            canFeed
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {canFeed ? (
            <>
              <Sparkles className="w-5 h-5" />
              Feed {petNames[petType]}! 🍎
            </>
          ) : (
            <>Learn {wordsGoal - wordsLearnedToday} more words!</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
