export class GroupAwareSelector {
  constructor({
    groupSize = 5,
    numberOfGroups = 5
  } = {}) {
    this.groupSize = groupSize;
    this.numberOfGroups = numberOfGroups;
  }

  select(
    numberScores,
    groupScores,
    predictionSize
  ) {
    if (!Array.isArray(numberScores)) {
      throw new Error(
        'Number scores must be an array'
      );
    }

    if (!Array.isArray(groupScores)) {
      throw new Error(
        'Group scores must be an array'
      );
    }

    if (
      !Number.isInteger(predictionSize) ||
      predictionSize <= 0
    ) {
      throw new Error(
        'Prediction size must be a positive integer'
      );
    }

    const groupCounts =
      this.#calculateGroupCounts(
        groupScores,
        predictionSize
      );

    const selected = [];

    for (
      let groupIndex = 0;
      groupIndex < this.numberOfGroups;
      groupIndex++
    ) {
      const count =
        groupCounts[groupIndex];

      const start =
        groupIndex * this.groupSize + 1;

      const end =
        start + this.groupSize - 1;

      const groupNumbers =
        numberScores
          .filter(
            item =>
              item.number >= start &&
              item.number <= end
          )
          .sort(
            (a, b) =>
              b.score - a.score
          )
          .slice(0, count);

      selected.push(
        ...groupNumbers
      );
    }

    return selected
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .map(
        item => item.number
      );
  }

  #calculateGroupCounts(
    groupScores,
    predictionSize
  ) {
    const rawCounts =
      groupScores.map(
        score =>
          score * predictionSize
      );

    const counts =
      rawCounts.map(
        value =>
          Math.floor(value)
      );

    let remaining =
      predictionSize -
      counts.reduce(
        (sum, value) =>
          sum + value,
        0
      );

    const remainders =
      rawCounts
        .map(
          (value, index) => ({
            index,
            remainder:
              value -
              Math.floor(value)
          })
        )
        .sort(
          (a, b) =>
            b.remainder -
            a.remainder
        );

    for (
      let i = 0;
      i < remainders.length &&
      remaining > 0;
      i++
    ) {
      counts[
        remainders[i].index
      ]++;

      remaining--;
    }

    return counts;
  }
}