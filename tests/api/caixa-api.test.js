import { describe, expect, it, vi } from 'vitest';
import { CaixaApi } from '../../src/api/caixa-api.js';

describe('CaixaApi', () => {
  it('should get the latest contest', async () => {
    const responseData = {
      numero: 3779,
      listaDezenas: ['01', '02', '03']
    };

    const httpClient = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseData)
    });

    const api = new CaixaApi({
      httpClient
    });

    const result = await api.getLatest();

    expect(result).toEqual(responseData);
    expect(httpClient).toHaveBeenCalledTimes(1);
  });

  it('should get a specific contest', async () => {
    const responseData = {
      numero: 3779
    };

    const httpClient = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseData)
    });

    const api = new CaixaApi({
      httpClient
    });

    const result = await api.getContest(3779);

    expect(result).toEqual(responseData);
    expect(httpClient).toHaveBeenCalledTimes(1);

    expect(httpClient.mock.calls[0][0])
      .toContain('/3779');
  });

  it('should reject invalid contest numbers', async () => {
    const httpClient = vi.fn();

    const api = new CaixaApi({
      httpClient
    });

    await expect(
      api.getContest(0)
    ).rejects.toThrow(
      'Contest number must be a positive integer'
    );

    await expect(
      api.getContest(-1)
    ).rejects.toThrow(
      'Contest number must be a positive integer'
    );

    await expect(
      api.getContest(1.5)
    ).rejects.toThrow(
      'Contest number must be a positive integer'
    );

    expect(httpClient).not.toHaveBeenCalled();
  });

  it('should throw when CAIXA API returns an error', async () => {
    const httpClient = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    const api = new CaixaApi({
      httpClient
    });

    await expect(
      api.getContest(999999)
    ).rejects.toThrow(
      'CAIXA API request failed: 404 Not Found'
    );
  });
});