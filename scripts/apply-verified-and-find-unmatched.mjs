import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const postsDir = path.join(rootDir, "src", "content", "posts");
const dataDir = path.join(rootDir, "public", "data");

// 1. 검증 데이터베이스 로드
const registryPath = path.join(dataDir, "verified-image-registry.json");
const candidatesPath = path.join(dataDir, "naver-image-candidates.json");
const audit60Path = path.join(rootDir, "scripts", "naver_all_60_venues_audit_result.json");
const audit40Path = path.join(rootDir, "scripts", "naver_step2_40_venues_audit_result.json");
const librariesPath = path.join(dataDir, "libraries.json");
const marketsPath = path.join(dataDir, "markets.json");

const registry = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath, "utf8")) : { images: [] };
const candidates = fs.existsSync(candidatesPath) ? JSON.parse(fs.readFileSync(candidatesPath, "utf8")) : [];
const audit60 = fs.existsSync(audit60Path) ? JSON.parse(fs.readFileSync(audit60Path, "utf8")) : [];
const audit40 = fs.existsSync(audit40Path) ? JSON.parse(fs.readFileSync(audit40Path, "utf8")) : [];
const libraries = fs.existsSync(librariesPath) ? JSON.parse(fs.readFileSync(librariesPath, "utf8")) : [];
const markets = fs.existsSync(marketsPath) ? JSON.parse(fs.readFileSync(marketsPath, "utf8")) : [];

// 정밀 정규화 맵 (오직 정확한 장소 ID와 공식 장소명만 허용)
const strictVerifiedMap = new Map();

function registerStrictAsset(canonicalId, canonicalName, imgObj) {
  if (!imgObj || !imgObj.url || imgObj.url.includes("placeholder") || imgObj.url.includes("svg")) return;

  const keys = [canonicalId, canonicalName].filter(Boolean);
  keys.forEach(k => {
    const norm = k.toLowerCase().replace(/[\s\-_]/g, "");
    if (!strictVerifiedMap.has(norm)) {
      strictVerifiedMap.set(norm, []);
    }
    const list = strictVerifiedMap.get(norm);
    if (!list.some(item => item.url === imgObj.url)) {
      list.push(imgObj);
    }
  });
}

// 1) Registry 공식 검증 자산
(registry.images || []).forEach(img => {
  if (img.status === "approved" || img.approved === true) {
    registerStrictAsset(img.venue_id || img.entity_id, img.entity_name, {
      url: img.image_url,
      title: img.original_title || img.entity_name,
      source: img.photographer || "공식기관",
      isCover: !!img.is_cover
    });
  }
});

// 2) Candidates 승인 자산
candidates.forEach(cand => {
  if (cand.status === "approved" || cand.is_cover === true || cand.score >= 85) {
    registerStrictAsset(cand.place_id, cand.place_name, {
      url: cand.image_url,
      title: cand.title || cand.place_name,
      source: cand.source_domain,
      isCover: !!cand.is_cover
    });
  }
});

// 3) Audit 60 & 40 자산
[...audit60, ...audit40].forEach(venue => {
  if (venue.approved_images && Array.isArray(venue.approved_images)) {
    venue.approved_images.forEach(img => {
      registerStrictAsset(venue.place_id, venue.place_name, {
        url: img.url,
        title: img.title || venue.place_name,
        source: img.source_domain,
        isCover: false
      });
    });
  }
});

// 4) Libraries 자산
libraries.forEach(lib => {
  const localImg = lib.imageUrl || (lib.images && lib.images[0]?.url);
  if (localImg && !localImg.includes("placeholder")) {
    registerStrictAsset(lib.id, lib.name, {
      url: localImg,
      title: `${lib.name} 전경`,
      source: "부산도서관 포털",
      isCover: true
    });
  }
});

// 5) Markets 자산
markets.forEach(m => {
  const localImg = m.imageUrl || (m.images && m.images[0]?.url);
  if (localImg && !localImg.includes("placeholder")) {
    registerStrictAsset(m.id, m.name, {
      url: localImg,
      title: `${m.name} 전경`,
      source: "전통시장 공식",
      isCover: true
    });
  }
});

