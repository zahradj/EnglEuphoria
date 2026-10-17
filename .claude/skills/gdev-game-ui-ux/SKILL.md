---
name: gdev-game-ui-ux
description: >
  Design and build game UI/UX — HUDs, menus, and overlays — that survive every screen: anchor-
  based responsive layout, resolution/aspect scaling and safe areas, keyboard/gamepad focus
  navigation, a screen/menu state stack, and event-driven (not polled) HUD updates. Engine-
  neutral patterns that pair with the detected engine's UI skill. Use when the user mentions
  HUD, health bar, main menu, pause menu, settings screen, UI layout, anchors, UI scaling,
  aspect ratio, safe area, controller/keyboard menu navigation, or wiring UI to game state.
---

# Game UI/UX

Build HUDs and menus that stay correct on a phone, an ultrawide monitor, and a TV across a
gamepad and a mouse. This skill owns the engine-neutral UI architecture — responsive layout,
scaling, focus navigation, screen flow, and how UI talks to game state — and defers the
concrete widget API to the engine UI skill.

## When to use

- Use when building a HUD (health/ammo/score), a menu (main/pause/settings), an inventory or
  shop screen, or any overlay, and you want it to scale and navigate correctly.
- Use to fix UI that breaks at other resolutions/aspect ratios, ignores notches/safe areas,
  can't be used with a controller, or is wired to game state by per-frame polling.
- Use to structure screen flow (title → game → pause → settings) as a stack, not flag soup.

**When *not* to use:** for the engine's concrete UI nodes/components and styling, use
`godot-ui-control` or Unity UI (UGUI/UI Toolkit). For *visual* punch (button pop, damage
numbers, shake) use `game-feel`. For branching conversation UI use `dialogue-systems`. For
translating UI strings, that is localization (see `references/` and `input-systems` for
rebinding screens). For card/board layout specifics, the `card-game` genre composes this skill.

## Core workflow

1. **Pick a layout model: anchors + containers, never absolute pixels.** Anchor elements to
   edges/corners/center and let containers (rows, columns, grids) flow children. Absolute
   `(x, y)` positions break at the first new resolution.
2. **Choose a scaling strategy** for the whole UI: a reference resolution that scales to fit
   (most games), plus a policy for extra width/height on other aspect ratios (letterbox,
   expand, or anchor HUD corners outward).
3. **Respect the safe area.** Inset critical UI from screen edges so notches, rounded corners,
   and TV overscan don't clip it.
4. **Make every screen keyboard/gamepad navigable.** Set an initial focused control per screen,
   define focus order/neighbors, and show a clear focus highlight. Mouse and focus must coexist.
5. **Model screens as a stack.** Push (pause over game), pop (resume), with input + visibility
   handed to the top screen. This makes overlays and "back" trivial.
6. **Drive the HUD from events, not polling.** The HUD subscribes to `health_changed`,
   `score_changed`, etc. and updates only when they fire — it does not read game state every
   frame.
7. **Verify across screens and devices.** Resize the window, switch aspect ratios, unplug the
   mouse and navigate by gamepad only, and confirm focus, scaling, and safe-area insets. Report
   what you actually observed at which resolutions.

## Patterns

### 1. Anchors + containers, not absolute coordinates

```gdscript
# Godot 4.7. Anchor a HUD label to the TOP-LEFT; let a container flow a row of hearts.
func _ready() -> void:
    $Score.set_anchors_preset(Control.PRESET_TOP_LEFT)   # sticks to the corner at any size
    # An HBoxContainer auto-lays-out children left-to-right; never position hearts by hand.
    for i in lives:
        $Hearts.add_child(make_heart())                   # HBoxContainer spaces them for you
# Unity 6.3 LTS uGUI: set RectTransform anchors to the corner; use a HorizontalLayoutGroup.
# RIGHT: anchors + layout groups. WRONG: rect.anchoredPosition = new Vector2(640, 360) (1080p-only).
```

### 2. Scale to a reference resolution (one UI, many screens)

