import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, PartyPopper, Sparkles, Trophy, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioService } from '@/services/audioService';

// Above the celebration overlay (z-[100]); canvas-confetti defaults to 100.
const fire = (opts: confetti.Options) => confetti({ zIndex: 250, ...opts });

const CELEBRATION_MS = 2200;

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
      // Played here (not on the teacher's Star button) so the teacher AND the
      // student hear it, in sync with the animation.
      audioService.playBigStarSound(isMilestone);

      // Keep all confetti firing within ~700ms so the overlay (auto-hides at 1000ms)
      // never ends with particles still spawning. Both teacher & student see the
      // celebration for exactly 1 second.
      const colors = isMilestone
        ? ['#ffd700', '#ff6b6b', '#4ecdc4', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff9500', '#00d2d3']
        : ['#ffd700', '#ffed4a', '#ffc107', '#fff176'];

      if (isMilestone) {
        // One big burst + two side cannons — all complete inside 1s.
        fire({
          particleCount: 120,
          spread: 220,
          origin: { y: 0.5, x: 0.5 },
          colors,
          startVelocity: 55,
          scalar: 1.4,
        });
        fire({
          particleCount: 30,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#ffd700', '#ffed4a'],
          shapes: ['star'],
          scalar: 1.8,
        });
        setTimeout(() => {
          fire({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
            startVelocity: 40,
          });
          fire({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
            startVelocity: 40,
          });
        }, 200);
      } else {
        // Joyful multi-colour burst: two cannons from the bottom corners,
        // star-shaped confetti popping out of the star itself, then a light
        // shower from the top. Everything fires in the first ~900ms.
        const party = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9FF3', '#54A0FF', '#FF9500', '#7BED9F', '#FFFFFF'];
        fire({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.85 }, colors: party, startVelocity: 62 });
        fire({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.85 }, colors: party, startVelocity: 62 });
        setTimeout(() => {
          fire({ particleCount: 40, spread: 360, startVelocity: 28, origin: { x: 0.5, y: 0.45 }, colors: ['#FFD700', '#FFE066', '#FFFFFF'], shapes: ['star'], scalar: 1.6, gravity: 0.7 });
        }, 250);
        setTimeout(() => {
          fire({ particleCount: 80, spread: 160, startVelocity: 18, origin: { x: 0.5, y: -0.05 }, colors: party, gravity: 0.9, ticks: 260 });
        }, 550);
      }

      // Total visible time ~2.2s (was 1s — over before a child could enjoy
      // it). Then fire onComplete so the parent can clear the state.
      const timer = setTimeout(() => {
        setShowContent(false);
        onCompleteRef.current?.();
      }, CELEBRATION_MS);

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
            animate={{ opacity: isMilestone ? 0.85 : 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${
              isMilestone 
                ? 'bg-gradient-to-br from-purple-900 via-pink-800 to-yellow-700' 
                : 'bg-[radial-gradient(circle_at_center,rgba(255,200,40,0.55)_0%,rgba(255,140,0,0.25)_35%,rgba(0,0,0,0.25)_75%)]'
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
              {/* Rotating sunburst behind the star */}
              <motion.div
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: 'repeating-conic-gradient(from 0deg, rgba(255,230,120,0.55) 0deg 9deg, transparent 9deg 22.5deg)',
                  WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
                  maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
                }}
              />
              <GlossyStar size={isMilestone ? 200 : 170} />
              {!isMilestone && (
                <motion.span
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: [0, 1.3, 1], y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="absolute -right-6 -top-2 rounded-full bg-white px-3 py-1 text-2xl font-black text-orange-500 shadow-xl ring-4 ring-yellow-300"
                >
                  +1 ⭐
                </motion.span>
              )}
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

/** A glossy golden star (gradient body, white rim, shine highlight). */
function GlossyStar({ size }: { size: number }) {
  const d = 'M50 4 L61.8 36.2 L96 37.6 L69.1 58.8 L78.5 92 L50 72.8 L21.5 92 L30.9 58.8 L4 37.6 L38.2 36.2 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-[0_0_40px_rgba(255,200,0,0.95)]" aria-hidden>
      <defs>
        <linearGradient id="gs-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6A8" />
          <stop offset="45%" stopColor="#FFD21F" />
          <stop offset="100%" stopColor="#FF9A00" />
        </linearGradient>
        <linearGradient id="gs-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#gs-body)" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
      <path d={d} fill="url(#gs-shine)" transform="translate(50 50) scale(0.62) translate(-50 -56)" />
      <circle cx="38" cy="30" r="4" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
