export class DatasetSplitter {
  constructor({
    trainRatio = 0.70,
    validationRatio = 0.15,
    testRatio = 0.15
  } = {}) {
    const totalRatio =
      trainRatio +
      validationRatio +
      testRatio;

    if (Math.abs(totalRatio - 1) > 0.000001) {
      throw new Error(
        'Train, validation and test ratios must sum to 1'
      );
    }

    this.trainRatio = trainRatio;
    this.validationRatio = validationRatio;
    this.testRatio = testRatio;
  }

  split(dataset) {
    if (!Array.isArray(dataset)) {
      throw new Error('Dataset must be an array');
    }

    const total = dataset.length;

    const trainSize = Math.floor(
      total * this.trainRatio
    );

    const validationSize = Math.floor(
      total * this.validationRatio
    );

    const testSize =
      total -
      trainSize -
      validationSize;

    return {
      train: dataset.slice(
        0,
        trainSize
      ),

      validation: dataset.slice(
        trainSize,
        trainSize + validationSize
      ),

      test: dataset.slice(
        trainSize + validationSize
      )
    };
  }
}
