import {
  ModelLoader
} from '../services/model-loader.js';

async function initialize() {
  const statusIndicator =
    document.getElementById(
      'status-indicator'
    );

  const statusText =
    document.getElementById(
      'status-text'
    );

  const modelInfo =
    document.getElementById(
      'model-info'
    );

  try {
    const loader =
      new ModelLoader();

    const {
      model,
      metadata
    } =
      await loader.load();

    console.log(
      'Modelo carregado:',
      model
    );

    console.log(
      'Metadata:',
      metadata
    );

    statusIndicator
      .classList
      .add('success');

    statusText.textContent =
      'Modelo carregado';

    document
      .getElementById(
        'model-name'
      )
      .textContent =
        metadata.model;

    document
      .getElementById(
        'model-version'
      )
      .textContent =
        metadata.version;

    document
      .getElementById(
        'feature-count'
      )
      .textContent =
        metadata.featureCount;

    modelInfo
      .classList
      .remove('hidden');

  } catch (error) {

    console.error(
      'Erro ao carregar modelo:',
      error
    );

    statusIndicator
      .classList
      .add('error');

    statusText.textContent =
      'Erro ao carregar modelo';
  }
}

initialize();