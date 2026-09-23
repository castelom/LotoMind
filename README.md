# LotoMind

> A machine learning study project for Lotofácil, built as a software engineering and AI/ML portfolio project.

## Introduction

### What is Lotofácil?

Lotofácil is a Brazilian lottery operated by Caixa Econômica Federal. In a regular draw, players select numbers from **01 to 25**, while **15 numbers are drawn**. Prizes are distributed according to the number of matches achieved by a ticket.

Its simple structure makes Lotofácil an interesting environment for experimenting with data engineering, statistical analysis, machine learning, model evaluation, and backtesting.

However, lottery draws are designed to be random. Historical patterns do not imply that future results can be reliably predicted.

### Project goals

LotoMind was created primarily as a **portfolio and learning project**.

The main objectives are to:

- Build a complete machine learning pipeline using real Lotofácil historical data.
- Experiment with statistical baselines before introducing neural networks.
- Practice chronological dataset splitting and avoid future-data leakage.
- Explore feature engineering for sequential lottery data.
- Compare different neural-network architectures.
- Investigate whether a hierarchical model can improve number selection.
- Apply number scores to larger combinations and polls.
- Practice repeated experiments and model comparison.
- Export trained models and deploy browser-based inference through a Chrome extension.

### Disclaimer

**LotoMind is an experimental portfolio project. It has no scientific proof that it can predict lottery results or increase the probability of winning.**

The experiments in this repository should be interpreted as machine learning experimentation rather than evidence of a real-world predictive advantage.

The reward values used by some experiments are **experimental weights** and are not official Caixa prize values.

---

# Study

The project follows an incremental approach: establish simple baselines first, then introduce neural networks and progressively more structured prediction strategies.

## 1. Baselines

Before evaluating neural networks, LotoMind establishes reference points using simple strategies.

### Random baseline

The random baseline selects numbers without using historical information.

For a prediction containing `k` numbers, the expected number of matches against a 15-number draw is:

```text
E[hits] = k × 15 / 25
        = 0.6k
```

Therefore:

| Prediction size | Expected random hits |
|---:|---:|
| 15 | 9.0 |
| 16 | 9.6 |
| 17 | 10.2 |
| 18 | 10.8 |
| 19 | 11.4 |
| 20 | 12.0 |

The random baseline provides a useful reference because a model should be evaluated against a meaningful baseline rather than simply producing plausible-looking predictions.

### Frequency baseline

The frequency baseline uses historical draw frequency to assign a score to each number.

At every evaluation point, only contests that occurred **before the target contest** are considered. Numbers are ranked according to their observed historical frequency, and the highest-scoring numbers are selected.

This answers a simple experimental question:

> Can a basic historical statistic perform differently from random selection?

---

## 2. MLP V1

MLP V1 is the first neural-network model in LotoMind.

The model predicts an individual score for each of the **25 Lotofácil numbers**.

### Input features

For every number from 01 to 25, four features are generated:

1. Frequency in the last 20 contests
2. Frequency in the last 5 contests
3. Delay since the number last appeared
4. Whether the number appeared in the previous draw

This produces:

```text
25 numbers × 4 features = 100 input features
```

### Target

The target is a 25-dimensional binary vector.

For each number:

```text
1 = number appeared in the target draw
0 = number did not appear
```

The model uses sigmoid outputs to generate a score for each number.

### Chronological data split

The dataset is split chronologically:

| Dataset | Ratio |
|---|---:|
| Training | 70% |
| Validation | 15% |
| Test | 15% |

A chronological split is important because future contests must not be used to predict earlier contests.

The feature scaler is fitted **only on the training dataset** and subsequently applied to validation and test data.

---

## 3. MLP V2

MLP V2 extends V1 with a second prediction task.

Instead of predicting only the individual numbers, V2 also predicts how the 15 drawn numbers are distributed across five groups.

| Group | Numbers |
|---|---|
| G1 | 01–05 |
| G2 | 06–10 |
| G3 | 11–15 |
| G4 | 16–20 |
| G5 | 21–25 |

For example, a draw with:

```text
01 02 03 04 06 07 08 11 12 13 16 17 18 21 22
```

produces the group counts:

```text
[4, 3, 3, 3, 2]
```

These counts are normalized to a distribution:

