import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCALE = 2; // Same scale factor as Python script

// Helper function to convert float to fixed point (sign, magnitude)
function floatToFixed(x, scale) {
    const signBit = x < 0 ? 1 : 0;
    const absX = Math.abs(x);
    const factor = Math.pow(10, scale);
    const absVal = Math.round(absX * factor);
    return [signBit, absVal];
}

// Function to process a directory of PNG files
async function processDirectory(dirPath, outputFile) {
    const results = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        if (file.endsWith('.png')) {
            const label = parseInt(file.split('_')[1]);
            
            // Read image as raw pixels
            const imgBuffer = await sharp(path.join(dirPath, file))
                .raw()
                .grayscale()
                .toBuffer();
            
            // Convert to Float32Array for exact precision matching
            const pixelData = new Float32Array(imgBuffer);
            const normalizedData = pixelData.map(p => p / 255.0);
            
            const mags = [];
            const signs = [];
            
            for (const pixel of normalizedData) {
                const [sign, mag] = floatToFixed(pixel, SCALE);
                signs.push(sign);
                mags.push(mag);
            }

            results.push({
                label: label,
                data: {
                    mag: mags,
                    sign: signs
                },
                filepath: path.join(dirPath, file)
            });
        }
    }

    // Save to JSON file
    fs.writeFileSync(
        outputFile,
        JSON.stringify({ train: results }, null, 2)
    );

    console.log(`Processed ${results.length} images and saved to ${outputFile}`);
}

// Process both train and test directories
async function main() {
    try {
        await processDirectory('./data7/train', 'convert_train.json');
        await processDirectory('./data7/test', 'convert_test.json');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

main();
