import { RawContestRepository } from './repositories/raw-contest-repository.js';
import { CaixaTransformer } from './transformers/caixa-transformer.js';
import { FeatureEngineer } from './features/feature-engineer.js';
import { DatasetSplitter } from './datasets/dataset-splitter.js';
import { FeatureScaler } from './features/feature-scaler.js';

const repository = new RawContestRepository();
const transformer = new CaixaTransformer();

const featureEngineer = new FeatureEngineer({
  windowSize: 20,
  recentWindowSize: 5
});

const splitter = new DatasetSplitter();

const rawContests = await repository.getAll();

const contests = rawContests.map(
  raw => transformer.transform(raw)
);

const dataset = featureEngineer.generate(contests);

const { train, validation, test } =
  splitter.split(dataset);

console.log(`Contests: ${contests.length}`);
console.log(`Dataset: ${dataset.length}`);

console.log('\nDataset split:');
console.log(`Train: ${train.length}`);
console.log(`Validation: ${validation.length}`);
console.log(`Test: ${test.length}`);

console.log('\nTrain range:');
console.log(
  `${train[0].contestNumber} → ` +
  `${train[train.length - 1].contestNumber}`
);

console.log('\nValidation range:');
console.log(
  `${validation[0].contestNumber} → ` +
  `${validation[validation.length - 1].contestNumber}`
);

console.log('\nTest range:');
console.log(
  `${test[0].contestNumber} → ` +
  `${test[test.length - 1].contestNumber}`
);

const scaler = new FeatureScaler();

// IMPORTANTE:
// fit somente no TRAIN
scaler.fit(train);

const normalizedTrain =
  scaler.transform(train);

const normalizedValidation =
  scaler.transform(validation);

const normalizedTest =
  scaler.transform(test);

console.log('\nNormalized datasets:');

console.log(
  'Train:',
  normalizedTrain[0].features
);

console.log(
  'Validation:',
  normalizedValidation[0].features
);

console.log(
  'Test:',
  normalizedTest[0].features
);

