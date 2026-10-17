// Loot flies into the bag: a small sticker (Word Card picture or a gem / trophy / clue glyph) arcs from where it was earned to the Bag button.
// DOM + Web Animations only, removed when done. Calm mode and jsdom (no Web Animations): nothing flies, the bag's counter alone changes.
import type { LootKind } from '../engine/quest';

const GLYPH: Record<LootKind, string> = { gem: '◆', wordcard: '✦', trophy: '♛', clue: '⌕' };

export function flyLoot(root: HTMLElement | null, from: { x: number; y: number }, kind: LootKind, artUrl: string | undefined, calm: boolean, delay = 0): void {
  if (calm || !root || typeof root.animate !== 'function') return;
  const bag = root.querySelector<HTMLElement>('.avq-bagbtn');
  if (!bag) return;
  const r = root.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  if (!r.width || !b.width) return;
  const el = document.createElement('span');
  el.className = 'avq-flyer'; el.dataset.kind = kind; el.setAttribute('aria-hidden', 'true');
  if (artUrl) { const im = document.createElement('img'); im.src = artUrl; im.alt = ''; im.draggable = false; im.onerror = () => { im.remove(); el.textContent = GLYPH[kind]; }; el.appendChild(im); } else el.textContent = GLYPH[kind];
  const sx = (from.x / 100) * r.width; const sy = (from.y / 100) * r.height;
  Object.assign(el.style, { left: `${sx}px`, top: `${sy}px` });
  root.appendChild(el);
  const dx = b.left + b.width / 2 - r.left - sx; const dy = b.top + b.height / 2 - r.top - sy;
  const a = el.animate([
    { transform: 'translate(-50%,-50%) scale(0.2) rotate(-12deg)', opacity: 0 },
    { transform: 'translate(-50%,-50%) scale(1.25) rotate(4deg)', opacity: 1, offset: 0.18 },
    { transform: `translate(calc(-50% + ${dx * 0.3}px), calc(-50% - 54px)) scale(1.05) rotate(8deg)`, opacity: 1, offset: 0.45 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.3) rotate(0deg)`, opacity: 0.2 },
  ], { duration: 900, delay, easing: 'cubic-bezier(0.3, 0.1, 0.3, 1)', fill: 'backwards' });
  a.onfinish = () => el.remove();
  a.oncancel = () => el.remove();
}
