const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log(`Auditing ${files.length} posts for questionable images...`);

const suspiciousList = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    const alt = m[1];
    const url = m[2];
    
    // Check if URL is suspicious (news images with old dates, text posters, etc.)
    if (url.includes('imgnews.naver.net') || url.includes('pup-post-phinf') || url.includes('uiryeong.go.kr') || url.includes('yes24.com') || url.includes('googleusercontent') || url.includes('img.newsro.kr')) {
      suspiciousList.push({ file, alt, url });
    }
  }
}

console.log(`Found ${suspiciousList.length} external/naver/portal images:`);
suspiciousList.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.file}] Alt: "${s.alt}"\n   URL: ${s.url}`);
});
