import {
  CaixaApi
} from '../../src/api/caixa-api.js';

import {
  CaixaTransformer
} from '../../src/transformers/caixa-transformer.js';

export class ContestService {
  constructor({
    api = new CaixaApi(),
    transformer = new CaixaTransformer()
  } = {}) {
    this.api = api;
    this.transformer = transformer;
  }

  async getLatestContests(
    count
  ) {
    if (
      !Number.isInteger(count) ||
      count <= 0
    ) {
      throw new Error(
        'Count must be a positive integer'
      );
    }

    /*
     * Descobrir qual é o concurso mais recente.
     */

    const latestRaw =
      await this.api.getLatest();

    const latestContest =
      this.transformer.transform(
        latestRaw
      );

    const latestNumber =
      latestContest.number;

    /*
     * O concurso mais recente já foi obtido.
     * Precisamos buscar os anteriores.
     */

    const contestNumbers =
      Array.from(
        {
          length:
            count - 1
        },
        (_, index) =>
          latestNumber -
          (count - 1) +
          index
      );

    const previousRawContests =
      await Promise.all(
        contestNumbers.map(
          contestNumber =>
            this.api.getContest(
              contestNumber
            )
        )
      );

    const previousContests =
      previousRawContests.map(
        contest =>
          this.transformer.transform(
            contest
          )
      );

    return [
      ...previousContests,
      latestContest
    ];
  }
}