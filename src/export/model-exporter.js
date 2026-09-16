import { mkdir, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';

export class ModelExporter {
  constructor({
    outputDirectory = 'models/mlp-v2',
    extensionDirectory = 'extension/models/mlp-v2'
  } = {}) {
    this.outputDirectory = outputDirectory;
    this.extensionDirectory = extensionDirectory;
  }

  async export({
    model,
    scaler,
    configuration,
    featureCount,
    modelVersion = '1.0.0'
  }) {
    if (!model) {
      throw new Error('Model is required');
    }

    if (!scaler) {
      throw new Error('Scaler is required');
    }

    if (!configuration) {
      throw new Error('Configuration is required');
    }

    if (!Number.isInteger(featureCount)) {
      throw new Error(
        'Feature count must be an integer'
      );
    }

    await mkdir(
      this.outputDirectory,
      { recursive: true }
    );

    await mkdir(
      this.extensionDirectory,
      { recursive: true }
    );

    /*
     * ==========================================
     * 1. EXPORTAR MODELO TENSORFLOW.JS
     * ==========================================
     */

    const modelPath =
      path.resolve(
        this.outputDirectory
      );

    await model.save(
      `file://${modelPath}`
    );

    /*
     * ==========================================
     * 2. METADATA
     * ==========================================
     */

    const metadata = {
      model: 'mlp-v2',

      version:
        modelVersion,

      exportedAt:
        new Date().toISOString(),

      featureCount,

      windowSize:
        configuration.windowSize,

      recentWindowSize:
        configuration.recentWindowSize,

      numberCount: 25,

      predictionSizes:
        configuration.predictionSizes,

      scaler: {
        type: 'min-max',

        min:
          scaler.min,

        max:
          scaler.max
      }
    };

    const metadataPath =
      path.join(
        this.outputDirectory,
        'metadata.json'
      );

    await writeFile(
      metadataPath,
      JSON.stringify(
        metadata,
        null,
        2
      ),
      'utf-8'
    );

    /*
     * ==========================================
     * 3. COPIAR PARA A EXTENSÃO
     * ==========================================
     */

    await cp(
      this.outputDirectory,
      this.extensionDirectory,
      {
        recursive: true
      }
    );

    console.log(
      '\n=== MODELO EXPORTADO ==='
    );

    console.log(
      `Modelo: ${this.outputDirectory}`
    );

    console.log(
      `Extensão: ${this.extensionDirectory}`
    );

    console.log(
      `Features: ${featureCount}`
    );

    console.log(
      `Versão: ${modelVersion}`
    );

    return {
      modelDirectory:
        this.outputDirectory,

      extensionDirectory:
        this.extensionDirectory,

      metadata
    };
  }
}