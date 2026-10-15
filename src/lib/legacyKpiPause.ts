/**
 * The old overall teacher KPI score ("legacy composite") is PAUSED as a basis for any consequence.
 *
 * Why: it leans on student star ratings (which carry known gender/accent biases), on an unattributable pronunciation
 * average, and on neutral defaults when data is missing, so a teacher with no data could be flagged "At Risk" or ranked
 * below a better teacher. See docs/research/teacher-monitoring-research.md.
 *
 * While paused (the default) the app does not: rank teachers by it, show the "At Risk" tier or its counters, show a
 * teacher their composite score, or calculate/queue a KPI bonus from it. Nothing is deleted: the data keeps being
 * recorded and bonuses that were already queued are untouched.
 *
 * To bring the old behaviour back, set VITE_LEGACY_KPI=on in the hosting environment.
 */
export const LEGACY_KPI_PAUSED = import.meta.env.VITE_LEGACY_KPI !== 'on';
