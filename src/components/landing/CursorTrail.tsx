import React, { useEffect, useRef, useCallback } from "react";
import { useHeroTheme, GROUP_THEMES } from "@/contexts/HeroThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

const MAX_PARTICLES = 120;

/** Map each hero theme index to a matching color palette. */
const THEME_PALETTES: string[][] = [
  // Kids / Playground — Yellow-Orange
  ["#FF9F1C", "#FFBF00", "#F59E0B", "#F97316", "#FBBF24"],
  // Teens / Academy — Purple-Blue
  ["#6366F1", "#A855F7", "#8B5CF6", "#7C3AED", "#818CF8"],
  // Adults / Success Hub — Emerald-Teal
  ["#10B981", "#059669", "#0F766E", "#34D399", "#2DD4BF"],
];

interface CursorTrailProps {
  /**
   * Optional override for the theme palette index.
   * 0 = Playground (yellow/orange), 1 = Academy (purple/blue), 2 = Professional (emerald/teal).
   * When omitted, the active hero-theme index is used.
   */
  themeIndex?: 0 | 1 | 2;
}

export function CursorTrail({ themeIndex }: CursorTrailProps = {}) {
  const { activeIndex } = useHeroTheme();
  const resolvedIndex = themeIndex ?? activeIndex;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const colorsRef = useRef<string[]>(THEME_PALETTES[resolvedIndex] ?? THEME_PALETTES[0]);
  const rafId = useRef<number>(0);

  // Update the color ref when the resolved index changes — existing particles
  // keep their original color and fade out naturally for a smooth transition.
  useEffect(() => {
    colorsRef.current = THEME_PALETTES[resolvedIndex] ?? THEME_PALETTES[0];
  }, [resolvedIndex]);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }, []);

  // Skip the canvas particle loop entirely on touch / coarse-pointer devices
  // and when the user prefers reduced motion. Keeps mobile load light.
  const isLightweightDevice =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(pointer: coarse)").matches ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (isLightweightDevice) return;
    resize();
    window.addEventListener("resize", resize);

    const spawnAt = (x: number, y: number) => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        if (particles.current.length >= MAX_PARTICLES) {
          particles.current.shift();
        }
        const maxLife = 30 + Math.random() * 15;
        const palette = colorsRef.current;
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 0.5,
          size: 3 + Math.random() * 3.5,
          life: maxLife,
          maxLife,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const onMove = (e: MouseEvent) => spawnAt(e.clientX, e.clientY);

    const onTouch = (e: TouchEvent) => {
      for (let t = 0; t < e.touches.length; t++) {
        spawnAt(e.touches[t].clientX, e.touches[t].clientY);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });

    const loop = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, c.width, c.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.size *= 0.97;

        if (p.life <= 0 || p.size < 0.3) {
          particles.current.splice(i, 1);
          continue;
        }

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      cancelAnimationFrame(rafId.current);
    };
  }, [resize, isLightweightDevice]);

  if (isLightweightDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
    />
  );
}
