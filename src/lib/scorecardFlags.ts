/**
 * Rollout switch for the ADMIN overview of teacher scorecards.
 *
 * The plan is teachers first: for the first ~4 weeks each teacher can see their own scorecard (My teaching page) and
 * get used to it before anyone else sees a table of everyone. Set VITE_ADMIN_SCORECARDS=on in the hosting
 * environment to open the admin overview (route + link) when that period is over.
 */
export const ADMIN_SCORECARDS_ENABLED = import.meta.env.VITE_ADMIN_SCORECARDS === 'on';
