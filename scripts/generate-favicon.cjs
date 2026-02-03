// Script to generate favicon with better visibility on light/dark tabs
// Run with: node scripts/generate-favicon.cjs

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputFile = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../src/app');

async function generateFavicons() {
    const sizes = [16, 32, 180]; // Standard favicon sizes + apple-touch-icon

    // Read the original logo
    const logoBuffer = fs.readFileSync(inputFile);

    for (const size of sizes) {
        // Create a version with slight dark padding for visibility on light tabs
        // This adds a subtle dark shadow/glow effect
        const paddedSize = Math.floor(size * 0.9);
        const padding = Math.floor((size - paddedSize) / 2);

        // Create the icon with a subtle dark circular background
        const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="#1a1a1a" flood-opacity="0.3"/>
                </filter>
            </defs>
            <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="rgba(10, 10, 12, 0.15)"/>
        </svg>`;

        const background = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();

        // Resize logo and composite onto background
        const resizedLogo = await sharp(logoBuffer)
            .resize(paddedSize, paddedSize, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer();

        const outputFile = size === 180
            ? path.join(outputDir, 'apple-icon.png')
            : path.join(outputDir, `favicon-${size}x${size}.png`);

        await sharp(background)
            .composite([{
                input: resizedLogo,
                top: padding,
                left: padding
            }])
            .png()
            .toFile(outputFile);

        console.log(`Created ${path.basename(outputFile)}`);
    }

    // Also create the main icon.png (larger, for OG/sharing)
    const iconSize = 512;
    const resizedIcon = await sharp(logoBuffer)
        .resize(iconSize, iconSize, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, 'icon.png'));

    console.log('Created icon.png');

    // Create ICO file using the 16x16 and 32x32 versions
    // Note: sharp doesn't support ICO directly, but Next.js can use PNG favicons

    console.log('\nFavicons generated successfully!');
    console.log('Note: For best browser support, the PNG favicons will be used.');
}

generateFavicons().catch(err => {
    console.error('Error generating favicons:', err);
    process.exit(1);
});
