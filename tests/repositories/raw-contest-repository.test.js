import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import {
  mkdir,
  rm,
  writeFile
} from 'node:fs/promises';

import path from 'node:path';
import { tmpdir } from 'node:os';

import {
  RawContestRepository
} from '../../src/repositories/raw-contest-repository.js';

const testDirectory = path.join(
  tmpdir(),
  'lotomind-raw-tests'
);

afterEach(async () => {
  await rm(testDirectory, {
    recursive: true,
    force: true
  });
});

describe('RawContestRepository', () => {
  it('should return all raw contests sorted by contest number', async () => {
    await mkdir(testDirectory, {
      recursive: true
    });

    await writeFile(
      path.join(testDirectory, '3.json'),
      JSON.stringify({ numero: 3 })
    );

    await writeFile(
      path.join(testDirectory, '1.json'),
      JSON.stringify({ numero: 1 })
    );

    await writeFile(
      path.join(testDirectory, '2.json'),
      JSON.stringify({ numero: 2 })
    );

    const repository = new RawContestRepository({
      directory: testDirectory
    });

    const contests = await repository.getAll();

    expect(contests).toHaveLength(3);

    expect(
      contests.map(contest => contest.numero)
    ).toEqual([1, 2, 3]);
  });

  it('should ignore non-json files', async () => {
    await mkdir(testDirectory, {
      recursive: true
    });

    await writeFile(
      path.join(testDirectory, '1.json'),
      JSON.stringify({ numero: 1 })
    );

    await writeFile(
      path.join(testDirectory, 'README.txt'),
      'ignored'
    );

    const repository = new RawContestRepository({
      directory: testDirectory
    });

    const contests = await repository.getAll();

    expect(contests).toHaveLength(1);
    expect(contests[0].numero).toBe(1);
  });

  it('should get a contest by number', async () => {
    await mkdir(testDirectory, {
      recursive: true
    });

    const rawContest = {
      numero: 3779,
      dataApuracao: '03/09/2026'
    };

    await writeFile(
      path.join(testDirectory, '3779.json'),
      JSON.stringify(rawContest)
    );

    const repository = new RawContestRepository({
      directory: testDirectory
    });

    const result =
      await repository.getByContestNumber(3779);

    expect(result).toEqual(rawContest);
  });

  it('should throw when the requested contest does not exist', async () => {
    const repository = new RawContestRepository({
      directory: testDirectory
    });

    await expect(
      repository.getByContestNumber(9999)
    ).rejects.toThrow();
  });
});