import { describe, it, expect } from 'vitest';
import { BacktestMetrics } from '../../src/evaluation/backtest-metrics.js';

describe('BacktestMetrics', () => {
  it('should calculate hit metrics', () => {
    const metrics = new BacktestMetrics();

    const results = [
      { hits: 10, reward: 0 },
      { hits: 11, reward: 1 },
      { hits: 12, reward: 2 },
      { hits: 13, reward: 4 },
      { hits: 14, reward: 15 },
      { hits: 15, reward: 100 }
    ];

    const result = metrics.calculate(results);

    expect(result.totalContests).toBe(6);
    expect(result.averageHits).toBe(12.5);
    expect(result.medianHits).toBe(12.5);
    expect(result.maxHits).toBe(15);
  });

  it('should calculate hit distributions', () => {
    const metrics = new BacktestMetrics();

    const results = [
      { hits: 10, reward: 0 },
      { hits: 11, reward: 1 },
      { hits: 12, reward: 2 },
      { hits: 13, reward: 4 },
      { hits: 14, reward: 15 },
      { hits: 15, reward: 100 }
    ];

    const result = metrics.calculate(results);

    expect(result.count11Plus).toBe(5);
    expect(result.count12Plus).toBe(4);
    expect(result.count13Plus).toBe(3);
    expect(result.count14Plus).toBe(2);
    expect(result.count15).toBe(1);
  });

  it('should calculate reward metrics', () => {
    const metrics = new BacktestMetrics();

    const results = [
      { hits: 10, reward: 0 },
      { hits: 11, reward: 1 },
      { hits: 12, reward: 2 },
      { hits: 13, reward: 4 },
      { hits: 14, reward: 15 },
      { hits: 15, reward: 100 }
    ];

    const result = metrics.calculate(results);

    expect(result.totalReward).toBe(122);
    expect(result.averageReward).toBeCloseTo(20.3333);
  });

  it('should return zero metrics for empty results', () => {
    const metrics = new BacktestMetrics();

    const result = metrics.calculate([]);

    expect(result).toEqual({
      totalContests: 0,
      averageHits: 0,
      medianHits: 0,
      maxHits: 0,
      count11Plus: 0,
      count12Plus: 0,
      count13Plus: 0,
      count14Plus: 0,
      count15: 0,
      totalReward: 0,
      averageReward: 0
    });
  });

  it('should treat missing reward as zero', () => {
    const metrics = new BacktestMetrics();

    const result = metrics.calculate([
      { hits: 10 },
      { hits: 12, reward: 2 }
    ]);

    expect(result.totalReward).toBe(2);
    expect(result.averageReward).toBe(1);
  });
});