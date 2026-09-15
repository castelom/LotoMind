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
- Apply number scores to larger combinations and bolões.
- Practice repeated experiments and model comparison.
- Eventually export a trained model and use it inside a Chrome extension.

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
│   └── index.js
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
| `scoring` | Score numbers and bolões |
| `evaluation` | Run backtests and ML experiments |
| `models` | Represent lottery contests |
| `tests` | Automated tests |
| `results` | Store experimental outputs |

---

# Results

The MLP V1 × V2 experiment was executed **100 times** using the same validation dataset.

## Average performance

The table below shows the average difference between V2 and V1:

> **Δ = V2 average hits − V1 average hits**

| Numbers | V1 mean hits | V2 mean hits | Mean Δ | V2 wins | V1 wins | Ties | V2 win rate |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 15 | 9.0131 | 9.0364 | **+0.0232** | 71 | 29 | 0 | **71%** |
| 16 | 9.6153 | 9.6355 | **+0.0201** | 66 | 33 | 1 | **66%** |
| 17 | 10.2226 | 10.2335 | **+0.0109** | 57 | 42 | 1 | **57%** |
| 18 | 10.8244 | 10.8318 | **+0.0074** | 53 | 47 | 0 | **53%** |
| 19 | 11.4246 | 11.4309 | **+0.0063** | 50 | 48 | 2 | **50%** |
| 20 | 12.0270 | 12.0255 | **-0.0015** | 45 | 54 | 1 | **45%** |

## Mean hit difference

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

| Prediction size | V1 | V2 |
|---:|---:|---:|
| 15 | 9.0131 | 9.0364 |
| 16 | 9.6153 | 9.6355 |
| 17 | 10.2226 | 10.2335 |
| 18 | 10.8244 | 10.8318 |
| 19 | 11.4246 | 11.4309 |
| 20 | 12.0270 | 12.0255 |

## Standard deviation across runs

| Prediction size | V1 std | V2 std |
|---:|---:|---:|
| 15 | 0.0436 | 0.0395 |
| 16 | 0.0472 | 0.0395 |
| 17 | 0.0474 | 0.0389 |
| 18 | 0.0456 | 0.0404 |
| 19 | 0.0401 | 0.0392 |
| 20 | 0.0378 | 0.0391 |

V2 showed slightly lower variation across repeated runs for prediction sizes from 15 to 19, while the difference at 20 numbers was negligible.

## Inferences

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

---

# Next Steps

## 1. Export MLP V2

The next step is to export the trained MLP V2 model so that inference can be performed without retraining the network.

The intended pipeline is:

```text
Training
   ↓
MLP V2
   ↓
Model export
   ↓
Model loading
   ↓
Inference
```

The exported model should be usable by the future client application.

The inference flow will be:

```text
Latest Lotofácil history
        ↓
Feature engineering
        ↓
Feature scaling
        ↓
MLP V2
   ┌────┴────┐
   ▼         ▼
Numbers    Groups
   └────┬────┘
        ▼
Group-aware selector
        ↓
Number ranking
```

## 2. Chrome extension

After model export, the next major step is to build a Chrome extension around the LotoMind inference pipeline.

The extension is intended to provide a simple interface for:

- Loading or updating historical data.
- Running the model locally.
- Displaying number scores.
- Applying model scores to combinations.
- Ranking available bolões.
- Showing the signals used by the scoring process.

The planned architecture is:

```text
Chrome Extension
       │
       ▼
TensorFlow.js Model
       │
       ▼
Feature Engineering
       │
       ▼
LotoMind Scoring
       │
       ▼
Bolão Ranking
```

The project direction is therefore evolving from:

```text
"Predict the next 15 numbers"
```

toward:

```text
"Use statistical and ML signals to rank existing
Lotofácil combinations and bolões."
```

This makes the project more interesting from a software-engineering perspective while keeping the experimental limitations explicit.

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

**LotoMind should not be interpreted as a lottery prediction system or a strategy with proven financial value.**
