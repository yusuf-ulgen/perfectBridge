const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\YUSUF\\.gemini\\antigravity\\brain\\5e20f702-e2ea-4577-8975-dfb5ecda6b7b';
const destDir = 'c:\\Users\\YUSUF\\Desktop\\Biten projeler\\perfectBridge\\assets';

const files = {
  'adaptive_icon_1774714331813.png': 'adaptive-icon.png',
  'favicon_1774714345558.png': 'favicon.png',
  'icon_1774714293546.png': 'icon.png',
  'splash_1774714311574.png': 'splash.png'
};

for (const [src, dest] of Object.entries(files)) {
  try {
    const srcPath = path.join(srcDir, src);
    const destPath = path.join(destDir, dest);
    console.log(`Copying ${srcPath} to ${destPath}`);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${dest}`);
  } catch (err) {
    console.error(`Failed to copy ${src}:`, err.message);
  }
}
