import { describe, expect, it } from 'vitest';
import { Contest } from '../../src/models/contest.js';

describe('Contest', () => {
  it('should create a contest with the provided properties', () => {
    const contest = new Contest({
      number: 3779,
      date: new Date('2026-09-03'),
      numbers: [1, 2, 3],
      drawOrder: [3, 1, 2],
      previousContest: 3778,
      nextContest: 3780,
      isSpecialContest: false
    });

    expect(contest.number).toBe(3779);
    expect(contest.numbers).toEqual([1, 2, 3]);
    expect(contest.drawOrder).toEqual([3, 1, 2]);
    expect(contest.previousContest).toBe(3778);
    expect(contest.nextContest).toBe(3780);
    expect(contest.isSpecialContest).toBe(false);
  });
});
