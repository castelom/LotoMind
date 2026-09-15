import * as tf from '@tensorflow/tfjs-node';

export class TensorDatasetV2 {
  static from(dataset) {
    if (!Array.isArray(dataset)) {
      throw new Error(
        'Dataset must be an array'
      );
    }

    if (dataset.length === 0) {
      throw new Error(
        'Dataset must not be empty'
      );
    }

    const features =
      dataset.map(
        sample => sample.features
      );

    const numberTargets =
      dataset.map(
        sample => sample.target
      );

    const groupTargets =
      dataset.map(
        sample => sample.groupTarget
      );

    return {
      features: tf.tensor2d(features),

      targets: {
        number_output:
          tf.tensor2d(numberTargets),

        group_output:
          tf.tensor2d(groupTargets)
      }
    };
  }
}