const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'audit_all_images_dump.json'), 'utf-8'));

console.log("==================================================");
console.log("🔍 [전수 조사] 92개 포스트 / 369개 이미지 1:1 정밀 분석");
console.log("==================================================");

const issues = [];
const pexelsMap = {};
const unsplashMap = {};
const otherMap = [];

data.forEach(post => {
  post.images.forEach((img, idx) => {
    const { alt, url } = img;
    
    // 1. 도메인별 분류
    if (url.includes('pexels.com')) {
      const match = url.match(/photos\/(\d+)/);
      const pid = match ? match[1] : 'unknown';
      pexelsMap[pid] = (pexelsMap[pid] || []).concat({ file: post.file, title: post.title, alt, url });
    } else if (url.includes('unsplash.com')) {
      const match = url.match(/photo-([0-9a-zA-Z\-]+)/);
      const uid = match ? match[1] : 'unknown';
      unsplashMap[uid] = (unsplashMap[uid] || []).concat({ file: post.file, title: post.title, alt, url });
    } else {
      otherMap.push({ file: post.file, title: post.title, alt, url });
    }

    // 2. 부조화 위험 패턴 감지
    // A. 캡션이 억새/갈대/자연인데 도서관/실내 또는 어두운 숲 사진
    if (/갈대|억새|생태공원|습지/i.test(alt) && !/photo-1508873696983|photo-1470071459604|pexels-photo-14456635|photo-1506744038136/i.test(url)) {
      issues.push({ type: '피사체 부조화 (갈대/억새)', file: post.file, alt, url });
    }

    // B. 캡션이 음식/맛집/국밥/카페인데 풍경 또는 미술관 사진
    if (/국밥|미식|디저트|커피|카페|맛집|먹거리/i.test(alt) && /photo-1508873696983|photo-1507525428034|photo-1481627834876/i.test(url)) {
      issues.push({ type: '피사체 부조화 (음식/카페)', file: post.file, alt, url });
    }

    // C. 캡션이 도서관/서가인데 바다/자연 사진
    if (/도서관|서가|열람/i.test(alt) && /photo-1507525428034|photo-1548199973/i.test(url)) {
      issues.push({ type: '피사체 부조화 (도서관/서가)', file: post.file, alt, url });
    }

    // D. 캡션이 미술관/전시실인데 시장/음식 사진
    if (/미술관|전시실|갤러리|작품/i.test(alt) && /photo-1547592180|photo-1563245372/i.test(url)) {
      issues.push({ type: '피사체 부조화 (미술관/전시)', file: post.file, alt, url });
    }

    // E. 초상권 위험 패턴
    if (/portrait|selfie|face\b|people\b|photo-1544005313|photo-1534528741775|photo-1507003211169/i.test(url) || /얼굴|셀카|가족사진/i.test(alt)) {
      issues.push({ type: '초상권 위험', file: post.file, alt, url });
    }

    // F. 계절 불일치 패턴 (봄/겨울)
    if (/cherry blossom|벚꽃|sakura|photo-1522383225653|snow\b|겨울|설경/i.test(url) || /벚꽃|설경/i.test(alt)) {
      issues.push({ type: '계절 불일치 (봄/겨울)', file: post.file, alt, url });
    }
  });
});

console.log(`📌 Unsplash 고유 이미지 수: ${Object.keys(unsplashMap).length}종`);
console.log(`📌 Pexels 고유 이미지 수: ${Object.keys(pexelsMap).length}종`);
console.log(`📌 기타 외부/네이버 이미지 수: ${otherMap.length}건`);
console.log(`⚠️ 정밀 감지된 부조화 및 위험 항목: 총 ${issues.length}건`);

console.log("\n[세부 이상 목록]");
issues.forEach((iss, i) => {
  console.log(`${i + 1}. [${iss.type}] ${iss.file}`);
  console.log(`   - 캡션: "${iss.alt}"`);
  console.log(`   - URL: ${iss.url.substring(0, 80)}...`);
});

fs.writeFileSync(path.join(__dirname, 'audit_issues_detected.json'), JSON.stringify(issues, null, 2), 'utf-8');
