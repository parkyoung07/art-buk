const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const pexelsKey = envContent.split('\n').find(l => l.startsWith('PEXELS_API_KEY=')).split('=')[1].trim().replace(/['"]/g, '');

async function run() {
  const res = await fetch('https://api.pexels.com/v1/search?query=art+museum+gallery+interior&per_page=10&orientation=landscape', {
    headers: { Authorization: pexelsKey }
  });
  const data = await res.json();
  data.photos.forEach((p, i) => {
    console.log(`\n[Photo ${i + 1}]`);
    console.log(`ID: ${p.id}`);
    console.log(`Alt: ${p.alt}`);
    console.log(`URL: ${p.src.large2x || p.src.large}`);
  });
}

run();
