export class Backtester {
  constructor({
    scorer,
    predictionSize = 15
  }) {
    this.scorer = scorer;
    this.predictionSize = predictionSize;
  }

  run(contests) {
    const results = [];

    for (let i = 1; i < contests.length; i++) {
      const historicalContests = contests.slice(0, i);
      const targetContest = contests[i];

      const scores = this.scorer.score(
        historicalContests
      );

      const prediction = this.#getTopNumbers(scores);

      const hits = this.#calculateHits(
        prediction,
        targetContest.numbers
      );

      results.push({
        contestNumber: targetContest.number,
        prediction,
        actual: targetContest.numbers,
        hits
      });
    }

    return results;
  }

  #getTopNumbers(scores) {
    return [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, this.predictionSize)
      .map(item => item.number);
  }

  #calculateHits(prediction, actual) {
    const actualSet = new Set(actual);

    return prediction.filter(
      number => actualSet.has(number)
    ).length;
  }
}