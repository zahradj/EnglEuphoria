// Illustrated full-bleed scenes (vector, drawn in code) shown until the real Canva pictures exist at `${artBase}/bg/<id>.webp`.
// Stills hold still: no zoom, pan or looping scale; the only motion anywhere is the player's opacity cross-fade.
// Brand colours: purple #7c3aed, indigo #4338ca, blue #3b5bdb.
import type { ReactElement } from 'react';

const Sparkles = ({ n = 14, seed = 1, color = '#fff' }: { n?: number; seed?: number; color?: string }) => {
  let a = seed * 9301 + 49297;
  const r = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  return (
    <g fill={color} opacity="0.5">
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={r() * 1000} cy={r() * 480} r={1 + r() * 2.4} />
      ))}
    </g>
  );
};

function Classroom({ tone }: { tone: 'morning' | 'evening' }) {
  const m = tone === 'morning';
  const wallTop = m ? '#dfe7ff' : '#ffd9b0';
  const wallBot = m ? '#f4ecff' : '#caa5d6';
  const sky1 = m ? '#9ed2ff' : '#ff9966';
  const sky2 = m ? '#e8f4ff' : '#7b5fbf';
  const floor1 = m ? '#c79b6d' : '#8a5a4c';
  const floor2 = m ? '#a97b52' : '#5e3b4a';
  const sun = m ? '#fff6c8' : '#ffd28a';
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="ap-scene" aria-hidden="true">
      <defs>
        <linearGradient id={`wall-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={wallTop} /><stop offset="1" stopColor={wallBot} /></linearGradient>
        <linearGradient id={`sky-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky1} /><stop offset="1" stopColor={sky2} /></linearGradient>
        <linearGradient id={`floor-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={floor1} /><stop offset="1" stopColor={floor2} /></linearGradient>
        <linearGradient id={`beam-${tone}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={sun} stopOpacity="0.7" /><stop offset="1" stopColor={sun} stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="1000" height="700" fill={`url(#wall-${tone})`} />
      {/* big window with skyline */}
      <g>
        <rect x="70" y="70" width="330" height="300" rx="16" fill="#fff" opacity="0.9" />
        <rect x="86" y="86" width="298" height="268" rx="8" fill={`url(#sky-${tone})`} />
        <circle cx={m ? 320 : 150} cy={m ? 150 : 250} r="34" fill={sun} opacity="0.95" />
        <g fill={m ? '#7f9bd6' : '#4b3a86'} opacity="0.85">
          <rect x="96" y="270" width="40" height="84" /><rect x="140" y="240" width="50" height="114" /><rect x="196" y="285" width="34" height="69" />
          <rect x="236" y="225" width="56" height="129" /><rect x="298" y="262" width="40" height="92" /><rect x="342" y="290" width="40" height="64" />
        </g>
        <path d="M 235 86 V 354 M 86 220 H 384" stroke="#fff" strokeWidth="10" />
        <polygon points="86,354 384,354 640,700 150,700" fill={`url(#beam-${tone})`} />
      </g>
      {/* whiteboard */}
      <g>
        <rect x="470" y="90" width="440" height="250" rx="12" fill="#f6f7fb" stroke="#b8bdd3" strokeWidth="10" />
        <g strokeLinecap="round" fill="none" strokeWidth="7">
          <path d="M 510 140 Q 560 110 610 140 T 710 140" stroke="#7c3aed" />
          <path d="M 510 190 H 700" stroke="#3b5bdb" /><path d="M 510 230 H 640" stroke="#3b5bdb" />
          <circle cx="780" cy="190" r="34" stroke="#f59e0b" /><path d="M 765 190 l 12 12 l 24 -26" stroke="#22c55e" />
          <path d="M 510 280 H 860" stroke="#e5e7ef" />
        </g>
        <rect x="560" y="340" width="260" height="14" rx="5" fill="#9aa1c0" />
      </g>
      {/* wall posters + clock */}
      <rect x="430" y="20" width="0" height="0" />
      <g>
        <circle cx="905" cy="55" r="30" fill="#fff" stroke="#6b7090" strokeWidth="6" /><path d="M 905 55 V 38 M 905 55 L 918 62" stroke="#4338ca" strokeWidth="5" strokeLinecap="round" />
        <rect x="430" y="40" width="70" height="90" rx="6" fill="#7c3aed" /><rect x="440" y="52" width="50" height="8" rx="3" fill="#fff" opacity="0.8" /><circle cx="465" cy="95" r="16" fill="#ffd166" />
        <rect x="940" y="120" width="60" height="110" rx="6" fill="#3b5bdb" opacity="0.9" />
      </g>
      {/* floor, desks, plant */}
      <rect y="470" width="1000" height="230" fill={`url(#floor-${tone})`} />
      <g stroke="#0000001a" strokeWidth="3">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <path key={i} d={`M ${i * 110 - 10} 470 L ${i * 150 - 200} 700`} />)}</g>
      <g>
        <rect x="-30" y="520" width="330" height="26" rx="10" fill={m ? '#e9b97c' : '#b9805c'} /><rect x="20" y="546" width="14" height="150" fill="#6b4a37" /><rect x="236" y="546" width="14" height="150" fill="#6b4a37" />
        <rect x="720" y="540" width="340" height="26" rx="10" fill={m ? '#e9b97c' : '#b9805c'} /><rect x="770" y="566" width="14" height="140" fill="#6b4a37" /><rect x="1000" y="566" width="14" height="140" fill="#6b4a37" />
        <rect x="90" y="486" width="120" height="34" rx="5" fill="#4338ca" /><rect x="100" y="494" width="100" height="6" rx="3" fill="#fff" opacity="0.5" />
        <path d="M 900 535 q -4 -60 24 -90 q 30 30 24 90 z" fill="#22c55e" /><path d="M 936 535 q -40 -30 -46 -70 q 40 8 56 50 z" fill="#16a34a" /><rect x="898" y="535" width="52" height="40" rx="8" fill="#7c3aed" />
      </g>
      <Sparkles n={m ? 18 : 10} seed={m ? 3 : 8} color={m ? '#fff' : '#ffe9b8'} />
      {!m && <rect width="1000" height="700" fill="#6b3fb0" opacity="0.08" />}
    </svg>
  );
}

