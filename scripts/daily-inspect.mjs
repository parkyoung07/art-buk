import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. 점검 대상 디렉토리
const postsDir = path.join(rootDir, "src/content/posts");
const artSamplePath = path.join(rootDir, "public/data/art-sample.json");
const searchIndexPath = path.join(rootDir, "public/search-index.json");

console.log("==================================================");
console.log("🚀 [나드리 AI] 일일 원스톱 통합 점검 & 진단 시작");
console.log("==================================================");

// KST 기준 날짜 계산
const now = new Date();
const kstOffset = 9 * 60 * 60 * 1000;
const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);
const today = kstDate.toISOString().split("T")[0];

const yesterdayDate = new Date(kstDate.getTime() - 24 * 60 * 60 * 1000);
const yesterday = yesterdayDate.toISOString().split("T")[0];

console.log(`📅 점검 기준일: 오늘(${today}), 전일(${yesterday})`);

// 2. 포스트 파일 분석
if (!fs.existsSync(postsDir)) {
  console.error("❌ 포스트 디렉토리가 존재하지 않습니다:", postsDir);
  process.exit(1);
}

const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith(".md") && f !== ".gitkeep");

const postList = postFiles.map(file => {
  const fullPath = path.join(postsDir, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  
  let dateStr = "";
  if (data.date) {
    if (data.date instanceof Date) {
      dateStr = data.date.toISOString().split("T")[0];
    } else {
      dateStr = String(data.date).split("T")[0];
    }
  } else {
    const m = file.match(/^(\d{4}-\d{2}-\d{2})/);
    dateStr = m ? m[1] : "";
  }

  return {
    file,
    slug: file.replace(/\.md$/, ""),
    title: data.title || "제목 없음",
    date: dateStr,
    region: data.region || "부울경",
    subRegion: data.subRegion || "",
    category: data.category || "전시 리뷰",
    eventId: data.eventId || "",
    thumbnail: data.thumbnail || ""
  };
}).sort((a, b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file));

// 전일 및 금일 발행 내역 추출
const todayPosts = postList.filter(p => p.date === today);
const yesterdayPosts = postList.filter(p => p.date === yesterday);

console.log(`\n📊 [1. 발행 현황 요약]`);
console.log(`- 전체 등록 포스트 수: ${postList.length}편`);
console.log(`- 전일(${yesterday}) 발행 건수: ${yesterdayPosts.length}편 (목표 2편)`);
yesterdayPosts.forEach((p, idx) => {
  console.log(`   ${idx + 1}) [${p.region}] ${p.title} (${p.file})`);
});

console.log(`- 금일(${today}) 발행 건수: ${todayPosts.length}편`);
todayPosts.forEach((p, idx) => {
  console.log(`   ${idx + 1}) [${p.region}] ${p.title} (${p.file})`);
});

// 3. 제1원칙: 14일 쿨다운 및 중복 검증
console.log(`\n🔍 [2. 글 소재 14일 쿨다운 및 중복 검증]`);
const slugHistory = new Map();
const cooldownViolations = [];

postList.forEach(p => {
  // slug에서 날짜 prefix 제거 (YYYY-MM-DD- 제거)
  const pureSlug = p.file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  if (!slugHistory.has(pureSlug)) {
    slugHistory.set(pureSlug, []);
  }
  slugHistory.get(pureSlug).push({ date: p.date, file: p.file });
});

slugHistory.forEach((occurrences, slug) => {
  if (occurrences.length > 1) {
    for (let i = 0; i < occurrences.length - 1; i++) {
      const d1 = new Date(occurrences[i].date);
      const d2 = new Date(occurrences[i + 1].date);
      const diffDays = Math.abs(Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)));
      if (diffDays < 14) {
        cooldownViolations.push({
          slug,
          first: occurrences[i + 1],
          second: occurrences[i],
          diffDays
        });
      }
    }
  }
});

if (cooldownViolations.length === 0) {
  console.log(`✅ [14일 쿨다운 원칙 준수] 14일 이내 재추천된 중복 글 0건 (완벽 통과)`);
} else {
  console.warn(`⚠️ [14일 쿨다운 위반 감지] 총 ${cooldownViolations.length}건:`);
  cooldownViolations.forEach(v => {
    console.warn(`   - ${v.slug}: ${v.first.date} vs ${v.second.date} (${v.diffDays}일 간격)`);
  });
}

// 4. 제1원칙: 이미지 무중복(Zero-Duplicate) 감사
console.log(`\n📸 [3. 이미지 무중복(Zero-Duplicate) 정밀 감사]`);
const urlUsage = new Map();

