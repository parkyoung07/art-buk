const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log("==================================================");
console.log("🛠️ [전수 교정] 전체 포스트 이미지 이상 전면 수정 가동");
console.log("==================================================");

// 검증된 100% 200 OK 실사 사진 풀
const SAFE_ASSETS = {
  autumn_reeds: [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop&q=80",
    "https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  library_books: [
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80"
  ],
  cafe_dessert: [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80"
  ],
  korean_food: [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80"
  ],
  ocean_harbor: [
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
  ],
  art_gallery: [
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80"
  ],
  autumn_nature: [
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop&q=80"
  ]
};

// 깨진 URL 또는 차단 URL 목록 로드
const brokenData = JSON.parse(fs.readFileSync(path.join(__dirname, 'audit_broken_urls.json'), 'utf-8'));
const brokenUrlSet = new Set(brokenData.map(b => b.url));

// 추가 결함 패턴 (404 Unsplash ID 등)
brokenUrlSet.add("https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=1200&auto=format&fit=crop&q=80");
brokenUrlSet.add("https://images.unsplash.com/photo-1507842229452-9b2f67644917?w=1200&auto=format&fit=crop&q=80");
brokenUrlSet.add("https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80");

function getBestReplacement(altText) {
  if (/갈대|억새|생태공원|습지|철새|수변/i.test(altText)) {
    return SAFE_ASSETS.autumn_reeds[0];
  } else if (/도서관|서가|열람|책|보이드/i.test(altText)) {
    return SAFE_ASSETS.library_books[0];
  } else if (/국밥|미식|음식|먹거리|식당|시장/i.test(altText)) {
    return SAFE_ASSETS.korean_food[0];
  } else if (/카페|디저트|커피|베이커리/i.test(altText)) {
    return SAFE_ASSETS.cafe_dessert[0];
  } else if (/바다|포구|항구|해안|남항/i.test(altText)) {
    return SAFE_ASSETS.ocean_harbor[0];
  } else if (/미술관|전시실|갤러리|조각|작품/i.test(altText)) {
    return SAFE_ASSETS.art_gallery[0];
  } else {
    return SAFE_ASSETS.autumn_nature[0];
  }
}

const postsDir = path.join(__dirname, '..', 'src', 'content', 'posts');
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

let modifiedPostsCount = 0;
let modifiedImagesCount = 0;

postFiles.forEach(file => {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(content);

  let modified = false;
  let body = parsed.content;

  // 1. 본문 이미지 검사 및 치환
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  body = body.replace(imgRegex, (match, alt, url) => {
    let shouldReplace = false;
    let reason = "";

    // 깨진 링크 또는 외부 403/401 차단 링크
    if (brokenUrlSet.has(url)) {
      shouldReplace = true;
      reason = "깨진 링크 또는 외부 차단 URL";
    }

    // 어두운 침엽수림
    if (url.includes("photo-1448375240586-882707db888b")) {
      shouldReplace = true;
      reason = "어두운 침엽수림 (부조화)";
    }

    // 가을 억새/갈대 캡션인데 Pexels 엉뚱한 사진인 경우
    if (/갈대|억새/i.test(alt) && url.includes("pexels-photo-34160211")) {
      shouldReplace = true;
      reason = "가을 억새 피사체 부조화";
    }
    if (/갈대|억새/i.test(alt) && url.includes("pexels-photo-17688199")) {
      shouldReplace = true;
      reason = "가을 억새 피사체 부조화";
    }
    if (/생태공원/i.test(alt) && url.includes("pexels-photo-9338938")) {
      shouldReplace = true;
      reason = "생태공원 피사체 부조화";
    }

    // 봄 벚꽃 캡션/URL
    if (/벚꽃|cherry blossom/i.test(alt) || /cherry_blossom/i.test(url)) {
      shouldReplace = true;
      reason = "가을 계절 불일치 (봄 벚꽃)";
    }

    if (shouldReplace) {
      const replacementUrl = getBestReplacement(alt);
      modifiedImagesCount++;
      modified = true;
      console.log(`🔧 [수정] ${file} | "${alt}" -> [${reason}] 교체 완료`);
      return `![${alt}](${replacementUrl})`;
    }

    return match;
  });

  // 2. 썸네일 검사
  if (parsed.data && parsed.data.thumbnail) {
    if (brokenUrlSet.has(parsed.data.thumbnail) || parsed.data.thumbnail.includes("photo-1448375240586-882707db888b")) {
      parsed.data.thumbnail = SAFE_ASSETS.autumn_nature[0];
      modified = true;
      modifiedImagesCount++;
      console.log(`🔧 [썸네일 수정] ${file} -> 안전 실사 썸네일로 교체`);
    }
  }

  if (modified) {
    modifiedPostsCount++;
    const updatedContent = matter.stringify(body, parsed.data);
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
  }
});

console.log("==================================================");
console.log(`🎉 [전수 교정 완료] 총 ${modifiedPostsCount}개 포스트 내 ${modifiedImagesCount}개 이미지 이상 100% 수정 완료!`);
console.log("==================================================");
