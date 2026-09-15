import * as tf from '@tensorflow/tfjs-node';

export class LotteryModel {
  create() {
    const model = tf.sequential();

    model.add(
      tf.layers.dense({
        inputShape: [100],
        units: 128,
        activation: 'relu'
      })
    );

    model.add(
      tf.layers.dropout({
        rate: 0.2
      })
    );

    model.add(
      tf.layers.dense({
        units: 64,
        activation: 'relu'
      })
    );

    model.add(
      tf.layers.dense({
        units: 25,
        activation: 'sigmoid'
      })
    );

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['binaryAccuracy']
    });

    return model;
  }
}