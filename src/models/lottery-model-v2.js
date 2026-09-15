import * as tf from '@tensorflow/tfjs-node';

export class LotteryModelV2 {
  create() {
    const input = tf.input({
      shape: [100],
      name: 'features'
    });

    const dense128 = tf.layers.dense({
      units: 128,
      activation: 'relu',
      name: 'shared_dense_128'
    }).apply(input);

    const dropout = tf.layers.dropout({
      rate: 0.2,
      name: 'shared_dropout'
    }).apply(dense128);

    const shared = tf.layers.dense({
      units: 64,
      activation: 'relu',
      name: 'shared_dense_64'
    }).apply(dropout);

    const numberOutput = tf.layers.dense({
      units: 25,
      activation: 'sigmoid',
      name: 'number_output'
    }).apply(shared);

    const groupOutput = tf.layers.dense({
      units: 5,
      activation: 'softmax',
      name: 'group_output'
    }).apply(shared);

    const model = tf.model({
      inputs: input,
      outputs: [
        numberOutput,
        groupOutput
      ],
      name: 'lottery_model_v2'
    });

    const binaryCrossEntropy = (
      yTrue,
      yPred
    ) => {
      return tf.metrics.binaryCrossentropy(
        yTrue,
        yPred
      ).mean();
    };

    const klDivergence = (
      yTrue,
      yPred
    ) => {
      const epsilon = tf.scalar(1e-7);

      const safeTrue =
        tf.maximum(yTrue, epsilon);

      const safePred =
        tf.maximum(yPred, epsilon);

      return tf.sum(
        tf.mul(
          safeTrue,
          tf.log(
            tf.div(
              safeTrue,
              safePred
            )
          )
        ),
        -1
      ).mean();
    };

    model.compile({
      optimizer: tf.train.adam(0.001),

      loss: {
        number_output:
          binaryCrossEntropy,

        group_output:
          klDivergence
      },

      lossWeights: {
        number_output: 1.0,
        group_output: 0.5
      }
    });

    return model;
  }
}