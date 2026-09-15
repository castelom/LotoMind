import { FeatureEngineer } from './feature-engineer.js';
import { GroupFeatureEngineer } from './group-feature-engineer.js';

export class FeatureEngineerV2 {
  constructor({
    windowSize = 20,
    recentWindowSize = 5,
    groupSize = 5,
    numberOfGroups = 5
  } = {}) {
    this.windowSize = windowSize;
    this.recentWindowSize = recentWindowSize;

    this.featureEngineer =
      new FeatureEngineer({
        windowSize,
        recentWindowSize
      });

    this.groupFeatureEngineer =
      new GroupFeatureEngineer({
        groupSize,
        numberOfGroups
      });
  }

  generate(contests) {
    const baseDataset =
      this.featureEngineer.generate(contests);

    return baseDataset.map((sample, index) => {
      const contestIndex =
        this.windowSize + index;

      const contest =
        contests[contestIndex];

      const groupCounts =
        this.groupFeatureEngineer.generate(
          contest.numbers
        );

      const groupTarget =
        this.#normalizeGroupCounts(
          groupCounts
        );

      return {
        ...sample,
        groupTarget
      };
    });
  }

  #normalizeGroupCounts(groupCounts) {
    const total =
      groupCounts.reduce(
        (sum, count) => sum + count,
        0
      );

    if (total === 0) {
      throw new Error(
        'Group counts must contain at least one number'
      );
    }

    return groupCounts.map(
      count => count / total
    );
  }
}