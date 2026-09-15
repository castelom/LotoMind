import { describe, expect, it } from 'vitest';
import { PollScorer } from '../../../src/scoring/poll/poll-scorer.js';

describe('PollScorer', () => {
  it('should calculate the average score of the numbers', () => {
    const scorer = new PollScorer();

    const Poll = {
      numbers: [1, 2, 3]
    };

    const numberScores = [
      { number: 1, score: 0.9 },
      { number: 2, score: 0.6 },
      { number: 3, score: 0.3 }
    ];

    const result = scorer.score(
      Poll,
      numberScores
    );

    expect(result.score).toBe(0.6);
    expect(result.numbers).toEqual([1, 2, 3]);
  });

  it('should return zero for an empty Poll', () => {
    const scorer = new PollScorer();

    const result = scorer.score(
      { numbers: [] },
      []
    );

    expect(result).toEqual({
      numbers: [],
      score: 0
    });
  });

  it('should support Poll with different sizes', () => {
    const scorer = new PollScorer();

    const numberScores = Array.from(
      { length: 25 },
      (_, index) => ({
        number: index + 1,
        score: 0.5
      })
    );

    const poll15 = {
      numbers: Array.from(
        { length: 15 },
        (_, index) => index + 1
      )
    };

    const poll19 = {
      numbers: Array.from(
        { length: 19 },
        (_, index) => index + 1
      )
    };

    const result15 = scorer.score(
      poll15,
      numberScores
    );

    const result19 = scorer.score(
      poll19,
      numberScores
    );

    expect(result15.score).toBe(0.5);
    expect(result19.score).toBe(0.5);
  });

  it('should throw when a number has no score', () => {
    const scorer = new PollScorer();

    const Poll = {
      numbers: [1, 2, 3]
    };

    const numberScores = [
      { number: 1, score: 0.8 },
      { number: 2, score: 0.7 }
    ];

    expect(() =>
      scorer.score(Poll, numberScores)
    ).toThrow('No score found for number 3');
  });
});