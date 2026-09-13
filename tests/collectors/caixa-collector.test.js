import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  mkdir,
  readFile,
  rm
} from 'node:fs/promises';

import path from 'node:path';
import { tmpdir } from 'node:os';

import {
  CaixaCollector
} from '../../src/collectors/caixa-collector.js';

const testDirectory = path.join(
  tmpdir(),
  'lotomind-collector-tests'
);

afterEach(async () => {
  await rm(testDirectory, {
    recursive: true,
    force: true
  });
});

describe('CaixaCollector', () => {
  it('should collect and save a contest', async () => {
    const rawContest = {
      numero: 3779,
      dataApuracao: '03/09/2026',
      listaDezenas: [
        '01', '02', '03'
      ]
    };

    const api = {
      getContest: vi.fn()
        .mockResolvedValue(rawContest)
    };

    const collector = new CaixaCollector({
      api,
      outputDirectory: testDirectory
    });

    const result =
      await collector.collectContest(3779);

    expect(api.getContest)
      .toHaveBeenCalledWith(3779);

    expect(result.contestNumber)
      .toBe(3779);

    const content = await readFile(
      path.join(testDirectory, '3779.json'),
      'utf-8'
    );

    expect(JSON.parse(content))
      .toEqual(rawContest);
  });

  it('should create the output directory when necessary', async () => {
    const rawContest = {
      numero: 3779
    };

    const api = {
      getContest: vi.fn()
        .mockResolvedValue(rawContest)
    };

    const collector = new CaixaCollector({
      api,
      outputDirectory: testDirectory
    });

    await collector.collectContest(3779);

    const content = await readFile(
      path.join(testDirectory, '3779.json'),
      'utf-8'
    );

    expect(JSON.parse(content))
      .toEqual(rawContest);
  });

  it('should propagate API errors when collecting a contest', async () => {
    const api = {
      getContest: vi.fn()
        .mockRejectedValue(
          new Error('API unavailable')
        )
    };

    const collector = new CaixaCollector({
      api,
      outputDirectory: testDirectory
    });

    await expect(
      collector.collectContest(3779)
    ).rejects.toThrow('API unavailable');
  });
});