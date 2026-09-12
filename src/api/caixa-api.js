const BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';

export class CaixaApi {
  async getLatest() {
    return this.#get(BASE_URL);
  }

  async getContest(contestNumber) {
    if (!Number.isInteger(contestNumber) || contestNumber <= 0) {
      throw new Error('Contest number must be a positive integer');
    }

    return this.#get(`${BASE_URL}/${contestNumber}`);
  }

  async #get(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `CAIXA API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}