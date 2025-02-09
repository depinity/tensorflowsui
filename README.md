<p align="center">
  <img src="opengraph.png" alt="OpenGraph" width="200"/>
</p>

# Tensorflowsui

Tensorflowsui aims to bridge **Web2-based DL/ML models** to a **fully decentralized on-chain environment**, enhancing the **transparency**, **reproducibility**, **auditability**, **operational efficiency**, and **connectivity** of AI models. By providing trust and predictability for otherwise untestable "black box" AI systems, Tensorflowsui delivers effective **risk management** solutions for AI models.

Our **fully on-chain inference** approach:
- **Ensures objective reliability** of the model's predictions
- **Defines algorithmic ownership** on the blockchain
- **Encourages industrial-scale mass adoption** of on-chain agents

Tensorflowsui's ultimate goal is to **democratize** AI by making deep learning (DL) and machine learning (ML) models verifiable, trustworthy, and easily integrable into decentralized applications (dApps) and beyond.

---

## Key Features

- **Fully On-Chain Execution**  
  Run DL/ML models directly on-chain for maximum transparency and security.

- **High Trust & Predictability**  
  Eliminate the risks of "black box" AI through verifiable inference processes that can be audited and reproduced.

- **Ownership & Accountability**  
  Clearly define algorithmic ownership, enabling fair usage rights and licensing on the blockchain.

- **Mass Adoption**  
  Pave the way for on-chain AI agents to be deployed in real-world industrial scenarios, thanks to transparent and provable computations.




---

## Usage Guide

### 1. warlus with Go
Start the Go server that handles Walrus interactions:
```bash
cd warlus_with_go
go run .
```

### 2. Model Publisher
For publishing Web2 models to the Sui blockchain using tensorflowSui library:

1. If you have a .h5 model, convert it to TensorFlow.js format first:
   - Visit: https://www.tensorflow.org/js/guide/conversion?hl=en
   - Follow the conversion guide for your specific model type

2. Use the Model Publisher to deploy your converted model with:
   - Fully interpreted model graphs
   - Operations and weights with signed 2-point floating
   - Blockchain deployment configurations

### 3. Model User
For using models from SUI packageId:
- Downloads input data from Walrus with digital provenance
- Performs fully on-chain inference
- Provides transaction verification

Note: Python SDK is currently under development.

---

We want to co-develop with those who share our vision.  
Feel free to reach out at any time via the link or email below:

- **LinkedIn**: [Jun-hwan Kwon](https://www.linkedin.com/in/jun-hwan-kwon/)
- **Email**: [gr0442@gmail.com](mailto:gr0442@gmail.com)

Junhwan Kwon, Ph.D.