```text
[4/15, 3/15, 3/15, 3/15, 2/15]
```

### Multi-task architecture

MLP V2 has a shared neural-network backbone with two outputs:

- **Number output:** scores for the 25 individual numbers.
- **Group output:** predicted distribution across the five groups.

The group prediction is then used during number selection.

Instead of simply taking the globally highest-scoring numbers, LotoMind estimates how many numbers should be selected from each group and then selects the highest-scoring numbers within those groups.

```text
Historical features
        │
        ▼
   Shared MLP
     /     \
    /       \
   ▼         ▼
Numbers    Groups
01–25      G1–G5
   │         │
   └────┬────┘
        ▼
Group-aware selection
        │
        ▼
Final prediction
```

This creates a hierarchical prediction strategy:

```text
Individual number score
        +
Group distribution score
        ↓
Group-aware number selection
```

---

# Model Comparison

MLP V1 and MLP V2 were compared using the **same chronological validation dataset**.

Keeping the validation dataset fixed is important because comparing models on different samples could introduce an additional source of variation.

For every experiment:

1. The historical dataset was prepared chronologically.
2. Training, validation, and test boundaries were established.
3. A new MLP V1 was trained.
4. A new MLP V2 was trained.
5. Both models were evaluated on the same validation contests.
6. Predictions were generated for 15, 16, 17, 18, 19 and 20 numbers.
7. Average hits were calculated.
8. The entire experiment was repeated **100 times**.
9. Results were aggregated across all runs.

The test dataset was kept separate from the repeated model-comparison experiment and should only be used after selecting the final model.

### Why 100 runs?

Neural networks contain stochastic elements such as random initialization and training behavior.

A single training run can therefore produce a result that is not representative of the architecture.

Repeating the experiment 100 times allows LotoMind to measure:

- Mean performance
- Standard deviation
- Minimum performance
- Maximum performance
- Number of runs won by each model

The goal is not to prove that one architecture is universally better, but to determine whether an observed difference is reasonably consistent across repeated experiments.

---

# Project Structure

```text
lotomind/
├── src/
│   ├── api/
│   │   └── caixa-api.js
│   │
│   ├── collectors/
│   │   ├── caixa-collector.js
│   │   └── collector-script.js
│   │
│   ├── models/
│   │   └── concurso.js
│   │
│   ├── transformers/
│   │   └── caixa-transformer.js
│   │
│   ├── repositories/
│   │   └── raw-contest-repository.js
│   │
│   ├── features/
│   │   ├── feature-engineer.js
│   │   ├── feature-engineer-v2.js
│   │   ├── group-feature-engineer.js
│   │   └── feature-scaler.js
│   │
│   ├── datasets/
│   │   ├── dataset-splitter.js
│   │   ├── tensor-dataset.js
│   │   └── tensor-dataset-v2.js
│   │
│   ├── scoring/
│   │   ├── number/
│   │   │   ├── random-number-scorer.js
│   │   │   └── frequency-number-scorer.js
│   │   └── poll/
│   │       └── poll-scorer.js
│   │
│   ├── evaluation/
│   │   ├── backtester.js
│   │   ├── reward-calculator.js
│   │   ├── backtest-metrics.js
│   │   ├── random-baseline.js
│   │   ├── frequency-baseline.js
│   │   ├── baseline-experiment.js
│   │   ├── mlp-v1.js
│   │   ├── mlp-v2.js
│   │   ├── mlp-comparison.js
│   │   └── mlp-experiment.js
│   │
│   ├── export/
│   │   └── model-exporter.js
│   │
│   └── index.js
│
├── extension/
│   ├── manifest.json
│   ├── models/
│   │   └── mlp-v2/
│   │       ├── metadata.json
│   │       ├── model.json
│   │       └── weights.bin
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── services/
│   │   ├── contest-service.js
│   │   ├── model-loader.js
│   │   └── prediction-service.js
│   └── dist/
│       └── popup.js
│
├── scripts/
│   └── build-extension.js
│
├── models/
│   └── mlp-v2/
│       ├── metadata.json
│       ├── model.json
│       └── weights.bin
│
├── data/
│   ├── raw/
│   └── processed/
│
├── results/
├── tests/
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```

### Main responsibilities

