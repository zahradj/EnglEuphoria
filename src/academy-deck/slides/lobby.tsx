import { useEffect } from 'react';
import { useDeck } from '../ctx';
import { partsFor, type DeckScript, type TitleSlide } from '../types';
import { levelLine } from '../hub';

/** The Academy lobby: the first page of every lesson. It presents the hub (level, season, episode), the mission (objective and "I can" goals), the crew and the quest path, like the start screen of a game. */
export function LobbyView({ slide, script, onStart }: { slide: TitleSlide; script: DeckScript; onStart?: () => void }) {
  const { done, artBase } = useDeck();
  useEffect(() => done(), [done]);
  const parts = partsFor(script);
  const info = levelLine(script);
  return (
    <div className="ad-lobby" aria-label="Lesson lobby">
      <div className="ad-lobby-hero">
        <span className="ad-lobby-kicker"><HubMark /> EnglEuphoria Academy · {info.level}{info.season ? ` · Season ${info.season}` : ''}{info.episode ? ` · Episode ${info.episode}` : ''}</span>
        <h1>{slide.heading}</h1>
        <p>{slide.sub}</p>
        <div className="ad-crew" aria-label="Your crew">
          {script.cast.map((c) => (
            <span key={c} className="ad-crew-one">
              {artBase ? <img src={`${artBase}/cast/${c.toLowerCase()}/happy.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} /> : null}
              <b>{c}</b>{c === 'Vee' && <small>host</small>}
            </span>
          ))}
        </div>
        {onStart && <button type="button" className="ad-start" onClick={onStart}>Start the mission →</button>}
      </div>
      <div className="ad-lobby-side">
        <section className="ad-lobby-card" aria-label="Your mission">
          <h2>Your mission</h2>
          <ul>{script.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </section>
        <section className="ad-lobby-card" aria-label="Quest path">
          <h2>The quest · {parts.reduce((a, p) => a + p.minutes, 0)} min</h2>
          <ol className="ad-lobby-path">
            {parts.map((p, i) => <li key={p.name}><i>{i + 1}</i><span>{p.name}</span><em>{p.minutes} min</em></li>)}
          </ol>
        </section>
      </div>
    </div>
  );
}

/** The Academy mark: a keyhole inside a rounded shield (no mascot). */
export function HubMark({ size = 22 }: { size?: number }) {
  return (
    <svg className="ad-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.5 28 7v8.2c0 7.4-4.8 12.5-12 14.3C8.8 27.700 4 22.600 4 15.200V7z" fill="currentColor" opacity="0.14" />
      <path d="M16 2.5 28 7v8.2c0 7.4-4.8 12.5-12 14.3C8.8 27.700 4 22.600 4 15.200V7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="13" r="3.2" fill="currentColor" />
      <path d="M14.600 15.500h2.800l1 7h-4.800z" fill="currentColor" />
    </svg>
  );
}
