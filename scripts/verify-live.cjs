const https = require('https');

const urls = [
  'https://nadriai.com/',
  'https://nadriai.com/ai-trip/',
  'https://nadriai.com/markets/',
  'https://nadriai.com/libraries/',
  'https://nadriai.com/blog/'
];

const forbidden = [
  '오늘(9월 3일)',
  '1초 완성',
  '1초 맞춤',
  '부울경 아트·전시',
  'art-buk'
];

const requiredChecks = [
  { 
    name: '메인 페이지 (/)',
    url: 'https://nadriai.com/', 
    keywords: [
      '✨ 어제 개막', 
      'AI 맞춤 코스', 
      '약 1분 만에 나들이 코스 완성', 
      '나드리 AI'
    ] 
  },
  { 
    name: 'AI 맞춤 코스 (/ai-trip/)',
    url: 'https://nadriai.com/ai-trip/', 
    keywords: [
      '약 1분 만에 나들이 코스 완성', 
      '공식정보 확인',
      '2026.09.04'
    ] 
  },
  { 
    name: '5일장 & 전통시장 (/markets/)',
    url: 'https://nadriai.com/markets/', 
    keywords: [
      '전체 등록 시장',
      '현재 조건 검색 결과',
      '오늘'
    ] 
  },
  { 
    name: '공공도서관 (/libraries/)',
    url: 'https://nadriai.com/libraries/', 
    keywords: [
      '전체 등록 도서관',
      '현재 조건 검색 결과'
    ] 
  }
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function verify() {
  console.log('=== NADRIAI.COM LIVE SERVER HTML VERIFICATION ===\n');

  for (const url of urls) {
    const res = await fetchUrl(url);
    console.log(`[URL] ${url} (HTTP ${res.status}, Length: ${res.body ? res.body.length : 0} bytes)`);
    if (res.body) {
      for (const term of forbidden) {
        const occurrences = res.body.split(term).length - 1;
        const mark = occurrences === 0 ? '✅ PASS (0건)' : `❌ FAIL (${occurrences}건 발견)`;
        console.log(`  - 금지어 검증 [${term}]: ${mark}`);
      }
    }
    console.log('');
  }

  console.log('=== REQUIRED FEATURE & STRING CHECKS ===\n');
  for (const req of requiredChecks) {
    const res = await fetchUrl(req.url);
    console.log(`[Target URL] ${req.url}`);
    if (res.body) {
      for (const kw of req.keywords) {
        const found = res.body.includes(kw);
        const mark = found ? '✅ PASS (정상 포함)' : '❌ FAIL (미발견)';
        console.log(`  - 필수 표현 [${kw}]: ${mark}`);
      }
    }
    console.log('');
  }
}

verify();
