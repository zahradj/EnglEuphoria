import { describe, expect, it } from 'vitest';
import { ACADEMY_RECALL_NODES, PRE_A1_RECALL_NODES, DAILY_GAP_DAYS, MAX_ITEMS_PER_SESSION, MAX_REMEMBER_ITEMS, MAX_REMEMBER_ITEMS_PRE_A1, RECALL_GAPS, RECALL_QUOTA, dailyCalendar, progressOf, recallPlan } from '..';

describe('Recall, spacing and progression', () => {
  it('the gaps expand and the quotas add up to the per-lesson cap, so every item can return', () => {
    expect([...RECALL_GAPS]).toEqual([1, 2, 4, 8, 16]);
    expect(RECALL_GAPS.reduce((a, g) => a + RECALL_QUOTA[g], 0)).toBe(MAX_ITEMS_PER_SESSION);
    expect(DAILY_GAP_DAYS.every((d, i) => i === 0 || d > DAILY_GAP_DAYS[i - 1])).toBe(true);
    expect(dailyCalendar(10)).toEqual([11, 13, 17, 24, 40]);
  });

  it('the first lesson of a track brings nothing back; every later lesson brings something back', () => {
    for (const nodes of [ACADEMY_RECALL_NODES, PRE_A1_RECALL_NODES]) {
      expect(recallPlan(nodes, nodes[0].id)?.total).toBe(0);
      nodes.slice(2).forEach((n) => expect(recallPlan(nodes, n.id)!.total, n.id).toBeGreaterThan(0));
    }
  });

  it('never asks for more items than the cap, and only for items taught before (no future items)', () => {
    for (const [nodes, cap] of [[ACADEMY_RECALL_NODES, MAX_REMEMBER_ITEMS], [PRE_A1_RECALL_NODES, MAX_REMEMBER_ITEMS_PRE_A1]] as const) {
      nodes.forEach((n, i) => {
        const plan = recallPlan(nodes, n.id, cap)!;
        expect(plan.total, n.id).toBeLessThanOrEqual(cap);
        const earlier = new Set(nodes.slice(0, i).flatMap((x) => x.items));
        plan.due.forEach((d) => d.items.forEach((it) => expect(earlier.has(it), `${n.id}: ${it}`).toBe(true)));
      });
    }
  });

  it('SPACING: every item of a lesson that has at least 16 teaching lessons after it returns at least once', () => {
    const nodes = ACADEMY_RECALL_NODES;
    const taught = nodes.filter((n) => n.items.length > 0);
    const back = new Map<string, Set<string>>();
    nodes.forEach((n) => recallPlan(nodes, n.id, 99)!.due.forEach((d) => { const s = back.get(d.fromLessonId) ?? new Set(); d.items.forEach((x) => s.add(x)); back.set(d.fromLessonId, s); }));
    taught.slice(0, taught.length - 16).forEach((n) => n.items.forEach((it) => expect(back.get(n.id)?.has(it), `${n.id} ${it}`).toBe(true)));
  });

  it('REVIEW LESSONS: Remix and Finale bring the whole Season back; a Big Remix also brings the Season before it', () => {
    const remix = ACADEMY_RECALL_NODES.find((n) => n.episode === 7 && n.bigRemix)!;
    const plan = recallPlan(ACADEMY_RECALL_NODES, remix.id)!;
    expect(plan.bigReview?.seasons.length).toBe(2);
    expect(plan.bigReview?.seasons[0]).toBe(remix.seasonId);
    const finale = ACADEMY_RECALL_NODES.find((n) => n.episode === 8)!;
    expect(recallPlan(ACADEMY_RECALL_NODES, finale.id)!.bigReview?.seasons).toEqual([finale.seasonId]);
    expect(recallPlan(ACADEMY_RECALL_NODES, ACADEMY_RECALL_NODES[0].id)!.bigReview).toBeNull();
  });

  it('PROGRESSION: a lesson knows what it builds on, what it unlocks, how many Seasons are done and how many items are known', () => {
    const n = ACADEMY_RECALL_NODES;
    const p = progressOf(n, n[20].id)!;
    expect(p.buildsOn).toBe(n[19].objective);
    expect(p.unlocks).toBe(n[21].objective);
    expect(p.itemsKnownBefore).toBe(n.slice(0, 20).reduce((a, x) => a + x.items.length, 0));
    expect(p.seasonsDone.length).toBe(2);
    expect(progressOf(n, n[0].id)!.buildsOn).toBeNull();
    expect(progressOf(n, n[n.length - 1].id)!.unlocks).toBeNull();
  });
});

