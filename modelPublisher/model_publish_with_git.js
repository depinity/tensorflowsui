import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

// Define sleep function first
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Replace the hardcoded configuration with loading from config.txt
const configContent = fs.readFileSync('../config.txt', 'utf-8');
const configLines = configContent.split('\n');
const config = {};

configLines.forEach(line => {
    // Skip empty lines and comments
    if (line.trim() === '' || line.startsWith('#')) {
        return;
    }
    if (line.includes('=')) {
        const [key, value] = line.split('=').map(s => s.trim());
        // Simply use the key as-is and clean the value
        config[key] = value.replace(/['";\s]/g, '');
    }
});

const PRIVATE_KEY = config.PRIVATE_KEY;
const NETWORK = config.NETWORK;
const SCALE = parseInt(config.SCALE);
const MODEL_PATH = config.MODEL_PATH;

// Move banner display to the start of execution
const letters = {
    "O": [
        " ███ ",
        "█   █",
        "█   █",
        "█   █",
        " ███ "
    ],
    "P": [
        "████ ",
        "█   █",
        "████ ",
        "█    ",
        "█    "
    ],
    "E": [
        "████",
        "█   ",
        "███ ",
        "█   ",
        "████"
    ],
    "N": [
        "█   █",
        "██  █",
        "█ █ █",
        "█  ██",
        "█   █"
    ],
    "G": [
        " ███ ",
        "█    ",
        "█  ██",
        "█   █",
        " ███ "
    ],
    "R": [
        "████ ",
        "█   █",
        "████ ",
        "█  █ ",
        "█   █"
    ],
    "A": [
        " ███ ",
        "█   █",
        "█████",
        "█   █",
        "█   █"
    ],
    "H": [
        "█   █",
        "█   █",
        "█████",
        "█   █",
        "█   █"
    ]
};

function printBanner(text) {
    let output = ["", "", "", "", ""];
    const colors = [
        "\x1b[38;5;51m",   // Cyan
        "\x1b[38;5;45m",   // Light Blue
        "\x1b[38;5;39m",   // Blue
        "\x1b[38;5;33m",   // Darker Blue
        "\x1b[38;5;27m"    // Deep Blue
    ];
    const reset = "\x1b[0m";

    for (let char of text) {
        if (letters[char]) {
            letters[char].forEach((line, i) => {
                output[i] += colors[i] + line + reset + "   ";
            });
        } else if (char === " ") {
            output.forEach((_, i) => {
                output[i] += "  ";
            });
        }
    }

    console.log("\n" + output.join("\n") + "\n\n");
}

async function displayLog() {
    console.log(`
\x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
║  \x1b[38;5;213mOPENGRAPH: Fully On-chain Neural Network Inference\x1b[38;5;51m        ║ 
╚════════════════════════════════════════════════════════════╝\x1b[0m`);

console.log(`
\x1b[38;5;199m1. Web2 Model Conversion for Web3\x1b[0m
\x1b[38;5;147m- Loads TensorFlow/PyTorch model
- Converts weights to fixed-point and signedrepresentation
- Auto Generates Move smart contract code\x1b[0m

\x1b[38;5;199m2. SUI Network Publishing\x1b[0m
\x1b[38;5;147m- Deploys model as Move module
- Creates on-chain neural network
- Enables fully decentralized inference\x1b[0m

\x1b[38;5;199m3. Training Data Packaging\x1b[0m
\x1b[38;5;147m- Prepares training/test datasets
- Links with deployed model package Id from SUI on chain
- Ensures model and data reproducibility\x1b[0m

\x1b[38;5;199m4. Digital Provenance (Walrus)\x1b[0m
\x1b[38;5;147m- Packages complete model evidence:\x1b[0m
\x1b[38;5;251m• Package ID (on-chain model reference)
• Transaction digest (deployment proof)
• Training/Test datasets
• Model architecture details\x1b[0m
\x1b[38;5;147m- Uploads to Walrus for permanent storage
- Enables trustless model verification
- Provides complete ML provenance chain\x1b[0m`);
}

// Execute banner display immediately
printBanner("O P E N G R A P H");
displayLog();
await sleep(1000); // Sleep for 1 second

// 1. Model processing functions
async function loadTfjsLayersModel(tfjsFolder) {
    try {
        // model.json path
        const modelJsonPath = path.join(tfjsFolder, 'model.json');
        const modelJsonStr = fs.readFileSync(modelJsonPath, 'utf-8');
        const modelJson = JSON.parse(modelJsonStr);

        const modelTopology = modelJson.modelTopology;
        const weightsManifest = modelJson.weightsManifest; // array

        const weightDataMap = {}; // { weightName: Float32Array }

        // Iterate through weightsManifest
        for (const manifestGroup of weightsManifest) {
            const { paths, weights } = manifestGroup;
            for (const binFile of paths) {
                const binFullPath = path.join(tfjsFolder, binFile);
                const binBuffer = fs.readFileSync(binFullPath);

                let offset = 0;
                for (const w of weights) {
                    const numElements = w.shape.reduce((a, b) => a * b, 1);
                    const byteLength = numElements * 4; // float32 = 4 bytes

                    const rawSlice = binBuffer.slice(offset, offset + byteLength);
                    offset += byteLength;

                    const floatArr = new Float32Array(rawSlice.buffer, rawSlice.byteOffset, numElements);
                    weightDataMap[w.name] = floatArr;
                }
            }
        }

        return { modelTopology, weightDataMap };
    } catch (error) {
        console.error('Error loading TensorFlow.js model:', error);
        throw error;
    }
}

function floatToFixed(x, scale) {
    let signBit = 0;
    if (x < 0) {
        signBit = 1;
        x = -x;
    }
    const factor = Math.pow(10, scale);
    const absVal = Math.round(x * factor);
    return [signBit, absVal];
}

function convertWeightsToFixed(modelTopology, weightDataMap, scale = 2) {
    console.log('\n=== Converting Weights to Fixed-Point (scale=', scale, ') ===');
    
    const layers = modelTopology.model_config.config.layers;
    const convertedWeights = [];

    for (const layer of layers) {
        if (layer.class_name === 'InputLayer') {
            continue;
        }

        const kernelName = `${layer.config.name}/kernel`;
        const biasName = `${layer.config.name}/bias`;
        
        if (!(kernelName in weightDataMap) || !(biasName in weightDataMap)) {
            continue;
        }

        const kernel = weightDataMap[kernelName];
        const bias = weightDataMap[biasName];

        const signsK = [];
        const magsK = [];
        for (const val of kernel) {
            const [signBit, absVal] = floatToFixed(val, scale);
            signsK.push(signBit);
            magsK.push(absVal);
        }

        const signsB = [];
        const magsB = [];
        for (const val of bias) {
            const [signBit, absVal] = floatToFixed(val, scale);
            signsB.push(signBit);
            magsB.push(absVal);
        }

        convertedWeights.push({
            layerName: layer.config.name,
            kernel: {
                magnitude: magsK,
                sign: signsK,
                shape: layer.config.kernel_size || [kernel.length / bias.length, bias.length]
            },
            bias: {
                magnitude: magsB,
                sign: signsB,
                shape: [bias.length]
            },
            scale
        });
    }

    return convertedWeights;
}

function generateMoveCode(convertedWeights, scale) {
    let moveCode = `module tensorflowsui::model {
    use sui::tx_context::TxContext;
    use tensorflowsui::graph;
    use tensorflowsui::tensor;

    public fun create_model_signed_fixed(graph: &mut graph::SignedFixedGraph, scale: u64) {
`;

    // Add layer declarations
    for (const layer of convertedWeights) {
        const [inputSize, outputSize] = layer.kernel.shape;
        moveCode += `        graph::DenseSignedFixed(graph, ${inputSize}, ${outputSize}, b"${layer.layerName}", scale);\n`;
    }
    moveCode += '\n';

    // Add weights for each layer
    for (const layer of convertedWeights) {
        const kernelMag = `vector[${layer.kernel.magnitude.join(', ')}]`;
        const kernelSign = `vector[${layer.kernel.sign.join(', ')}]`;
        const biasMag = `vector[${layer.bias.magnitude.join(', ')}]`;
        const biasSign = `vector[${layer.bias.sign.join(', ')}]`;
        const [inputSize, outputSize] = layer.kernel.shape;

        moveCode += `
        let w${layer.layerName}_mag = ${kernelMag};
        let w${layer.layerName}_sign = ${kernelSign};
        let b${layer.layerName}_mag = ${biasMag};
        let b${layer.layerName}_sign = ${biasSign};

        graph::set_layer_weights_signed_fixed(
            graph,
            b"${layer.layerName}",
            w${layer.layerName}_mag, w${layer.layerName}_sign,
            b${layer.layerName}_mag, b${layer.layerName}_sign,
            ${inputSize}, ${outputSize},
            scale
        );\n`;
    }

    // Add helper functions for split chunk computation
    moveCode += `
    }

    entry public fun split_chunk_compute(
        graph_obj: &graph::SignedFixedGraph,
        pd: &mut graph::PartialDenses,
        partial_name: vector<u8>,
        input_magnitude: vector<u64>, input_sign: vector<u64>,
        activation_type: u64,
        start_j: u64,
        end_j: u64
    ) {
        graph::split_chunk_compute(graph_obj, pd, partial_name, input_magnitude, input_sign, activation_type, start_j, end_j);    
    }

    entry public fun split_chunk_finalize(
        pd: &mut graph::PartialDenses,
        partial_name: vector<u8>
    ): (vector<u64>, vector<u64>, u64) {
        let mut results_mag = vector::empty<u64>();
        let mut result_sign = vector::empty<u64>();
        let mut results;
        let (_results_mag, _result_sign, _results) = graph::split_chunk_finalize(pd, partial_name);

        results_mag = _results_mag;
        result_sign = _result_sign;
        results = _results;

        (results_mag, result_sign, results)
    }

    entry public fun ptb_layer(
        graph: &graph::SignedFixedGraph,
        input_magnitude: vector<u64>, input_sign: vector<u64>,
        scale: u64, name: vector<u8>
    ) : (vector<u64>, vector<u64>, u64) {
        let mut results_mag = vector::empty<u64>();
        let mut result_sign = vector::empty<u64>();
        let mut results;

        let (_results_mag, _result_sign, _results) = graph::ptb_layer(graph, input_magnitude, input_sign, scale, name);

        results_mag = _results_mag;
        result_sign = _result_sign;
        results = _results;

        (results_mag, result_sign, results)
    }

    entry public fun ptb_layer_arg_max(
        graph: &graph::SignedFixedGraph,
        input_magnitude: vector<u64>, input_sign: vector<u64>,
        scale: u64, name: vector<u8>
    ) : u64 {
        let results = graph::ptb_layer_arg_max(graph, input_magnitude, input_sign, scale, name);
        results
    }

    public entry fun initialize(ctx: &mut TxContext) {
        let mut graph = graph::create_signed_graph(ctx);
        create_model_signed_fixed(&mut graph, ${scale}); 
        let mut partials = graph::create_partial_denses(ctx);
        graph::add_partials_for_all_but_last(&graph, &mut partials);
        graph::share_graph(graph);
        graph::share_partial(partials);
    }
}`;

    return moveCode;
}

// 2. Move.toml generation
async function generateMoveToml(moduleName) {
    const moveTomlContent = `[package]
name = "Model"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/${NETWORK}" }
tensorflowsui = { git = "https://github.com/depinity/tensorflowsui.git", subdir = "tensorflowSuiLib/v.1.0.1", rev = "main" }

[addresses]
model = "0x0"

[dev-dependencies]

[dev-addresses]
`;

    await fsPromises.writeFile('./with_git_dependencies/Move.toml', moveTomlContent, 'utf-8');
    console.log("Move.toml file generated successfully");
}

// 3. Publishing to NETWORK
async function publishToNet() {
    const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
    const signer = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));

    const contractURI = path.resolve("./with_git_dependencies");
    console.log("Contract URI:", contractURI);
    console.log("Working Directory:", process.cwd());

    const { modules, dependencies } = JSON.parse(
        execSync(`sui move build --dump-bytecode-as-base64 --path ${contractURI}  --silence-warnings`, {
            encoding: 'utf-8',
        })
    );
    console.log("Build successful!");

    const tx = new Transaction();
    tx.setSender(signer.getPublicKey().toSuiAddress());
    tx.setGasBudget(45000000);
    const upgradeCap = tx.publish({ modules, dependencies });
    tx.transferObjects([upgradeCap], signer.getPublicKey().toSuiAddress());

    const txBytes = await tx.build({ client });
    const signature = (await signer.signTransaction(txBytes)).signature;

    const simulationResult = await client.dryRunTransactionBlock({ transactionBlock: txBytes });
    if (simulationResult.effects.status.status === "success") {
        const result = await client.executeTransactionBlock({
            transactionBlock: txBytes,
            signature,
            options: { showEffects: true }
        });
        console.log("Deployment successful:", result);        
        // Extract package ID more reliably by finding the created package
        const packageId = result.effects.created?.find(item => item.owner === 'Immutable')?.reference?.objectId;
        if (!packageId) {
            throw new Error("Failed to extract package ID from deployment result");
        }

console.log(`
\x1b[38;5;199m1. Web2 Model Reading & Processing\x1b[0m
\x1b[38;5;147m- Auto-reads common graph structure (./web2_model/)
- Extracts model weights and topology
- Interprets neural network architecture\x1b[0m

\x1b[38;5;199m2. TensorflowSUI Auto-Generation\x1b[0m
\x1b[38;5;147m- Auto-generates model.move using TensorflowSUI lib we developed
- Creates Move smart contract structure
- Configures on-chain neural network\x1b[0m

\x1b[38;5;199m3. Move Package Configuration\x1b[0m
\x1b[38;5;147m- Auto-generates Move.toml
- Sets up package dependencies
- Configures build settings
- Prepares for deployment\x1b[0m

\x1b[38;5;199m So, This scripts automates the entire process of deploying a web2 Deep Learning model to the SUI network\x1b[0m
\x1b[38;5;147m- One-click publishing to SUI network
- Streamlined for model publishers
- Various Web2 AI model to Web3 AI model automation\x1b[0m`);

        console.log("\nPackage ID:", packageId);
        console.log("https://suiscan.xyz/"+NETWORK+"/object/"+ packageId+"/tx-blocks");

        console.log("\nTransaction Digest:", result.digest);
        console.log("https://suiscan.xyz/"+NETWORK+"/tx/"+ result.digest);
        
        // Save package ID to a file
        await fsPromises.writeFile('../packageId.txt', packageId);

        console.log("Package ID saved to packageId.txt");

        return result;
    } else {
        console.log("Simulation failed:", simulationResult);
        throw new Error("Deployment simulation failed");
    }
}

