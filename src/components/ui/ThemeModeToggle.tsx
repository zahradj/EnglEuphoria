import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '@/hooks/useThemeMode';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ThemeModeToggleProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

const SunRay = ({ index, total }: { index: number; total: number }) => {
  const angle = (index / total) * 360;
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      exit={{ scaleY: 0, opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
      className="absolute w-[2px] h-[6px] bg-amber-400 rounded-full"
      style={{ transform: `rotate(${angle}deg) translateY(-10px)`, transformOrigin: 'center center' }}
    />
  );
};

const MoonCrater = ({ size, top, left, delay }: { size: number; top: string; left: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.4, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    transition={{ duration: 0.2, delay }}
    className="absolute bg-slate-400 rounded-full"
    style={{ width: size, height: size, top, left }}
  />
);

export function ThemeModeToggle({ className = '', variant = 'ghost' }: ThemeModeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: string; y: string; bg: string } | null>(null);

  const handleClick = useCallback(() => {
    if (!btnRef.current) {
      toggleTheme();
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const x = `${rect.left + rect.width / 2}px`;
    const y = `${rect.top + rect.height / 2}px`;
    // Target bg is the OPPOSITE theme's bg
    const bg = isDark ? '#FAFAFA' : '#09090B';
    setRipple({ x, y, bg });

    // Toggle theme after a short delay so the ripple starts expanding first
    setTimeout(() => {
      toggleTheme();
    }, 50);
  }, [isDark, toggleTheme]);

  // Clean up ripple after animation
  useEffect(() => {
    if (!ripple) return;
    const timer = setTimeout(() => setRipple(null), 750);
    return () => clearTimeout(timer);
  }, [ripple]);

  return (
    <>
      <Button
        ref={btnRef}
        variant={variant}
        size="icon"
        onClick={handleClick}
        className={`relative w-9 h-9 overflow-hidden ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <motion.div
          className="absolute inset-0 rounded-md"
          initial={false}
          animate={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.1)' }}
          transition={{ duration: 0.4 }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              className="relative flex items-center justify-center"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {[...Array(8)].map((_, i) => (
                <SunRay key={i} index={i} total={8} />
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="w-[10px] h-[10px] bg-gradient-to-br from-amber-300 to-amber-500 rounded-full shadow-lg shadow-amber-400/50"
              />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              className="relative flex items-center justify-center"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative w-[14px] h-[14px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-full shadow-lg"
              >
                <MoonCrater size={3} top="2px" left="3px" delay={0.15} />
                <MoonCrater size={4} top="7px" left="8px" delay={0.2} />
                <MoonCrater size={2} top="4px" left="9px" delay={0.25} />
              </motion.div>
              {[
                { top: '-4px', left: '12px', size: 2, delay: 0.2 },
                { top: '10px', left: '-2px', size: 1.5, delay: 0.25 },
                { top: '-2px', left: '-4px', size: 1, delay: 0.3 },
              ].map((star, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2, delay: star.delay }}
                  className="absolute bg-slate-400 rounded-full"
                  style={{ width: star.size, height: star.size, top: star.top, left: star.left }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Circle Ripple Overlay */}
      {ripple && createPortal(
        <div
          className="fixed inset-0 z-[9999] pointer-events-none theme-ripple"
          style={{
            '--ripple-x': ripple.x,
            '--ripple-y': ripple.y,
            backgroundColor: ripple.bg,
          } as React.CSSProperties}
        />,
        document.body
      )}
    </>
  );
}
