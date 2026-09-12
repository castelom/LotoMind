import { Contest } from '../models/contest.js';

export class CaixaTransformer {
  transform(data) {
    return new Contest({
      number: data.numero,
      date: this.#parseDate(data.dataApuracao),
      numbers: data.listaDezenas.map(Number),
      drawOrder: data.dezenasSorteadasOrdemSorteio.map(Number),
      previousContest: data.numeroConcursoAnterior,
      nextContest: data.numeroConcursoProximo,
      isSpecialContest: data.indicadorConcursoEspecial === 2
    });
  }

  #parseDate(date) {
    const [day, month, year] = date.split('/');

    return new Date(`${year}-${month}-${day}T00:00:00`);
  }
}