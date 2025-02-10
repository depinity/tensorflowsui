import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHex } from '@mysten/bcs';
import promptSync from 'prompt-sync';
import ora from "ora";
import fs from 'fs';


const prompt = promptSync();

// Read configuration from config.txt
const configContent = fs.readFileSync('../config.txt', 'utf8');
const config = Object.fromEntries(
	configContent.split('\n')
		.filter(line => line.trim())
		.map(line => line.split('=').map(part => part.trim()))
);

// Read package ID from packageId.txt
const packageId = fs.readFileSync('../packageId.txt', 'utf8').trim();

const network = config.NETWORK;
const TENSROFLOW_SUI_PACKAGE_ID = packageId;
const PRIVATE_KEY = config.PRIVATE_KEY;

// 3
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 85, 99, 17, 0, 0, 0, 3, 0, 56, 32, 0, 0, 0, 62, 93, 90, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 90, 76, 94, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 7
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 39, 39, 71, 0, 0, 0, 0, 0, 0, 54, 16, 0, 0, 3, 74, 52, 10, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 	0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 

// 4
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 66, 0, 0, 0, 99, 0, 0, 95, 0, 0, 0, 51, 60, 87, 99, 0, 0, 0, 6, 67, 0, 99, 2, 0, 0, 0, 0, 0, 33, 57, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 0
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 96, 1, 0, 0, 0, 33, 62, 29, 45, 0, 0, 0, 50, 0, 0, 88, 0, 0, 17, 0, 0, 54, 7, 0, 0, 11, 97, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 6
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 44, 0, 0, 0, 0, 4, 89, 0, 0, 0, 0, 0, 59, 92, 43, 0, 0, 0, 0, 49, 89, 90, 30, 0, 0, 0, 0, 61, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let input_mag = [];
let input_sign = [];

const rpcUrl = getFullnodeUrl(network);
const client = new SuiClient({ url: rpcUrl });

let SignedFixedGraph = "";
let PartialDenses = "";
let totalGasUsage = 0;

// async function main() {
if (!PRIVATE_KEY) {
	console.error("Please provide a PRIVATE_KEY in .env file");
}

async function getInput(label) {
	try {
		const response = await fetch('http://localhost:8083/get', {
			method: 'POST', 
			headers: { 'Content-Type': 'application/json' }, 
			body: JSON.stringify({ label: label }) // JSON 데이터 변환
		  });

		const data = await response.json();
		console.log(data);
		return data;
	} catch (error) {
		console.error('API Call Err:', error)
		return "";
	}
}

async function store(digest_arr, partialDenses_digest_arr, version_arr) {
	try {
		const response = await fetch('http://localhost:8083/store', {
			method: 'POST', 
			headers: { 'Content-Type': 'application/json' }, 
			body: JSON.stringify({ digestArr: digest_arr, partialDensesDigestArr: partialDenses_digest_arr, versionArr: version_arr }) // JSON 데이터 변환
		  });
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('API Call Err:', error)
		return "";
	}
}
 