function PhoneClose() {
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="ap-scene" aria-hidden="true">
      <defs>
        <radialGradient id="ph-bg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#ffffff" /><stop offset="0.55" stopColor="#e4d9ff" /><stop offset="1" stopColor="#b9a5f7" /></radialGradient>
        <linearGradient id="ph-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6f2ff" /><stop offset="1" stopColor="#dccfff" /></linearGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#ph-bg)" />
      <g opacity="0.55">
        {[[120, 140, 60, '#7c3aed'], [880, 120, 80, '#3b5bdb'], [180, 520, 90, '#4338ca'], [840, 560, 70, '#7c3aed'], [60, 340, 40, '#93c5fd'], [940, 350, 46, '#c4b5fd']].map(([x, y, r, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} opacity="0.5" />
        ))}
      </g>
      <Sparkles n={26} seed={5} color="#c4b5fd" />
      <g transform="translate(500 350)">
        <rect x="-170" y="-310" width="340" height="620" rx="46" fill="#4c2fb8" stroke="#a78bfa" strokeWidth="6" />
        <rect x="-150" y="-290" width="300" height="580" rx="32" fill="url(#ph-screen)" />
        <rect x="-40" y="-290" width="80" height="22" rx="11" fill="#2f1c80" />
        {/* profile header */}
        <circle cx="0" cy="-190" r="54" fill="#ffffff" stroke="#8b5cf6" strokeWidth="5" strokeDasharray="10 8" />
        <text x="0" y="-170" textAnchor="middle" fontSize="64" fontWeight="800" fill="#7c3aed" fontFamily="system-ui">?</text>
        <rect x="-70" y="-110" width="140" height="18" rx="9" fill="#7c3aed" />
        <rect x="-50" y="-82" width="100" height="12" rx="6" fill="#4b4f9a" />
        {/* rows */}
        {[-40, 20, 80, 140].map((y, i) => (
          <g key={y}><rect x="-120" y={y} width="76" height="14" rx="7" fill="#9a8cf0" /><rect x="-30" y={y} width={150 - i * 24} height="14" rx="7" fill="#7c3aed" opacity="0.8" /></g>
        ))}
        <circle cx="-110" cy="215" r="12" fill="#22c55e" /><rect x="-90" y="209" width="90" height="12" rx="6" fill="#4b4f9a" />
        <rect x="-120" y="240" width="240" height="34" rx="17" fill="#7c3aed" />
      </g>
      {/* floating chat bubbles */}
      <g>
        <rect x="90" y="190" width="190" height="64" rx="28" fill="#7c3aed" opacity="0.92" /><circle cx="130" cy="222" r="8" fill="#fff" /><circle cx="160" cy="222" r="8" fill="#fff" opacity="0.7" /><circle cx="190" cy="222" r="8" fill="#fff" opacity="0.45" />
        <rect x="730" y="300" width="190" height="64" rx="28" fill="#3b5bdb" opacity="0.92" /><rect x="756" y="320" width="120" height="10" rx="5" fill="#fff" opacity="0.85" /><rect x="756" y="338" width="80" height="10" rx="5" fill="#fff" opacity="0.6" />
        <rect x="110" y="470" width="170" height="60" rx="26" fill="#4338ca" opacity="0.92" /><rect x="136" y="490" width="110" height="10" rx="5" fill="#fff" opacity="0.8" />
      </g>
    </svg>
  );
}

function Generic({ from, to }: { from: string; to: string }) {
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="ap-scene" aria-hidden="true">
      <defs><linearGradient id={`g-${from}${to}`.replace(/#/g, '')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient></defs>
      <rect width="1000" height="700" fill={`url(#g-${from}${to})`.replace(/#(?=[0-9a-f]{3,6}[0-9a-f]*\))/gi, '')} />
      <circle cx="200" cy="160" r="110" fill="#fff" opacity="0.08" /><circle cx="820" cy="480" r="160" fill="#fff" opacity="0.07" />
      <Sparkles n={20} seed={2} />
    </svg>
  );
}

export function SceneArt({ id, from, to }: { id: string; from: string; to: string }): ReactElement {
  if (id === 'classroom-morning') return <Classroom tone="morning" />;
  if (id === 'classroom-evening') return <Classroom tone="evening" />;
  if (id === 'phone-profile-closeup') return <PhoneClose />;
  return <Generic from={from} to={to} />;
}
