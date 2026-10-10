import { useMemo, useState } from 'react';
import { useDeck } from '../ctx';
import type { CardSlide, WrapSlide } from '../types';
import { Panel } from './shared';

/** Sign-up card: fill it with the model beside it, then press Print and the card prints out. */
export function CardView({ slide }: { slide: CardSlide }) {
  const { vars, setVars, done, award, stamps } = useDeck();
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [nation, setNation] = useState('');
  const [printed, setPrinted] = useState(false);
  const ok = age && country.trim() && nation.trim();
  const rows = useMemo(() => [['Name', vars.name || '—'], ['Letters', vars.spelled || '—'], ['Age', age || '—'], ['Country', country.trim() || '—'], ['Nationality', nation.trim() || '—'], ['Member number', vars.num || '4-2-7']], [vars, age, country, nation]);
  const print = () => {
    setVars({ age, country: country.trim(), nationality: nation.trim() });
    setPrinted(true);
    if (!stamps.includes('card')) award('card');
    done();
  };
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-cardgrid">
        <div className="ad-model" aria-label="Model">
          <span className="ad-model-title">👀 Model: Ava’s card</span>
          {slide.model.map((m) => (
            <p key={m.label}><b>{m.label}</b> {m.text}</p>
          ))}
        </div>
        <div className="ad-form">
          <div className="ad-field">
            <label>My age</label>
            <div className="ad-tick-opts" role="radiogroup" aria-label="My age">
              {slide.ages.map((a) => (
                <button key={a} type="button" role="radio" aria-checked={age === String(a)} className="ad-btn ad-btn-small" data-on={age === String(a)} onClick={() => setAge(String(a))}>{a}</button>
              ))}
            </div>
            {age && <p className="ad-yoursentence">✅ I am {age}.</p>}
          </div>
          <div className="ad-field">
            <label htmlFor="ad-country">My country</label>
            <div className="ad-starter-row"><span className="ad-starter">I am from</span><input id="ad-country" className="ad-input" maxLength={20} value={country} placeholder="Brazil" onChange={(e) => setCountry(e.target.value.replace(/[{}<>]/g, ''))} /></div>
          </div>
          <div className="ad-field">
            <label htmlFor="ad-nation">My nationality</label>
            <div className="ad-starter-row"><span className="ad-starter">I am</span><input id="ad-nation" className="ad-input" maxLength={20} value={nation} placeholder="Brazilian" onChange={(e) => setNation(e.target.value.replace(/[{}<>]/g, ''))} /></div>
            <p className="ad-fieldclue">💡 {slide.nationalities.join(' · ')}</p>
          </div>
        </div>
      </div>
      <div className="ad-printer">
        <div className="ad-printslot" />
        <div className="ad-printcard" data-printed={printed} aria-live="polite">
          <b>🪪 CLUB SIGN-UP CARD</b>
          {rows.map(([k, v]) => (
            <p key={k}><span>{k}</span><i>{v}</i></p>
          ))}
        </div>
      </div>
      <div className="ad-row"><button type="button" className="ad-btn ad-btn-primary" disabled={!ok || printed} onClick={print}>🖨️ Print my card</button></div>
    </Panel>
  );
}

/** Wrap: stamps collected, can-do ticks (yes / almost / not yet), homework, and the clue for next time. */
export function WrapView({ slide }: { slide: WrapSlide }) {
  const { stamps, done, setVars } = useDeck();
  const [tick, setTick] = useState<Record<number, 'yes' | 'almost' | 'not yet'>>({});
  const [flip, setFlip] = useState(false);
  const all = Object.keys(tick).length === slide.ticks.length;
  const cycle = (i: number) => setTick({ ...tick, [i]: tick[i] === 'yes' ? 'almost' : tick[i] === 'almost' ? 'not yet' : 'yes' });
  return (
    <Panel title={slide.heading} wide>
      <div className="ad-stamps" aria-label="Stamps collected">
        {[['spell', '🔤', 'Spell'], ['number', '🔢', 'Number'], ['passport', '🛂', 'Passport'], ['card', '🪪', 'Card']].map(([id, icon, label]) => (
          <span key={id} className="ad-stampbadge" data-got={stamps.includes(id)}><b>{icon}</b><i>{label}</i></span>
        ))}
      </div>
      <p className="ad-hint-line">Tap each line: yes · almost · not yet. Honest is best!</p>
      <div className="ad-ticks">
        {slide.ticks.map((t, i) => (
          <button key={i} type="button" className="ad-tickrow" data-v={tick[i] ?? ''} onClick={() => cycle(i)}>
            <span>{t}</span>
            <b>{tick[i] ?? 'tap'}</b>
          </button>
        ))}
      </div>
      <p className="ad-homework">📝 {slide.homework}</p>
      <button type="button" className="ad-clue-card" data-flip={flip} onClick={() => all && (setFlip(true), setVars({ ticks: Object.values(tick).join(',') }), done())} disabled={!all} aria-label="Clue for next time">
        {flip ? slide.clue : all ? '🔎 Tap to see the clue for next time' : '🔒 Answer all lines to unlock the clue'}
      </button>
    </Panel>
  );
}
