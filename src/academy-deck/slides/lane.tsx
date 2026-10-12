import { useEffect, useState } from 'react';
import { useDeck } from '../ctx';
import { laneOf, LANE_LABEL } from '../lanes';
import type { LaneSlide } from '../types';
import { Panel } from './shared';
import { Art } from './teach';

/** Lane picker: three big picture cards. No test, no score: the student says where to start; it can be changed any time (More). */
export function LaneView({ slide }: { slide: LaneSlide }) {
  const { vars, setVars, done, right } = useDeck();
  const [picked, setPicked] = useState(false);
  const chosen = laneOf(vars);
  useEffect(() => {
    if (picked) done();
  }, [picked, done]);
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-lanes" role="radiogroup" aria-label={slide.prompt}>
        {slide.choices.map((c) => (
          <button key={c.lane} type="button" role="radio" aria-checked={picked && chosen === c.lane} className="ad-lane" data-on={picked && chosen === c.lane} onClick={() => { setVars({ lane: c.lane }); setPicked(true); right(); }}>
            <span className="ad-lane-art"><Art art={c.art} size="sm" /></span>
            <b className="ad-lane-title">{c.title}</b>
            <span className="ad-lane-blurb">{c.blurb}</span>
            <i className="ad-lane-tag">{LANE_LABEL[c.lane].teacher}</i>
          </button>
        ))}
      </div>
      <p className="ad-hint-line">{picked ? `You chose ${LANE_LABEL[chosen].student}. You can change it any time: More, then Easier or Harder.` : 'Pick one. There is no wrong answer, and you can change it later.'}</p>
    </Panel>
  );
}
