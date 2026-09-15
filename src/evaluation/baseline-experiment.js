import { RandomBaseline } from './random-baseline.js';
import { FrequencyBaseline } from './frequency-baseline.js';

export class BaselineExperiment {
  constructor({
    predictionSizes = [15, 16, 17, 18, 19, 20],
    randomIterations = 100,
    minimumHistory = 20
  } = {}) {
    this.predictionSizes = predictionSizes;
    this.randomIterations = randomIterations;
    this.minimumHistory = minimumHistory;
  }

  run(contests) {
    const results = [];

    for (const predictionSize of this.predictionSizes) {
      console.log(
        `\n=== ${predictionSize} DEZENAS ===`
      );

      const random = new RandomBaseline({
        iterations: this.randomIterations,
        predictionSize,
        minimumHistory: this.minimumHistory
      });

      console.log('Executando Random...');

      const randomResult = random.run(contests);

      const frequency = new FrequencyBaseline({
        predictionSize,
        minimumHistory: this.minimumHistory
      });

      console.log('Executando Frequency...');

      const frequencyResult =
        frequency.run(contests);

      results.push({
        predictionSize,

        random: {
          benchmarkMetrics:
            randomResult.benchmarkMetrics,

          statistics:
            randomResult.statistics
        },

        frequency: {
          benchmarkMetrics:
            frequencyResult.benchmarkMetrics
        }
      });
    }

    return {
      configuration: {
        predictionSizes: this.predictionSizes,
        randomIterations: this.randomIterations,
        minimumHistory: this.minimumHistory,
        totalContests: contests.length
      },

      comparisons: results
    };
  }
}