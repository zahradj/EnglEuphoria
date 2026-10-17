import type { Burst, Floater } from './useFx';

/** Renders the effects of useFx over the stage. Purely visual (aria-hidden). */
export function FxLayer({ bursts, floaters }: { bursts: Burst[]; floaters: Floater[] }) {
  return (
    <div className="av-fx" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="av-burst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 45}deg` }} />)}
        </span>
      ))}
      {floaters.map((f) => <span key={f.id} className="av-float" style={{ left: `${f.x}%`, top: `${f.y}%` }}>{f.text}</span>)}
    </div>
  );
}
