const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;

function flattenImages(directory) {
    try {
        const files = fs.readdirSync(directory);
        
        // Filter PNG files and group by prompt and label
        const fileGroups = new Map();
        files.forEach(file => {
            if (!file.endsWith('.png')) return;
            
            const match = file.match(/^(.+?)_(\d+)_(\d+)\.png$/);
            if (!match) return;
            
            const [_, prompt, label, timestamp] = match;
            const key = `${prompt}_${label}`;
            
            if (!fileGroups.has(key)) {
                fileGroups.set(key, []);
            }
            fileGroups.get(key).push({
                file,
                prompt,
                label: parseInt(label),
                timestamp: parseInt(timestamp)
            });
        });

        // Process all groups into a single result array
        const results = [];
        
        for (const [_, files] of fileGroups) {
            // Sort files by timestamp
            files.sort((a, b) => a.timestamp - b.timestamp);
            
            // Get prompt and label from first file (they're same for the group)
            const {prompt, label} = files[0];
            
            // Process each file in the group
            const flattened = files.map(({file}) => {
                const filePath = path.join(directory, file);
                const data = fs.readFileSync(filePath);
                const png = PNG.sync.read(data);
                
                // Flatten the image data (RGBA format) into grayscale values
                const pixels = [];
                for (let y = 0; y < png.height; y++) {
                    for (let x = 0; x < png.width; x++) {
                        const idx = (png.width * y + x) << 2;
                        pixels.push(png.data[idx]);
                    }
                }
                return pixels;
            });

            // Add to results array
            results.push({
                prompt,
                label,
                flatten: flattened
            });
        }

        // Write the JSON output
        const outputPath = path.join(directory, 'flattened_results.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        
        console.log(`Processed ${results.length} groups and saved to flattened_results.json`);
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

// Usage: provide the directory path as argument or use current directory
const targetDir = process.argv[2] || './atoma_number';
flattenImages(targetDir);
