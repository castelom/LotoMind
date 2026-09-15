export class GroupFeatureEngineer {
  constructor({
    groupSize = 5,
    numberOfGroups = 5
  } = {}) {
    this.groupSize = groupSize;
    this.numberOfGroups = numberOfGroups;
  }

  generate(numbers) {
    if (!Array.isArray(numbers)) {
      throw new Error('Numbers must be an array');
    }

    return Array(this.numberOfGroups)
      .fill(0)
      .map((_, groupIndex) => {
        const start =
          groupIndex * this.groupSize + 1;

        const end =
          start + this.groupSize - 1;

        return numbers.filter(
          number =>
            number >= start &&
            number <= end
        ).length;
      });
  }
}