// Lightweight in-memory cache for AI judge results.
// DB-backed cache (qa_judge_cache) is consulted by the orchestrator
// before invoking judges, and written after a fresh judge run.

const mem = new Map<string, any>();

export function memGet(key: string): any | undefined {
  return mem.get(key);
}

export function memSet(key: string, value: any): void {
  mem.set(key, value);
}

export function judgeKey(judgeName: string, contentHash: string): string {
  return `${judgeName}::${contentHash}`;
}
