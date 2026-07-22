// FSRS-5 parameters. Tuned defaults; can be re-fit per cohort in a later wave.
// See https://github.com/open-spaced-repetition/fsrs4anki/wiki for rationale.

export const FSRS_W: number[] = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544,
  1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567,
];

export const FSRS_REQUEST_RETENTION = 0.9; // desired retrievability at next review
export const FSRS_MAX_INTERVAL_DAYS = 365;
export const FSRS_DECAY = -0.5;
export const FSRS_FACTOR = Math.pow(0.9, 1 / FSRS_DECAY) - 1;