```text
# Godot 4.7 — Project Settings > Display > Window > Stretch:
#   Mode = "canvas_items", Aspect = "expand", reference size e.g. 1920x1080.
#   UI scales to the window; "expand" reveals extra space you anchor HUD corners into.
# Unity 6.3 LTS — Canvas > CanvasScaler:
#   UI Scale Mode = "Scale With Screen Size", Reference Resolution = 1920x1080,
#   Match = 0.5 (blend width/height) — pick 1.0 if your HUD is height-critical.
```

### 3. Safe-area inset for notches / overscan

```gdscript
# Godot 4.7. Inset a margin container to the OS-reported safe rect (phones, TVs).
func _apply_safe_area() -> void:
    var safe: Rect2i = DisplayServer.get_display_safe_area()
    var win := DisplayServer.window_get_size()
    $Margin.add_theme_constant_override("margin_left", safe.position.x)
    $Margin.add_theme_constant_override("margin_top",  safe.position.y)
    $Margin.add_theme_constant_override("margin_right", win.x - safe.end.x)
    $Margin.add_theme_constant_override("margin_bottom", win.y - safe.end.y)
# Unity 6.3 LTS: read Screen.safeArea (Rect in pixels) and set a panel's anchorMin/anchorMax to
# safeArea.position / (position+size) normalized by Screen.width/height.
```

### 4. Gamepad/keyboard focus (UI is unusable on a controller without it)

```gdscript
# Godot 4.7. Give each screen a default focus and wire neighbors so a stick/d-pad walks it.
func _on_screen_shown() -> void:
    $PlayButton.grab_focus()                               # always focus SOMETHING on open
$PlayButton.focus_neighbor_bottom = $SettingsButton.get_path()
$SettingsButton.focus_neighbor_top = $PlayButton.get_path()
# Unity 6.3 LTS: EventSystem.SetSelectedGameObject(playButton) on enable; set each Selectable's
# Navigation (Explicit or Automatic). RIGHT: a control is focused on open. WRONG: nothing
# selected → the gamepad does nothing and the player is stuck.
```

### 5. Event-driven HUD (decouple UI from game logic)

```gdscript
# RIGHT: HUD reacts to a signal; it updates only when health actually changes.
func _ready() -> void:
    player.health_changed.connect(_on_health_changed)     # emitted by gameplay
func _on_health_changed(current: int, max: int) -> void:
    $HealthBar.value = float(current) / max
# WRONG: func _process(dt): $HealthBar.value = player.hp / player.max_hp  # polls every frame,
# couples UI to the player's internals, and runs work even when nothing changed.
```

## Pitfalls

- **Absolute pixel positions / a single design resolution.** Looks right on your monitor, broken
  everywhere else. Anchor to edges/center and flow with containers.
- **No aspect-ratio policy.** 16:9-only layouts crop or letterbox badly on ultrawide and phones.
  Decide expand vs letterbox and anchor HUD to corners that move outward.
- **Ignoring the safe area.** HUD under a notch or lost to TV overscan. Inset critical elements.
- **No initial focus / no focus neighbors.** The game is unplayable on a gamepad; players land
  on a menu with nothing selected. Always focus one control and define navigation.
- **Polling game state in `_process`/`Update`.** Couples UI to internals and wastes work. Push
  updates via signals/events.
- **Tiny fixed font sizes.** Unreadable on a TV-at-distance or a small phone. Scale text with the
  UI and offer a text-size option.
- **Menu flow as boolean flags** (`isPaused`, `inSettings`, …) becomes unmanageable. Use a
  screen stack with push/pop.
- **Hardcoded English strings baked into layout.** Translations overflow buttons. Externalize
  strings and let containers size to content (see `references/`).
- **Mouse-only or focus-only.** Support both; switching input device should not strand the user.

## References

- For stretch/scale modes per engine, the safe-area math, a complete focus-navigation and
  screen-stack pattern, diegetic vs non-diegetic UI, accessibility (text size, contrast,
  colorblind-safe state), and localization-ready layout, read `references/layout-and-flow.md`.

