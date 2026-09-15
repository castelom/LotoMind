import { describe, test, expect } from 'vitest';

import { FeatureEngineerV2 } from '../../src/features/feature-engineer-v2.js';

describe('FeatureEngineerV2', () => {
  test('should generate group target', () => {
    const contests = Array.from(
      { length: 21 },
      (_, index) => ({
        number: index + 1,
        numbers: [
          1, 2, 3, 4,
          6, 7, 8,
          11, 12, 13,
          16, 17, 18,
          21, 22
        ]
      })
    );

    const engineer =
      new FeatureEngineerV2({
        windowSize: 20,
        recentWindowSize: 5
      });

    const dataset =
      engineer.generate(contests);

    expect(dataset).toHaveLength(1);

    expect(dataset[0].groupTarget).toEqual([
      4 / 15,
      3 / 15,
      3 / 15,
      3 / 15,
      2 / 15
    ]);
  });
});