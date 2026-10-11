// Academy lesson player — public API. Academy-only; nothing here imports the Playground or Success.
export { AcademyPlayer, type AcademyPlayerProps, type PlayerSignal } from './AcademyPlayer';
export * from './scriptTypes';
export { initState, step, backlog, accuracy, seededShuffle, mulberry32, labelIndex, type PlayerState, type PlayerEvent } from './engine';
export { validateScript, knownWordShare, MAX_WORDS, type ScriptIssue } from './validateScript';
export { A1S01E1 } from './samples/a1s01e1';
