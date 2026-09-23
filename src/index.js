import { RawContestRepository } from './repositories/raw-contest-repository.js';
import { CaixaTransformer } from './transformers/caixa-transformer.js';
import { MLPV2 } from './evaluation/mlp-v2.js';
import { ModelExporter } from './export/model-exporter.js';

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
  // 3. TREINAR MLP V2
  // ==========================================

  console.log('\n');
  console.log('########################################');
  console.log('#          Treinando MLP V2           #');
  console.log('########################################');

  const mlp =
    new MLPV2({
      predictionSizes: [
        15,
        16,
        17,
        18,
        19,
        20
      ],

      windowSize: 20,

      recentWindowSize: 5,

      epochs: 50,

      batchSize: 32
    });

  const result =
    await mlp.run(contests);

  // ==========================================
  // 4. EXPORTAR MODELO
  // ==========================================

  console.log('\n');
  console.log('########################################');
  console.log('#            Model Export              #');
  console.log('########################################');

  const exporter =
    new ModelExporter();

  await exporter.export({
    model:
      result.model,

    scaler:
      result.scaler,

    configuration:
      result.configuration,

    featureCount:
      result.featureCount,

    modelVersion:
      '1.0.0'
  });

  console.log(
    '\n=== Model Exported ==='
  );
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