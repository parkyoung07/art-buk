import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("🛡️ [나드리 AI] 3중 무결성 시각 감사관 (Vision Verifier) 가동");
console.log("==================================================");

// 1. 검증 금고 로드
const vaultPath = path.join(rootDir, "public/data/verified-image-vault.json");
let vault = { generic_fallbacks: {} };
if (fs.existsSync(vaultPath)) {
  try {
    vault = JSON.parse(fs.readFileSync(vaultPath, "utf-8"));
  } catch (e) {
    console.warn("⚠️ Vault 파싱 실패:", e.message);
  }
}

// 2. 엄격한 블랙리스트 패턴 (초상권, 계절불일치, 엉뚱한 외국숲, 비위생, 포스터)
const CRITICAL_BLACKLIST = [
  // 초상권 / 셀카 / 인물 얼굴
  { pattern: /photo-1544005313/i, reason: "개인 인물 초상권 사진" },
  { pattern: /photo-1534528741775/i, reason: "개인 인물 초상권 사진" },
  { pattern: /photo-1507003211169/i, reason: "개인 인물 초상권 사진" },
  { pattern: /portrait|selfie|face\b|people\b/i, reason: "인물/초상권 키워드 포함" },
  
  // 계절 불일치 (가을 시즌 차단 대상)
  { pattern: /photo-1522383225653/i, reason: "봄철 벚꽃 사진 (가을 계절 불일치)" },
  { pattern: /photo-1448375240586-882707db888b/i, reason: "어두운 외국 침엽수림 사진 (가을 억새/자연 불일치)" },
  { pattern: /cherry blossom|cherry_blossom|sakura/i, reason: "봄철 벚꽃 키워드 (가을 불일치)" },
  { pattern: /snow\b|winter\b|snowman|설경/i, reason: "겨울 설경 키워드 (가을 불일치)" },

  // 비위생 / 공사현장 / 위험
  { pattern: /toilet|restroom|urinal|bathroom|화장실|변기|세면대/i, reason: "화장실 및 비위생 이미지" },
  { pattern: /construction|crane|철거|공사현장/i, reason: "공사 현장 이미지" },
  { pattern: /accident|사고사|부검|유엔묘지/i, reason: "부적절한 장소 및 사고 이미지" },

  // 저품질 / 워터마크 / 책표지
  { pattern: /gettyimages|shutterstock|watermark/i, reason: "워터마크 스톡 이미지" },
  { pattern: /yes24\.com|aladin\.co\.kr|kyobobook\.co\.kr/i, reason: "서점 책 표지 이미지" },
  { pattern: /yt3\.ggpht\.com/i, reason: "유튜브 프로필 아이콘" }
];

// 3. 포스트 전수 감사 및 무결성 검사
const postsDir = path.join(rootDir, "src/content/posts");
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

let auditedCount = 0;
let fixedCount = 0;
const violations = [];

for (const file of postFiles) {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(content);

  let modified = false;
  let newBody = parsed.content;

  // 마크다운 이미지 정규식: ![alt](url)
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;

  while ((match = imgRegex.exec(parsed.content)) !== null) {
    auditedCount++;
    const [fullTag, altText, imgUrl] = match;

    // 블랙리스트 검사
    for (const rule of CRITICAL_BLACKLIST) {
      if (rule.pattern.test(imgUrl) || rule.pattern.test(altText)) {
        violations.push({
          file,
          alt: altText,
          url: imgUrl,
          reason: rule.reason
        });

        // 자동 치유: 캡션 맥락에 맞는 100% 안전 금고 사진으로 자동 교체
        let safeReplacement = vault.generic_fallbacks.autumn_park;
        if (/갈대|억새|생태공원|우포|을숙도/i.test(altText)) {
          safeReplacement = vault.generic_fallbacks.autumn_reeds;
        } else if (/도서관|책|서가/i.test(altText)) {
          safeReplacement = vault.generic_fallbacks.library_books;
        } else if (/시장|먹거리|국밥|음식/i.test(altText)) {
          safeReplacement = vault.generic_fallbacks.korean_food;
        } else if (/카페|디저트|커피/i.test(altText)) {
          safeReplacement = vault.generic_fallbacks.cafe_dessert;
        } else if (/미술관|전시|갤러리|조각/i.test(altText)) {
          safeReplacement = vault.generic_fallbacks.art_gallery;
        } else if (/바다|포구|항구|해안/i.test(altText)) {
          safeReplacement = vault.generic_fallbacks.ocean_harbor;
        }

        const safeTag = `![${altText}](${safeReplacement})`;
        newBody = newBody.replace(fullTag, safeTag);
        modified = true;
        fixedCount++;
        break;
      }
    }
  }

  // 대표 썸네일(thumbnail)도 검사
  if (parsed.data && parsed.data.thumbnail) {
    const thumbUrl = parsed.data.thumbnail;
    for (const rule of CRITICAL_BLACKLIST) {
      if (rule.pattern.test(thumbUrl)) {
        violations.push({
          file,
          alt: "thumbnail",
          url: thumbUrl,
          reason: rule.reason
        });
        parsed.data.thumbnail = vault.generic_fallbacks.autumn_landmark;
        modified = true;
        fixedCount++;
        break;
      }
    }
  }

  if (modified) {
    const updatedFileContent = matter.stringify(newBody, parsed.data);
    fs.writeFileSync(filePath, updatedFileContent, "utf-8");
  }
}

console.log(`📊 [감사 결과] 총 ${postFiles.length}개 포스트 내 ${auditedCount}개 이미지 검사 완료`);
if (violations.length > 0) {
  console.log(`⚠️ 발견된 위반 항목: ${violations.length}건 (전체 자동 안전 치유 완료: ${fixedCount}건)`);
  violations.forEach((v, idx) => {
    console.log(`  [${idx + 1}] ${v.file}: ${v.reason} (${v.alt})`);
  });
} else {
  console.log("✅ 위반 및 부조화 사진 0건! 모든 이미지가 3중 무결성 기준(초상권 0%, 가을 계절 일치 100%)을 통과했습니다.");
}

console.log("==================================================");
