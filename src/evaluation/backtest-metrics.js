export class BacktestMetrics {
  calculate(results) {
    if (!Array.isArray(results)) {
      throw new Error('Results must be an array');
    }

    if (results.length === 0) {
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

    const hits = results.map(result => result.hits);

    const totalReward = results.reduce(
      (sum, result) => sum + (result.reward ?? 0),
      0
    );

    return {
      totalContests: results.length,

      averageHits: this.#average(hits),

      medianHits: this.#median(hits),

      maxHits: Math.max(...hits),

      count11Plus: this.#countAtLeast(hits, 11),
      count12Plus: this.#countAtLeast(hits, 12),
      count13Plus: this.#countAtLeast(hits, 13),
      count14Plus: this.#countAtLeast(hits, 14),
      count15: this.#count(hits, 15),

      totalReward: totalReward,

      averageReward:
        totalReward / results.length
    };
  }

  #average(values) {
    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );

    return total / values.length;
  }

  #median(values) {
    const sorted = [...values].sort(
      (a, b) => a - b
    );

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (
        (sorted[middle - 1] + sorted[middle]) / 2
      );
    }

    return sorted[middle];
  }

  #countAtLeast(values, minimum) {
    return values.filter(
      value => value >= minimum
    ).length;
  }

  #count(values, target) {
    return values.filter(
      value => value === target
    ).length;
  }
}