import * as tf from '@tensorflow/tfjs-node';

export class TensorDataset {
  static from(dataset) {
    const features = dataset.map(
      sample => sample.features
    );

    const targets = dataset.map(
      sample => sample.target
    );

    return {
      features: tf.tensor2d(features),
      targets: tf.tensor2d(targets)
    };
  }
}