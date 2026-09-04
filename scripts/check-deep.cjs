const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  console.log('=== CHECKING LIVE SERVER NADRIAI.COM ===');

  // 1. /blog/ checks
  const blog1 = await fetchUrl('https://nadriai.com/blog/');
  console.log('\n[1] /blog/ (HTTP', blog1.status, ')');
  const tMatch1 = blog1.body.match(/<title>(.*?)<\/title>/);
  console.log('  <title>:', tMatch1 ? tMatch1[1] : 'NONE');
  const ogMatch1 = blog1.body.match(/<meta property="og:title" content="(.*?)"/);
  console.log('  og:title:', ogMatch1 ? ogMatch1[1] : 'NONE');

  // 2. /blog without trailing slash
  const blog2 = await fetchUrl('https://nadriai.com/blog');
  console.log('\n[2] /blog (HTTP', blog2.status, ')');

  // 3. /exhibitions/ checks
  const ex = await fetchUrl('https://nadriai.com/exhibitions/');
  console.log('\n[3] /exhibitions/ (HTTP', ex.status, ', Length:', ex.body.length, ')');
  const hasEndedEx = ex.body.includes('busan-moca-summer-special-2026');
  const hasEndedTitle = ex.body.includes('부산현대미술관 여름 특별전');
  console.log('  Includes "busan-moca-summer-special-2026":', hasEndedEx ? '✅ YES' : '❌ NO');
  console.log('  Includes "부산현대미술관 여름 특별전":', hasEndedTitle ? '✅ YES' : '❌ NO');
  if (hasEndedEx) {
    const idx = ex.body.indexOf('busan-moca-summer-special-2026');
    console.log('  Snippet:', ex.body.substring(idx - 50, idx + 400));
  }

  // 4. Detail page direct access
  const detail = await fetchUrl('https://nadriai.com/events/busan-moca-summer-special-2026/');
  console.log('\n[4] /events/busan-moca-summer-special-2026/ (HTTP', detail.status, ', Length:', detail.body.length, ')');
  const dTitle = detail.body.match(/<title>(.*?)<\/title>/);
  console.log('  <title>:', dTitle ? dTitle[1] : 'NONE');
}

run();
