import { describe, expect, it } from 'vitest';
import { Backtester } from '../../src/evaluation/backtester.js';

describe('Backtester', () => {
  it('should evaluate predictions against the next contest', () => {
    const scorer = {
      score: () => [
        { number: 1, score: 1.0 },
        { number: 2, score: 0.9 },
        { number: 3, score: 0.8 },
        { number: 4, score: 0.7 },
        { number: 5, score: 0.6 }
      ]
    };

    const contests = [
      {
        number: 1,
        numbers: [10, 11, 12]
      },
      {
        number: 2,
        numbers: [1, 2, 10]
      }
    ];

    const backtester = new Backtester({
      scorer,
      predictionSize: 2
    });

    const results = backtester.run(contests);

    expect(results).toHaveLength(1);

    expect(results[0]).toEqual({
      contestNumber: 2,
      prediction: [1, 2],
      actual: [1, 2, 10],
      hits: 2
    });
  });

  it('should not use the target contest when scoring', () => {
    const historicalLengths = [];

    const scorer = {
      score: contests => {
        historicalLengths.push(
          contests.length
        );

        return [
          { number: 1, score: 1 },
          { number: 2, score: 0.5 }
        ];
      }
    };

    const contests = [
      {
        number: 1,
        numbers: [1]
      },
      {
        number: 2,
        numbers: [2]
      },
      {
        number: 3,
        numbers: [3]
      }
    ];

    const backtester = new Backtester({
      scorer,
      predictionSize: 2
    });

    backtester.run(contests);

    expect(historicalLengths).toEqual([1, 2]);
  });

  it('should calculate zero hits when there is no intersection', () => {
    const scorer = {
      score: () => [
        { number: 1, score: 1 },
        { number: 2, score: 0.9 }
      ]
    };

    const contests = [
      {
        number: 1,
        numbers: [10]
      },
      {
        number: 2,
        numbers: [20]
      }
    ];

    const backtester = new Backtester({
      scorer,
      predictionSize: 2
    });

    const results = backtester.run(contests);

    expect(results[0].hits).toBe(0);
  });
});