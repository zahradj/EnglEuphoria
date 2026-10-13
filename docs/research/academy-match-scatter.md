# Academy matching game: scattered pictures, no frames (2026-10-12)

Owner feedback: the matching game looked small and boxed; make it scattered, without frames, comfortable.

## Sources and limits
- Web search (2026-10-12) for drag-and-drop vocabulary matching: general guidance only — drop targets must be large and forgiving, draggables need visible cues, drop targets should react while dragging, and tap-word-then-tap-picture is the touch-friendly alternative (7esl drag-and-drop vocabulary page; Wordwall "Match up" template). Quality: low (several duplicated pages). **Lingokids and Khan Academy Kids word-match mechanics could not be confirmed from the web**; nothing was copied from them.
- Project rules: academy-game-ui skill (illustrated, alive, no worksheet look), academy-player-ux (comfort first, no timers, "Not yet" wording).

## Decisions
- Pictures are big (about 150-170 px on desktop) and lie scattered: each has its own small offset and tilt and a slow bob (frozen in Calm mode). No dashed boxes.
- The whole picture plus padding is the drop target; a soft glow appears under every picture while a word is being dragged, green when matched.
- Word pills are large (58 px high), glossy and few; tapping works as well as dragging.
- Matched picture straightens, glows green and shows its word on a white pill below; wrong drop shakes and says "Not yet".
- Phone: two columns, smaller pictures so the pills stay on screen.
