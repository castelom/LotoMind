import { describe, expect, it } from 'vitest';
import { DatasetSplitter } from '../../src/datasets/dataset-splitter.js';

describe('DatasetSplitter', () => {
  const dataset = Array.from(
    { length: 100 },
    (_, index) => ({
      contestNumber: index + 1,
      features: [],
      target: []
    })
  );

  it('should split dataset chronologically', () => {
    const splitter = new DatasetSplitter();

    const {
      train,
      validation,
      test
    } = splitter.split(dataset);

    expect(train[0].contestNumber).toBe(1);
    expect(
      train[train.length - 1].contestNumber
    ).toBe(70);

    expect(validation[0].contestNumber).toBe(71);
    expect(
      validation[validation.length - 1].contestNumber
    ).toBe(85);

    expect(test[0].contestNumber).toBe(86);
    expect(
      test[test.length - 1].contestNumber
    ).toBe(100);
  });

  it('should preserve all samples', () => {
    const splitter = new DatasetSplitter();

    const result = splitter.split(dataset);

    expect(
      result.train.length +
      result.validation.length +
      result.test.length
    ).toBe(dataset.length);
  });

  it('should reject invalid ratios', () => {
    expect(() => {
      new DatasetSplitter({
        trainRatio: 0.7,
        validationRatio: 0.2,
        testRatio: 0.2
      });
    }).toThrow();
  });

  it('should reject non-array datasets', () => {
    const splitter = new DatasetSplitter();

    expect(() => {
      splitter.split(null);
    }).toThrow();
  });
});