console.log(`🔒 엄격 검증 자산 등록 장소 키 수: ${strictVerifiedMap.size}개`);

// 2. 포스트 파일 엄격 검사 및 적용
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

// 명시적 1:1 장소 매핑 테이블 (포스트 slug/eventId -> 정확한 검증 대상)
const CANONICAL_VENUE_DICTIONARY = {
  "gyeongnam-art-museum": "경남도립미술관",
  "gyeongnam-autumn-masterpiece": "경남도립미술관",
  "busan-junggu-modern-history-museum": "부산근현대역사관",
  "busan-modern-history-museum": "부산근현대역사관",
  "ulsan-donggu-daewangam-art": "대왕암공원",
  "ulsan-daewangam-park": "대왕암공원",
  "sacheon-ocean-art-museum": "사천미술관",
  "busan-moca-eulsukdo": "부산현대미술관",
  "busan-moca": "부산현대미술관",
  "busan-biennale": "부산현대미술관",
  "busan-biennale-2026": "부산현대미술관",
  "library-busan-sasang-main": "부산도서관",
  "busan-cinema-center-media-art": "영화의전당",
  "busan-cinema-center": "영화의전당",
  "busan-f1963-art-exhibition": "f1963",
  "busan-f1963": "f1963",
  "busan-museum-of-art-modern": "부산시립미술관",
  "busan-museum-of-art-grand-reopening": "부산시립미술관",
  "busan-museum-of-art-reopening": "부산시립미술관",
  "gyeongnam-jinju-national-museum": "국립진주박물관",
  "tongyeong-ottchil-art-museum": "통영옻칠미술관",
  "gimhae-clayarch": "클레이아크김해미술관",
  "gimhae-clayarch-autumn": "클레이아크김해미술관",
  "ulsan-art-museum-sound-light": "울산시립미술관",
  "geoje-art-center-ocean-view": "거제문화예술회관",
  "market-hadong-hwagae-autumn": "화개장터",
  "market-miryang-arirang-autumn": "밀양아리랑시장",
  "market-ulsan-namchang-onggi": "남창옹기종기시장",
  "market-busan-jagalchi-nampo": "자갈치시장",
  "library-gimhae-sea-of-wisdom": "김해지혜의바다도서관",
  "library-ulsan-city-library": "울산도서관"
};

const matchedResults = [];
const unmatchedResults = [];

// 오매칭되었던 연제/우포늪 등 포스트 롤백 처리용 함수
function getFallbackPlaceholder(slug, title, category) {
  if (/market|시장|5day/i.test(slug + " " + title + " " + category)) {
    return "/images/placeholders/placeholder-market.svg";
  } else if (/library|도서관|책/i.test(slug + " " + title + " " + category)) {
    return "/images/placeholders/placeholder-library.svg";
  } else if (/healing|nature|park|산책|늪|가야진사|언덕/i.test(slug + " " + title + " " + category)) {
    return "/images/placeholders/placeholder-nature.svg";
  } else {
    return "/images/placeholders/placeholder-art.svg";
  }
}

