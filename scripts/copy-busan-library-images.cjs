const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\master\\.gemini\\antigravity-ide\\brain\\cc2d89da-bb5d-4892-b548-24806717b06e\\.user_uploaded';
const targetDir = path.join(process.cwd(), 'public', 'images', 'library');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const fileMap = [
  { src: 'media_1789974116012.png', dest: 'busan-library-busanaettle.png' },
  { src: 'media_1789974116118.png', dest: 'busan-library-digital.png' },
  { src: 'media_1789974116170.png', dest: 'busan-library-chaeknuriter.png' },
  { src: 'media_1789974116203.png', dest: 'busan-library-chaekmaru.png' },
  { src: 'media_1789974116224.png', dest: 'busan-library-kkumtteurak.png' },
];

fileMap.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(targetDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied: ${src} -> ${dest}`);
  } else {
    console.warn(`⚠️ Source not found: ${srcPath}`);
  }
});