| Component | Responsibility |
|---|---|
| `api` | Communicate with the Caixa lottery API |
| `collectors` | Download and persist historical contests |
| `transformers` | Convert API payloads into domain objects |
| `features` | Generate machine-learning features |
| `datasets` | Split, scale and convert data to tensors |
| `scoring` | Score numbers and polls |
| `evaluation` | Run backtests and ML experiments |
| `models` | Represent lottery contests |
| `tests` | Automated tests |
| `results` | Store experimental outputs |
| `export` | Export trained models and inference metadata |
| `extension` | Run the inference pipeline and user interface in Chrome |

---

# Results

The experiments were divided into two stages.

The first stage compares the statistical baselines against MLP V1.

The second stage compares the two neural-network architectures, MLP V1 and MLP V2.

---

## 1. Baselines vs MLP V1

The first experiment compares three strategies:

- Random baseline
- Frequency baseline
- MLP V1

The comparison was performed using prediction sizes from 15 to 20 numbers.

For each prediction size, the same historical evaluation methodology was used.

### Average hits

| Numbers | Random Hits | Frequency Hits | MLP V1 Hits | MLP − Frequency |
|---:|---:|---:|---:|---:|
| 15 | 9.0003 | 9.0392 | 9.0354 | -0.0038 |
| 16 | 9.6008 | 9.6379 | 9.6301 | -0.0078 |
| 17 | 10.2002 | 10.2512 | **10.2584** | **+0.0072** |
| 18 | 10.8020 | 10.8512 | 10.8425 | -0.0088 |
| 19 | 11.3990 | 11.4624 | 11.4566 | -0.0058 |
| 20 | 12.0005 | 12.0577 | **12.0602** | **+0.0025** |

The MLP V1 model produced a slightly higher average number of hits than the Frequency baseline for 17- and 20-number predictions.

For the other prediction sizes, the Frequency baseline achieved slightly higher average hits.

The differences are very small, indicating that MLP V1 did not provide a clear advantage in raw hit count over the simple frequency strategy.

### Average reward

The experiments also used an experimental reward function to give greater weight to higher-hit outcomes.

These reward values are **not official Caixa prize values**. They are experimental weights used only to compare the behavior of the different strategies.

| Numbers | Random Reward | Frequency Reward | MLP V1 Reward | MLP − Frequency Reward |
|---:|---:|---:|---:|---:|
| 15 | 0.1279 | 0.1347 | 0.1310 | -0.0038 |
| 16 | 0.2921 | 0.3076 | **0.3274** | **+0.0199** |
| 17 | 0.5892 | 0.6233 | **0.6602** | **+0.0368** |
| 18 | 1.0860 | 1.1353 | **1.2000** | **+0.0647** |
| 19 | 1.8905 | 2.0143 | **2.0212** | **+0.0069** |
| 20 | 3.3369 | 3.6183 | **3.8212** | **+0.2029** |

Unlike the raw hit-count comparison, MLP V1 achieved a higher average experimental reward than Frequency for prediction sizes from 16 to 20.

The largest difference occurred for 20-number predictions:

### 20 numbers

```text
Frequency reward → 3.6183
MLP V1 reward    → 3.8212

Difference       → +0.2029
```

This illustrates why evaluating only average hits may not capture the complete behavior of a prediction strategy when higher-hit outcomes are given greater weight.

### Hit difference

```text
MLP V1 advantage over Frequency

15 numbers                       -0.0038
16 numbers                       -0.0078
17 numbers  ████████████         +0.0072
18 numbers                       -0.0088
19 numbers                       -0.0058
20 numbers  ████                 +0.0025
```

### Interpretation

The baseline experiment provides an important result for the project.

MLP V1 **does not consistently outperform the Frequency baseline in average hits**.

In fact, Frequency performed slightly better for 15, 16, 18 and 19-number predictions.

However, MLP V1 achieved a higher experimental reward for prediction sizes from 16 to 20.

This suggests that the neural network may be producing differences in the distribution of outcomes rather than simply increasing the average number of matches.

The strongest difference was observed for 20-number predictions, where MLP V1 achieved:

```text
+0.0025 average hits
+0.2029 average experimental reward
```

Nevertheless, these differences are small and should not be interpreted as evidence of a real predictive advantage.

The baseline experiment is primarily useful because it establishes a reference point for evaluating the more complex models.

