import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility function to convert float to fixed point (sign, magnitude)
function floatToFixed(x, scale) {
    const signBit = x < 0 ? 1 : 0;
    const factor = Math.pow(10, scale);
    const absVal = Math.round(Math.abs(x) * factor);
    return [signBit, absVal];
}

async function convertImage(imagePath, scale = 2) {
    const imageBuffer = fs.readFileSync(imagePath);
    let pos = 8;
    const width = imageBuffer.readUInt32BE(pos + 8);
    const height = imageBuffer.readUInt32BE(pos + 12);
    
    pos = 8;
    while (pos < imageBuffer.length) {
        const length = imageBuffer.readUInt32BE(pos);
        const type = imageBuffer.slice(pos + 4, pos + 8).toString();
        if (type === 'IDAT') {
            pos += 8;
            break;
        }
        pos += 12 + length;
    }
    
    const data = new Float32Array(width * height);
    for (let i = 0; i < width * height && pos + i < imageBuffer.length; i++) {
        data[i] = imageBuffer[pos + i] / 255.0;
    }
    
    const signs = [];
    const mags = [];
    
    for (const val of data) {
        const [sign, mag] = floatToFixed(val, scale);
        signs.push(sign);
        mags.push(mag);
    }
    
    return { sign: signs, mag: mags };
}

async function processDirectory(dirPath, outputPath) {
    const results = [];
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));
    console.log(`Processing ${files.length} files from ${dirPath}`);
    
    for (const file of files) {
        try {
            // Extract label from filename (format: xxxxx_y.png)
            const label = parseInt(file.split('_')[1]);
            const imagePath = path.join(dirPath, file);
            const { sign, mag } = await convertImage(imagePath);
            
            results.push({
                filepath: imagePath,
                filename: file,
                label: label,
                data: {
                    sign: sign,
                    mag: mag
                }
            });
            
            if (results.length % 1000 === 0) {
                console.log(`Processed ${results.length} images`);
            }
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }
    
    return results;
}

async function main() {
    try {
        // Create output directory
        const outputDir = './';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('Processing atoma number data...');
        const results = await processDirectory('./atoma_number', outputDir);
        
        // Save results with simplified structure
        const finalData = {
            data: results
        };
        
        const outputPath = path.join(outputDir, 'atoma_converted.json');
        fs.writeFileSync(
            outputPath,
            JSON.stringify(finalData, null, 2)
        );
        
        console.log('Conversion completed!');
        console.log('Total samples:', results.length);
        console.log('Output saved to:', outputPath);
        
    } catch (error) {
        console.error('Error during conversion:', error);
    }
}

main();
