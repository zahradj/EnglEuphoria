// Generation-time poll normalizer: if `pct` survives without distribution_source="real_data",
// rename it to `label_distribution` and mark distribution_source="illustrative".

export function normalizePoll<T = any>(content: T): T {
  if (!content || typeof content !== 'object') return content;
  const clone: any = Array.isArray(content) ? [...(content as any)] : { ...(content as any) };

  if (Array.isArray(clone.options)) {
    const source = clone.distribution_source;
    if (source !== 'real_data') {
      clone.distribution_source = 'illustrative';
      clone.options = clone.options.map((o: any) => {
        if (!o || typeof o !== 'object' || !Object.prototype.hasOwnProperty.call(o, 'pct')) return o;
        const { pct, ...rest } = o;
        return { ...rest, label_distribution: pct };
      });
    }
  }

  for (const [k, v] of Object.entries(clone)) {
    if (Array.isArray(v)) clone[k] = v.map((entry) => normalizePoll(entry));
    else if (v && typeof v === 'object') clone[k] = normalizePoll(v);
  }
  return clone as T;
}
