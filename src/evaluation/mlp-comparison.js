export class MLPComparison {
  constructor({
    predictionSizes = [15, 16, 17, 18, 19, 20]
  } = {}) {
    this.predictionSizes = predictionSizes;
  }

  compare(v1, v2) {
    this.#validateTestSets(v1, v2);

    const comparisons = [];

    for (const predictionSize of this.predictionSizes) {
      const v1Metrics =
        this.#findMetrics(
          v1.benchmarkMetrics,
          predictionSize
        );

      const v2Metrics =
        this.#findMetrics(
          v2.benchmarkMetrics,
          predictionSize
        );

      comparisons.push({
        predictionSize,

        v1: v1Metrics,

        v2: v2Metrics,

        delta: {
          averageHits:
            v2Metrics.averageHits -
            v1Metrics.averageHits,

          medianHits:
            v2Metrics.medianHits -
            v1Metrics.medianHits,

          maxHits:
            v2Metrics.maxHits -
            v1Metrics.maxHits,

          count11Plus:
            v2Metrics.count11Plus -
            v1Metrics.count11Plus,

          count12Plus:
            v2Metrics.count12Plus -
            v1Metrics.count12Plus,

          count13Plus:
            v2Metrics.count13Plus -
            v1Metrics.count13Plus,

          count14Plus:
            v2Metrics.count14Plus -
            v1Metrics.count14Plus,

          count15:
            v2Metrics.count15 -
            v1Metrics.count15,

          totalReward:
            v2Metrics.totalReward -
            v1Metrics.totalReward,

          averageReward:
            v2Metrics.averageReward -
            v1Metrics.averageReward
        }
      });
    }

    return comparisons;
  }

  print(comparisons) {
    console.log(
      '\n=== COMPARAÇÃO MLP V1 × V2 ==='
    );

    console.table(
      comparisons.map(item => ({
        Dezenas:
          item.predictionSize,

        'V1 Hits':
          item.v1.averageHits.toFixed(4),

        'V2 Hits':
          item.v2.averageHits.toFixed(4),

        'Δ Hits':
          item.delta.averageHits.toFixed(4),

        'V1 Reward':
          item.v1.averageReward.toFixed(4),

        'V2 Reward':
          item.v2.averageReward.toFixed(4),

        'Δ Reward':
          item.delta.averageReward.toFixed(4),

        'V1 Total Reward':
          item.v1.totalReward.toFixed(2),

        'V2 Total Reward':
          item.v2.totalReward.toFixed(2),

        'Δ Total Reward':
          item.delta.totalReward.toFixed(2),

        'V1 15':
          item.v1.count15,

        'V2 15':
          item.v2.count15,

        'Δ 15':
          item.delta.count15
      }))
    );
  }

  #validateTestSets(v1, v2) {
    if (!v1?.test?.dataset) {
      throw new Error(
        'MLP V1 result must contain test.dataset'
      );
    }

    if (!v2?.test?.dataset) {
      throw new Error(
        'MLP V2 result must contain test.dataset'
      );
    }

    const v1Tests =
      v1.test.dataset;

    const v2Tests =
      v2.test.dataset;

    if (
      v1Tests.length !==
      v2Tests.length
    ) {
      throw new Error(
        'MLP V1 and V2 have different test sizes'
      );
    }

    for (
      let i = 0;
      i < v1Tests.length;
      i++
    ) {
      const v1Contest =
        v1Tests[i].contestNumber;

      const v2Contest =
        v2Tests[i].contestNumber;

      if (
        v1Contest !==
        v2Contest
      ) {
        throw new Error(
          `Test datasets differ at index ${i}: ` +
          `V1=${v1Contest}, ` +
          `V2=${v2Contest}`
        );
      }
    }

    console.log(
      `\nTest set validado: ${v1Tests.length} concursos`
    );
  }

  #findMetrics(
    metrics,
    predictionSize
  ) {
    const result =
      metrics.find(
        item =>
          item.predictionSize ===
          predictionSize
      );

    if (!result) {
      throw new Error(
        `Metrics not found for prediction size ${predictionSize}`
      );
    }

    return result;
  }
}