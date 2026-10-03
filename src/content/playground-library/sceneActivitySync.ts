import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Real synced state for interactive scene kinds, shared by every scene
 * library (Welcome Town, Pre-A1 Unit 1, and any future one) instead of each
 * reimplementing its own copy. Whichever side currently "has the floor" —
 * the teacher by default, or the student once unlocked — pushes its full
 * local state on every change through PlayWelcomeTownLesson's /
 * PlayUnitLesson's activity-state channel (whiteboardService.sendSceneActivityState);
 * the other side renders straight from the latest snapshot. This replaces
 * the older generic scene_tap DOM-click-mirror for kinds that opt in (see
 * each lesson player's REAL_SYNC_KINDS), which depended on both sides'
 * rendered DOM trees being structurally identical — an assumption that
 * broke as soon as one side rendered so much as an extra lock overlay the
 * other didn't.
 *
 * New scene kinds should use this from the start rather than leaning on the
 * DOM-tap-mirror: add the kind to the lesson player's REAL_SYNC_KINDS set,
 * accept a `sync?: ActivitySync` prop, and read/write state through
 * `useSyncedState` below instead of a bare `useState`.
 */
export interface ActivitySync {
  isSynced: boolean;
  /** True on whichever side currently "has the floor" — that side's own
   *  interactions drive state and publish it; the other side is a pure
   *  mirror of the latest snapshot. */
  isAuthority: boolean;
  state: unknown;
  setState: (next: unknown) => void;
  /** SHARED PLAY: both screens drive the same game at once (teacher + unlocked student, one player).
   *  Both sides are authorities (`isAuthority` is true on both): every change is broadcast, and the
   *  other side's snapshot is applied to local state (last write wins). */
  shared?: boolean;
  /** Only meaningful with `shared`: the screen that runs a scene's automatic sequences (model-first
   *  intro, saying a picture's word when it appears). The follower skips them — the leader's speech is
   *  relayed — so nothing plays or is written twice. The teacher leads. */
  leader?: boolean;
}

/** Scene kinds that are real games: in a live class the teacher AND the unlocked student play them together. */
export const SHARED_PLAY_KINDS: ReadonlySet<string> = new Set([
  'first-sound', 'letter-match', 'letter-blocks', 'whats-missing', 'sort-basket', 'grammar-gap',
]);

/** True on the screen that must NOT run a shared scene's automatic sequences. */
export const isSharedFollower = (sync?: ActivitySync) => !!sync?.isSynced && !!sync.shared && sync.leader === false;

/** Drop-in replacement for a scene's own `useState` for whatever piece of
 *  state needs to look the same on both screens. Each scene keeps exactly
 *  ONE call to this (a single combined state object, not one call per
 *  field) — `sync.setState` fully replaces the broadcast snapshot, so N
 *  separate calls would each clobber the other N-1 fields' latest values.
 *  With no `sync` (solo play outside a classroom) this is a plain local
 *  `useState` with no network involved.
 *
 *  State must be JSON-serializable (it travels over a Supabase realtime
 *  broadcast) — a `Set`/`Map` silently flattens to `{}`; use a plain
 *  array instead and derive a Set locally with `useMemo` if needed. */
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Make a snapshot that arrived over the wire safe to read: any field the
 *  snapshot is missing — or whose container type is wrong (an array that
 *  isn't one) — falls back to the scene's own default, so a partial,
 *  older-shaped or other-scene snapshot can never make a scene dereference
 *  `undefined` (`state.order.length`, `state.rounds[i].prompt`, …) while
 *  rendering. */
export function reconcileSyncedState<T>(remote: unknown, initial: T): T {
  if (remote == null) return initial;
  if (!isPlainObject(initial)) {
    // Scene state that isn't an object (rare): accept only the same primitive/array type.
    return (Array.isArray(initial) === Array.isArray(remote) && typeof remote === typeof initial ? remote : initial) as T;
  }
  // The scene's state is an object: anything else (an array, a string, a
  // number, …) is not a snapshot of this scene.
  if (!isPlainObject(remote)) return initial;
  const out: Record<string, unknown> = { ...remote };
  for (const k of Object.keys(initial)) {
    const dflt = initial[k];
    const got = remote[k];
    const ok =
      dflt === null || dflt === undefined ? true // nullable field: take what was sent
      : Array.isArray(dflt) ? Array.isArray(got) && (dflt.length === 0 || got.every((x) => typeof x === typeof dflt[0]))
      : isPlainObject(dflt) ? isPlainObject(got)
      : typeof dflt === 'number' ? typeof got === 'number' && Number.isFinite(got)
      : typeof got === typeof dflt;
    if (got === undefined || !ok) out[k] = dflt;
  }
  return out as T;
}

/** The lesson player's per-scene activity snapshot. Tagged with the scene it
 *  belongs to and only handed out while that scene is still the one on
 *  screen — so the render right after a scene change never sees the PREVIOUS
 *  scene's state (a reset effect only runs after that render commits, which
 *  is exactly when the student's mirror used to crash). */
export function useSceneScopedState(sceneId: string): [unknown, (next: unknown) => void] {
  const [scoped, setScoped] = useState<{ sceneId: string; state: unknown } | null>(null);
  const state = scoped && scoped.sceneId === sceneId ? scoped.state : null;
  const set = useCallback((next: unknown) => setScoped({ sceneId, state: next }), [sceneId]);
  return [state, set];
}

export function useSyncedState<T>(sync: ActivitySync | undefined, initial: T): [T, (updater: T | ((prev: T) => T)) => void] {
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const [local, setLocal] = useState<T>(initial);
  // Several scenes call `set` more than once in the same synchronous handler
  // with no await between (e.g. a tap handler that sets one field then,
  // synchronously, a "busy" flag too) — a plain closure over `local` would
  // see the pre-render, stale value on the second call and silently drop
  // the first update. A ref kept in lockstep with every `set` call (not
  // just re-renders) makes this behave like React's own functional
  // setState updater.
  const localRef = useRef(local);
  localRef.current = local;
  const isShared = !!sync?.isSynced && !!sync.shared && !isRemoteMirror;
  // True only while the scene's mount effects run (they reset state); cleared right after, before any tap.
  const starting = useRef(true);
  useEffect(() => {
    const t = window.setTimeout(() => { starting.current = false; }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const remote = isRemoteMirror ? sync!.state : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mirrored = useMemo(() => reconcileSyncedState<T>(remote, initial), [remote]);
  const value = isRemoteMirror ? mirrored : local;
  // Shared play: the other screen's snapshots arrive as `sync.state`; fold them into local state.
  // (Our own writes also come back through `sync.state`, but they already equal local state.)
  const sharedRemote = isShared ? sync!.state : undefined;
  useEffect(() => {
    if (!isShared || sharedRemote == null) return;
    const incoming = reconcileSyncedState<T>(sharedRemote, initial);
    if (JSON.stringify(incoming) !== JSON.stringify(localRef.current)) {
      localRef.current = incoming;
      setLocal(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedRemote, isShared]);
  const set = (updater: T | ((prev: T) => T)) => {
    if (isRemoteMirror) return; // mirror side never drives state
    const next = typeof updater === 'function' ? (updater as (prev: T) => T)(localRef.current) : updater;
    localRef.current = next;
    setLocal(next);
    // A follower that has only just mounted must not broadcast its start-up reset: the leader may be
    // mid-game, and "back to the beginning" from a late joiner would wipe their progress.
    if (isShared && sync!.leader === false && starting.current) return;
    sync?.setState(next);
  };
  return [value, set];
}
