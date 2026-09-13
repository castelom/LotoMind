import { describe, expect, it } from 'vitest';
import { FeatureEngineer } from '../../src/features/feature-engineer.js';

function createContest(number, numbers) {
  return {
    number,
    numbers
  };
}

describe('FeatureEngineer', () => {
  it('should generate one sample after the historical window', () => {
    const contests = [
      createContest(1, [1, 2, 3]),
      createContest(2, [1, 4, 5]),
      createContest(3, [1, 2, 6])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    expect(dataset).toHaveLength(1);
    expect(dataset[0].contestNumber).toBe(3);
  });

  it('should calculate frequency correctly', () => {
    const contests = [
      createContest(1, [1, 2, 3]),
      createContest(2, [1, 4, 5]),
      createContest(3, [1, 2, 6])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    // Number 1 appeared in contests 1 and 2.
    expect(dataset[0].features[0]).toBe(2);
  });

  it('should calculate recent frequency correctly', () => {
    const contests = [
      createContest(1, [1, 2, 3]),
      createContest(2, [1, 4, 5]),
      createContest(3, [1, 2, 6])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    // Only contest 2 belongs to the recent window.
    // Number 4 appeared once.
    expect(dataset[0].features[1 + 3])
      .toBe(1);
  });

  it('should calculate delay correctly', () => {
    const contests = [
      createContest(1, [1, 2, 3]),
      createContest(2, [1, 4, 5]),
      createContest(3, [1, 2, 6])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    // Number 2 appeared in contest 1,
    // but not in contest 2.
    // Therefore delay = 1.
    expect(dataset[0].features[4 + 2])
      .toBe(1);
  });

  it('should identify numbers from the previous draw', () => {
    const contests = [
      createContest(1, [1, 2, 3]),
      createContest(2, [1, 4, 5]),
      createContest(3, [1, 2, 6])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    // Number 4 appeared in the previous draw.
    expect(dataset[0].features[12 + 3])
      .toBe(1);

    // Number 2 did not appear in the previous draw.
    expect(dataset[0].features[4 + 3])
      .toBe(0);
  });

  it('should generate a 25-value binary target', () => {
    const contests = [
      createContest(1, [1, 2, 3]),
      createContest(2, [1, 4, 5]),
      createContest(3, [1, 2, 6])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    const target = dataset[0].target;

    expect(target).toHaveLength(25);

    expect(target[0]).toBe(1); // number 1
    expect(target[1]).toBe(1); // number 2
    expect(target[5]).toBe(1); // number 6
    expect(target[2]).toBe(0); // number 3
  });

  it('should not use the target contest when generating features', () => {
    const contests = [
      createContest(1, [1]),
      createContest(2, [2]),
      createContest(3, [3])
    ];

    const engineer = new FeatureEngineer({
      windowSize: 2,
      recentWindowSize: 1
    });

    const dataset = engineer.generate(contests);

    // Target is contest 3, which contains number 3.
    // Number 3 must not appear in the historical features.
    const number3Frequency = dataset[0].features[8];

    expect(number3Frequency).toBe(0);
  });
});