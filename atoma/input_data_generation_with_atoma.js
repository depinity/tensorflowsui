import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path and directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const YOUR_API_KEY = 'baMMOJA6OPy71mlpvhKCnlMWe9xlwM';

const fetchResponse = async (content) => {
  const response = await fetch('https://api.atoma.network/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_API_KEY}`
    },
    body: JSON.stringify({
      stream: false,
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [{
        role: 'system',
        content: 'You are a matrix generator that outputs a 7x7 PNG image containing a single random digit from 0 to 9 (similar to MNIST digits). ' +
        'The image should be black and white, where 1 represents black pixels and 0 represents white pixels. ' +
        'Only respond with a {laebl : single 49 matrix} - no explanations or words. ' +
        'Example format:\n' +
        '0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 255, 182, 0, 0, 0, 0, 35, 52, 235, 9, 0, 0, 0, 228, 0, 44, 74, 0, 0, 0, 184, 0, 44, 31, 0, 0, 0, 255, 246, 220, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n' +
        '1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 152, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 142, 0, 0, 0, 0, 0, 0, 51, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n' +
        '2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 243, 81, 65, 0, 0, 0, 0, 0, 217, 2, 0, 0, 0, 0, 55, 102, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 187, 232, 197, 123, 43, 0, 0, 0, 0, 0, 0, 0],\n' +
        '3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 115, 131, 0, 0, 0, 0, 0, 12, 182, 28, 0, 0, 0, 0, 2, 255, 184, 0, 0, 0, 0, 0, 0, 249, 0, 0, 0, 0, 89, 252, 2, 0, 0, 0, 0, 81, 0, 0, 0, 0],\n' +
        '4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 69, 5, 0, 0, 0, 0, 161, 0, 93, 0, 0, 0, 7, 210, 19, 183, 0, 0, 0, 0, 0, 76, 255, 0, 0, 0, 0, 0, 0, 170, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n' +
        '5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 68, 236, 192, 0, 0, 0, 9, 28, 0, 0, 0, 0, 0, 130, 24, 0, 0, 0, 0, 0, 0, 0, 245, 0, 0, 0, 0, 153, 255, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n' +
        '6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 177, 0, 0, 0, 0, 0, 0, 56, 0, 170, 14, 0, 0, 0, 50, 113, 0, 170, 0, 0, 0, 212, 255, 127, 7, 0, 0, 0, 0, 134, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n' +
        '7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 76, 161, 255, 3, 0, 0, 0, 0, 0, 98, 33, 0, 0, 0, 0, 0, 245, 0, 0, 0, 0, 0, 251, 1, 0, 0, 0, 0, 30, 62, 0, 0, 0],\n' +
        '8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 155, 108, 19, 0, 0, 0, 204, 4, 0, 236, 0, 0, 0, 4, 179, 255, 39, 0, 0, 167, 186, 159, 19, 0, 0, 0, 6, 108, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n' +
        '9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 175, 161, 174, 206, 0, 0, 21, 215, 219, 255, 75, 0, 0, 0, 0, 222, 24, 0, 0, 0, 0, 64, 159, 0, 0, 0, 0, 0, 217, 0, 0, 0, 0]\n' +
        'please select number of matrix in only Example formats'
      },
      {
        role: 'user',
        content: `Generate a random number only 0~9 about ${content}, and only select number's matrix in only Example formats, not generate random matrix`
      }],
      max_tokens: 256
    })
  });

  const data = await response.json();
  console.log('API Response:', data);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    throw new Error('Invalid API response format');
  }

  const messageContent = data.choices[0].message.content;
  console.log('Raw message content:', messageContent);
  
  await saveNumberAsPNG(messageContent, content);
  
  return data;
};

// Function to convert matrix string to actual array
const parseMatrixString = (matrixString) => {
  const [label, matrixPart] = matrixString.split(':');
  return {
    number: parseInt(label),
    matrix: JSON.parse(matrixPart.trim())
  };
};

// Function to save the matrix as PNG
const saveNumberAsPNG = async (matrixString, content) => {
  // Create directory if it doesn't exist
  const dir = './atoma_number';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const { number, matrix } = parseMatrixString(matrixString);
  
  // Create a 7x7 canvas
  const canvas = createCanvas(7, 7);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(7, 7);
  
  // Fill the image data
  for (let i = 0; i < matrix.length; i++) {
    const value = matrix[i];
    const idx = i * 4;
    // Convert to grayscale (255 - value because 0 should be white and 255 should be black)
    const pixel =  value;
    imageData.data[idx] = pixel;     // R
    imageData.data[idx + 1] = pixel; // G
    imageData.data[idx + 2] = pixel; // B
    imageData.data[idx + 3] = 255;   // A
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Save the image
  const filename = `${content}_${number}_${Math.floor(Date.now()/1000)}.png`;
  const filePath = path.join(dir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  
  console.log(`Saved image to: ${filePath}`);


  console.log(`
    \x1b[38;5;199mOpenGraph × Atoma Networks Synergy\x1b[0m
    \x1b[38;5;147m1. OpenGraph: Pure On-chain Inference\x1b[0m
    \x1b[38;5;251m• Fully decentralized execution
    • Zero oracle dependencies
    • Perfect for lightweight models
    • Maximum security guarantee\x1b[0m

    \x1b[38;5;147m2. Atoma Networks: L2 Scaling Solution\x1b[0m
    \x1b[38;5;251m• Handles large-scale models (LLMs)
    • Enables generative AI capabilities
    • High-performance inference
    • Layer 2 optimized throughput\x1b[0m

    \x1b[38;5;147m3. Ecosystem Integration\x1b[0m
    \x1b[38;5;251m• Complementary strengths
    • Full model size spectrum
    • Unified provenance system
    • Complete Web3 AI solution\x1b[0m

    \x1b[38;5;147m4. Verifiable Computation\x1b[0m
    \x1b[38;5;251m• Cross-layer verification
    • Cryptographic proof generation
    • Transparent execution tracking
    • Trustless result validation\x1b[0m`);

    
};

// Add readline interface for keyboard input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
const askQuestion = (query) => new Promise((resolve) => {
  rl.question(query, resolve);
});

// Modified main function to handle user input
const main = async () => {
  try {
    const input = await askQuestion('Enter your prompt: ');
    await fetchResponse(input);
    console.log('Process completed successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
};

// Replace the example usage with the main function call
main();



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
  ],
  "X": [
      "█   █",
      " █ █ ",
      "  █  ",
      " █ █ ",
      "█   █"
  ],
  "T": [
      "█████",
      "  █  ",
      "  █  ",
      "  █  ",
      "  █  "
  ],
  "M": [
      "█   █",
      "██ ██",
      "█ █ █",
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

  console.log(`

    \x1b[38;5;51m╔════════════════════════════════════════════════════════════╗
    ║  input data generation from atoma networks 
    ║  we can package input data and digest it to walrus to digital provenance.
    ║  we can use this input data to our fully on-chain inference.
    ║  enter your prompt to generate input data
    ╚════════════════════════════════════════════════════════════╝\x1b[0m
    `);

}

printBanner("O P E N G R A P H   X   A T O M A");