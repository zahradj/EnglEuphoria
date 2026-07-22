import { useEffect, useState } from 'react';

interface Props {
  registerLaserHandler: (h: (p: { x: number; y: number; senderId: string }) => void) => () => void;
}

export function LaserDot({ registerLaserHandler }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const off = registerLaserHandler((p) => {
      setPos({ x: p.x, y: p.y });
      setVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 800);
    });
    return () => { off(); if (timer) clearTimeout(timer); };
  }, [registerLaserHandler]);

  if (!pos || !visible) return null;
  return (
    <div
      className="absolute z-30 pointer-events-none transition-opacity"
      style={{
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_18px_6px_rgba(239,68,68,0.7)]" />
    </div>
  );
}
