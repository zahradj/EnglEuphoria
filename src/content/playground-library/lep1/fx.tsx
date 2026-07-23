/** Pure-CSS confetti burst — no external deps. Ported from the source LottieFX helper. */
export function Confetti({ count = 40 }: { count?: number }) {
  const colors = ['#FE6A2F', '#FFC93C', '#7BE0FF', '#FF6EA5', '#B8FF7A', '#B892FF'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
        const dist = 220 + Math.random() * 380;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 60;
        const rot = (Math.random() - 0.5) * 720;
        const dur = 900 + Math.random() * 900;
        const delay = Math.random() * 200;
        const color = colors[i % colors.length];
        const w = 6 + Math.random() * 6;
        const h = 10 + Math.random() * 10;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '55%',
              width: w,
              height: h,
              background: color,
              borderRadius: 2,
              opacity: 0,
              animation: `lep1-confetti-fly ${dur}ms cubic-bezier(.15,.7,.3,1) ${delay}ms forwards`,
              // @ts-expect-error CSS custom props
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
              '--rot': `${rot}deg`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes lep1-confetti-fly {
          0%   { opacity: 0; transform: translate(0,0) rotate(0deg); }
          10%  { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); }
        }
      `}</style>
    </div>
  );
}