async function run() {

	let keypair;
	let result;

	let tx_digest_arr = [];
	let partialDenses_digest_arr = [];
	let version_arr = [];

	while (true) {

		console.log("\n  ");


		const command = prompt(">> Please enter your command : ");

		switch (command.trim().toLowerCase()) {


		case "help":


		console.log(`
\x1b[38;5;199m1. Initialize (init)\x1b[0m
\x1b[38;5;147m- Publishes objects from the Move package
- Creates two main objects:\x1b[0m
    \x1b[38;5;226ma) SignedFixedGraph:\x1b[0m Contains all graph information from the published web3 model
        \x1b[38;5;251m• Weights, biases, and network architecture
        • Immutable after initialization\x1b[0m
    \x1b[38;5;226mb) PartialDenses:\x1b[0m Stores computation results of nodes
        \x1b[38;5;251m• Used for split transaction computation
        • Mutable state for intermediate results\x1b[0m`);

		await sleep(500);

		console.log(`
\x1b[38;5;199m2. Load Input (load input)\x1b[0m
\x1b[38;5;147m- Fetches input data from Walrus blob storage
- Blob contains model inputs uploaded by model publisher
- Prepares input vectors for inference:\x1b[0m
    \x1b[38;5;251m• input_mag: Magnitude vector
    • input_sign: Sign vector\x1b[0m`);

		await sleep(500);

		console.log(`
\x1b[38;5;199m3. Run Inference (run)\x1b[0m
\x1b[38;5;147mThe inference process combines two optimization strategies:\x1b[0m

\x1b[38;5;226mA. Split Transaction Computation (16 parts)\x1b[0m
    \x1b[38;5;251m- Breaks down input layer → hidden layer computation
    - Input (#49 nodes) → Hidden Layer 1 (#16 nodes)
    - Processes in 16 separate transactions for gas efficiency\x1b[0m

\x1b[38;5;226mB. PTB (Parallel Transaction Blocks)\x1b[0m
    \x1b[38;5;251m- Handles remaining layers atomically
    - Hidden Layer 1 → Hidden Layer 2 → Output
    - Executes final classification in single transaction
    - Ensures atomic state transitions\x1b[0m`);

		await sleep(500);

		console.log(`
\x1b[38;5;199m4. Save Receipt to Walrus\x1b[0m
\x1b[38;5;147m- Packages inference evidence:\x1b[0m
    \x1b[38;5;251m• Transaction digests (tx_digest_arr)
    • Partial dense computation proofs (partialDenses_digest_arr)
    • State versions (version_arr)\x1b[0m
\x1b[38;5;147m- Uploads to Walrus as receipt
- Provides permanent proof of inference execution
- Enables digital provenance verification
- Returns Walrus blob ID for reference\x1b[0m`);

		await sleep(500);

	
			break;
			
		case "init":
			console.log("\nInitializing... \n");
console.log(`
\x1b[38;5;199m1. Initialize (init)\x1b[0m
\x1b[38;5;147m- Publishes objects from the Move package
- Creates two main objects:\x1b[0m
\x1b[38;5;226ma) SignedFixedGraph:\x1b[0m Contains all graph information from the published web3 model
\x1b[38;5;251m• Weights, biases, and network architecture
• Immutable after initialization\x1b[0m
\x1b[38;5;226mb) PartialDenses:\x1b[0m Stores computation results of nodes
\x1b[38;5;251m• Used for split transaction computation
• Mutable state for intermediate results\x1b[0m`);


			let tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model::initialize`,
			})

			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			for (let i=0; i < result['objectChanges'].length; i++) {

				let parts;
				let exist;
				
				parts = result['objectChanges'][i]["objectType"].split("::");
				exist = parts.some(part => part.includes("PartialDenses"));
				if (exist == true) {
					PartialDenses = result['objectChanges'][i]["objectId"];
					exist = false;
				}

				parts = result['objectChanges'][i]["objectType"].split("::");
				exist = parts.some(part => part.includes("SignedFixedGraph"));
				if (exist == true) {
					SignedFixedGraph = result['objectChanges'][i]["objectId"];
					exist = false;
				}
			}
			console.log("");
			console.log("");

			console.log("SignedFixedGraph:", SignedFixedGraph);
			console.log("https://suiscan.xyz/"+network+"/object/"+ SignedFixedGraph+"/tx-blocks");

			console.log("PartialVariable:", PartialDenses);
			console.log("https://suiscan.xyz/"+network+"/object/"+ PartialDenses+"/tx-blocks");

			console.log("Gas Used (only once):", (Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.storageCost) + Number(result.effects.gasUsed.storageRebate)) / Number(MIST_PER_SUI), " SUI");
			console.log("");

			console.log("");


			console.log(`

				\x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
				║  Completed! init the model  ║ "load input" to load input data from Walrus
				╚════════════════════════════════════════════════════════════╝\x1b[0m
				`);
			

			break;
			
		case "load input":
console.log(`
\x1b[38;5;199m2. Load Input (load input)\x1b[0m
\x1b[38;5;147m- Fetches input data from Walrus blob storage
- Blob contains model inputs uploaded by model publisher
- Prepares input vectors for inference:\x1b[0m
\x1b[38;5;251m• input_mag: Magnitude vector
• input_sign: Sign vector\x1b[0m`);

			const label = prompt(">> What label do you want? ");

			console.log(label)

			let input = await getInput(Number(label));
			input_mag = input["inputMag"];
			input_sign = input["inputSign"];



			console.log(`

				\x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
				║ Completed! load input data  ║ "run" to start inference
				╚════════════════════════════════════════════════════════════╝\x1b[0m
				`);
			
			
			break;

		case "run":
console.log(`
\x1b[38;5;199m3. Run Inference (run)\x1b[0m
\x1b[38;5;147mThe inference process combines two optimization strategies:\x1b[0m

\x1b[38;5;226mA. Split Transaction Computation (16 parts)\x1b[0m
\x1b[38;5;251m- Breaks down input layer → hidden layer computation
- Input (#49 nodes) → Hidden Layer 1 (#16 nodes)
- Processes in 16 separate transactions for gas efficiency\x1b[0m

\x1b[38;5;226mB. PTB (Parallel Transaction Blocks)\x1b[0m
\x1b[38;5;251m- Handles remaining layers atomically
- Hidden Layer 1 → Hidden Layer 2 → Output
- Executes final classification in single transaction
- Ensures atomic state transitions\x1b[0m`);


			console.log('\nInference start... \n');

			let totalTasks = 17
			let spinner;
			
			for (let i = 0; i<totalTasks; i++) {

				await sleep(500);


				const filledBar = '█'.repeat(i+1);  
				const emptyBar = '░'.repeat(totalTasks - i - 1); 
				const progressBar = filledBar + emptyBar; // total progress bar
				
				if (i == totalTasks-1) {

					let final_tx = new Transaction();

					if (!final_tx.gas) {
						console.error("Gas object is not set correctly");
					}

					let res_act1 = final_tx.moveCall({
						target: `${TENSROFLOW_SUI_PACKAGE_ID}::graph::split_chunk_finalize`,
						arguments: [
							final_tx.object(PartialDenses),
							final_tx.pure.string('dense'),
						],
					})

					let res_act2 = final_tx.moveCall({
						target: `${TENSROFLOW_SUI_PACKAGE_ID}::graph::ptb_layer`,
						arguments: [
							final_tx.object(SignedFixedGraph),
							res_act1[0],
							res_act1[1],
							res_act1[2],
							final_tx.pure.string('dense_1'),
						],
					})

					final_tx.moveCall({
						target: `${TENSROFLOW_SUI_PACKAGE_ID}::graph::ptb_layer_arg_max`,
						arguments: [
							final_tx.object(SignedFixedGraph),
							res_act2[0],
							res_act2[1],
							res_act2[2],
							final_tx.pure.string('dense_2'),
						],
					})

					keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
					result = await client.signAndExecuteTransaction({
						transaction: final_tx,
						signer: keypair,
						options: {
							showEffects: true,
							showEvents: true,
							showObjectChanges: true,
						}
					})
					spinner.succeed("✅ spilit transaction computation completed!");
					
					spinner = ora("Processing task... ").start();
					console.log("\n***** Start PTB computation hidden layer 1 -> hidden layer 2 -> output *****");

					for (let i=0; i < result['objectChanges'].length; i++) {

						let parts;
						let exist;
						
						parts = result['objectChanges'][i]["objectType"].split("::");
						exist = parts.some(part => part.includes("PartialDenses"));
						if (exist == true) {
							partialDenses_digest_arr.push(result['objectChanges'][i]["digest"]);
							version_arr.push(result['objectChanges'][i]["version"]);
						}
					}
					
					tx_digest_arr.push(result.digest)
					console.log("\nTx Digest:", result.digest)
					console.log("https://suiscan.xyz/"+network+"/tx/"+ result.digest);



					console.log("Gas Used: ", (Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee)) / Number(MIST_PER_SUI), " SUI");
					totalGasUsage += Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee)

					console.log("\nresult:", result.events[0].parsedJson['value']);
					console.log("Total Gas Used (SUI):", totalGasUsage / Number(MIST_PER_SUI))
					spinner.succeed("✅ PTB transaction computation completed!");

					const data = await store(tx_digest_arr, partialDenses_digest_arr, version_arr);
					if (data.status === "success") {




						spinner.succeed("✅ Walrus Store Success!");
						console.log("BlobID:", data.blobId);
						console.log('https://walruscan.com/testnet/blob/' + data.blobId);
					
						console.log("");

						console.log("\n");

console.log(`
\x1b[38;5;199m4. Save Receipt to Walrus\x1b[0m
\x1b[38;5;147m- Packages inference evidence:\x1b[0m
\x1b[38;5;251m• Transaction digests (tx_digest_arr)
• Partial dense computation proofs (partialDenses_digest_arr)
• State versions (digest version)\x1b[0m
\x1b[38;5;147m- Uploads to Walrus as receipt
- Provides permanent proof of inference execution
- Enables digital provenance verification
- Returns Walrus blob ID for reference\x1b[0m`);
					}

					console.log("");

					totalGasUsage = 0;
					tx_digest_arr = [];
					partialDenses_digest_arr = [];
					version_arr = [];
				} else {

					let tx = new Transaction();

					if (!tx.gas) {
						console.error("Gas object is not set correctly");
					}
					console.log(`input layer  -> hidden layer 1 ${i+1}/${totalTasks-1}`);
					
					tx.moveCall({
						target: `${TENSROFLOW_SUI_PACKAGE_ID}::graph::split_chunk_compute`,
						arguments: [
							tx.object(SignedFixedGraph),
							tx.object(PartialDenses),
							tx.pure.string('dense'),
							tx.pure.vector('u64', input_mag),
							tx.pure.vector('u64', input_sign),
							tx.pure.u64(1),
							tx.pure.u64(i),
							tx.pure.u64(i),
						],
					})

					keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
					result = await client.signAndExecuteTransaction({
						transaction: tx,
						signer: keypair,
						options: {
							showEffects: true,
							showEvents: true,
							showObjectChanges: true,
						}
					})

					spinner = ora("Processing task... ").start();
					console.log(progressBar + ` ${i+1}/${totalTasks}`);
				
					for (let i=0; i < result['objectChanges'].length; i++) {

						let parts;
						let exist;
						
						parts = result['objectChanges'][i]["objectType"].split("::");
						exist = parts.some(part => part.includes("PartialDenses"));
						if (exist == true) {
							partialDenses_digest_arr.push(result['objectChanges'][i]["digest"]);
							version_arr.push(result['objectChanges'][i]["version"]);
						}
					}
					
					tx_digest_arr.push(result.digest)
					console.log("Tx Digest:", result.digest)
					console.log("https://suiscan.xyz/"+network+"/tx/"+ result.digest);

					console.log("Gas Used:", (Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee)) / Number(MIST_PER_SUI) , " SUI"); 
					console.log("");
					totalGasUsage += Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee)
				}
			}
			console.log(`

				\x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
				║  inference completed! ║ "load input" to load input data from Walrus to next inference
				╚════════════════════════════════════════════════════════════╝\x1b[0m
				`);


			break;
			
		default:
			console.log(`Unknown command: '${command}'`);
		}
	}
  }

// start program
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

printBanner("O P E N G R A P H");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function displayLog() {
    console.log(`
\x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
║  \x1b[38;5;213mOPENGRAPH: Fully On-chain Neural Network Inference\x1b[38;5;51m        ║ 
╚════════════════════════════════════════════════════════════╝\x1b[0m`);
console.log("\n 'help' for more commands");

console.log(`
\x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
║                Ready to start inference!                    ║ "init" to initialize the model
╚════════════════════════════════════════════════════════════╝\x1b[0m
`);
}

// Call the async function
displayLog();
run();

  





