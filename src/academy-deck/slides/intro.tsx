import { useEffect, useState } from 'react';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import { Bubble } from '../Stage';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { chapterOfLesson } from '../../curriculum/academy/arcs';
import type { BadgeSlide, BriefSlide, DialSlide, TitleSlide } from '../types';
import { Panel } from './shared';

export function TitleView({ slide }: { slide: TitleSlide }) {
  const { done, lessonId } = useDeck();
  useEffect(() => done(), [done]);
  // the Season arc: "Chapter 3 of 8" and its sub-question, for every lesson that has a blueprint
  const chapter = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === lessonId)?.chapter ?? (lessonId ? chapterOfLesson(lessonId) : undefined);
  return (
    <div className="ad-title">
      <span className="ad-title-kicker">Academy · Episode</span>
      <h1>{slide.heading}</h1>
      <p>{slide.sub}</p>
      {chapter && <p className="ad-title-chapter" data-chapter><b>Chapter {chapter.no} of 8 · {chapter.title}</b><span>{chapter.question}</span></p>}
    </div>
  );
}

/** Mission card: tap each face-down stamp card to flip it. */
export function BriefView({ slide }: { slide: BriefSlide }) {
  const { done } = useDeck();
  const [open, setOpen] = useState<string[]>([]);
  useEffect(() => {
    if (open.length === slide.stamps.length) done();
  }, [open, slide.stamps.length, done]);
  return (
    <>
      <div className="ad-top"><Bubble who="Vee" side="left">{slide.say}</Bubble></div>
      <Panel title={slide.heading}>
        <div className="ad-stampcards">
          {slide.stamps.map((s) => (
            <button key={s.id} type="button" className="ad-stampcard" data-open={open.includes(s.id)} onClick={() => !open.includes(s.id) && setOpen([...open, s.id])} aria-label={open.includes(s.id) ? s.label : 'Mission card, tap to flip'}>
              <span className="ad-stampcard-face ad-stampcard-back">?</span>
              <span className="ad-stampcard-face ad-stampcard-front"><b><Icon name={s.icon} /></b><i>{s.label}</i></span>
            </button>
          ))}
        </div>
        <p className="ad-hint-line">{open.length < slide.stamps.length ? `Tap the cards to flip them (${open.length}/${slide.stamps.length})` : 'Three stamps to win. Let’s go!'}</p>
      </Panel>
    </>
  );
}

/** Type your name on a name badge. Any name or nickname is fine. */
export function BadgeView({ slide }: { slide: BadgeSlide }) {
  const { setVars, done, vars } = useDeck();
  const [name, setName] = useState(vars.name ?? '');
  const [age, setAge] = useState(vars.age ?? '');
  const clean = name.replace(/[{}<>]/g, '').trim();
  const ready = !!clean && (!slide.ages || !!age);
  return (
    <Panel title={slide.prompt}>
      <div className="ad-badge" aria-live="polite">
        <span className="ad-badge-top">HELLO · my name is</span>
        <span className="ad-badge-name">{clean || '…'}</span>
      </div>
      <div className="ad-starter-row">
        <span className="ad-starter">{slide.starter}</span>
        <input className="ad-input" maxLength={14} value={name} placeholder="your name" aria-label={`${slide.starter} …`} onChange={(e) => setName(e.target.value)} />
      </div>
      {slide.ages && (
        <div className="ad-field">
          <div className="ad-starter-row"><span className="ad-starter">I am</span>
            <div className="ad-tick-opts" role="radiogroup" aria-label="My age">
              {slide.ages.map((a) => <button key={a} type="button" role="radio" aria-checked={age === String(a)} className="ad-btn ad-btn-small" data-on={age === String(a)} onClick={() => setAge(String(a))}>{a}</button>)}
            </div>
          </div>
        </div>
      )}
      <p className="ad-hint-line">Any name or nickname is fine. We only use it in this lesson.</p>
      <div className="ad-row">
        <button type="button" className="ad-btn ad-btn-primary" disabled={!ready} onClick={() => { setVars({ name: clean, ...(age ? { age } : {}) }); done(); }}>That’s me ▸</button>
      </div>
    </Panel>
  );
}

/** Difficulty select: Chill (lots of help) / Normal / Push (a little help). The student's choice; it changes the model shown in the Mission. */
export function DialView({ slide }: { slide: DialSlide }) {
  const { vars, setVars, done } = useDeck();
  const pick = (d: string) => {
    setVars({ dial: d });
    done();
  };
  const OPTS: [string, string, string, string][] = [['chill', 'leaf', 'Chill', 'Lots of help: a long model on the screen'], ['normal', 'bolt', 'Normal', 'A medium model'], ['push', 'rocket', 'Push', 'A little help: short model, more to say']];
  return (
    <Panel title={slide.prompt}>
      <div className="ad-dials-choice" role="radiogroup" aria-label="How much help do you want?">
        {OPTS.map(([id, icon, name, desc]) => (
          <button key={id} type="button" role="radio" aria-checked={vars.dial === id} className="ad-dialopt" data-on={vars.dial === id} onClick={() => pick(id)}>
            <b><Icon name={icon} /></b><strong>{name}</strong><span>{desc}</span>
          </button>
        ))}
      </div>
      <p className="ad-hint-line">You can change it later. There is no wrong choice.</p>
    </Panel>
  );
}
