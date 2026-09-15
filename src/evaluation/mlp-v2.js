import * as tf from '@tensorflow/tfjs-node';

import { FeatureEngineerV2 } from '../features/feature-engineer-v2.js';
import { FeatureScaler } from '../features/feature-scaler.js';
import { DatasetSplitter } from '../datasets/dataset-splitter.js';
import { TensorDatasetV2 } from '../datasets/tensor-dataset-v2.js';
import { LotteryModelV2 } from '../models/lottery-model-v2.js';
import { RewardCalculator } from './reward-calculator.js';

export class MLPV2 {
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
    console.log('\n=== MLP V2 ===');

    const featureEngineer =
      new FeatureEngineerV2({
        windowSize: this.windowSize,
        recentWindowSize: this.recentWindowSize
      });

    const dataset =
      featureEngineer.generate(contests);

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

    /*
     * IMPORTANTE:
     * scaler é ajustado SOMENTE com train.
     */
    const scaler =
      new FeatureScaler();

    const scaledTrain =
      scaler.fitTransform(train);

    const scaledValidation =
      scaler.transform(validation);

    const scaledTest =
      scaler.transform(test);

    const trainTensor =
      TensorDatasetV2.from(scaledTrain);

    const validationTensor =
      TensorDatasetV2.from(scaledValidation);

    const testTensor =
      TensorDatasetV2.from(scaledTest);

    const modelFactory =
      new LotteryModelV2();

    const model =
      modelFactory.create();

    model.summary();

    /*
     * Early stopping baseado na validation loss.
     */
    const earlyStopping =
      tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: 5,
        restoreBestWeight: true
      });

    console.log('\n=== TREINAMENTO MLP V2 ===');

    const history =
      await model.fit(
        trainTensor.features,
        trainTensor.targets,
        {
          epochs: this.epochs,

          batchSize:
            this.batchSize,

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

    /*
     * =====================================================
     * AVALIAÇÃO
     * =====================================================
     */

    console.log('\n=== AVALIAÇÃO TEST V2 ===');

    const predictions =
      model.predict(
        testTensor.features
      );

    /*
     * Output 1:
     * 565 concursos × 25 números
     */
    const numberPredictions =
      predictions[0].arraySync();

    /*
     * Output 2:
     * 565 concursos × 5 grupos
     */
    const groupPredictions =
      predictions[1].arraySync();

    console.log(
      'Number output shape:',
      predictions[0].shape
    );

    console.log(
      'Group output shape:',
      predictions[1].shape
    );

    console.log(
      '\nExemplo de previsão de grupos:'
    );

    console.log(
      groupPredictions[0]
    );

    /*
     * Calcula hits e rewards usando
     * SOMENTE o number output.
     */
    const rewardCalculator =
      new RewardCalculator();

    const benchmarkMetrics =
      this.#calculateNumberMetrics(
        test,
        numberPredictions,
        rewardCalculator
      );

    console.log(
      '\n=== MÉTRICAS MLP V2 ==='
    );

    console.table(
      benchmarkMetrics.map(item => ({
        Dezenas:
          item.predictionSize,

        'Average Hits':
          item.averageHits.toFixed(4),

        'Median Hits':
          item.medianHits,

        'Max Hits':
          item.maxHits,

        '11+':
          item.count11Plus,

        '12+':
          item.count12Plus,

        '13+':
          item.count13Plus,

        '14+':
          item.count14Plus,

        '15':
          item.count15,

        'Average Reward':
          item.averageReward.toFixed(4),

        'Total Reward':
          item.totalReward.toFixed(2)
      }))
    );

    /*
     * Liberar tensores.
     */
    predictions[0].dispose();
    predictions[1].dispose();

    trainTensor.features.dispose();
    trainTensor.targets.number_output.dispose();
    trainTensor.targets.group_output.dispose();

    validationTensor.features.dispose();
    validationTensor.targets.number_output.dispose();
    validationTensor.targets.group_output.dispose();

    testTensor.features.dispose();
    testTensor.targets.number_output.dispose();
    testTensor.targets.group_output.dispose();

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

      /*
       * Métricas da saída de números.
       */
      benchmarkMetrics,

      /*
       * Mantemos os objetos para análises futuras.
       */
      model,
      scaler,
      featureEngineer,

      test: {
        numberPredictions,
        groupPredictions,
        dataset: test
      }
    };
  }

  #calculateNumberMetrics(
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

          /*
           * Transforma:
           *
           * [0.4, 0.8, 0.2, ...]
           *
           * em:
           *
           * [
           *   { number: 1, score: 0.4 },
           *   { number: 2, score: 0.8 },
           *   ...
           * ]
           */
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

          /*
           * Recupera o resultado real.
           */
          const actual =
            testDataset[i].target
              .map(
                (value, index) => ({
                  number: index + 1,
                  value
                })
              )
              .filter(
                item => item.value === 1
              )
              .map(
                item => item.number
              );

          const actualSet =
            new Set(actual);

          /*
           * Calcula quantidade de acertos.
           */
          const hits =
            prediction.filter(
              number =>
                actualSet.has(number)
            ).length;

          /*
           * Calcula reward.
           */
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

          ...this.#calculateMetrics(
            results
          )
        };
      }
    );
  }

  #calculateMetrics(results) {
    const hits =
      results.map(
        result => result.hits
      );

    const rewards =
      results.map(
        result => result.reward
      );

    const totalReward =
      rewards.reduce(
        (sum, value) =>
          sum + value,
        0
      );

    return {
      totalContests:
        results.length,

      averageHits:
        hits.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / hits.length,

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
        results.length,

      results
    };
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