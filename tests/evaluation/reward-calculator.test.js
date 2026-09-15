import { describe, it, expect } from 'vitest';
import { RewardCalculator } from '../../src/evaluation/reward-calculator.js';

describe('RewardCalculator', () => {
  it('should return zero when there is no prize', () => {
    const calculator = new RewardCalculator();

    expect(calculator.calculate(0)).toBe(0);
    expect(calculator.calculate(10)).toBe(0);
  });

  it('should calculate reward for 11 hits', () => {
    const calculator = new RewardCalculator();

    expect(calculator.calculate(11)).toBe(1);
  });

  it('should calculate reward for 12 hits', () => {
    const calculator = new RewardCalculator();

    expect(calculator.calculate(12)).toBe(2);
  });

  it('should calculate reward for 13 hits', () => {
    const calculator = new RewardCalculator();

    expect(calculator.calculate(13)).toBe(4);
  });

  it('should calculate reward for 14 hits', () => {
    const calculator = new RewardCalculator();

    expect(calculator.calculate(14)).toBe(15);
  });

  it('should calculate reward for 15 hits', () => {
    const calculator = new RewardCalculator();

    expect(calculator.calculate(15)).toBe(100);
  });

  it('should support a custom reward table', () => {
    const calculator = new RewardCalculator({
      rewardTable: {
        11: 10,
        12: 20,
        13: 30,
        14: 50,
        15: 1000
      }
    });

    expect(calculator.calculate(11)).toBe(10);
    expect(calculator.calculate(14)).toBe(50);
    expect(calculator.calculate(15)).toBe(1000);
  });

  it('should reject invalid hits', () => {
    const calculator = new RewardCalculator();

    expect(() => calculator.calculate(-1))
      .toThrow();

    expect(() => calculator.calculate(11.5))
      .toThrow();

    expect(() => calculator.calculate('15'))
      .toThrow();
  });
});