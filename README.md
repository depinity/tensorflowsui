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

## TensorflowSui Library

The `@tensorflowSui_lib` provides core functionality for interpreting and executing Web2 AI models (trained with frameworks like TensorFlow and PyTorch) in a fully on-chain environment.

### Core Components

- **tensor.move**  
  Implements tensor structures and computation functions with floating-point and signed number support. Provides fundamental arithmetic operations optimized for AI computations.

- **graph.move**  
  Handles AI model structure interpretation, including layers, activations, weights, and operations. Currently supports:
  - Dense layers
  - ReLU activation
  - Basic model architectures (with ongoing development for more complex deep learning models)

### Inference Options

<p align="center">
  <img src="inference_options.JPG" alt="inference_options" width="600"/>
</p>


The library offers three flexible inference approaches to balance between atomicity, cost, and efficiency:

1. **One Transaction Inference**
   - All computations performed in a single transaction
   - Fully atomic execution
   - Higher gas costs due to accumulated computations
   - Best for simple models or when atomicity is critical

2. **Programable Transaction Block (PTB) Inference**
   - Leverages Sui's PTB functionality to split computations
   - Maintains atomic execution while reducing costs
   - Computations can be split by layers
   - Optimal balance between atomicity and efficiency

3. **Split Transaction Inference**
   - Divides computation across multiple transactions
   - Uses partial state boxes for intermediate results
   - Lowest gas costs
   - Non-atomic execution
   - Recommended to use with Walrus for transaction trajectory and output verification

These options can be mixed and matched within the same model to optimize for specific requirements. For example, you could use PTB inference for critical computations while using split transactions for less sensitive operations, allowing for a customized balance between security and efficiency.

Choose the inference option or combination that best matches your requirements for atomicity, cost efficiency, and execution speed.

---

## Usage Guide

### 1. warlus with Go
Start the Go server that handles Walrus interactions:
```bash
cd warlus_with_go
go run .
```

### 2. Model Publisher
The Model Publisher simplifies the process of deploying Web2 AI models to the Sui blockchain:

1. **Prepare Your Model**
   - Convert your .h5 model to TensorFlow.js format:
     ```bash
     tensorflowjs_converter --input_format=keras /path/to/model.h5 /path/to/tfjs_model
     ```
     here ! https://www.tensorflow.org/js/guide/conversion?hl=en
   - Place the converted model in the `web2_models` directory

2. **Configure Publishing**
   - Update `config.txt` with your settings:
     ```ini
     PRIVATE_KEY=your_private_key
     NETWORK=devnet  # or testnet/mainnet
     SCALE=2         # decimal precision for fixed-point conversion
     MODEL_PATH=./web2_models
     ```

3. **Run the Publisher**
   ```bash
   cd Model_publisher
   node model_publish.js
   ```

The publisher will:
- Load and process your TensorFlow.js model
- Convert weights to fixed-point representation
- Auto-generate Move smart contracts
- Deploy to the specified Sui network
- Save the package ID for future reference

### 3. Model User
The Model User component provides a CLI interface for interacting with deployed models and performing inference:
For using models from SUI packageId:
- Downloads input data from Walrus with digital provenance
- Performs fully on-chain inference
- Provides transaction verification

1. **Setup**
   ```bash
   cd Model_user
   npm install
   ```

2. **Configure**
   - The package ID from the published model will be automatically loaded from `packageId.txt`
   - Update `config.txt` with your settings:
     ```ini
     PRIVATE_KEY=your_private_key
     NETWORK=devnet  # or testnet/mainnet
     ```

3. **Run Inference**
   ```bash
   node inference.js
   ```

   The CLI supports three commands:
   - `init`: Initialize the model state
   - `load input`: Load input data from the Walrus server
   - `run`: Execute the inference process mixed inference options (split transaction and PTB)

4. **Hybrid Inference Process**
   The implementation uses a hybrid approach combining two inference methods:
   - **Split Transaction** for the input layer → layer 1
     - Divides computation into 16 partitions for efficiency
     - Provides progress visualization
     - Optimizes gas costs for heavy computations
   
   - **PTB (Programable Transaction Block)** for layers 2 → 3 → output
     - Maintains atomic execution
     - Processes remaining layers in a single transaction
     - Outputs final classification result

5. **Walrus Integration**
   - All transaction trajectories are automatically uploaded to Walrus
   - Provides verifiable proof of computation
   - Access results via Walrus Explorer: `https://walruscan.com/testnet/account/{blobId}`

## Hybrid Inference Architecture

Tensorflowsui supports both on-chain and off-chain inference through a hybrid architecture:

1. **On-Chain Inference (Small Models)**
   - Fully decentralized execution for lightweight models
   - Complete transparency and auditability
   - Suitable for:
     - Classification tasks
     - Simple neural networks
     - Time-critical applications

2. **Atoma Network Integration (Large Models)**
   - Leverages Atoma Network for large model inference
   - Maintains connection to Sui blockchain for verification
   - Supports models like:
     - LLMs (e.g., Llama-3.3-70B)
     - Complex deep learning architectures
     - Resource-intensive tasks

### Atoma Input Generation

The `atoma` directory provides tools for generating model inputs using Atoma Network:

```bash
cd atoma
npm install
node input_data_generation_with_atoma.js
```

Key components:
- `input_data_generation_with_atoma.js`: Generates inputs using Atoma's LLM capabilities
- `convert_data_for_web3_input.js`: Converts generated data for on-chain use
- `atoma_converted.json`: Stores processed input data

This hybrid approach enables:
- Scalable inference for both small and large models
- Decentralized verification of model outputs
- Flexible deployment options based on model size and requirements

---

We want to co-develop with those who share our vision.  
Feel free to reach out at any time via the link or email below:

- **LinkedIn**: [Jun-hwan Kwon](https://www.linkedin.com/in/jun-hwan-kwon/)
- **Email**: [gr0442@gmail.com](mailto:gr0442@gmail.com)

Junhwan Kwon, Ph.D.



