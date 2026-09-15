export class PollScorer {
  score(Poll, numberScores) {
    if (!Poll || !Array.isArray(Poll.numbers)) {
      throw new Error('Poll must contain numbers');
    }

    if (!Array.isArray(numberScores)) {
      throw new Error('Number scores must be an array');
    }

    if (Poll.numbers.length === 0) {
      return {
        numbers: [],
        score: 0
      };
    }

    const scoresByNumber = new Map(
      numberScores.map(item => [
        item.number,
        item.score
      ])
    );

    const scores = Poll.numbers.map(number => {
      const score = scoresByNumber.get(number);

      if (score === undefined) {
        throw new Error(
          `No score found for number ${number}`
        );
      }

      return score;
    });

    const total = scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return {
      numbers: Poll.numbers,
      score: total / scores.length
    };
  }
}