A neural network should justify its additional complexity through measurable improvement over simple statistical strategies. In the current experiment, MLP V1 shows **interesting behavior in the reward metric**, but not a strong or consistent improvement in raw hit count.

---

## 2. MLP V1 vs MLP V2

The MLP V1 × V2 experiment was executed **100 times** using the same validation dataset.

### Average performance

The table below shows the average difference between V2 and V1:

> **Δ = V2 average hits − V1 average hits**

| Numbers | V1 Mean Hits | V2 Mean Hits | Mean Δ | V2 Wins | V1 Wins | Ties | V2 Win Rate |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 15 | 9.0131 | 9.0364 | **+0.0232** | 71 | 29 | 0 | **71%** |
| 16 | 9.6153 | 9.6355 | **+0.0201** | 66 | 33 | 1 | **66%** |
| 17 | 10.2226 | 10.2335 | **+0.0109** | 57 | 42 | 1 | **57%** |
| 18 | 10.8244 | 10.8318 | **+0.0074** | 53 | 47 | 0 | **53%** |
| 19 | 11.4246 | 11.4309 | **+0.0063** | 50 | 48 | 2 | **50%** |
| 20 | 12.0270 | 12.0255 | **-0.0015** | 45 | 54 | 1 | **45%** |

### Mean hit difference

```text
V2 average advantage over V1

15 numbers  ████████████████████  +0.0232
16 numbers  █████████████████     +0.0201
17 numbers  █████████             +0.0109
18 numbers  ██████                +0.0074
19 numbers  █████                 +0.0063
20 numbers                        -0.0015
```

### V1 vs V2 mean hits

| Prediction Size | V1 | V2 |
|---:|---:|---:|
| 15 | 9.0131 | 9.0364 |
| 16 | 9.6153 | 9.6355 |
| 17 | 10.2226 | 10.2335 |
| 18 | 10.8244 | 10.8318 |
| 19 | 11.4246 | 11.4309 |
| 20 | 12.0270 | 12.0255 |

### Standard deviation across runs

| Prediction Size | V1 Std | V2 Std |
|---:|---:|---:|
| 15 | 0.0436 | 0.0395 |
| 16 | 0.0472 | 0.0395 |
| 17 | 0.0474 | 0.0389 |
| 18 | 0.0456 | 0.0404 |
| 19 | 0.0401 | 0.0392 |
| 20 | 0.0378 | 0.0391 |

V2 showed slightly lower variation across repeated runs for prediction sizes from 15 to 19, while the difference at 20 numbers was negligible.

### Inferences

The experiments suggest that the group-aware V2 architecture produced a **small average improvement for prediction sizes from 15 to 19 numbers**.

The strongest observed average difference was:

```text
15 numbers → +0.0232 hits
```

The advantage decreased as the prediction size increased, eventually becoming slightly negative for 20 numbers:

```text
20 numbers → -0.0015 hits
```

The win-rate results show a similar pattern:

- V2 won **71%** of the 15-number comparisons.
- V2 won **66%** of the 16-number comparisons.
- V2 won **57%** of the 17-number comparisons.
- V2 won **53%** of the 18-number comparisons.
- 19 numbers were effectively a tie.
- V1 had a small advantage at 20 numbers.

### What does this mean?

The results provide evidence that the hierarchical idea is **interesting enough to investigate further**, but they do not demonstrate a meaningful lottery-prediction advantage.

The absolute differences are very small. For example, an improvement of `+0.0232` means that V2 achieved approximately 0.02 additional hits on average in the validation experiment.

The 100-run experiment is more informative than a single training run, but it is still not sufficient to establish statistical significance or real-world predictive power.

The most reasonable conclusion is:

> **MLP V2 is a promising experimental direction, but the current results are not strong enough to claim that it is superior to MLP V1 in a statistically or practically meaningful way.**

This distinction is particularly important because the underlying problem is a lottery, where historical correlations can occur naturally even when future draws remain unpredictable.

# Extension

LotoMind includes a Chrome extension that deploys the trained MLP V2 model directly in the browser using TensorFlow.js.

The extension is the serving layer of the project. Training remains in the Node.js pipeline, while the browser loads the exported model and executes inference without retraining it.

