// Script to generate proper icon sizes from the logo
// Run with: node generate-icons.cjs

const sharp = require('sharp');
const path = require('path');

const sizes = [16, 32, 48, 128];
const inputFile = path.join(__dirname, 'logo-original.png');

async function generateIcons() {
    for (const size of sizes) {
        // Generate both naming styles
        const files = [
            path.join(__dirname, `smarana-${size}.png`),
            path.join(__dirname, `icon${size}.png`),
        ];
        for (const outputFile of files) {
            await sharp(inputFile)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toFile(outputFile);
        }
        console.log(`Created smarana-${size}.png & icon${size}.png`);
    }
    console.log('\nIcons generated successfully!');
}

generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
});
