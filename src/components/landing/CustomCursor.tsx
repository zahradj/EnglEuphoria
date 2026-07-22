import { useEffect, useState, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';

type CursorContext = 'default' | 'playground' | 'academy' | 'professional' | 'interactive';

const CURSOR_COLORS: Record<CursorContext, string> = {
  default: '#ffffff',
  playground: '#10B981',
  academy: '#6366F1',
  professional: '#F59E0B',
  interactive: '#ffffff',
};

const CURSOR_SIZES: Record<CursorContext, number> = {
  default: 20,
  playground: 40,
  academy: 40,
  professional: 40,
  interactive: 32,
};

export function CustomCursor() {
  const [context, setContext] = useState<CursorContext>('default');
  const [visible, setVisible] = useState(false);

  const cursorX = useSpring(0, { damping: 25, stiffness: 200 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 200 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    if (!visible) setVisible(true);
  }, [cursorX, cursorY, visible]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cursorEl = target.closest('[data-cursor]') as HTMLElement | null;
    if (cursorEl) {
      const val = cursorEl.getAttribute('data-cursor') as CursorContext;
      if (val in CURSOR_COLORS) {
        setContext(val);
        return;
      }
    }
    // Check if hovering over interactive elements
    const interactive = target.closest('a, button, [role="button"], input, textarea, select');
    setContext(interactive ? 'interactive' : 'default');
  }, []);

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    document.body.classList.add('custom-cursor');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.body.classList.remove('custom-cursor');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseOver, handleMouseLeave]);

  const size = CURSOR_SIZES[context];
  const color = CURSOR_COLORS[context];

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
      style={{
        x: cursorX,
        y: cursorY,
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        mixBlendMode: 'difference',
        translateX: '-50%',
        translateY: '-50%',
        opacity: visible ? 1 : 0,
        transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
      }}
    />
  );
}