The user selects a prediction size from **15 to 20 numbers** and requests a new prediction. The extension retrieves the latest Lotofácil contests from the Caixa API, reproduces the same feature-engineering and scaling steps used during training, runs the exported MLP V2 model, and selects the highest-scoring numbers.

The current browser inference flow is:

```text
Caixa API
    ↓
Latest 20 contests
    ↓
Caixa transformation
    ↓
Feature engineering
    ↓
100 input features
    ↓
Exported training scaler
    ↓
TensorFlow.js MLP V2
    ↓
25 number scores
    ↓
Top N scores
    ↓
Prediction shown in the extension
```

For each number from 01 to 25, the same four features used during training are generated: frequency in the historical window, frequency in the recent window, delay since the last occurrence, and presence in the previous draw. With 25 numbers, this produces the same **100-feature input vector** expected by the exported model.

The scaler is **not fitted again in the browser**. The minimum and maximum values learned from the training split are exported with the model metadata and reused during inference. This keeps preprocessing consistent between training and serving and avoids introducing information from future contests into the fitted scaler.

The model itself has two outputs, but the current extension uses the individual-number output to rank the 25 numbers. After inference, the scores are sorted from highest to lowest and the top `N` numbers are selected according to the prediction size chosen by the user. The selected numbers are then sorted numerically for presentation.

### Extension architecture

```text
Training pipeline

data/raw/*.json
      ↓
RawContestRepository
      ↓
Feature Engineering + Scaling
      ↓
MLP V2 training
      ↓
ModelExporter
      ↓
model.json + weights.bin + metadata.json


Browser inference pipeline

Chrome Extension
      ↓
CaixaApi / ContestService
      ↓
FeatureEngineer
      ↓
Exported scaler metadata
      ↓
TensorFlow.js model
      ↓
PredictionService
      ↓
Popup UI
```

The extension source is bundled with **esbuild**. TensorFlow.js is imported as an npm dependency and included in the browser bundle, avoiding reliance on global scripts and keeping the extension compatible with Chrome Manifest V3.

### How to use

1. Install the project dependencies if necessary:

   ```bash
   npm install
   ```

2. Generate the extension bundle:

   ```bash
   npm run build:extension
   ```

3. Open Chrome and navigate to `chrome://extensions`.

4. Enable **Developer mode**.

5. Click **Load unpacked**.

6. Select the project's `extension/` directory.

7. Pin or open **LotoMind** from the Chrome extensions menu.

8. Select how many numbers you want in the prediction: **15, 16, 17, 18, 19, or 20**.

9. Click **Generate prediction**.

The extension will retrieve the latest available Lotofácil history, prepare the model input, run inference locally in the browser, and display the selected numbers together with the latest contest used as historical context.

---

# Next Steps

The next stage of LotoMind shifts the project from generating a single number selection toward **ranking available Lotofácil pools**.

The objective is not to claim that a model can predict a random lottery draw. Instead, the project will investigate whether available pools can be described, compared, and ranked using transparent structural, statistical, cost, diversity, and model-derived signals.

## 1. Pool data collection

Historical pool data is not currently available to the project. However, information about pools that are available for upcoming contests can be collected before each draw.

LotoMind will therefore begin building its own historical pool dataset. For every future contest, the project should store a snapshot of the pools available before the draw, including all useful information exposed by the source, such as price, number of bets, numbers per bet, quota information, and the combinations contained in the pool when available.

```text
Upcoming contest
      ↓
Collect available pools
      ↓
Store pre-draw snapshot
      ↓
Draw occurs
      ↓
Retrieve official result
      ↓
Enrich snapshot with observed outcomes
      ↓
Historical pool dataset
```

The pre-draw snapshot is important because only information available **before the target draw** should be used as model input.

## 2. Pool result enrichment and automatic labeling

After each contest is drawn, LotoMind will retrieve the official result and evaluate the pools that were previously collected.

This creates labels from observed outcomes rather than manually assigned judgments. Depending on the information available, examples may include best hit count, hit distribution across bets, prize-related outcomes, or other measurable post-draw performance variables.

The resulting dataset will connect:

```text
Pool features available before the draw
                  +
Observed result after the draw
                  ↓
         Supervised training data
```

## 3. Pool feature engineering

A dedicated feature-engineering layer will describe each pool independently of its eventual result. Candidate features include:

