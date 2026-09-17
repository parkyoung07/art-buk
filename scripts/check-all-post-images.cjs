const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log(`Total post files: ${files.length}`);

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  const imgs = [];
  while ((match = imgRegex.exec(content)) !== null) {
    imgs.push({ alt: match[1], url: match[2] });
  }

  // Check if file has any image
  if (file.includes('2026-09-17') || file.includes('busan-museum') || file.includes('cinema')) {
    console.log(`\n📄 [${file}]`);
    imgs.forEach((img, i) => {
      console.log(`  ${i + 1}. [${img.alt}] -> ${img.url}`);
    });
  }
}
