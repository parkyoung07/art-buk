const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'audit_all_images_dump.json'), 'utf-8'));

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return res.status;
  } catch (e) {
    return 'ERROR: ' + e.message;
  }
}

async function run() {
  console.log("==================================================");
  console.log("🌐 [초고속 병렬 전수 조사] 369개 이미지 실제 응답(200 OK) 상태 점검");
  console.log("==================================================");

  const allUrls = [];
  data.forEach(post => {
    post.images.forEach(img => {
      allUrls.push({ file: post.file, alt: img.alt, url: img.url });
    });
  });

  const uniqueUrls = Array.from(new Set(allUrls.map(u => u.url)));
  console.log(`총 고유 URL 수: ${uniqueUrls.length}개 (전체 이미지 369개)`);

  const results = new Map();
  const concurrency = 20;
  let index = 0;

  async function worker() {
    while (index < uniqueUrls.length) {
      const curIndex = index++;
      const url = uniqueUrls[curIndex];
      const status = await checkUrl(url);
      results.set(url, status);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const broken = [];
  allUrls.forEach(item => {
    const status = results.get(item.url);
    if ((typeof status === 'number' && status >= 400) || (typeof status === 'string' && status.startsWith('ERROR'))) {
      broken.push({ ...item, status });
    }
  });

  console.log(`❌ 깨진 링크/응답 실패 URL 수: ${broken.length}건`);
  
  if (broken.length > 0) {
    console.log("\n[깨진 링크 목록]");
    broken.forEach((b, i) => {
      console.log(`${i + 1}. [HTTP ${b.status}] ${b.file} | "${b.alt}" -> ${b.url}`);
    });
  } else {
    console.log("✅ 모든 이미지 URL이 정상적으로 동작(200 OK)합니다!");
  }

  fs.writeFileSync(path.join(__dirname, 'audit_broken_urls.json'), JSON.stringify(broken, null, 2), 'utf-8');
}

run();
