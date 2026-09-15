import * as tf from '@tensorflow/tfjs-node';

export class MLPNumberScorer {
  constructor({
    model,
    featureEngineer,
    scaler
  }) {
    this.model = model;
    this.featureEngineer = featureEngineer;
    this.scaler = scaler;
  }

  score(contests) {
    const dataset =
      this.featureEngineer.generate(contests);

    const latest = dataset[dataset.length - 1];

    if (!latest) {
      throw new Error(
        'Not enough contests to generate features'
      );
    }

    const scaled = this.scaler.transform([latest]);

    const prediction =
      this.model.predict(
        tf.tensor2d([scaled[0].features])
      );

    const scores = prediction.arraySync()[0];

    prediction.dispose();

    return scores.map((score, index) => ({
      number: index + 1,
      score
    }));
  }
}