import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class CaixaCollector {
    constructor({ api, outputDirectory = 'data/raw' }) {
        this.api = api;
        this.outputDirectory = outputDirectory;
    }

    async collectContest(contestNumber) {
        const data = await this.api.getContest(contestNumber);

        await this.#ensureOutputDirectory();

        const filePath = path.join(
            this.outputDirectory,
            `${contestNumber}.json`
        );

        await writeFile(
            filePath,
            JSON.stringify(data, null, 2),
            'utf-8'
        );

        return {
            contestNumber,
            filePath
        };
    }

    async collectRange(from, to) {
        const collected = [];
        const skipped = [];
        const failed = [];

        await this.#ensureOutputDirectory();

        for (let contestNumber = from; contestNumber <= to; contestNumber++) {
            const filePath = path.join(
                this.outputDirectory,
                `${contestNumber}.json`
            );

            if (await this.#fileExists(filePath)) {
                skipped.push(contestNumber);
                continue;
            }

            try {
                await this.collectContest(contestNumber);
                collected.push(contestNumber);
            } catch (error) {
                failed.push({
                    contestNumber,
                    error: error.message
                });
            }
        }

        return {
            collected,
            skipped,
            failed
        };
    }

    async #fileExists(filePath) {
        try {
            await access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async #ensureOutputDirectory() {
        await mkdir(this.outputDirectory, {
            recursive: true
        });
    }
}