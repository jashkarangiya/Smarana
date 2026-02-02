// Simple script to generate placeholder PNG icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple 1x1 orange pixel PNG (base64)
// For production, replace with actual icon files
const createPlaceholderPNG = (size) => {
  // PNG header + IHDR + minimal orange IDAT + IEND
  // This creates a tiny valid PNG that Chrome will accept
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02, // bit depth = 8, color type = 2 (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0xD8, 0xAD, 0x66, 0x31, 0x00, 0x00, 0x02, 0x7B, 0x01, 0x1D, // compressed orange pixel
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
};

// Write placeholder icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const filename = path.join(__dirname, `icon${size}.png`);
  fs.writeFileSync(filename, createPlaceholderPNG(size));
  console.log(`Created ${filename}`);
});

console.log('\nNote: Replace these with actual icon files for production!');