## Related skills

- `godot-ui-control`, Unity UI (UGUI/UI Toolkit) — the concrete widgets, themes, and styling.
- `game-feel` — button pops, transitions, and HUD juice that ride on top of this layout.
- `dialogue-systems` — conversation/choice UI that lives inside this UI shell.
- `input-systems` — device switching, rebinding screens, and accessible controls.
- `rpg`, `card-game`, `tower-defense`, `visual-novel` — UI-heavy genres that compose this skill.


## Web / educational UI addendum (2026-10-17)

Evidence tags: **[S]** search snippet (page not opened), **[R]** repo rule, **[J]** judgement. Timing tokens, accessibility checklist and anti-patterns: `game-animation` sections 10-16. Log: `docs/research/game-dev-skills-research-2026-10-17.md`.

### Feedback timing (the 0.1 / 1 / 10 second rules) [S]
- <= 0.1 s feels like direct manipulation: press, lift and tick must respond in the same frame.
- <= 1 s keeps the train of thought: the verdict (right / not yet) and the next-step hint appear within 1 s.
- > 1 s needs a visible "working" state (a spinner or a character thinking); > 10 s needs progress and a way out. Recorded voice clips that are still loading show a silent mic/speaker ring, never a freeze.

### Targets, reach and layout (Fitts) [S]
- Time to hit a target falls with size and rises with distance; fingers need bigger targets than a mouse. Use **>= 44 x 44 CSS px** (Apple 44 pt, Material 48 dp, WCAG 2.5.8 AA min 24 px, 2.5.5 AAA 44 px) with >= 8 px between targets; enlarge the hit area with padding, not the sprite.
- Put the primary action in the bottom thumb zone (bottom-right for the main button); keep rarely used controls (hint, comfort, back) at the top corners; never put the answer targets under a top bar or a notch (use `env(safe-area-inset-*)`).
- A well-placed button with an ambiguous label still fails: every control has an icon plus a word.

### HUD design for learning (diegetic vs non-diegetic) [S]
- Taxonomy: diegetic (inside the world: a phone screen, a notice board), non-diegetic (classic HUD pills), spatial (in the scene, not seen by the characters), meta (screen effects). Practitioners recommend blending; fast, information-heavy screens lean on a HUD, story scenes gain from diegetic objects.
- Learning default: **the task and the language target are diegetic** (the message on the phone, the menu on the table), **status is a light non-diegetic HUD** (progress, stars, hint). Max 5 HUD items visible; the HUD never overlaps the target.

### Progress and goals
- **Goal-gradient and endowed progress**: motivation rises as the goal gets closer, and a bar that starts partly filled (e.g. 1 of 5 done after the title card) is completed more often [S, Hull 1932, Nunes and Dreze 2006; design applications are blog-level]. Use a segmented bar per part, show "2 more" near the end, never a bar that resets or drops.
- Progress is against the student's **own best**, never a ranking [R].

### Rewards, ethically
- Predictable, earned rewards (stars for first-try, Word Cards collected). No variable-ratio mystery boxes, no fake urgency, no streak-loss guilt, no leaderboards [S, R]. See anti-patterns in `game-animation` section 15.
- Flow: keep challenge slightly above skill with a visible dial (Chill / Normal / Push); some data suggest players tolerate being over-challenged better than bored, but anxiety rises, so offer the easier path without penalty [S, J].

### Reading and responsive layout
- 16 px minimum body text, ~12 words per line at A1; text on a pill over art; layouts tested at 390 x 844 and 1280 x 720; logical CSS properties so Arabic (RTL) mirrors [R].
- Every screen has an initial focus target, a visible focus ring and keyboard parity with touch (the web version of gamepad focus above).

### Teen taste (13-18) [S: only agency blogs; no teen-specific study found, so [J]]
- Clean, low-clutter, visual-first screens, cards, personalisation (themes, emoji choice), a conversational but adult tone; avoid mascots, rounded baby fonts, confetti on every tap and "great job!" for trivial steps.
