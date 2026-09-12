import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export class RawContestRepository {
  constructor({ directory = 'data/raw' } = {}) {
    this.directory = directory;
  }

  async getAll() {
    const files = await readdir(this.directory);

    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const numberA = Number(path.basename(a, '.json'));
        const numberB = Number(path.basename(b, '.json'));

        return numberA - numberB;
      });

    const contests = [];

    for (const file of jsonFiles) {
      const filePath = path.join(this.directory, file);

      const content = await readFile(filePath, 'utf-8');

      contests.push(JSON.parse(content));
    }

    return contests;
  }

  async getByContestNumber(contestNumber) {
    const filePath = path.join(
      this.directory,
      `${contestNumber}.json`
    );

    const content = await readFile(filePath, 'utf-8');

    return JSON.parse(content);
  }
}