import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessoryData {
  id: string;
  name: string;
  image_url: string | null;
  type: string;
  description: string | null;
  level_name?: string;
}

interface AccessoryUnlockProps {
  accessory: AccessoryData;
  levelNumber?: number;
  hub?: 'playground' | 'academy' | 'professional';
  onClose: () => void;
  onCollect?: () => void;
}

const HUB_THEMES = {
  playground: {
    glowColor: 'bg-yellow-400/30',
    accentColor: 'text-yellow-400',
    buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    particleColor: 'bg-yellow-300',
    ringColor: 'ring-yellow-400/50',
  },
  academy: {
    glowColor: 'bg-cyan-400/30',
    accentColor: 'text-cyan-400',
    buttonBg: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600',
    particleColor: 'bg-cyan-300',
    ringColor: 'ring-cyan-400/50',
  },
  professional: {
    glowColor: 'bg-amber-400/20',
    accentColor: 'text-amber-400',
    buttonBg: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900',
    particleColor: 'bg-amber-300',
    ringColor: 'ring-amber-400/50',
  },
};

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

const ConfettiParticle = ({ index }: { index: number }) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  const size = 4 + Math.random() * 8;
  const delay = Math.random() * 0.8;
  const duration = 2 + Math.random() * 2;
  const rotation = Math.random() * 720;

  return (
    <motion.div
      initial={{ x: `${startX}vw`, y: -20, rotate: 0, opacity: 1 }}
      animate={{ x: `${endX}vw`, y: '110vh', rotate: rotation, opacity: 0 }}
      transition={{ duration, delay, ease: 'easeIn' }}
      className="absolute z-40 rounded-sm"
      style={{
        width: size,
        height: size * (0.4 + Math.random() * 0.6),
        backgroundColor: color,
      }}
    />
  );
};

export const AccessoryUnlock: React.FC<AccessoryUnlockProps> = ({
  accessory,
  levelNumber = 1,
  hub = 'playground',
  onClose,
  onCollect,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [collected, setCollected] = useState(false);
  const theme = HUB_THEMES[hub];

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCollect = async () => {
    setCollected(true);
    toast.success(`${accessory.name} added to your collection!`, { icon: '🏆' });
    onCollect?.();
    setTimeout(onClose, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 overflow-hidden"
      >
        {/* Confetti */}
        {showConfetti && (
          <>
            {Array.from({ length: 60 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Rotating glow ring */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1.5, rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className={`absolute w-64 h-64 ${theme.glowColor} rounded-full blur-3xl`}
        />

        {/* Secondary pulsing glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.3 }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute w-96 h-96 ${theme.glowColor} rounded-full blur-[80px]`}
        />

        {/* Sparkle particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos((i / 8) * Math.PI * 2) * 140,
              y: Math.sin((i / 8) * Math.PI * 2) * 140,
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
            className={`absolute w-2 h-2 ${theme.particleColor} rounded-full`}
          />
        ))}

        {/* Main content */}
        <motion.div
          initial={{ y: 300, scale: 0, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.3 }}
          className="relative z-10 text-center px-8"
        >
          {/* Trophy burst icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 8, stiffness: 120, delay: 0.5 }}
            className="mb-4"
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm ring-2 ${theme.ringColor}`}>
              <Trophy className={`h-8 w-8 ${theme.accentColor}`} />
            </div>
          </motion.div>

          {/* Accessory image */}
          <motion.div
            initial={{ y: 60, scale: 0.5, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 80, delay: 0.6 }}
            className="relative mb-8"
          >
            {accessory.image_url ? (
              <motion.img
                src={accessory.image_url}
                alt={accessory.name}
                className="w-48 h-48 mx-auto drop-shadow-[0_0_40px_rgba(255,215,0,0.4)] object-contain"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <motion.div
                className={`w-48 h-48 mx-auto rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ${theme.ringColor}`}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className={`h-20 w-20 ${theme.accentColor}`} />
              </motion.div>
            )}
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h2 className="text-white text-3xl font-bold tracking-tight">
              Level {levelNumber} Complete!
            </h2>
            <p className={`${theme.accentColor} text-xl font-semibold mt-2`}>
              You unlocked: {accessory.name}
            </p>
            {accessory.description && (
              <p className="text-white/60 text-sm mt-2 max-w-xs mx-auto">
                {accessory.description}
              </p>
            )}
          </motion.div>

          {/* Action button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-8"
          >
            {collected ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-lg"
              >
                <Sparkles className="h-5 w-5" /> Added to Collection!
              </motion.div>
            ) : (
              <Button
                onClick={handleCollect}
                className={`px-8 py-3 h-auto text-lg font-bold rounded-full text-white shadow-xl shadow-black/30 ${theme.buttonBg} transition-transform hover:scale-105`}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Add to Collection
              </Button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
