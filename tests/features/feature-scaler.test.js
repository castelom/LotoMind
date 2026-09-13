import { describe, expect, it } from 'vitest';
import { FeatureScaler } from '../../src/features/feature-scaler.js';

describe('FeatureScaler', () => {
  it('should normalize features between 0 and 1', () => {
    const dataset = [
      {
        features: [0, 10],
        target: []
      },
      {
        features: [5, 20],
        target: []
      },
      {
        features: [10, 30],
        target: []
      }
    ];

    const scaler = new FeatureScaler();

    scaler.fit(dataset);

    const result = scaler.transform(dataset);

    expect(result[0].features).toEqual([0, 0]);
    expect(result[1].features).toEqual([0.5, 0.5]);
    expect(result[2].features).toEqual([1, 1]);
  });

  it('should use training parameters when transforming another dataset', () => {
    const train = [
      {
        features: [0, 10],
        target: []
      },
      {
        features: [10, 20],
        target: []
      }
    ];

    const validation = [
      {
        features: [5, 15],
        target: []
      }
    ];

    const scaler = new FeatureScaler();

    scaler.fit(train);

    const result = scaler.transform(validation);

    expect(result[0].features).toEqual([
      0.5,
      0.5
    ]);
  });

  it('should not fit using validation data', () => {
    const train = [
      {
        features: [0],
        target: []
      },
      {
        features: [10],
        target: []
      }
    ];

    const validation = [
      {
        features: [100],
        target: []
      }
    ];

    const scaler = new FeatureScaler();

    scaler.fit(train);

    const result = scaler.transform(validation);

    // 100 is outside the training range.
    expect(result[0].features[0]).toBe(10);
  });

  it('should return zero when min and max are equal', () => {
    const dataset = [
      {
        features: [5],
        target: []
      },
      {
        features: [5],
        target: []
      }
    ];

    const scaler = new FeatureScaler();

    scaler.fit(dataset);

    const result = scaler.transform(dataset);

    expect(result[0].features[0]).toBe(0);
    expect(result[1].features[0]).toBe(0);
  });

  it('should not transform before fitting', () => {
    const scaler = new FeatureScaler();

    expect(() => {
      scaler.transform([
        {
          features: [1],
          target: []
        }
      ]);
    }).toThrow();
  });

  it('should reject an empty dataset', () => {
    const scaler = new FeatureScaler();

    expect(() => {
      scaler.fit([]);
    }).toThrow();
  });
});