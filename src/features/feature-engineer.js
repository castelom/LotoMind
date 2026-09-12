export class FeatureEngineer {
  constructor({
    windowSize = 20,
    recentWindowSize = 5
  } = {}) {
    this.windowSize = windowSize;
    this.recentWindowSize = recentWindowSize;
  }

  generate(contests) {
    const dataset = [];

    for (let i = this.windowSize; i < contests.length; i++) {
      const targetContest = contests[i];

      const historicalContests = contests.slice(
        i - this.windowSize,
        i
      );

      const features = this.#generateFeatures(
        historicalContests
      );

      const target = this.#generateTarget(
        targetContest
      );

      dataset.push({
        contestNumber: targetContest.number,
        features,
        target
      });
    }

    return dataset;
  }

  #generateFeatures(contests) {
    const recentContests = contests.slice(
      -this.recentWindowSize
    );

    const features = [];

    for (let number = 1; number <= 25; number++) {
      const frequency = this.#calculateFrequency(
        contests,
        number
      );

      const recentFrequency = this.#calculateFrequency(
        recentContests,
        number
      );

      const delay = this.#calculateDelay(
        contests,
        number
      );

      const previousDraw = this.#wasInPreviousDraw(
        contests,
        number
      );

      features.push(
        frequency,
        recentFrequency,
        delay,
        previousDraw
      );
    }

    return features;
  }

  #calculateFrequency(contests, number) {
    return contests.filter(contest =>
      contest.numbers.includes(number)
    ).length;
  }

  #calculateDelay(contests, number) {
    for (let i = contests.length - 1; i >= 0; i--) {
      if (contests[i].numbers.includes(number)) {
        return contests.length - 1 - i;
      }
    }

    return contests.length;
  }

  #wasInPreviousDraw(contests, number) {
    const previousContest = contests[contests.length - 1];

    return previousContest.numbers.includes(number)
      ? 1
      : 0;
  }

  #generateTarget(contest) {
    return Array.from(
      { length: 25 },
      (_, index) =>
        contest.numbers.includes(index + 1) ? 1 : 0
    );
  }
}