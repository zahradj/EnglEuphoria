import type { Lane, Slide, Vars } from './types';
import { LANES } from './types';

/** The lane the student is in (default: core). */
export const laneOf = (vars: Vars): Lane => (LANES.includes(vars.lane as Lane) ? (vars.lane as Lane) : 'core');

/** The slide as this lane sees it: the lane's overrides replace the slide's own fields. Core is the slide as written. */
export function applyLane<T extends Slide>(slide: T, lane: Lane): T {
  const o = lane === 'core' ? undefined : slide.lanes?.[lane];
  return o ? ({ ...slide, ...o } as T) : slide;
}

export const LANE_LABEL: Record<Lane, { student: string; teacher: string }> = {
  start: { student: 'Start', teacher: 'Pre-A1' },
  core: { student: 'Core', teacher: 'A1' },
  stretch: { student: 'Stretch', teacher: 'Post-A1' },
};
