import { describe, test, expect } from 'vitest';

import { TensorDatasetV2 } from '../../src/datasets/tensor-dataset-v2.js';

describe('TensorDatasetV2', () => {
  test('should create tensors for both outputs', () => {
    const dataset = [
      {
        features: Array(100).fill(0),
        target: Array(25).fill(0),
        groupTarget: [
          0.2,
          0.2,
          0.2,
          0.2,
          0.2
        ]
      },
      {
        features: Array(100).fill(1),
        target: Array(25).fill(1),
        groupTarget: [
          0.2666667,
          0.2,
          0.2,
          0.2,
          0.1333333
        ]
      }
    ];

    const tensors =
      TensorDatasetV2.from(dataset);

    expect(
      tensors.features.shape
    ).toEqual([2, 100]);

    expect(
      tensors.targets.number_output.shape
    ).toEqual([2, 25]);

    expect(
      tensors.targets.group_output.shape
    ).toEqual([2, 5]);

    tensors.features.dispose();

    tensors.targets.number_output.dispose();

    tensors.targets.group_output.dispose();
  });
});