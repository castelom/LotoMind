import * as tf from '@tensorflow/tfjs-node';

import { FeatureEngineer } from '../features/feature-engineer.js';
import { FeatureEngineerV2 } from '../features/feature-engineer-v2.js';

import { FeatureScaler } from '../features/feature-scaler.js';
import { DatasetSplitter } from '../datasets/dataset-splitter.js';

import { TensorDataset } from '../datasets/tensor-dataset.js';
import { TensorDatasetV2 } from '../datasets/tensor-dataset-v2.js';

import { LotteryModel } from '../models/lottery-model.js';
import { LotteryModelV2 } from '../models/lottery-model-v2.js';

import { GroupAwareSelector } from '../scoring/group-aware-selector.js';

export class MLPExperiment {
  constructor({
    iterations = 100,
    predictionSizes = [15, 16, 17, 18, 19, 20],
    windowSize = 20,
    recentWindowSize = 5,
    epochs = 50,
    batchSize = 32
  } = {}) {
    this.iterations = iterations;
    this.predictionSizes = predictionSizes;
    this.windowSize = windowSize;
    this.recentWindowSize = recentWindowSize;
    this.epochs = epochs;
    this.batchSize = batchSize;
  }

  async run(contests) {
    console.log(
      `\nExecutando ${this.iterations} experimentos...`
    );

    const v1Results = [];
    const v2Results = [];

    for (
      let iteration = 1;
      iteration <= this.iterations;
      iteration++
    ) {
      console.log(
        `\n========== ITERAÇÃO ${iteration}/${this.iterations} ==========`
      );

      console.log('\n--- MLP V1 ---');

      const v1 =
        await this.#runV1(contests);

      v1Results.push({
        iteration,
        metrics: v1
      });

      console.log('\n--- MLP V2 ---');

      const v2 =
        await this.#runV2(contests);

      v2Results.push({
        iteration,
        metrics: v2
      });
    }

    return {
      configuration: {
        iterations: this.iterations,
        predictionSizes: this.predictionSizes,
        windowSize: this.windowSize,
        recentWindowSize: this.recentWindowSize,
        epochs: this.epochs,
        batchSize: this.batchSize
      },

      v1: this.#aggregate(v1Results),

      v2: this.#aggregate(v2Results),

      comparison:
        this.#compare(
          v1Results,
          v2Results
        )
    };
  }

  async #runV1(contests) {
    const featureEngineer =
      new FeatureEngineer({
        windowSize: this.windowSize,
        recentWindowSize:
          this.recentWindowSize
      });

    const dataset =
      featureEngineer.generate(
        contests
      );

    const splitter =
      new DatasetSplitter();

    const {
      train,
      validation
    } = splitter.split(dataset);

    const scaler =
      new FeatureScaler();

    const scaledTrain =
      scaler.fitTransform(train);

    const scaledValidation =
      scaler.transform(validation);

    const trainTensor =
      TensorDataset.from(
        scaledTrain
      );

    const validationTensor =
      TensorDataset.from(
        scaledValidation
      );

    const modelFactory =
      new LotteryModel();

    const model =
      modelFactory.create();

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

          verbose: 0
        }
      );

    const predictions =
      model.predict(
        validationTensor.features
      );

    const predictionValues =
      predictions.arraySync();

    const metrics =
      this.#calculateV1Metrics(
        validation,
        predictionValues
      );

    predictions.dispose();

    trainTensor.features.dispose();
    trainTensor.targets.dispose();

    validationTensor.features.dispose();
    validationTensor.targets.dispose();

    model.dispose();

    return metrics;
  }

  async #runV2(contests) {
    const featureEngineer =
      new FeatureEngineerV2({
        windowSize: this.windowSize,
        recentWindowSize:
          this.recentWindowSize
      });

    const dataset =
      featureEngineer.generate(
        contests
      );

    const splitter =
      new DatasetSplitter();

    const {
      train,
      validation
    } = splitter.split(dataset);

    const scaler =
      new FeatureScaler();

    const scaledTrain =
      scaler.fitTransform(train);

    const scaledValidation =
      scaler.transform(validation);

    const trainTensor =
      TensorDatasetV2.from(
        scaledTrain
      );

    const validationTensor =
      TensorDatasetV2.from(
        scaledValidation
      );

    const modelFactory =
      new LotteryModelV2();

    const model =
      modelFactory.create();

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

          verbose: 0
        }
      );

    const predictions =
      model.predict(
        validationTensor.features
      );

    const numberPredictions =
      predictions[0].arraySync();

    const groupPredictions =
      predictions[1].arraySync();

    const selector =
      new GroupAwareSelector();

    const metrics =
      this.#calculateV2Metrics(
        validation,
        numberPredictions,
        groupPredictions,
        selector
      );

    predictions.forEach(
      prediction =>
        prediction.dispose()
    );

    trainTensor.features.dispose();

    trainTensor.targets.number_output.dispose();
    trainTensor.targets.group_output.dispose();

    validationTensor.features.dispose();

    validationTensor.targets.number_output.dispose();
    validationTensor.targets.group_output.dispose();

    model.dispose();

    return metrics;
  }

  #calculateV1Metrics(
    dataset,
    predictions
  ) {
    return this.predictionSizes.map(
      predictionSize => {
        const hits = [];

        for (
          let i = 0;
          i < dataset.length;
          i++
        ) {
          const prediction =
            predictions[i]
              .map(
                (score, index) => ({
                  number: index + 1,
                  score
                })
              )
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

          const actual =
            dataset[i].target
              .map(
                (value, index) => ({
                  number: index + 1,
                  value
                })
              )
              .filter(
                item =>
                  item.value === 1
              )
              .map(
                item =>
                  item.number
              );

          const actualSet =
            new Set(actual);

          hits.push(
            prediction.filter(
              number =>
                actualSet.has(number)
            ).length
          );
        }

        return {
          predictionSize,
          averageHits:
            this.#average(hits),
          medianHits:
            this.#median(hits),
          minHits:
            Math.min(...hits),
          maxHits:
            Math.max(...hits)
        };
      }
    );
  }

  #calculateV2Metrics(
    dataset,
    numberPredictions,
    groupPredictions,
    selector
  ) {
    return this.predictionSizes.map(
      predictionSize => {
        const hits = [];

        for (
          let i = 0;
          i < dataset.length;
          i++
        ) {
          const numberScores =
            numberPredictions[i]
              .map(
                (score, index) => ({
                  number: index + 1,
                  score
                })
              );

          const prediction =
            selector.select(
              numberScores,
              groupPredictions[i],
              predictionSize
            );

          const actual =
            dataset[i].target
              .map(
                (value, index) => ({
                  number: index + 1,
                  value
                })
              )
              .filter(
                item =>
                  item.value === 1
              )
              .map(
                item =>
                  item.number
              );

          const actualSet =
            new Set(actual);

          hits.push(
            prediction.filter(
              number =>
                actualSet.has(number)
            ).length
          );
        }

        return {
          predictionSize,
          averageHits:
            this.#average(hits),
          medianHits:
            this.#median(hits),
          minHits:
            Math.min(...hits),
          maxHits:
            Math.max(...hits)
        };
      }
    );
  }

  #aggregate(results) {
    return this.predictionSizes.map(
      predictionSize => {
        const values =
          results.map(
            result =>
              result.metrics.find(
                metric =>
                  metric.predictionSize ===
                  predictionSize
              )
          );

        const averageHits =
          values.map(
            value =>
              value.averageHits
          );

        return {
          predictionSize,

          averageHits:
            this.#average(averageHits),

          stdDev:
            this.#standardDeviation(
              averageHits
            ),

          min:
            Math.min(...averageHits),

          max:
            Math.max(...averageHits)
        };
      }
    );
  }

  #compare(v1Results, v2Results) {
    return this.predictionSizes.map(
      predictionSize => {
        const deltas = [];

        let v2Wins = 0;
        let v1Wins = 0;
        let ties = 0;

        for (
          let i = 0;
          i < this.iterations;
          i++
        ) {
          const v1 =
            v1Results[i].metrics.find(
              metric =>
                metric.predictionSize ===
                predictionSize
            );

          const v2 =
            v2Results[i].metrics.find(
              metric =>
                metric.predictionSize ===
                predictionSize
            );

          const delta =
            v2.averageHits -
            v1.averageHits;

          deltas.push(delta);

          if (delta > 0) {
            v2Wins++;
          } else if (delta < 0) {
            v1Wins++;
          } else {
            ties++;
          }
        }

        return {
          predictionSize,

          averageDelta:
            this.#average(deltas),

          stdDevDelta:
            this.#standardDeviation(
              deltas
            ),

          v2Wins,

          v1Wins,

          ties,

          v2WinRate:
            v2Wins /
            this.iterations
        };
      }
    );
  }

  #average(values) {
    return (
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / values.length
    );
  }

  #standardDeviation(values) {
    const mean =
      this.#average(values);

    const variance =
      this.#average(
        values.map(
          value =>
            Math.pow(
              value - mean,
              2
            )
        )
      );

    return Math.sqrt(variance);
  }

  #median(values) {
    const sorted =
      [...values].sort(
        (a, b) =>
          a - b
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

  print(result) {
    console.log(
      '\n=== MÉDIA DAS 100 EXECUÇÕES ==='
    );

    console.table(
      result.comparison.map(
        item => ({
          Dezenas:
            item.predictionSize,

          'Δ médio':
            item.averageDelta.toFixed(4),

          'Δ std':
            item.stdDevDelta.toFixed(4),

          'V2 venceu':
            item.v2Wins,

          'V1 venceu':
            item.v1Wins,

          Empates:
            item.ties,

          'V2 win rate':
            `${(
              item.v2WinRate * 100
            ).toFixed(1)}%`
        })
      )
    );

    console.log(
      '\n=== MLP V1 ==='
    );

    console.table(
      result.v1.map(
        item => ({
          Dezenas:
            item.predictionSize,

          'Média Hits':
            item.averageHits.toFixed(4),

          'Std':
            item.stdDev.toFixed(4),

          'Min':
            item.min.toFixed(4),

          'Max':
            item.max.toFixed(4)
        })
      )
    );

    console.log(
      '\n=== MLP V2 ==='
    );

    console.table(
      result.v2.map(
        item => ({
          Dezenas:
            item.predictionSize,

          'Média Hits':
            item.averageHits.toFixed(4),

          'Std':
            item.stdDev.toFixed(4),

          'Min':
            item.min.toFixed(4),

          'Max':
            item.max.toFixed(4)
        })
      )
    );
  }
}