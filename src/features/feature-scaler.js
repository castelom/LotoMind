export class FeatureScaler {
  constructor() {
    this.min = null;
    this.max = null;
  }

  fit(dataset) {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error('Dataset must not be empty');
    }

    const featureCount = dataset[0].features.length;

    this.min = Array(featureCount).fill(Infinity);
    this.max = Array(featureCount).fill(-Infinity);

    for (const sample of dataset) {
      for (let i = 0; i < featureCount; i++) {
        const value = sample.features[i];

        if (value < this.min[i]) {
          this.min[i] = value;
        }

        if (value > this.max[i]) {
          this.max[i] = value;
        }
      }
    }

    return this;
  }

  transform(dataset) {
    this.#ensureFitted();

    return dataset.map(sample => ({
      ...sample,
      features: sample.features.map((value, index) =>
        this.#scale(
          value,
          this.min[index],
          this.max[index]
        )
      )
    }));
  }

  fitTransform(dataset) {
    this.fit(dataset);

    return this.transform(dataset);
  }

  #scale(value, min, max) {
    if (max === min) {
      return 0;
    }

    return (value - min) / (max - min);
  }

  #ensureFitted() {
    if (this.min === null || this.max === null) {
      throw new Error(
        'FeatureScaler must be fitted before transform'
      );
    }
  }
}
