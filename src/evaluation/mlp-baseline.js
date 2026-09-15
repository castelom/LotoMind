import * as tf from '@tensorflow/tfjs-node';

import { FeatureEngineer } from '../features/feature-engineer.js';
import { FeatureScaler } from '../features/feature-scaler.js';
import { DatasetSplitter } from '../datasets/dataset-splitter.js';
import { TensorDataset } from '../datasets/tensor-dataset.js';
import { LotteryModel } from '../models/lottery-model.js';
import { RewardCalculator } from './reward-calculator.js';

export class MLPBaseline {
  constructor({
    predictionSizes = [15, 16, 17, 18, 19, 20],
    windowSize = 20,
    recentWindowSize = 5,
    epochs = 50,
    batchSize = 32
  } = {}) {
    this.predictionSizes = predictionSizes;
    this.windowSize = windowSize;
    this.recentWindowSize = recentWindowSize;
    this.epochs = epochs;
    this.batchSize = batchSize;
  }

  async run(contests) {
    // ============================
    // FEATURE ENGINEERING
    // ============================

    const featureEngineer =
      new FeatureEngineer({
        windowSize: this.windowSize,
        recentWindowSize: this.recentWindowSize
      });

    const dataset =
      featureEngineer.generate(contests);

    // ============================
    // DATASET SPLIT
    // ============================

    const splitter =
      new DatasetSplitter();

    const {
      train,
      validation,
      test
    } = splitter.split(dataset);

    console.log(`Dataset: ${dataset.length}`);
    console.log(`Train: ${train.length}`);
    console.log(`Validation: ${validation.length}`);
    console.log(`Test: ${test.length}`);

    // ============================
    // SCALING
    // ============================

    const scaler =
      new FeatureScaler();

    // IMPORTANTE:
    // fit somente no train
    const scaledTrain =
      scaler.fitTransform(train);

    const scaledValidation =
      scaler.transform(validation);

    const scaledTest =
      scaler.transform(test);

    // ============================
    // TENSORS
    // ============================

    const trainTensor =
      TensorDataset.from(scaledTrain);

    const validationTensor =
      TensorDataset.from(scaledValidation);

    const testTensor =
      TensorDataset.from(scaledTest);

    // ============================
    // MODEL
    // ============================

    const modelFactory =
      new LotteryModel();

    const model =
      modelFactory.create();

    model.summary();

    // ============================
    // TRAINING
    // ============================

    console.log('\n=== TREINAMENTO MLP ===');

    const earlyStopping =
      tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: 5,
        restoreBestWeight: true
      });

    const history =
      await model.fit(
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

          callbacks: [
            earlyStopping
          ],

          verbose: 1
        }
      );

    console.log(
      `\nTreinamento terminou em ${history.epoch.length} épocas.`
    );

    // ============================
    // TEST
    // ============================

    console.log('\n=== AVALIAÇÃO TEST ===');

    const predictions =
      model.predict(
        testTensor.features
      );

    const predictionValues =
      predictions.arraySync();

    // ============================
    // REWARD
    // ============================

    const rewardCalculator =
      new RewardCalculator();

    // ============================
    // RESULTS
    // ============================

    const testResults =
      this.#calculateTestResults(
        test,
        predictionValues,
        rewardCalculator
      );

    predictions.dispose();

    // ============================
    // METRICS
    // ============================

    const benchmarkMetrics =
      this.#calculateMetrics(
        testResults
      );

    // ============================
    // CLEANUP
    // ============================

    trainTensor.features.dispose();
    trainTensor.targets.dispose();

    validationTensor.features.dispose();
    validationTensor.targets.dispose();

    testTensor.features.dispose();
    testTensor.targets.dispose();

    return {
      configuration: {
        predictionSizes:
          this.predictionSizes,

        windowSize:
          this.windowSize,

        recentWindowSize:
          this.recentWindowSize,

        epochs:
          this.epochs,

        batchSize:
          this.batchSize,

        trainSize:
          train.length,

        validationSize:
          validation.length,

        testSize:
          test.length
      },

      training: {
        epochsCompleted:
          history.epoch.length,

        finalLoss:
          history.history.loss.at(-1),

        finalValidationLoss:
          history.history.val_loss.at(-1)
      },

      benchmarkMetrics,

      model,
      scaler,
      featureEngineer
    };
  }

  #calculateTestResults(
    testDataset,
    predictions,
    rewardCalculator
  ) {
    return this.predictionSizes.map(
      predictionSize => {
        const results = [];

        for (
          let i = 0;
          i < testDataset.length;
          i++
        ) {
          const scores =
            predictions[i];

          // ============================
          // TOP K
          // ============================

          const prediction =
            scores
              .map((score, index) => ({
                number: index + 1,
                score
              }))
              .sort(
                (a, b) =>
                  b.score - a.score
              )
              .slice(
                0,
                predictionSize
              )
              .map(
                item => item.number
              );

          // ============================
          // ACTUAL
          // ============================

          const actual =
            testDataset[i].target
              .map((value, index) => ({
                number: index + 1,
                value
              }))
              .filter(
                item => item.value === 1
              )
              .map(
                item => item.number
              );

          // ============================
          // HITS
          // ============================

          const actualSet =
            new Set(actual);

          const hits =
            prediction.filter(
              number =>
                actualSet.has(number)
            ).length;

          // ============================
          // REWARD
          // ============================

          const reward =
            rewardCalculator.calculate(
              hits
            );

          results.push({
            contestNumber:
              testDataset[i].contestNumber,

            prediction,

            actual,

            hits,

            reward
          });
        }

        return {
          predictionSize,
          results
        };
      }
    );
  }

  #calculateMetrics(testResults) {
    return testResults.map(
      ({
        predictionSize,
        results
      }) => {
        const hits =
          results.map(
            result => result.hits
          );

        const rewards =
          results.map(
            result => result.reward
          );

        const averageHits =
          hits.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / hits.length;

        const totalReward =
          rewards.reduce(
            (sum, value) =>
              sum + value,
            0
          );

        return {
          predictionSize,

          totalContests:
            results.length,

          averageHits,

          medianHits:
            this.#median(hits),

          maxHits:
            Math.max(...hits),

          count11Plus:
            hits.filter(
              h => h >= 11
            ).length,

          count12Plus:
            hits.filter(
              h => h >= 12
            ).length,

          count13Plus:
            hits.filter(
              h => h >= 13
            ).length,

          count14Plus:
            hits.filter(
              h => h >= 14
            ).length,

          count15:
            hits.filter(
              h => h === 15
            ).length,

          totalReward,

          averageReward:
            totalReward /
            results.length
        };
      }
    );
  }

  #median(values) {
    const sorted =
      [...values].sort(
        (a, b) => a - b
      );

    const middle =
      Math.floor(
        sorted.length / 2
      );

    if (
      sorted.length % 2 === 0
    ) {
      return (
        (
          sorted[middle - 1] +
          sorted[middle]
        ) / 2
      );
    }

    return sorted[middle];
  }
}