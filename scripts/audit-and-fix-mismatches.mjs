import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const postsDir = path.join(rootDir, "src/content/posts");

console.log("==================================================");
console.log("🔍 [나드리 AI] 95개 포스트 전체 이미지 전수 감사 시작");
console.log("==================================================");

const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md") && f !== ".gitkeep");
console.log(`📂 총 검사 대상 포스트: ${files.length}개\n`);

// 불일치 및 위험 이미지 패턴 목록
const BAD_PATTERNS = [
  { id: "FLOWER_PAINTING", name: "서양 고전 꽃 정물화 유화", pattern: "photo-1579783900882-c0d3dad7b119" },
  { id: "TROPICAL_BEACH", name: "외국 열대 해변 모래사장 (위양지/거제 등 오적용)", pattern: "photo-1507525428034-b723cf961d3e" },
  { id: "YOSEMITE_FOREST", name: "미국 요세미티 침엽수림 (우포늪 오적용)", pattern: "photo-1506744038136-46273834b3fb" },
  { id: "GOHIAN_POSTER", name: "고희안 트리오 2024 콘서트 포스터", pattern: "0000048327_001_20240603154609253" },
  { id: "MISMATCHED_REEDS", name: "마른 갈대 텍스처 무차별 중복 (바람의언덕/시민공원 오적용)", pattern: "pexels-photo-14456635" },
  { id: "CONSTRUCTION_CRANE", name: "공사 현장/크레인", pattern: "photo-1565008447742-97f6f38c985c" },
  { id: "PET_DOG", name: "반려동물/강아지", pattern: "photo-1548199973-03cce0bbc87b" },
  { id: "DARK_MILKYWAY", name: "어두운 밤하늘/은하수", pattern: "photo-1470246973918-29a132242b55" }
];

const detectedIssues = [];
const allImagesMap = new Map(); // url -> Array<{file, type, alt}>

files.forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), "utf8");
  
  // 1. 썸네일 검사
  const thumbMatch = content.match(/thumbnail:\s*['"]?([^\s'"]+)['"]?/);
  const thumbnail = thumbMatch ? thumbMatch[1] : null;

  if (thumbnail) {
    if (!allImagesMap.has(thumbnail)) allImagesMap.set(thumbnail, []);
    allImagesMap.get(thumbnail).push({ file, type: "thumbnail", alt: "대표 썸네일" });

    BAD_PATTERNS.forEach(bp => {
      if (thumbnail.includes(bp.pattern)) {
        detectedIssues.push({
          file,
          type: "THUMBNAIL_MISMATCH",
          patternId: bp.id,
          patternName: bp.name,
          url: thumbnail,
          caption: "대표 썸네일"
        });
      }
    });
  }

  // 2. 본문 이미지 검사
  const imgMatches = content.matchAll(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g);
  for (const m of imgMatches) {
    const alt = m[1];
    const url = m[2];

    if (!allImagesMap.has(url)) allImagesMap.set(url, []);
    allImagesMap.get(url).push({ file, type: "body", alt });

    BAD_PATTERNS.forEach(bp => {
      if (url.includes(bp.pattern)) {
        detectedIssues.push({
          file,
          type: "BODY_IMG_MISMATCH",
          patternId: bp.id,
          patternName: bp.name,
          url,
          caption: alt
        });
      }
    });

    // 포스터 의심 패턴 (포스터, 티켓, 팜플렛, 공연 전단지 등)
    if (/포스터|티켓|콘서트|공연안내|라인업/i.test(alt) || /poster|ticket/i.test(url)) {
      detectedIssues.push({
        file,
        type: "SUSPICIOUS_POSTER",
        patternId: "POSTER_KEYWORD",
        patternName: "행사/공연 포스터 의심 피사체",
        url,
        caption: alt
      });
    }
  }
});

console.log(`🚨 [전수 조사 결과] 감지된 불일치/위험 이미지: 총 ${detectedIssues.length}건`);
detectedIssues.forEach((issue, idx) => {
  console.log(`\n[${idx + 1}] 파일: ${issue.file}`);
  console.log(`    - 유형: [${issue.patternName}] (${issue.type})`);
  console.log(`    - 캡션: "${issue.caption}"`);
  console.log(`    - URL: ${issue.url.slice(0, 80)}...`);
});

// 중복 사용 URL (3회 이상 재사용된 이미지)
console.log("\n==================================================");
console.log("🔄 [중복 사용 이미지 점검] (3곳 이상 재사용된 URL)");
console.log("==================================================");
let dupeCount = 0;
for (const [url, usages] of allImagesMap.entries()) {
  if (usages.length >= 3) {
    dupeCount++;
    console.log(`⚠️ ${usages.length}회 중복 사용: ${url.slice(0, 70)}...`);
    usages.forEach(u => console.log(`   └ [${u.type}] ${u.file} (${u.alt.slice(0, 20)})`));
  }
}
console.log(`총 ${dupeCount}종의 이미지가 3곳 이상 과도 중복 사용 중입니다.`);

const reportPath = path.join(rootDir, "scripts/audit_result_mismatches.json");
fs.writeFileSync(reportPath, JSON.stringify({ detectedIssues, totalCheckedFiles: files.length }, null, 2), "utf8");
console.log(`\n💾 결과 보고서 저장 완료: ${reportPath}`);