import { WEEKLY_DOSE, decideForGap, nudgeFor } from '..';

describe('Practice gaps: what changes when the student does not practise', () => {
  it('on schedule: normal lesson (14 new items, Pre-A1 8, 10 minutes of Remember?)', () => {
    expect(decideForGap({})).toMatchObject({ mode: 'on-track', newItemCap: 14, rememberMinutes: 10, overdueFirst: false });
    expect(decideForGap({}, true).newItemCap).toBe(8);
  });
  it('a missed week or weak Daily 10 gives a refresh: fewer new items, a longer Remember?, overdue items first', () => {
    for (const sig of [{ daysSinceLastLesson: 9 }, { daily10Rate: 0.3 }, { rememberAccuracy: 0.6 }, { missedInRow: 1 }]) {
      expect(decideForGap(sig)).toMatchObject({ mode: 'refresh', newItemCap: 8, rememberMinutes: 15, overdueFirst: true });
    }
  });
  it('two weeks away, three missed lessons or recall under half: rewind (no new language, replay the last two lessons)', () => {
    for (const sig of [{ daysSinceLastLesson: 16 }, { missedInRow: 3 }, { rememberAccuracy: 0.45 }]) {
      expect(decideForGap(sig)).toMatchObject({ mode: 'rewind', newItemCap: 0, replayLessons: 2 });
    }
  });
  it('a month away: restart with a short re-check and four lessons replayed', () => {
    expect(decideForGap({ daysSinceLastLesson: 40 })).toMatchObject({ mode: 'restart', newItemCap: 0, recheck: true, replayLessons: 4 });
  });
  it('messages are kind: no shaming words', () => {
    for (const d of [decideForGap({}), decideForGap({ daysSinceLastLesson: 9 }), decideForGap({ daysSinceLastLesson: 16 }), decideForGap({ daysSinceLastLesson: 40 })]) expect(d.message).not.toMatch(/fail|lazy|wrong|behind|bad/i);
  });
  it('nudges shrink with the missed practice and keep the weekly dose in view', () => {
    expect(WEEKLY_DOSE).toEqual({ lessons: 2, daily10: 3, minutes: 90 });
    expect(nudgeFor(3).size).toBe('normal');
    expect(nudgeFor(1)).toMatchObject({ size: 'mini', minutes: 5 });
    expect(nudgeFor(0)).toMatchObject({ size: 'rescue', minutes: 5 });
  });
});

import { LEVEL_FRAMES } from '../levelFrames';
import { SPEAKING_LADDER, SPEAKING_TARGETS, speakingProblems } from '..';

describe('Speaking practice is the largest share at every level', () => {
  it('every level frame gives speaking the biggest share, at least 30 %, and the shares add up to 100', () => {
    LEVEL_FRAMES.forEach((f) => {
      const entries = Object.entries(f.skills);
      expect(entries.reduce((a, [, v]) => a + v, 0), f.level).toBe(100);
      const speak = entries.filter(([k]) => k.startsWith('Speaking')).reduce((a, [, v]) => a + v, 0);
      expect(speak, f.level).toBeGreaterThanOrEqual(30);
      expect(speak, f.level).toBe(Math.max(...entries.map(([, v]) => v)));
    });
  });
  it('targets rise with the level and the ladder has five steps from shadowing to free speech', () => {
    expect(SPEAKING_LADDER.map((s) => s.step)).toEqual(['shadow', 'repeat', 'controlled', 'guided', 'free']);
    const lv = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'] as const;
    lv.slice(1).forEach((l, i) => {
      expect(SPEAKING_TARGETS[l].studentTalkShare).toBeGreaterThanOrEqual(SPEAKING_TARGETS[lv[i]].studentTalkShare);
      expect(SPEAKING_TARGETS[l].speakingMinutes).toBeGreaterThanOrEqual(SPEAKING_TARGETS[lv[i]].speakingMinutes);
    });
  });
  it('a plan that talks too little, or never reaches its ladder step, is reported', () => {
    expect(speakingProblems({ level: 'A1', studentTalkShare: 0.5, speakingMinutes: 16, tasks: [{ step: 'shadow', minutes: 3 }, { step: 'repeat', minutes: 3 }, { step: 'controlled', minutes: 4 }, { step: 'guided', minutes: 3 }, { step: 'guided', minutes: 3 }] })).toEqual([]);
    expect(speakingProblems({ level: 'B1', studentTalkShare: 0.3, speakingMinutes: 8, tasks: [{ step: 'repeat', minutes: 8 }] }).length).toBe(4);
  });
});
