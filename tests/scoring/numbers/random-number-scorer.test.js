import { describe, expect, it } from 'vitest';
import { RandomNumberScorer } from '../../../src/scoring/number/random-number-scorer.js';

describe('RandomNumberScorer', () => {
  it('should return scores for numbers 1 to 25', () => {
    const scorer = new RandomNumberScorer({
      random: () => 0.5
    });

    const result = scorer.score();

    expect(result).toHaveLength(25);

    expect(result[0]).toEqual({
      number: 1,
      score: 0.5
    });

    expect(result[24]).toEqual({
      number: 25,
      score: 0.5
    });
  });

  it('should generate scores between 0 and 1', () => {
    const scorer = new RandomNumberScorer();

    const result = scorer.score();

    for (const item of result) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThan(1);
    }
  });

  it('should return every number exactly once', () => {
    const scorer = new RandomNumberScorer();

    const result = scorer.score();

    const numbers = result.map(item => item.number);

    expect(numbers).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1)
    );
  });
});