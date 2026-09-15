import { mkdir, writeFile } from 'node:fs/promises';

import { RawContestRepository } from './repositories/raw-contest-repository.js';
import { CaixaTransformer } from './transformers/caixa-transformer.js';

import { BaselineExperiment } from './evaluation/baseline-experiment.js';
import { MLPBaseline } from './evaluation/mlp-baseline.js';
import { BaselineComparison } from './evaluation/baseline-comparison.js';

const repository =
  new RawContestRepository();

const transformer =
  new CaixaTransformer();

const rawContests =
  await repository.getAll();

const contests =
  rawContests.map(
    contest => transformer.transform(contest)
  );

console.log(
  `Concursos carregados: ${contests.length}`
);

// ============================
// RANDOM + FREQUENCY
// ============================

const baselineExperiment =
  new BaselineExperiment({
    predictionSizes: [
      15,
      16,
      17,
      18,
      19,
      20
    ],
    randomIterations: 100,
    minimumHistory: 20
  });

console.log('\n=== RANDOM + FREQUENCY ===');

const baselineResult =
  baselineExperiment.run(contests);

// ============================
// MLP
// ============================

const mlpBaseline =
  new MLPBaseline({
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

const mlpResult =
  await mlpBaseline.run(contests);

// ============================
// COMPARISON
// ============================

const comparison =
  new BaselineComparison();

const comparisons =
  comparison.compare({
    baseline: baselineResult,
    mlp: mlpResult
  });

const result = {
  configuration: {
    totalContests: contests.length,

    predictionSizes: [
      15,
      16,
      17,
      18,
      19,
      20
    ],

    randomIterations: 100,

    mlp: mlpResult.configuration
  },

  training: mlpResult.training,

  comparisons
};

await mkdir(
  'results',
  { recursive: true }
);

await writeFile(
  'results/baseline-comparison.json',
  JSON.stringify(
    result,
    null,
    2
  ),
  'utf-8'
);

console.log(
  '\n=== BASELINE COMPARISON ==='
);

console.table(
  comparisons.map(item => ({
    Dezenas:
      item.predictionSize,

    'Random Hits':
      item.random.averageHits.toFixed(4),

    'Frequency Hits':
      item.frequency.averageHits.toFixed(4),

    'MLP Hits':
      item.mlp.averageHits.toFixed(4),

    'MLP - Frequency Hits':
      item.mlpVsFrequency.toFixed(4),

    'Random Reward':
      item.random.averageReward.toFixed(4),

    'Frequency Reward':
      item.frequency.averageReward.toFixed(4),

    'MLP Reward':
      item.mlp.averageReward.toFixed(4),

    'MLP - Frequency Reward':
      (
        item.mlp.averageReward -
        item.frequency.averageReward
      ).toFixed(4)
  }))
);

console.log(
  '\nResultado salvo em:',
  'results/baseline-comparison.json'
);