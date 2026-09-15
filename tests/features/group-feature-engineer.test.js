import { describe, it, expect } from 'vitest';

import { GroupFeatureEngineer } from '../../src/features/group-feature-engineer.js';

describe('GroupFeatureEngineer', () => {
  const engineer = new GroupFeatureEngineer();

  it('should calculate the number of dezenas in each group', () => {
    const numbers = [
      1, 2, 3, 5,
      6, 8, 9,
      11, 12, 14,
      16, 18, 20,
      22, 25
    ];

    const result = engineer.generate(numbers);

    expect(result).toEqual([
      4,
      3,
      3,
      3,
      2
    ]);
  });

  it('should return five groups', () => {
    const result = engineer.generate([]);

    expect(result).toHaveLength(5);
  });

  it('should return zero for empty numbers', () => {
    const result = engineer.generate([]);

    expect(result).toEqual([
      0,
      0,
      0,
      0,
      0
    ]);
  });

  it('should return five for every group when all numbers are selected', () => {
    const numbers = Array.from(
      { length: 25 },
      (_, index) => index + 1
    );

    const result = engineer.generate(numbers);

    expect(result).toEqual([
      5,
      5,
      5,
      5,
      5
    ]);
  });

  it('should always sum to the number of selected dezenas', () => {
    const numbers = [
      1, 4, 5,
      7, 8,
      11, 13, 15,
      17, 19,
      21, 23, 24
    ];

    const result = engineer.generate(numbers);

    expect(
      result.reduce((sum, value) => sum + value, 0)
    ).toBe(numbers.length);
  });

  it('should handle one number from each group', () => {
    const numbers = [
      1, 6, 11, 16, 21
    ];

    const result = engineer.generate(numbers);

    expect(result).toEqual([
      1,
      1,
      1,
      1,
      1
    ]);
  });
});