import * as tf from '@tensorflow/tfjs';

import {
    FeatureEngineer
} from '../../src/features/feature-engineer.js';

import {
    ContestService
} from './contest-service.js';

export class PredictionService {
    constructor({
        model,
        metadata,
        contestService =
        new ContestService()
    }) {
        if (!model) {
            throw new Error(
                'Model is required'
            );
        }

        if (!metadata) {
            throw new Error(
                'Metadata is required'
            );
        }

        this.model =
            model;

        this.metadata =
            metadata;

        this.contestService =
            contestService;

        this.featureEngineer =
            new FeatureEngineer({
                windowSize:
                    metadata.windowSize,

                recentWindowSize:
                    metadata.recentWindowSize
            });
    }

    async predict(
        predictionSize
    ) {
        this.#validatePredictionSize(
            predictionSize
        );

        /*
         * ==========================================
         * 1. BUSCAR CONCURSOS
         * ==========================================
         */

        const contests =
            await this.contestService
                .getLatestContests(
                    this.metadata.windowSize
                );

        /*
         * ==========================================
         * 2. FEATURE ENGINEERING
         * ==========================================
         */

        const features =
            this.featureEngineer
                .generatePredictionFeatures(
                    contests
                );

        if (
            features.length !==
            this.metadata.featureCount
        ) {
            throw new Error(
                `Expected ${this.metadata.featureCount} features, got ${features.length}`
            );
        }

        /*
         * ==========================================
         * 3. SCALING
         * ==========================================
         */

        const scaledFeatures =
            this.#scale(
                features
            );

        /*
         * ==========================================
         * 4. INFERÊNCIA
         * ==========================================
         */

        const input =
            tf.tensor2d(
                [scaledFeatures]
            );

        const predictions =
            this.model.predict(
                input
            );

        const outputs =
            Array.isArray(predictions)
                ? predictions
                : [predictions];

        try {
            /*
             * MLP V2:
             *
             * outputs[0] = number_output
             * outputs[1] = group_output
             */

            const scores =
                outputs[0]
                    .arraySync()[0];

            /*
             * ==========================================
             * 5. SELECIONAR TOP N
             * ==========================================
             */

            const numbers =
                scores
                    .map(
                        (score, index) => ({
                            number:
                                index + 1,

                            score
                        })
                    )
                    .sort(
                        (a, b) =>
                            b.score -
                            a.score
                    )
                    .slice(
                        0,
                        predictionSize
                    )
                    .map(
                        item =>
                            item.number
                    )
                    .sort(
                        (a, b) =>
                            a - b
                    );

            return {
                predictionSize,

                numbers,

                basedOnContest:
                    contests.at(-1).number
            };

        } finally {

            /*
             * ==========================================
             * 6. CLEANUP
             * ==========================================
             */

            input.dispose();

            outputs.forEach(
                output =>
                    output.dispose()
            );
        }
    }

    #scale(features) {
        const {
            min,
            max
        } =
            this.metadata.scaler;

        if (
            min.length !== features.length ||
            max.length !== features.length
        ) {
            throw new Error(
                'Scaler metadata does not match feature count'
            );
        }

        return features.map(
            (value, index) => {

                if (
                    max[index] ===
                    min[index]
                ) {
                    return 0;
                }

                return (
                    value -
                    min[index]
                ) / (
                    max[index] -
                    min[index]
                );
            }
        );
    }

    #validatePredictionSize(
        predictionSize
    ) {
        if (
            !this.metadata
                .predictionSizes
                .includes(
                    predictionSize
                )
        ) {
            throw new Error(
                `Unsupported prediction size: ${predictionSize}`
            );
        }
    }
}