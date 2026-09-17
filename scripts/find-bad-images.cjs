const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

// Blacklist patterns for garbage / mismatched image URLs
const badPatterns = [
  'googleusercontent.com', // YouTube avatars
  'image.yes24.com',      // Book covers
  'img.newsro.kr',        // Event posters
  'uiryeong.go.kr/images/new/Culture', // Wrong banner
  'NISI20130912',         // 2013 outdated low-res news photo
  'AKR2018',              // 2018 old news
  '0003619403_001_2018',  // 2018 outdated movie poster
  '0003152956_001_2018',  // 2018 news
  '0000058475_001_2018',  // 2018 news
  '0000242289_002_2021',  // 2021 news
];

const foundBad = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  for (const pattern of badPatterns) {
    if (content.includes(pattern)) {
      foundBad.push({ file, pattern });
    }
  }
}

console.log('Bad image occurrences found:', foundBad);
