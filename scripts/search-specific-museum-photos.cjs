const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const pexelsKey = envContent.split('\n').find(l => l.startsWith('PEXELS_API_KEY=')).split('=')[1].trim().replace(/['"]/g, '');

const queries = [
  { topic: '1. 미래형 미디어/인터랙티브 전시 (Future Museology)', q: 'interactive media art exhibition installation' },
  { topic: '2. 근현대 회화 미술관 전시실 (1945-1953 역사전)', q: 'fine art gallery painting exhibition visitors' },
  { topic: '3. 미니멀 돌/철판 조각 명상 공간 (이우환 공간)', q: 'minimalist sculpture stone gallery museum' },
  { topic: '4. 어린이 미술 체험 공간 (안전기지)', q: 'children art museum interactive colorful' },
  { topic: '5. 통창 유리 미술관 카페 (1층 뮤지엄 카페)', q: 'modern museum cafe coffee window' },
  { topic: '6. 강변 공원 산책로 (APEC 나루공원)', q: 'riverside park walk trees' },
  { topic: '7. 미술관 건축 외관/로비 전경', q: 'modern museum architecture entrance lobby' }
];

async function run() {
  for (const { topic, q } of queries) {
    console.log(`\n========================================`);
    console.log(`🔍 [${topic}] Query: "${q}"`);
    console.log(`========================================`);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=4&orientation=landscape`, {
        headers: { Authorization: pexelsKey }
      });
      const data = await res.json();
      (data.photos || []).forEach((p, i) => {
        console.log(`  [Option ${i + 1}] ID: ${p.id}`);
        console.log(`  Alt: ${p.alt}`);
        console.log(`  URL: ${p.src.large2x || p.src.large}\n`);
      });
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

run();