- Price and cost-related attributes.
- Number of bets and numbers per bet.
- Coverage of the 01–25 number space.
- Repetition and overlap between bets.
- Diversity between combinations.
- Odd/even and sum distributions.
- Number-frequency distributions across the pool.
- Exposure to numbers with high MLP V2 scores.
- Aggregate MLP compatibility signals such as mean, minimum, and maximum number scores.

This allows the current number model to remain useful: MLP V2 can become one source of features for the future pool-ranking system rather than being replaced by it.

## 4. Deterministic ranking baseline

Before training a machine-learning ranker, LotoMind should establish a transparent deterministic baseline.

The initial pool score can combine explicitly documented factors such as coverage, diversity, cost efficiency, structural characteristics, and compatibility with the existing number model.

This score should be interpreted only as a **LotoMind comparative score**, not as a proven probability of winning.

A deterministic baseline also provides a meaningful reference against which future learned ranking models can be evaluated.

## 5. Historical pool dataset

As new contests occur, the collection and enrichment pipeline will progressively create a versioned historical dataset:

```text
Contest N
  ├── pre-draw pool snapshot
  ├── pre-draw features
  └── observed outcomes

Contest N + 1
  ├── pre-draw pool snapshot
  ├── pre-draw features
  └── observed outcomes

...
```

This dataset becomes a new project asset and enables supervised experiments that are not possible with the currently available data.

## 6. Train a pool-ranking model

Once enough historical observations have been collected, LotoMind will train and compare models specifically for pool ranking. This is a new training problem rather than fine-tuning the existing MLP V2.

The exact learning objective should be chosen only after the available labels and dataset size are understood. Possible formulations include regression, classification, and **learning to rank**.

Learning to rank is particularly relevant because multiple pools are available for the same contest and the application ultimately needs to order those alternatives according to measurable signals. Candidate experiments may include ranking-capable gradient-boosted models and neural ranking approaches.

## 7. Temporal evaluation and retraining

Pool-ranking experiments must preserve the chronological discipline already used by LotoMind. Training data should contain only contests that occurred before the evaluation period.

```text
Older pool snapshots
       ↓
Training
       ↓
More recent snapshots
       ↓
Validation / test
       ↓
Future collected contests
       ↓
Periodic retraining
```

The learned ranker should be compared against simple baselines and evaluated out of time. Because lottery results are random, special attention must be given to overfitting, spurious historical correlations, data leakage, and the difference between a useful pool-comparison metric and evidence of predictive advantage.

## Target architecture

The longer-term architecture is expected to evolve toward:

```text
                 Caixa results
                      │
                      ▼
              Historical draws
                      │
                      ▼
             Number Predictor
                      │
                scores 01–25
                      │
                      ▼
Available pools → Pool Feature Engineer
                      │
                      ▼
                  Pool Ranker
                      │
                      ▼
                 Pool ranking
                      │
               draw takes place
                      │
                      ▼
                Result Enricher
                      │
                      ▼
             Historical Dataset
                      │
                      ▼
                 Train Ranker
                      │
                      └───────────↺
```

This direction expands LotoMind from a model experiment into a broader ML engineering system involving **data collection, automatic labeling, dataset versioning, feature engineering, model serving, ranking, temporal evaluation, and retraining**.

---

# Final Note

LotoMind is ultimately a learning and portfolio project.

Its main value is not in claiming that a lottery can be predicted, but in demonstrating a complete machine-learning engineering workflow:

```text
Real-world data
      ↓
Data collection
      ↓
Data transformation
      ↓
Feature engineering
      ↓
Statistical baselines
      ↓
Chronological validation
      ↓
Neural networks
      ↓
Repeated experiments
      ↓
Model comparison
      ↓
Model export
      ↓
Browser deployment
      ↓
Pool data collection
      ↓
Automatic labeling
      ↓
Pool feature engineering
      ↓
Learning-to-rank experiments
      ↓
Temporal evaluation and retraining
```

The project demonstrates practical experience with:

- JavaScript
- TensorFlow.js
- Machine learning
- Feature engineering
- Data engineering
- Chronological validation
- Backtesting
- Experiment design
- Model comparison
- Software architecture
- Browser-based ML inference
- Model serving
- Automated dataset construction
- Learning-to-rank system design

**LotoMind should not be interpreted as a lottery prediction system or a strategy with proven financial value.**
