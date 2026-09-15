export class RandomNumberScorer {
  constructor({ random = Math.random } = {}) {
    this.random = random;
  }

  score() {
    return Array.from(
      { length: 25 },
      (_, index) => ({
        number: index + 1,
        score: this.random()
      })
    );
  }
}