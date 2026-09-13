import { describe, expect, it } from 'vitest';
import { CaixaTransformer } from '../../src/transformers/caixa-transformer.js';

describe('CaixaTransformer', () => {
  it('should transform CAIXA response into Concurso', () => {
    const transformer = new CaixaTransformer();

    const raw = {
      numero: 3779,
      dataApuracao: '03/09/2026',
      listaDezenas: [
        '01', '02', '03', '05', '07',
        '08', '10', '11', '13', '15',
        '17', '19', '21', '23', '25'
      ],
      dezenasSorteadasOrdemSorteio: [
        '03', '01', '25', '08', '13',
        '17', '05', '21', '10', '02',
        '23', '11', '15', '07', '19'
      ],
      numeroConcursoAnterior: 3778,
      numeroConcursoProximo: 3780,
      indicadorConcursoEspecial: 0
    };

    const contest = transformer.transform(raw);

    expect(contest.number).toBe(3779);

    expect(contest.date).toEqual(
      new Date('2026-09-03T00:00:00')
    );

    expect(contest.numbers).toEqual([
      1, 2, 3, 5, 7,
      8, 10, 11, 13, 15,
      17, 19, 21, 23, 25
    ]);

    expect(contest.drawOrder).toEqual([
      3, 1, 25, 8, 13,
      17, 5, 21, 10, 2,
      23, 11, 15, 7, 19
    ]);

    expect(contest.previousContest).toBe(3778);
    expect(contest.nextContest).toBe(3780);
    expect(contest.isSpecialContest).toBe(false);
  });

  it('should identify a special contest', () => {
    const transformer = new CaixaTransformer();

    const raw = {
      numero: 3480,
      dataApuracao: '06/09/2025',
      listaDezenas: [
        '03', '05', '06', '08', '09',
        '12', '13', '14', '15', '16',
        '17', '20', '21', '22', '23'
      ],
      dezenasSorteadasOrdemSorteio: [],
      numeroConcursoAnterior: 3479,
      numeroConcursoProximo: 3481,
      indicadorConcursoEspecial: 2
    };

    const contest = transformer.transform(raw);

    expect(contest.number).toBe(3480);
    expect(contest.isSpecialContest).toBe(true);
  });
});
