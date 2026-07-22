/**
 * Sentinel-1 state registry.
 * High-risk components register their latest props/state via useSentinelState.
 * If they throw, SentinelErrorBoundary picks up the snapshot for diagnosis.
 */
import { useEffect, useRef } from "react";

interface Snapshot {
  component: string;
  state: unknown;
  target_table?: string;
  target_row_id?: string;
  at: number;
}

const registry = new Map<string, Snapshot>();

export function useSentinelState(
  component: string,
  state: unknown,
  meta?: { target_table?: string; target_row_id?: string },
) {
  const idRef = useRef(`${component}-${Math.random().toString(36).slice(2, 8)}`);
  useEffect(() => {
    registry.set(idRef.current, {
      component,
      state,
      target_table: meta?.target_table,
      target_row_id: meta?.target_row_id,
      at: Date.now(),
    });
    return () => {
      registry.delete(idRef.current);
    };
  }, [component, state, meta?.target_table, meta?.target_row_id]);
}

export function snapshotLatestSentinelState(): Snapshot | null {
  let latest: Snapshot | null = null;
  registry.forEach((snap) => {
    if (!latest || snap.at > latest.at) latest = snap;
  });
  return latest;
}
