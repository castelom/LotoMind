import { RandomNumberScorer } from '../scoring/number/random-number-scorer.js';
import { Backtester } from './backtester.js';
import { RewardCalculator } from './reward-calculator.js';
import { BacktestMetrics } from './backtest-metrics.js';

export class RandomBaseline {
  constructor({
    iterations = 100,
    predictionSize = 15,
    minimumHistory = 20
  } = {}) {
    this.iterations = iterations;
    this.predictionSize = predictionSize;
    this.minimumHistory = minimumHistory;
  }

  run(contests) {
    const rewardCalculator = new RewardCalculator();
    const metricsCalculator = new BacktestMetrics();

    const runs = [];

    for (
      let iteration = 1;
      iteration <= this.iterations;
      iteration++
    ) {
      const scorer = new RandomNumberScorer();

      const backtester = new Backtester({
        scorer,
        predictionSize: this.predictionSize,
        minimumHistory: this.minimumHistory
      });

      const results = backtester.run(contests);

      const evaluatedResults = results.map(result => ({
        ...result,
        reward: rewardCalculator.calculate(result.hits)
      }));

      const metrics =
        metricsCalculator.calculate(evaluatedResults);

      runs.push({
        iteration,
        metrics
      });
    }

    return {
      configuration: {
        iterations: this.iterations,
        predictionSize: this.predictionSize,
        minimumHistory: this.minimumHistory,
        totalContests: contests.length,
        evaluatedContests:
          runs[0]?.metrics.totalContests ?? 0
      },

      benchmarkMetrics:
        this.#calculateBenchmarkMetrics(runs),

      statistics:
        this.#calculateStatistics(runs),

      runs
    };
  }

  #calculateBenchmarkMetrics(runs) {
    if (runs.length === 0) {
      return {
        totalContests: 0,
        averageHits: 0,
        medianHits: 0,
        maxHits: 0,
        count11Plus: 0,
        count12Plus: 0,
        count13Plus: 0,
        count14Plus: 0,
        count15: 0,
        totalReward: 0,
        averageReward: 0
      };
    }

    const metrics = runs.map(
      run => run.metrics
    );

    return {
      totalContests: metrics[0].totalContests,

      averageHits: this.#mean(
        metrics.map(item => item.averageHits)
      ),

      medianHits: this.#mean(
        metrics.map(item => item.medianHits)
      ),

      maxHits: Math.max(
        ...metrics.map(item => item.maxHits)
      ),

      count11Plus: this.#mean(
        metrics.map(item => item.count11Plus)
      ),

      count12Plus: this.#mean(
        metrics.map(item => item.count12Plus)
      ),

      count13Plus: this.#mean(
        metrics.map(item => item.count13Plus)
      ),

      count14Plus: this.#mean(
        metrics.map(item => item.count14Plus)
      ),

      count15: this.#mean(
        metrics.map(item => item.count15)
      ),

      totalReward: this.#mean(
        metrics.map(item => item.totalReward)
      ),

      averageReward: this.#mean(
        metrics.map(item => item.averageReward)
      )
    };
  }

  #calculateStatistics(runs) {
    const metrics = runs.map(
      run => run.metrics
    );

    return {
      averageHits: this.#statistics(
        metrics.map(item => item.averageHits)
      ),

      medianHits: this.#statistics(
        metrics.map(item => item.medianHits)
      ),

      maxHits: this.#statistics(
        metrics.map(item => item.maxHits)
      ),

      count11Plus: this.#statistics(
        metrics.map(item => item.count11Plus)
      ),

      count12Plus: this.#statistics(
        metrics.map(item => item.count12Plus)
      ),

      count13Plus: this.#statistics(
        metrics.map(item => item.count13Plus)
      ),

      count14Plus: this.#statistics(
        metrics.map(item => item.count14Plus)
      ),

      count15: this.#statistics(
        metrics.map(item => item.count15)
      ),

      totalReward: this.#statistics(
        metrics.map(item => item.totalReward)
      ),

      averageReward: this.#statistics(
        metrics.map(item => item.averageReward)
      )
    };
  }

  #statistics(values) {
    const mean = this.#mean(values);

    const standardDeviation =
      this.#standardDeviation(
        values,
        mean
      );

    return {
      mean,
      standardDeviation,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  #mean(values) {
    return (
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length
    );
  }

  #standardDeviation(values, mean) {
    const variance =
      values.reduce(
        (sum, value) =>
          sum + Math.pow(value - mean, 2),
        0
      ) / values.length;

    return Math.sqrt(variance);
  }
}