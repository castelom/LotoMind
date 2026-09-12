import { CaixaApi } from '../api/caixa-api.js';
import { CaixaCollector } from './caixa-collector.js';

const api = new CaixaApi();

const collector = new CaixaCollector({
  api,
  outputDirectory: 'data/raw'
});

const result = await collector.collectRange(1, 3779);

console.log('Collection finished');
console.log(`Collected: ${result.collected.length}`);
console.log(`Skipped: ${result.skipped.length}`);
console.log(`Failed: ${result.failed.length}`);

if (result.failed.length > 0) {
  console.log('Failed contests:');
  console.log(result.failed);
}