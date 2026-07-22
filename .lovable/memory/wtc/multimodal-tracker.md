---
name: WTC & L2-Anxiety Multimodal Tracker
description: Cycle 5 live monitor that fuses voice volume, gaze ratio, posture and gestures into a WTC score; triggers shorten_task/switch_to_game/invite_pip_support recommendations and persists rollups to wtc_signals.
type: feature
---

# WTC & L2-Anxiety Tracker (Cycle 5)

Code: `src/wtc/*`, `src/hooks/useWTCMonitor.ts`, `src/components/live-classroom/AnxietyCoach.tsx`.

- Detectors: `VolumeDetector` (5s rolling median over WebAudio level), `GazeDetector` (Chromium `FaceDetector` when available, neutral 0.5 fallback), `PostureDetector` (2fps frame-diff motion in upper-body + side regions).
- Fusion: `fuseWTC()` produces `WTCState { wtcScore, anxietyLevel, recommendation, reason }`.
  - Recommendations: `continue | shorten_task | switch_to_game | invite_pip_support`.
  - Trigger rule: ≥2 negative signals persistent for ≥10s → `shorten_task`/`switch_to_game`.
- Persistence: rollup every 15s to `public.wtc_signals` (RLS: students insert/read own; teachers+admins read all).
- Consent gate: hook requires explicit `enabled=true`.
- Tier 5 — communication/affect signal. NEVER overrides CEFR/curriculum/age/safety.
