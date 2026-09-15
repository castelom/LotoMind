export class FrequencyNumberScorer {
  score(contests) {
    if (!contests || contests.length === 0) {
      return Array.from(
        { length: 25 },
        (_, index) => ({
          number: index + 1,
          score: 0
        })
      );
    }

    const frequency = new Array(25).fill(0);

    for (const contest of contests) {
      for (const number of contest.numbers) {
        frequency[number - 1]++;
      }
    }

    return frequency.map((count, index) => ({
      number: index + 1,
      score: count / contests.length
    }));
  }
}