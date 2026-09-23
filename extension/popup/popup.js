import {
  ModelLoader
} from '../services/model-loader.js';

import {
  PredictionService
} from '../services/prediction-service.js';

let selectedPredictionSize = null;

let predictionService = null;

async function initialize() {
  const statusIndicator =
    document.getElementById(
      'status-indicator'
    );

  const statusText =
    document.getElementById(
      'status-text'
    );

  try {
    /*
     * ==========================================
     * CARREGAR MODELO
     * ==========================================
     */

    const loader =
      new ModelLoader();

    const {
      model,
      metadata
    } =
      await loader.load();

    /*
     * ==========================================
     * CRIAR SERVIÇO DE PREDIÇÃO
     * ==========================================
     */

    predictionService =
      new PredictionService({
        model,
        metadata
      });

    /*
     * ==========================================
     * INTERFACE
     * ==========================================
     */

    statusIndicator
      .classList
      .add('success');

    statusText.textContent =
      'Modelo carregado';

    initializePredictionSizes(
      metadata.predictionSizes
    );

  } catch (error) {

    console.error(
      'Erro ao inicializar:',
      error
    );

    statusIndicator
      .classList
      .add('error');

    statusText.textContent =
      'Erro ao carregar modelo';
  }
}

function initializePredictionSizes(
  predictionSizes
) {
  const container =
    document.getElementById(
      'prediction-sizes'
    );

  const section =
    document.getElementById(
      'prediction-section'
    );

  predictionSizes.forEach(
    predictionSize => {

      const button =
        document.createElement(
          'button'
        );

      button.type =
        'button';

      button.className =
        'prediction-size';

      button.dataset.size =
        predictionSize;

      button.textContent =
        predictionSize;

      button.addEventListener(
        'click',
        () =>
          selectPredictionSize(
            predictionSize
          )
      );

      container.appendChild(
        button
      );
    }
  );

  const generateButton =
    document.getElementById(
      'generate-button'
    );

  generateButton.addEventListener(
    'click',
    generatePrediction
  );

  section.classList.remove(
    'hidden'
  );
}

function selectPredictionSize(
  predictionSize
) {
  selectedPredictionSize =
    predictionSize;

  const buttons =
    document.querySelectorAll(
      '.prediction-size'
    );

  buttons.forEach(
    button => {

      const size =
        Number(
          button.dataset.size
        );

      button.classList.toggle(
        'selected',
        size === predictionSize
      );

    }
  );

  document
    .getElementById(
      'generate-button'
    )
    .disabled = false;

  /*
   * Se trocar a quantidade,
   * escondemos a previsão anterior.
   */

  document
    .getElementById(
      'result-section'
    )
    .classList
    .add('hidden');
}

async function generatePrediction() {
  if (
    selectedPredictionSize === null ||
    predictionService === null
  ) {
    return;
  }

  const button =
    document.getElementById(
      'generate-button'
    );

  const loading =
    document.getElementById(
      'loading-section'
    );

  const result =
    document.getElementById(
      'result-section'
    );

  const errorSection =
    document.getElementById(
      'error-section'
    );

  try {
    /*
     * ==========================================
     * LOADING
     * ==========================================
     */

    button.disabled = true;

    loading.classList.remove(
      'hidden'
    );

    result.classList.add(
      'hidden'
    );

    errorSection.classList.add(
      'hidden'
    );

    /*
     * ==========================================
     * PREDIÇÃO
     * ==========================================
     */

    const prediction =
      await predictionService.predict(
        selectedPredictionSize
      );

    /*
     * ==========================================
     * RESULTADO
     * ==========================================
     */

    renderPrediction(
      prediction
    );

  } catch (error) {

    console.error(
      'Erro ao gerar aposta:',
      error
    );

    errorSection.textContent =
      'Não foi possível gerar a aposta.';

    errorSection.classList.remove(
      'hidden'
    );

  } finally {

    loading.classList.add(
      'hidden'
    );

    button.disabled = false;
  }
}

function renderPrediction(
  prediction
) {
  const numbersContainer =
    document.getElementById(
      'numbers'
    );

  numbersContainer.innerHTML = '';

  prediction.numbers.forEach(
    number => {

      const element =
        document.createElement(
          'span'
        );

      element.className =
        'number';

      element.textContent =
        String(number)
          .padStart(
            2,
            '0'
          );

      numbersContainer.appendChild(
        element
      );
    }
  );

  document
    .getElementById(
      'contest-info'
    )
    .textContent =
      `Dados atualizados até o concurso ${prediction.basedOnContest}.`;

  document
    .getElementById(
      'result-section'
    )
    .classList
    .remove('hidden');
}

initialize();