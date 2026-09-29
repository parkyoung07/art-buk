const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.resolve("src/content/posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

const urlMap = {};

for (const f of files) {
  const content = fs.readFileSync(path.join(postsDir, f), "utf8");
  const parsed = matter(content);
  
  if (parsed.data.thumbnail) {
    urlMap[parsed.data.thumbnail] = urlMap[parsed.data.thumbnail] || [];
    urlMap[parsed.data.thumbnail].push({ file: f, type: "thumbnail" });
  }

  const matches = content.matchAll(/!\[(.*?)\]\((.*?)\)/g);
  for (const m of matches) {
    const caption = m[1];
    const url = m[2];
    urlMap[url] = urlMap[url] || [];
    urlMap[url].push({ file: f, type: "body", caption });
  }
}

console.log(`Total unique image URLs: ${Object.keys(urlMap).length}`);

// Find dangerous/bad URLs
const badPatterns = [
  { id: "158명 얼굴 포스터 (IMG_9855)", pattern: "IMG_9855" },
  { id: "애니메이션 피규어 엉덩이 (1578632767115)", pattern: "1578632767115" },
  { id: "크리스마스 트리 & 곰인형 (POST_IMAGE_ENCODING_20260502_193734_565)", pattern: "POST_IMAGE_ENCODING_20260502_193734_565" },
  { id: "울산동구문화원 낡은 문 & 주차차량 (1649984445479Xop0m)", pattern: "1649984445479Xop0m" },
  { id: "핀터레스트 드립커피 주전자 (1442512595331)", pattern: "1442512595331" },
  { id: "외국 알프스 침엽수림 (1473448912268)", pattern: "1473448912268" },
  { id: "외국 열대 해변 (1507525428034)", pattern: "1507525428034" },
  { id: "꽃 정물화 유화 (1579783900882)", pattern: "1579783900882" },
  { id: "요세미티/외국산 (1506744038136)", pattern: "1506744038136" },
  { id: "색종이/물감 텍스처 (1541701494587)", pattern: "1541701494587" },
];

let totalBadInstances = 0;

for (const bp of badPatterns) {
  const matched = Object.entries(urlMap).filter(([u]) => u.includes(bp.pattern));
  if (matched.length > 0) {
    console.log(`\n🚨 [적발] ${bp.id}`);
    for (const [url, usages] of matched) {
      console.log(`   URL: ${url}`);
      console.log(`   사용 횟수: ${usages.length}회`);
      totalBadInstances += usages.length;
      usages.forEach(u => {
        console.log(`     - [${u.file}] (${u.type}) ${u.caption || ""}`);
      });
    }
  }
}

console.log(`\n⚠️ 총 적발된 불량/엉뚱 이미지 사용 건수: ${totalBadInstances}건`);

fs.writeFileSync("scripts/all_unique_urls.json", JSON.stringify(urlMap, null, 2), "utf8");
