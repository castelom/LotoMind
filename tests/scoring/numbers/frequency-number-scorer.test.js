import { describe, expect, it } from 'vitest';
import { FrequencyNumberScorer } from '../../../src/scoring/number/frequency-number-scorer.js';

describe('FrequencyNumberScorer', () => {
  it('should return zero scores when contests are empty', () => {
    const scorer = new FrequencyNumberScorer();

    const result = scorer.score([]);

    expect(result).toHaveLength(25);

    expect(result[0]).toEqual({
      number: 1,
      score: 0
    });

    expect(result[24]).toEqual({
      number: 25,
      score: 0
    });
  });

  it('should calculate normalized frequency for each number', () => {
    const contests = [
      {
        numbers: [1, 2, 3]
      },
      {
        numbers: [1, 2]
      },
      {
        numbers: [1]
      }
    ];

    const scorer = new FrequencyNumberScorer();

    const result = scorer.score(contests);

    expect(result[0]).toEqual({
      number: 1,
      score: 1
    });

    expect(result[1]).toEqual({
      number: 2,
      score: 2 / 3
    });

    expect(result[2]).toEqual({
      number: 3,
      score: 1 / 3
    });

    expect(result[3]).toEqual({
      number: 4,
      score: 0
    });
  });

  it('should return scores for numbers 1 through 25', () => {
    const contests = [
      {
        numbers: [1, 5, 10]
      }
    ];

    const scorer = new FrequencyNumberScorer();

    const result = scorer.score(contests);

    expect(result).toHaveLength(25);

    const numbers = result.map(item => item.number);

    expect(numbers).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1)
    );
  });
});