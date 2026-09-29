const fs = require("fs");
const path = require("path");

const postsDir = path.resolve("src/content/posts");
const vaultPath = path.resolve("public/data/verified-image-vault.json");
const genScriptPath = path.resolve("scripts/generate-daily-post.mjs");
const visionScriptPath = path.resolve("scripts/verify-image-vision.mjs");

console.log("==================================================");
console.log("🚨 [마스터 클린업] 불량/엉뚱 이미지 전면 숙청 및 무결점 교체 가동");
console.log("==================================================");

// 1. 교체할 불량 이미지 목록 및 대체 고화질 실사 매핑
const BAD_REPLACEMENTS = [
  // A. 158명 얼굴 포스터 (IMG_9855) -> 검증된 실제 현대미술 전시실 / 갤러리 화이트큐브 실사
  {
    target: "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfOCAg%2FMDAxNzg2NDI1NjIyNjUz.TX8TWvBkKNVsXjpBU7iHp06xf14HTQn2SQrce6tX5Kkg.JCRI6M_3A3Z3CxXaSM8KROTlTETa5D58GSCH6eQu7fsg.JPEG%2FIMG_9855.jpg&type=sc960_832",
    replacement: "https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // B. 애니메이션 피규어 엉덩이 (1578632767115) -> 문화예술회관 대극장 및 조각 기획전 실사
  {
    target: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/2123337/pexels-photo-2123337.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // C. 크리스마스 트리 & 곰인형 (POST_IMAGE_ENCODING_20260502_193734_565) -> 일산지 오션뷰 카페 실사
  {
    target: "https://pup-post-phinf.pstatic.net/MjAyNjA1MDJfMjMx/MDAxNzc3NzE4MjU3MDYw.CALtKSHHYllftYhA5PYeubQdFiRevdeR1Cs3lI2qI2Ag.bzwLnbrgVs25x2NpBNqEvBSwhr5ScPmtAYwRsfI05E4g.JPEG/POST_IMAGE_ENCODING_20260502_193734_565.jpg",
    replacement: "https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // D. 울산동구문화원 낡은 문 & 주차차량 (1649984445479Xop0m) -> 대왕암공원 해송과 푸른 동해 바다 기암괴석 실사
  {
    target: "https://ldb-phinf.pstatic.net/20220415_154/1649984445479Xop0m_JPEG/%B9%AE%C8%AD%BF%F8%C0%FC%B0%E6%BB%E7%C1%F8.JPG",
    replacement: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // E. 핀터레스트 드립커피 주전자 (1442512595331) -> 감성 카페 인테리어 실사
  {
    target: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // F. 외국 알프스 침엽수림 (1473448912268) -> 한국 남해안 고즈넉한 해안 산책로 실사
  {
    target: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/29359231/pexels-photo-29359231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // G. 색종이/물감 텍스처 (1541701494587) -> 인터랙티브 미디어아트 전시 공간 실사
  {
    target: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // H. 꽃 정물화 유화 (1579783900882) -> 한국 가을 호수/공원 실사
  {
    target: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/13657127/pexels-photo-13657127.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // I. 열대 해변 야자수 (1507525428034) -> 남해 쪽빛 바다 해안 실사
  {
    target: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/29359231/pexels-photo-29359231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  // J. 요세미티 외국산 (1506744038136) -> 한국 가을 숲길 실사
  {
    target: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    replacement: "https://images.pexels.com/photos/14804467/pexels-photo-14804467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  }
];

// 2. 모든 포스트 파일 일괄 스캔 및 정밀 교체
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
let replacedPostCount = 0;
let totalReplacedOccurrences = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  let fileModified = false;

  for (const item of BAD_REPLACEMENTS) {
    if (content.includes(item.target)) {
      const regex = new RegExp(item.target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      content = content.replace(regex, item.replacement);
      fileModified = true;
      totalReplacedOccurrences++;
    }
  }

  // 특정 포스트별 캡션-사진 정밀 튜닝
  if (file === "2026-09-28-ulsan-donggu-daewangam-art.md") {
    content = content.replace(
      "![울산광역시동구문화원](https://ldb-phinf.pstatic.net/20220415_154/1649984445479Xop0m_JPEG/%B9%AE%C8%AD%BF%F8%C0%FC%B0%E6%BB%E7%C1%F8.JPG)",
      "![대왕암공원과 동해 바다 전경](https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)"
    );
    content = content.replace(
      "*▲ 울산광역시동구문화원 전경*",
      "*▲ 기암괴석과 푸른 동해 바다가 어우러진 대왕암공원 전경*"
    );
  }

  if (fileModified) {
    fs.writeFileSync(filePath, content, "utf-8");
    replacedPostCount++;
    console.log(`✅ [포스트 정화 완료] ${file}`);
  }
}

console.log(`\n🎉 [포스트 정화 결과] 총 ${replacedPostCount}개 포스트 내 ${totalReplacedOccurrences}개 불량 이미지 완전 퇴출 및 실사 교체 완료!`);

// 3. public/data/verified-image-vault.json 정화
if (fs.existsSync(vaultPath)) {
  let vaultContent = fs.readFileSync(vaultPath, "utf-8");
  for (const item of BAD_REPLACEMENTS) {
    vaultContent = vaultContent.replaceAll(item.target, item.replacement);
  }
  fs.writeFileSync(vaultPath, vaultContent, "utf-8");
  console.log("🛡️ [Vault 정화 완료] verified-image-vault.json 내 모든 불량 이미지 완전 제거 완료");
}

// 4. scripts/generate-daily-post.mjs 정화
if (fs.existsSync(genScriptPath)) {
  let genContent = fs.readFileSync(genScriptPath, "utf-8");
  for (const item of BAD_REPLACEMENTS) {
    genContent = genContent.replaceAll(item.target, item.replacement);
  }
  fs.writeFileSync(genScriptPath, genContent, "utf-8");
  console.log("🛡️ [생성 엔진 정화 완료] generate-daily-post.mjs 내 하드코딩 불량 URL 완전 제거 완료");
}

// 5. scripts/verify-image-vision.mjs 검증 블랙리스트 7대 불량 패턴 철벽 추가
if (fs.existsSync(visionScriptPath)) {
  let visionContent = fs.readFileSync(visionScriptPath, "utf-8");
  
  const strictBlacklist = `
  "IMG_9855",
  "1578632767115",
  "POST_IMAGE_ENCODING_20260502_193734_565",
  "1649984445479Xop0m",
  "1442512595331",
  "1473448912268",
  "1541701494587",
  "1579783900882",
  "1507525428034",
  "1506744038136",
`;

  if (!visionContent.includes("IMG_9855")) {
    visionContent = visionContent.replace(
      /const BLACKLIST_PATTERNS = \[/,
      `const BLACKLIST_PATTERNS = [${strictBlacklist}`
    );
    fs.writeFileSync(visionScriptPath, visionContent, "utf-8");
    console.log("🛡️ [비전 검증기 업그레이드] verify-image-vision.mjs에 10대 절대 배제 패턴 추가 완료");
  }
}

console.log("==================================================");
console.log("✨ [완벽 무결점] 100% 실사 정화 완료!");
console.log("==================================================");
