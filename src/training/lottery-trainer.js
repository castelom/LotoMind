import * as tf from '@tensorflow/tfjs-node';
import { LotteryModel } from '../models/lottery-model.js';
import { TensorDataset } from '../datasets/tensor-dataset.js';

export class LotteryTrainer {
  constructor({
    epochs = 50,
    batchSize = 32
  } = {}) {
    this.epochs = epochs;
    this.batchSize = batchSize;
  }

  async train(trainDataset, validationDataset) {
    const trainTensor = TensorDataset.from(trainDataset);
    const validationTensor =
      TensorDataset.from(validationDataset);

    const modelFactory = new LotteryModel();
    const model = modelFactory.create();

    const earlyStopping = tf.callbacks.earlyStopping({
      monitor: 'val_loss',
      patience: 5,
      restoreBestWeight: true
    });

    const history = await model.fit(
      trainTensor.features,
      trainTensor.targets,
      {
        epochs: this.epochs,
        batchSize: this.batchSize,
        validationData: [
          validationTensor.features,
          validationTensor.targets
        ],
        shuffle: false,
        callbacks: [earlyStopping],
        verbose: 1
      }
    );

    trainTensor.features.dispose();
    trainTensor.targets.dispose();

    validationTensor.features.dispose();
    validationTensor.targets.dispose();

    return {
      model,
      history
    };
  }
}