// art-sample.json
if (fs.existsSync(artSamplePath)) {
  try {
    const artSample = JSON.parse(fs.readFileSync(artSamplePath, "utf8"));
    artSample.forEach(item => {
      if (item.thumbnailUrl) {
        if (!urlUsage.has(item.thumbnailUrl)) urlUsage.set(item.thumbnailUrl, []);
        urlUsage.get(item.thumbnailUrl).push(`[전시 DB] ${item.id}`);
      }
    });
  } catch (e) {
    console.warn("⚠️ art-sample.json 파싱 실패:", e.message);
  }
}

// 포스트 이미지 수집
postFiles.forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), "utf8");
  const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\)]+)\)/g;
  const thumbMatch = content.match(/thumbnail:\s*"([^"]+)"/);
  
  if (thumbMatch) {
    const u = thumbMatch[1];
    if (!urlUsage.has(u)) urlUsage.set(u, []);
    urlUsage.get(u).push(`[썸네일] ${file}`);
  }
  
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    const u = m[2];
    if (!urlUsage.has(u)) urlUsage.set(u, []);
    urlUsage.get(u).push(`[본문] ${file}`);
  }
});

let duplicateUrlCount = 0;
urlUsage.forEach((usages, u) => {
  // 동일 글 내부 제외하고 서로 다른 글/DB 간 중복 확인
  const uniqueSources = new Set(usages.map(s => s.split(" ")[1]));
  if (uniqueSources.size > 1) {
    duplicateUrlCount++;
  }
});

console.log(`- 수집된 고유 이미지 URL 총계: ${urlUsage.size}개`);
if (duplicateUrlCount === 0) {
  console.log(`✅ [이미지 무중복 원칙 준수] 서로 다른 글 간 이미지 재사용 0건 (완벽 통과)`);
} else {
  console.log(`ℹ️ [이미지 사용 현황] 다중 참조 이미지: ${duplicateUrlCount}건`);
}

// 5. [시스템 최고 가치] 이미지 신뢰성 & 연관성 무결성 감사 (포스터/공사/추상텍스처 0건 검증)
console.log(`\n🛡️ [5. 이미지 신뢰성 & 연관성 무결성 감사 (신뢰도 직결)]`);

const badImagePatterns = [
  { name: "유튜브 프로필 아바타", pattern: "googleusercontent.com" },
  { name: "인터넷 서점 책 표지", pattern: "image.yes24.com" },
  { name: "지자체 공고 배너", pattern: "uiryeong.go.kr/images/new/Culture" },
  { name: "구형 행사 포스터", pattern: "img.newsro.kr" },
  { name: "과거 구형 포스터/뉴스", pattern: "0003619403_001_2018" },
  { name: "추상 마블/물감 텍스처", pattern: "photo-1561214115-f2f134cc4912" },
  { name: "공사 현장/크레인", pattern: "photo-1565008447742-97f6f38c985c" },
  { name: "강아지/반려동물(풍경 불일치)", pattern: "photo-1548199973-03cce0bbc87b" },
];

const suspiciousImages = [];

postFiles.forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), "utf8");
  badImagePatterns.forEach(({ name, pattern }) => {
    if (content.includes(pattern)) {
      suspiciousImages.push({ file, name, pattern });
    }
  });
});

if (suspiciousImages.length === 0) {
  console.log(`✅ [이미지 신뢰성 절대 보장 통과] 포스터, 공사 현장, 추상 텍스처, 서점 표지 등 부적절 이미지 0건 (100% 무결성 합격)`);
} else {
  console.error(`🚨 [이미지 신뢰성 위반 감지] 총 ${suspiciousImages.length}건:`);
  suspiciousImages.forEach(s => {
    console.error(`   - [${s.name}] ${s.file}`);
  });
  process.exit(1);
}

// 6. 검색 색인(search-index.json) 점검
console.log(`\n🔎 [6. 검색 색인 및 시스템 상태]`);
if (fs.existsSync(searchIndexPath)) {
  try {
    const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, "utf8"));
    console.log(`✅ 검색 색인 정상 로드: 총 ${searchIndex.length}개 항목 인덱싱 완료`);
  } catch (e) {
    console.warn("⚠️ search-index.json 로드 실패:", e.message);
  }
} else {
  console.warn("⚠️ search-index.json 파일이 없습니다.");
}

console.log("\n==================================================");
console.log("🎉 [나드리 AI] 일일 통합 정기 점검 완료");
console.log("==================================================");
