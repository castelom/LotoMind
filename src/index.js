import { CaixaApi } from './api/caixa-api.js';
import { CaixaCollector } from './collectors/caixa-collector.js';

const api = new CaixaApi();

const collector = new CaixaCollector({
  api
});

const result = await collector.collectContest(3779);

console.log(`Contest ${result.contestNumber} saved at ${result.filePath}`);