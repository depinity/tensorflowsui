const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Read the flattened output file
const flattenedData = fs.readFileSync('./example/flattened_output.txt', 'utf8');

// Parse the data into a 2D array
const rows = flattenedData
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
        // Extract numbers from each line
        const match = line.match(/\[(.*?)\]/);
        if (!match) return null;
        return match[1].split(',').map(n => parseInt(n.trim()));
    })
    .filter(row => row !== null);

// Create output directory if it doesn't exist
const targetDir = process.argv[2] || './example';
const restoreDir =  './restore';
if (!fs.existsSync(restoreDir)) {
    fs.mkdirSync(restoreDir, { recursive: true });
}

// Function to create a PNG file from pixel data
function createImage(pixels, index) {
    try {
        // Set dimensions for 7x7 image
        const width = 7;
        const height = 7;
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Create ImageData
        const imageData = ctx.createImageData(width, height);
        
        // Fill pixel data
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                const value = pixels[pixelIndex];
                const offset = pixelIndex * 4;
                
                // Invert the value to match select_number.js logic
                const pixel = 255 - value;
                
                // Set RGBA values (grayscale)
                imageData.data[offset] = pixel;     // R
                imageData.data[offset + 1] = pixel; // G
                imageData.data[offset + 2] = pixel; // B
                imageData.data[offset + 3] = 255;   // A (fully opaque)
            }
        }
        
        // Put the image data on the canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Save as PNG
        const outputPath = path.join(restoreDir, `${index}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
    } catch (error) {
        console.error(`Error creating image ${index}:`, error);
    }
}

try {
    // Read the flattened output file
    const inputPath = path.join(targetDir, 'flattened_output.txt');
    const flattenedData = fs.readFileSync(inputPath, 'utf8');

    // Create PNG files for each row
    rows.forEach((pixels, index) => {
        createImage(pixels, index);
    });

    console.log(`Images restored successfully to ${restoreDir}!`);
} catch (error) {
    console.error('Error restoring images:', error);
}