// Main execution
async function main() {
    try {
        // 1. Process model and generate Move code
        const tfjsFolder = MODEL_PATH;
        if (!fs.existsSync(tfjsFolder)) {
            throw new Error(`Model folder not found: ${tfjsFolder}`);
        }
        console.log("\n");
        console.log("\n");
        console.log("1. Processing TensorFlow.js model...");
        const { modelTopology, weightDataMap } = await loadTfjsLayersModel(tfjsFolder);
        const convertedWeights = convertWeightsToFixed(modelTopology, weightDataMap, SCALE);
        const moveCode = generateMoveCode(convertedWeights, SCALE);

        // Changed path from './sui' to './with_git_dependencies'
        await fsPromises.mkdir('./with_git_dependencies/sources', { recursive: true });
        await fsPromises.writeFile('./with_git_dependencies/sources/model.move', moveCode);
        console.log("Move code generated and saved to ./with_git_dependencies/sources/model.move");

        // 2. Generate Move.toml
        console.log("\n2. Generating Move.toml...");
        await generateMoveToml("tensorflowsui");

        // 3. Publish to NETWORK
        console.log("\n3. Publishing to " + NETWORK+"...");
        const result = await publishToNet();
        console.log("Deployment completed successfully!");
        
        const packageId = result.effects.created?.find(item => item.owner === 'Immutable')?.reference?.objectId;
        if (!packageId) {
            throw new Error("Failed to extract package ID from deployment result");
        }
        await storeTrainData(packageId, result.digest);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

async function storeTrainData(packageId, digest) {
	try {
        
        const jsonTrainData = fs.readFileSync('./web2_datasets/resample_convert_train.json', 'utf8');
        const jsonTestData = fs.readFileSync('./web2_datasets/resample_convert_test.json', 'utf8');
        
        // Parse JSON string to JavaScript object
        const trainData = JSON.parse(jsonTrainData);
        const testData = JSON.parse(jsonTestData);
        
        // Log the data structure
        console.log('MNIST data loaded successfully');

		// 서버로 요청 보내기
		const response = await fetch('http://localhost:8083/train-set', {
			method: 'POST', 
			headers: { 'Content-Type': 'application/json' }, 
			body: JSON.stringify( { train: trainData, test: testData, packageId: packageId, digest: digest })
		});

		const data = await response.json();
        const blobId = data['blobId'];

    
		console.log("Training Set Walrus Store Success", data);
        console.log('https://walruscan.com/testnet/blob/' + blobId);
		return data;
	} catch (error) {
		console.error('API Call Err:', error);
		return "";
	}
}

main();
