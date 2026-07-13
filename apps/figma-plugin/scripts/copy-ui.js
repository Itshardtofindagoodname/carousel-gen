import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.resolve(__dirname, '../src/ui.html');
const destDir = path.resolve(__dirname, '../dist');
const destPath = path.resolve(destDir, 'ui.html');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(srcPath, destPath);
console.log('🎉 Successfully copied ui.html to dist/ui.html');
