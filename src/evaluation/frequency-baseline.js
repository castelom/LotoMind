import { FrequencyNumberScorer } from '../scoring/number/frequency-number-scorer.js';
import { Backtester } from './backtester.js';
import { RewardCalculator } from './reward-calculator.js';
import { BacktestMetrics } from './backtest-metrics.js';

export class FrequencyBaseline {
  constructor({
    predictionSize = 15,
    minimumHistory = 20
  } = {}) {
    this.predictionSize = predictionSize;
    this.minimumHistory = minimumHistory;
  }

  run(contests) {
    const scorer =
      new FrequencyNumberScorer();

    const backtester = new Backtester({
      scorer,
      predictionSize: this.predictionSize,
      minimumHistory: this.minimumHistory
    });

    const results =
      backtester.run(contests);

    const rewardCalculator =
      new RewardCalculator();

    const evaluatedResults =
      results.map(result => ({
        ...result,
        reward: rewardCalculator.calculate(
          result.hits
        )
      }));

    const metricsCalculator =
      new BacktestMetrics();

    const benchmarkMetrics =
      metricsCalculator.calculate(
        evaluatedResults
      );

    return {
      configuration: {
        predictionSize: this.predictionSize,
        minimumHistory: this.minimumHistory,
        totalContests: contests.length
      },

      benchmarkMetrics
    };
  }
}