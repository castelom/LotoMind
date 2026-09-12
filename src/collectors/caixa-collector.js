import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class CaixaCollector {
  constructor({ api, outputDirectory = 'data/raw' }) {
    this.api = api;
    this.outputDirectory = outputDirectory;
  }

  async collectContest(contestNumber) {
    const data = await this.api.getContest(contestNumber);

    await this.#ensureOutputDirectory();

    const filePath = path.join(
      this.outputDirectory,
      `${contestNumber}.json`
    );

    await writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    return {
      contestNumber,
      filePath
    };
  }

  async #ensureOutputDirectory() {
    await mkdir(this.outputDirectory, {
      recursive: true
    });
  }
}