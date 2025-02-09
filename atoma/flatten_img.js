const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;

function flattenImages(directory) {
    try {
        const files = fs.readdirSync(directory);
        
        // Filter and sort files with numbers 0-9
        const numberedFiles = files
            .filter(file => /^[0-9]\.png$/.test(file))
            .sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                return numA - numB;
            });

        // Process each file
        const flattened = numberedFiles.map(file => {
            const filePath = path.join(directory, file);
            const data = fs.readFileSync(filePath);
            const png = PNG.sync.read(data);
            
            // Flatten the image data (RGBA format) into grayscale values
            const pixels = [];
            for (let y = 0; y < png.height; y++) {
                for (let x = 0; x < png.width; x++) {
                    const idx = (png.width * y + x) << 2;
                    // Using red channel as grayscale value (assuming grayscale image)
                    pixels.push(png.data[idx]);
                }
            }
            return pixels;
        });

        // Format the output as a string with numbered arrays
        const formattedOutput = flattened
            .map((pixels, index) => `${index}: [${pixels.join(', ')}]`)
            .join(',\n');

        // Write to output file
        const outputPath = path.join(directory, 'flattened_output.txt');
        fs.writeFileSync(outputPath, formattedOutput);

        console.log(`Processed ${numberedFiles.length} files and saved to flattened_output.txt`);
        return flattened;
    } catch (error) {
        console.error('Error processing images:', error);
        return [];
    }
}

// Usage: provide the directory path as argument or use current directory
const targetDir = process.argv[2] || './example';
flattenImages(targetDir);
