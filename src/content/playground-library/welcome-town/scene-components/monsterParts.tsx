/* Shared monster drawing (Monster Mix-Up, Guess Who): a square box with the body sticker, eyes, horns, mouth and worn
 * pieces at fixed % positions, so every monster game builds monsters the same way. */

export const EYE_SPOTS: Record<1 | 2 | 3, number[]> = { 1: [50], 2: [38, 62], 3: [30, 50, 70] };
export const HORN_W = [56, 60];
/** Where a worn piece sits on the square monster box (%). */
export const WEAR_AT: Record<'head' | 'face' | 'neck' | 'feet', { left: number; top?: number; bottom?: number; width: number }> = {
  head: { left: 27, bottom: 70, width: 46 },
  face: { left: 22, top: 25, width: 56 },
  neck: { left: 25, top: 61, width: 50 },
  feet: { left: 21, top: 84, width: 58 },
};

export type MonsterKit = {
  body: string; eye: string;
  horns: { label: string; img: string }[];
  mouths: { label: string; img: string }[];
  wear: { word: string; img: string; on: 'head' | 'face' | 'neck' | 'feet' }[];
};

/** A still monster (no animation) filling its parent box; `hue` turns the body (not the horns) another colour. */
export function MonsterFigure({ kit, eyes, horns, mouth, wears, hue = 0 }: { kit: MonsterKit; eyes: 1 | 2 | 3; horns: number; mouth: number; wears: number[]; hue?: number }) {
  return (
    <div className="absolute inset-0">
      {horns >= 0 && kit.horns[horns] && (
        <img src={kit.horns[horns].img} alt="" draggable={false} className="absolute object-contain"
          style={{ bottom: '70%', width: `${HORN_W[horns] ?? 56}%`, left: `${50 - (HORN_W[horns] ?? 56) / 2}%`}} />
      )}
      <img src={kit.body} alt="" draggable={false} className="absolute left-[9%] top-[18%] w-[82%] object-contain drop-shadow-[0_8px_10px_rgba(30,10,60,0.4)]"
        style={{ filter: hue ? `hue-rotate(${hue}deg) saturate(1.1)` : undefined }} />
      {(EYE_SPOTS[eyes] ?? EYE_SPOTS[2]).map((x, i) => (
        <img key={i} src={kit.eye} alt="" draggable={false} className="absolute w-[16%] object-contain" style={{ left: `${x - 8}%`, top: '30%' }} />
      ))}
      {mouth >= 0 && kit.mouths[mouth] && (
        <img src={kit.mouths[mouth].img} alt="" draggable={false} className="absolute left-[33%] w-[34%] object-contain" style={{ top: '49%' }} />
      )}
      {wears.map((w) => {
        const piece = kit.wear[w];
        if (!piece) return null;
        const at = WEAR_AT[piece.on];
        return (
          <img key={w} src={piece.img} alt={piece.word} draggable={false} className="absolute object-contain drop-shadow-[0_4px_6px_rgba(30,10,60,0.35)]"
            style={{ left: `${at.left}%`, width: `${at.width}%`, top: at.top !== undefined ? `${at.top}%` : undefined, bottom: at.bottom !== undefined ? `${at.bottom}%` : undefined }} />
        );
      })}
    </div>
  );
}
