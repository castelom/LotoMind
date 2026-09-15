import { RawContestRepository } from './repositories/raw-contest-repository.js';
import { CaixaTransformer } from './transformers/caixa-transformer.js';

import { MLPExperiment } from './evaluation/mlp-experiment.js';

async function main() {
  console.log('=== LOTOMIND ===');

  // ==========================================
  // 1. CARREGAR CONCURSOS
  // ==========================================

  const repository =
    new RawContestRepository();

  const rawContests =
    await repository.getAll();

  console.log(
    `Concursos carregados: ${rawContests.length}`
  );

  // ==========================================
  // 2. TRANSFORMAR DADOS DA CAIXA
  // ==========================================

  const transformer =
    new CaixaTransformer();

  const contests =
    rawContests.map(
      contest =>
        transformer.transform(contest)
    );

  console.log(
    `Concursos transformados: ${contests.length}`
  );

  // ==========================================
  // 3. EXPERIMENTO MLP V1 × V2
  // ==========================================

  console.log('\n');
  console.log('########################################');
  console.log('#       EXPERIMENTO MLP V1 × V2       #');
  console.log('########################################');

  const experiment =
    new MLPExperiment({
      iterations: 100,

      predictionSizes: [
        15,
        16,
        17,
        18,
        19,
        20
      ]
    });

  const result =
    await experiment.run(contests);

  // ==========================================
  // 4. RESULTADO
  // ==========================================

  console.log('\n');
  console.log('########################################');
  console.log('#          RESULTADO FINAL             #');
  console.log('########################################');

  experiment.print(result);
}

main()
  .then(() => {
    console.log(
      '\n=== EXPERIMENTO FINALIZADO ==='
    );
  })
  .catch(error => {
    console.error(
      '\n=== ERRO ==='
    );

    console.error(error);

    process.exit(1);
  });