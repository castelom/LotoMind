export class RewardCalculator {
  constructor({
    rewardTable = {
      11: 1,
      12: 2,
      13: 4,
      14: 15,
      15: 100
    }
  } = {}) {
    this.rewardTable = rewardTable;
  }

  calculate(hits) {
    if (!Number.isInteger(hits) || hits < 0) {
      throw new Error(
        'Hits must be a non-negative integer'
      );
    }

    return this.rewardTable[hits] ?? 0;
  }
}