postFiles.forEach(file => {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  let content = parsed.content;

  const slug = file.replace(/\.md$/, "");
  const pureSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const title = data.title || "";
  const eventId = data.eventId || "";
  const category = data.category || "";
  const region = data.region || "";

  // 1) 명시적 딕셔너리 또는 100% 일치 키 검색
  let targetCanonical = CANONICAL_VENUE_DICTIONARY[pureSlug] || CANONICAL_VENUE_DICTIONARY[eventId];
  
  let targetImages = null;
  if (targetCanonical) {
    const norm = targetCanonical.toLowerCase().replace(/[\s\-_]/g, "");
    if (strictVerifiedMap.has(norm) && strictVerifiedMap.get(norm).length > 0) {
      targetImages = strictVerifiedMap.get(norm);
    }
  }

  // 2) 매칭 여부에 따른 분기 처리
  if (targetImages && targetImages.length > 0) {
    // 100% 완벽 검증 실사 확정 적용
    const coverImg = targetImages.find(i => i.isCover) || targetImages[0];
    data.thumbnail = coverImg.url;

    let imgIdx = 0;
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    content = content.replace(imageRegex, (m, alt, oldUrl) => {
      // 이미 검증된 URL이면 유지
      if (targetImages.some(ti => ti.url === oldUrl)) {
        return m;
      }
      const chosen = targetImages[imgIdx % targetImages.length];
      imgIdx++;
      const cleanAlt = (alt || `${title} 현장 실사`).replace(/나드리 AI 공식 검증 대기 중 - /g, "");
      return `![${cleanAlt}](${chosen.url})`;
    });

    const updatedRaw = matter.stringify(content, data);
    fs.writeFileSync(filePath, updatedRaw, "utf8");

    matchedResults.push({
      file,
      title,
      region,
      canonicalVenue: targetCanonical,
      appliedCover: coverImg.url,
      imagesCount: targetImages.length
    });
  } else {
    // 100% 매칭 실사가 없는 경우 -> 반드시 안전 플레이스홀더 상태 유지 및 후보 추출 대상으로 분리
    const placeholder = getFallbackPlaceholder(slug, title, category);
    
    // 만약 잘못된 다른 장소 이미지가 들어가 있다면 플레이스홀더로 안전 롤백
    let rollbackNeeded = false;
    if (data.thumbnail && !data.thumbnail.includes("placeholder") && !data.thumbnail.startsWith("/images/library/")) {
      data.thumbnail = placeholder;
      rollbackNeeded = true;
    }

    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    content = content.replace(imageRegex, (m, alt, oldUrl) => {
      if (!oldUrl.includes("placeholder") && !oldUrl.startsWith("/images/library/")) {
        rollbackNeeded = true;
        return `![나드리 AI 공식 검증 대기 중 - ${title}](${placeholder})`;
      }
      return m;
    });

    if (rollbackNeeded) {
      const updatedRaw = matter.stringify(content, data);
      fs.writeFileSync(filePath, updatedRaw, "utf8");
    }

    unmatchedResults.push({
      file,
      slug,
      pureSlug,
      title,
      region,
      category,
      searchKeyword: title.replace(/\[.*?\]/g, "").split(":")[0].trim() || pureSlug
    });
  }
});

console.log("\n==================================================");
console.log(`🎯 [엄격 100% 일치] 검증 실사 확정 적용: 총 ${matchedResults.length}편`);
console.log(`🔍 [후보군 신규 추출 대기 대상]: 총 ${unmatchedResults.length}편`);
console.log("==================================================");

// 2단계용 후보군 추출 명소 목록 생성
const uniqueTargetVenues = [];
const seenVenues = new Set();

unmatchedResults.forEach(item => {
  if (!seenVenues.has(item.searchKeyword)) {
    seenVenues.add(item.searchKeyword);
    uniqueTargetVenues.push({
      keyword: item.searchKeyword,
      region: item.region,
      category: item.category,
      relatedFilesCount: unmatchedResults.filter(u => u.searchKeyword === item.searchKeyword).length
    });
  }
});

const finalReport = {
  timestamp: new Date().toISOString(),
  stats: {
    totalPosts: postFiles.length,
    strictlyVerifiedCompleted: matchedResults.length,
    pendingCandidateExtraction: unmatchedResults.length,
    uniqueVenuesToExtract: uniqueTargetVenues.length
  },
  strictlyVerifiedList: matchedResults,
  targetVenuesForStep2: uniqueTargetVenues,
  unmatchedPosts: unmatchedResults
};

fs.writeFileSync(
  path.join(rootDir, "scripts", "step1_strict_verified_report.json"),
  JSON.stringify(finalReport, null, 2),
  "utf8"
);

console.log("📄 엄격 리포트 생성 완료: scripts/step1_strict_verified_report.json");
