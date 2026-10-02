import type { Scene } from '../scenes';
import { unlockAudio } from '../audio';
import engleuphoriaLogo from '@/assets/engleuphoria-logo.png';

/* ---------- Title card ---------- */

export function TitleCardScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'title-card' }>; onNext: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-5 top-5 flex items-center gap-3 animate-[lep1-fade-slide_0.5s_ease-out]">
        <img src={engleuphoriaLogo} alt="EnglEuphoria logo" className="h-16 w-16 rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.4)] ring-2 ring-white/70" />
        <div className="hidden flex-col sm:flex">
          <span className="text-[11px] font-black uppercase tracking-widest text-white/90 drop-shadow">EnglEuphoria</span>
          <span className="text-[10px] font-bold text-white/80 drop-shadow">Playground Hub</span>
        </div>
      </div>
      <div className="absolute right-5 top-5 flex flex-wrap justify-end gap-2">
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.level}</span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.unit}</span>
        <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">{scene.lessonLabel}</span>
      </div>
      <div className="absolute inset-x-0 top-24 flex flex-col items-center px-6 text-center sm:top-20">
        <h1
          className="inline-block -rotate-2 text-6xl leading-[1] sm:text-8xl md:text-9xl"
          style={{
            fontFamily: "'Bungee', 'Fredoka', system-ui, sans-serif",
            background: 'linear-gradient(180deg, #FFF3B0 0%, #FFD34E 35%, #FF8A3D 70%, #E5561A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', WebkitTextStroke: '5px #2A1200',
            paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #B23A00) drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
            letterSpacing: '0.02em', animation: 'lep1-hop 1.8s ease-in-out infinite',
          }}
        >
          {scene.title}
        </h1>
        <p className="mt-2 max-w-xl rounded-full bg-white/85 px-4 py-1 text-sm font-black text-orange-800 shadow-lg ring-2 ring-orange-200 sm:text-base" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>{scene.subtitle} ✨</p>
      </div>
      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
        <button onClick={() => { unlockAudio(); onNext(); }} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-12 py-5 text-2xl font-black text-white shadow-2xl ring-4 ring-white/60 transition hover:scale-105 active:scale-95 animate-pulse">
          Start Lesson →
        </button>
      </div>
    </div>
  );
}
