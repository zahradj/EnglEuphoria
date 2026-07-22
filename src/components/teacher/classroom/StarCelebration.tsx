import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, PartyPopper, Sparkles, Trophy, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StarCelebrationProps {
  isVisible: boolean;
  starCount: number;
  studentName: string;
  isMilestone?: boolean;
  onComplete: () => void;
}

export const StarCelebration: React.FC<StarCelebrationProps> = ({
  isVisible,
  starCount,
  studentName,
  isMilestone = false,
  onComplete
}) => {
  const [showContent, setShowContent] = useState(false);
  // Hold the latest onComplete in a ref so the effect's dependency list
  // can stay tiny — otherwise an inline arrow from the parent re-runs the
  // effect on every render and the 1-second timer never finishes.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (isVisible) {
      setShowContent(true);

      // Keep all confetti firing within ~700ms so the overlay (auto-hides at 1000ms)
      // never ends with particles still spawning. Both teacher & student see the
      // celebration for exactly 1 second.
      const colors = isMilestone
        ? ['#ffd700', '#ff6b6b', '#4ecdc4', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff9500', '#00d2d3']
        : ['#ffd700', '#ffed4a', '#ffc107', '#fff176'];

      if (isMilestone) {
        // One big burst + two side cannons — all complete inside 1s.
        confetti({
          particleCount: 120,
          spread: 220,
          origin: { y: 0.5, x: 0.5 },
          colors,
          startVelocity: 55,
          scalar: 1.4,
        });
        confetti({
          particleCount: 30,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#ffd700', '#ffed4a'],
          shapes: ['star'],
          scalar: 1.8,
        });
        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
            startVelocity: 40,
          });
          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
            startVelocity: 40,
          });
        }, 200);
      } else {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.6 },
          colors,
          startVelocity: 34,
          scalar: 1,
        });
        setTimeout(() => {
          confetti({
            particleCount: 22,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ffd700'],
            shapes: ['star'],
            scalar: 1.3,
          });
        }, 140);
      }

      // Total visible time: 1 second. Then immediately fire onComplete so the
      // parent can clear the celebration state.
      const timer = setTimeout(() => {
        setShowContent(false);
        onCompleteRef.current?.();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, isMilestone]);

  return (
    <AnimatePresence>
      {isVisible && showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Full background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isMilestone ? 0.85 : 0.7 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${
              isMilestone 
                ? 'bg-gradient-to-br from-purple-900 via-pink-800 to-yellow-700' 
                : 'bg-gradient-to-br from-amber-900/80 via-yellow-800/80 to-orange-900/80'
            }`}
          />

          {/* Animated background rays for milestone */}
          {isMilestone && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.5, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="absolute top-1/2 left-1/2 w-full h-8 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent origin-left"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    transformOrigin: 'left center'
                  }}
                />
              ))}
            </div>
          )}

          {/* Main celebration content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.3, 1], 
              rotate: [0, 15, -15, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              type: "spring", 
              stiffness: 150 
            }}
            className="relative flex flex-col items-center z-10"
          >
            {/* Large star burst background */}
            <div className="absolute inset-0 -m-40">
              {[...Array(isMilestone ? 16 : 8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0.5, 2, 0.5],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: isMilestone ? 3 : 2, 
                    delay: i * 0.1,
                    repeat: isMilestone ? 2 : 1
                  }}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * (isMilestone ? 22.5 : 45)}deg) translateY(-120px)`
                  }}
                >
                  <Sparkles className={`${isMilestone ? 'w-10 h-10' : 'w-8 h-8'} text-yellow-400`} />
                </motion.div>
              ))}
            </div>

            {/* Crown for milestone */}
            {isMilestone && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mb-4"
              >
                <Crown className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.9)]" />
              </motion.div>
            )}

            {/* Main star icon - BIGGER */}
            <motion.div
              animate={isMilestone ? {
                scale: [1, 1.4, 1],
                rotate: [0, 20, -20, 0]
              } : {
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.6, 
                repeat: isMilestone ? 4 : 2,
                repeatType: "reverse"
              }}
              className={`relative ${isMilestone ? 'mb-8' : 'mb-6'}`}
            >
              <Star 
                className={`${isMilestone ? 'w-48 h-48' : 'w-36 h-36'} text-yellow-400 fill-yellow-400 drop-shadow-[0_0_60px_rgba(250,204,21,0.9)]`}
              />
              {isMilestone && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="absolute w-60 h-60 border-4 border-dashed border-yellow-400/60 rounded-full" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="absolute w-72 h-72 border-2 border-dotted border-pink-400/50 rounded-full" />
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Party icons for milestone */}
            {isMilestone && (
              <div className="flex gap-12 mb-6">
                <motion.div
                  animate={{ 
                    y: [0, -30, 0],
                    rotate: [-20, 20, -20]
                  }}
                  transition={{ duration: 0.5, repeat: 6 }}
                >
                  <PartyPopper className="w-16 h-16 text-pink-400 drop-shadow-lg" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5 }}
                >
                  <Trophy className="w-20 h-20 text-yellow-500 drop-shadow-lg" />
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -30, 0],
                    rotate: [20, -20, 20]
                  }}
                  transition={{ duration: 0.5, repeat: 6, delay: 0.2 }}
                >
                  <PartyPopper className="w-16 h-16 text-cyan-400 scale-x-[-1] drop-shadow-lg" />
                </motion.div>
              </div>
            )}

            {/* Star count display - BIGGER TEXT */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              {isMilestone ? (
                <>
                  <motion.h2 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    🎉 SUPERSTAR! 🎉
                  </motion.h2>
                  <p className="text-3xl md:text-4xl font-bold text-yellow-300 mb-3 drop-shadow-lg">
                    {studentName} earned {starCount} stars!
                  </p>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                      textShadow: [
                        '0 0 20px rgba(250,204,21,0.8)',
                        '0 0 40px rgba(250,204,21,1)',
                        '0 0 20px rgba(250,204,21,0.8)'
                      ]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-2xl md:text-3xl text-white font-semibold"
                  >
                    🌟✨ AMAZING ACHIEVEMENT! ✨🌟
                  </motion.div>
                </>
              ) : (
                <>
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
                    ⭐ Great Job! ⭐
                  </h2>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-2">
                    {studentName} earned a star!
                  </p>
                  <p className="text-xl md:text-2xl text-white/90">
                    Total: {starCount} {starCount === 1 ? 'star' : 'stars'}
                  </p>
                </>
              )}
            </motion.div>

            {/* Floating stars for milestone */}
            {isMilestone && (
              <div className="absolute inset-0 -m-48 overflow-visible pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      x: Math.random() * 600 - 300,
                      y: 200 + Math.random() * 150
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: -300 - Math.random() * 300,
                      rotate: Math.random() * 720
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 3,
                      repeat: 1
                    }}
                    className="absolute left-1/2 top-1/2"
                  >
                    <Star className={`${Math.random() > 0.5 ? 'w-6 h-6' : 'w-4 h-4'} text-yellow-400 fill-yellow-400`} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
