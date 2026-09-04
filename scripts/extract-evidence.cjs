const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
  });
}

async function printEvidence() {
  const blog = await get('https://nadriai.com/blog/');
  const ex = await get('https://nadriai.com/exhibitions/');
  const detail = await get('https://nadriai.com/events/busan-moca-summer-special-2026/');

  console.log('=== [1] /blog/ Title 및 메타태그 라이브 HTML ===');
  const t = blog.body.match(/<title>.*?<\/title>/);
  const og = blog.body.match(/<meta property="og:title" content=".*?"/);
  const tw = blog.body.match(/<meta name="twitter:title" content=".*?"/);
  console.log(t ? t[0] : 'NONE');
  console.log(og ? og[0] + ' />' : 'NONE');
  console.log(tw ? tw[0] + ' />' : 'NONE');

  console.log('\n=== [2] /exhibitions/ 종료 전시 카드 라이브 HTML ===');
  const idx = ex.body.indexOf('busan-moca-summer-special-2026');
  if (idx >= 0) {
    console.log(ex.body.substring(idx - 80, idx + 1050));
  } else {
    console.log('NOT FOUND');
  }

  console.log('\n=== [3] /events/busan-moca-summer-special-2026/ 라이브 접속 상태 ===');
  console.log('HTTP Status:', detail.status);
  const dt = detail.body.match(/<title>.*?<\/title>/);
  console.log('Detail Title:', dt ? dt[0] : 'NONE');
}

printEvidence();
