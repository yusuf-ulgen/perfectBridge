const fs = require('fs');
const path = require('path');

const sourceImage = 'C:\\Users\\gencs\\.gemini\\antigravity\\brain\\ffc1d2b9-e9c0-42b9-93ff-8a91bb6eb38f\\perfect_bridge_icon_1775023462034.png';
const assetsDir = 'C:\\projeler\\perfectBridge\\assets';

const targets = [
  'icon.png',
  'adaptive-icon.png',
  'splash.png',
  'favicon.png'
];

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

targets.forEach(target => {
  const destPath = path.join(assetsDir, target);
  try {
    fs.copyFileSync(sourceImage, destPath);
    console.log(`Copied placeholder to ${target}`);
  } catch (err) {
    console.error(`Failed to copy ${target}:`, err.message);
  }
});
