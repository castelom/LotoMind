export class BaselineComparison {
  compare({ baseline, mlp }) {
    if (!baseline) {
      throw new Error(
        'Baseline result is required'
      );
    }

    if (!mlp) {
      throw new Error(
        'MLP result is required'
      );
    }

    if (!Array.isArray(baseline.comparisons)) {
      throw new Error(
        'Baseline result must contain comparisons'
      );
    }

    if (!Array.isArray(mlp.benchmarkMetrics)) {
      throw new Error(
        'MLP result must contain benchmarkMetrics'
      );
    }

    return mlp.benchmarkMetrics.map(
      mlpMetric => {
        const baselineItem =
          baseline.comparisons.find(
            item =>
              item.predictionSize ===
              mlpMetric.predictionSize
          );

        if (!baselineItem) {
          throw new Error(
            `No baseline found for prediction size ${mlpMetric.predictionSize}`
          );
        }

        const random =
          baselineItem.random.benchmarkMetrics;

        const frequency =
          baselineItem.frequency.benchmarkMetrics;

        return {
          predictionSize:
            mlpMetric.predictionSize,

          random: {
            averageHits:
              random.averageHits,
            averageReward:
              random.averageReward
          },

          frequency: {
            averageHits:
              frequency.averageHits,
            averageReward:
              frequency.averageReward
          },

          mlp: {
            averageHits:
              mlpMetric.averageHits,
            averageReward:
              mlpMetric.averageReward,
            totalReward:
              mlpMetric.totalReward,
            maxHits:
              mlpMetric.maxHits,
            count11Plus:
              mlpMetric.count11Plus,
            count12Plus:
              mlpMetric.count12Plus,
            count13Plus:
              mlpMetric.count13Plus,
            count14Plus:
              mlpMetric.count14Plus,
            count15:
              mlpMetric.count15
          },

          mlpVsFrequency:
            mlpMetric.averageHits -
            frequency.averageHits
        };
      }
    );
  }
}