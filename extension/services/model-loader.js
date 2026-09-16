export class ModelLoader {
  constructor({
    modelDirectory = 'models/mlp-v2'
  } = {}) {
    this.modelDirectory =
      modelDirectory;

    this.model = null;

    this.metadata = null;
  }

  async load() {
    await this.#loadMetadata();

    await this.#loadModel();

    return {
      model:
        this.model,

      metadata:
        this.metadata
    };
  }

  async #loadMetadata() {
    const metadataUrl =
      chrome.runtime.getURL(
        `${this.modelDirectory}/metadata.json`
      );

    const response =
      await fetch(metadataUrl);

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar metadata: ${response.status}`
      );
    }

    this.metadata =
      await response.json();
  }

  async #loadModel() {
    const modelUrl =
      chrome.runtime.getURL(
        `${this.modelDirectory}/model.json`
      );

    this.model =
      await tf.loadLayersModel(
        modelUrl
      );
  }
}