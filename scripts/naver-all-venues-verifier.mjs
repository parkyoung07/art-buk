import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. .env.local 로드
function loadEnv() {
  const envFiles = [path.join(rootDir, ".env.local"), path.join(rootDir, ".env")];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 2. 전체 60개 명소 정의 (1차 20곳 + 2차 40곳 통합)
export const ALL_60_VENUES = [
  // === [부산 21곳] ===
  { place_id: "busan-museum-of-art", place_name: "부산시립미술관", category: "venue", region: "부산", sub_region: "해운대구", address: "부산광역시 해운대구 APEC로 58" },
  { place_id: "busan-moca-eulsukdo", place_name: "부산현대미술관", category: "venue", region: "부산", sub_region: "사하구", address: "부산광역시 사하구 낙동남로 1191 (을숙도)" },
  { place_id: "busan-cinema-center", place_name: "영화의전당", category: "venue", region: "부산", sub_region: "해운대구", address: "부산광역시 해운대구 수영강변대로 120" },
  { place_id: "busan-f1963", place_name: "F1963", category: "venue", region: "부산", sub_region: "수영구", address: "부산광역시 수영구 구락로123번길 20" },
  { place_id: "busan-maritime-museum", place_name: "국립해양박물관", category: "venue", region: "부산", sub_region: "영도구", address: "부산광역시 영도구 해양로301번길 45" },
  { place_id: "busan-modern-history-museum", place_name: "부산근현대역사관", category: "venue", region: "부산", sub_region: "중구", address: "부산광역시 중구 대청로 112" },
  { place_id: "busan-library-main", place_name: "부산도서관", category: "library", region: "부산", sub_region: "사상구", address: "부산광역시 사상구 사상로310번길 33" },
  { place_id: "busan-geumjeong-library", place_name: "금정도서관", category: "library", region: "부산", sub_region: "금정구", address: "부산광역시 금정구 체육공원로 294" },
  { place_id: "busan-haeundae-humanities-library", place_name: "해운대인문학도서관", category: "library", region: "부산", sub_region: "해운대구", address: "부산광역시 해운대구 대천로 67" },
  { place_id: "busan-nat-assembly-library", place_name: "국회부산도서관", category: "library", region: "부산", sub_region: "강서구", address: "부산광역시 강서구 명지국제1로 161" },
  { place_id: "busan-jagalchi", place_name: "자갈치시장", category: "market", region: "부산", sub_region: "중구", address: "부산광역시 중구 자갈치해안로 52" },
  { place_id: "busan-gupo-market", place_name: "구포시장", category: "market", region: "부산", sub_region: "북구", address: "부산광역시 북구 구포시장1길 17" },
  { place_id: "busan-bujeon-market", place_name: "부전마켓타운", category: "market", region: "부산", sub_region: "부산진구", address: "부산광역시 부산진구 중앙대로 783" },
  { place_id: "busan-dongnae-market", place_name: "동래시장", category: "market", region: "부산", sub_region: "동래구", address: "부산광역시 동래구 동래시장길 14" },
  { place_id: "busan-gijang-market", place_name: "기장시장", category: "market", region: "부산", sub_region: "기장군", address: "부산광역시 기장군 기장읍 읍내로104번길 16" },
  { place_id: "busan-dadaepo-sunset", place_name: "다대포 꿈의 낙조분수", category: "nature", region: "부산", sub_region: "사하구", address: "부산광역시 사하구 몰운대1길 14" },
  { place_id: "busan-blueline-park", place_name: "해운대 블루라인파크", category: "nature", region: "부산", sub_region: "해운대구", address: "부산광역시 해운대구 청사포로 116" },
  { place_id: "busan-haedong-yonggungsa", place_name: "해동용궁사", category: "nature", region: "부산", sub_region: "기장군", address: "부산광역시 기장군 기장읍 용궁사로 86" },
  { place_id: "busan-hwamyeong-ecopark", place_name: "화명생태공원", category: "nature", region: "부산", sub_region: "북구", address: "부산광역시 북구 화명동 1718-17" },
  { place_id: "busan-samnak-ecopark", place_name: "삼락생태공원", category: "nature", region: "부산", sub_region: "사상구", address: "부산광역시 사상구 삼락동 29-46" },
  { place_id: "busan-huinnyeoul-culture-village", place_name: "흰여울문화마을", category: "nature", region: "부산", sub_region: "영도구", address: "부산광역시 영도구 영선동4가 1044-6" },

  // === [울산 15곳] ===
  { place_id: "ulsan-art-museum", place_name: "울산시립미술관", category: "venue", region: "울산", sub_region: "중구", address: "울산광역시 중구 미술관길 72" },
  { place_id: "ulsan-culture-center", place_name: "울산문화예술회관", category: "venue", region: "울산", sub_region: "남구", address: "울산광역시 남구 번영로 200" },
  { place_id: "ulsan-museum", place_name: "울산박물관", category: "venue", region: "울산", sub_region: "남구", address: "울산광역시 남구 두왕로 277" },
  { place_id: "ulsan-jangsaengpo-whale-village", place_name: "장생포 고래문화마을", category: "venue", region: "울산", sub_region: "남구", address: "울산광역시 남구 장생포고래로 271-1" },
  { place_id: "ulsan-library-main", place_name: "울산도서관", category: "library", region: "울산", sub_region: "남구", address: "울산광역시 남구 꽃대나리로 140" },
  { place_id: "ulsan-seonbawi-library", place_name: "울주선바위도서관", category: "library", region: "울산", sub_region: "울주군", address: "울산광역시 울주군 범서읍 구영로 101-35" },
  { place_id: "ulsan-yaksa-library", place_name: "중구약사희망도서관", category: "library", region: "울산", sub_region: "중구", address: "울산광역시 중구 종가5길 15" },
  { place_id: "ulsan-namchang-market", place_name: "남창옹기종기시장", category: "market", region: "울산", sub_region: "울주군", address: "울산광역시 울주군 온양읍 남창2길 8-8" },
  { place_id: "ulsan-jungang-market", place_name: "울산 중앙전통시장", category: "market", region: "울산", sub_region: "중구", address: "울산광역시 중구 중앙시장길 2" },
  { place_id: "ulsan-suam-market", place_name: "수암상가시장", category: "market", region: "울산", sub_region: "남구", address: "울산광역시 남구 수암로 116" },
  { place_id: "ulsan-eonyang-market", place_name: "언양알프스시장", category: "market", region: "울산", sub_region: "울주군", address: "울산광역시 울주군 언양읍 장터2길 11-5" },
  { place_id: "ulsan-taehwa-garden", place_name: "태화강국가정원 십리대숲", category: "nature", region: "울산", sub_region: "중구", address: "울산광역시 중구 태화강국가정원길" },
  { place_id: "ulsan-daewangam-park", place_name: "대왕암공원", category: "nature", region: "울산", sub_region: "동구", address: "울산광역시 동구 등대로 95" },
  { place_id: "ulsan-ganjeolgot", place_name: "간절곶", category: "nature", region: "울산", sub_region: "울주군", address: "울산광역시 울주군 서생면 간절곶1길 39-2" },
  { place_id: "ulsan-ganwoljae-reed", place_name: "영남알프스 간월재", category: "nature", region: "울산", sub_region: "울주군", address: "울산광역시 울주군 상북면 간월산길" },

  // === [경남 24곳] ===
  { place_id: "sacheon-art-museum", place_name: "사천미술관", category: "venue", region: "경남", sub_region: "사천시", address: "경상남도 사천시 사천대로 17" },
  { place_id: "jinju-national-museum", place_name: "국립진주박물관", category: "venue", region: "경남", sub_region: "진주시", address: "경상남도 진주시 남강로 626-35 (진주성)" },
  { place_id: "gimhae-clayarch", place_name: "클레이아크김해미술관", category: "venue", region: "경남", sub_region: "김해시", address: "경상남도 김해시 진례면 진례로 275-51" },
  { place_id: "tongyeong-ottchil", place_name: "통영옻칠미술관", category: "venue", region: "경남", sub_region: "통영시", address: "경상남도 통영시 용남면 미지해안로 160" },
  { place_id: "geoje-art-center", place_name: "거제문화예술회관", category: "venue", region: "경남", sub_region: "거제시", address: "경상남도 거제시 장승포로 145" },
  { place_id: "changwon-gam-art-museum", place_name: "경남도립미술관", category: "venue", region: "경남", sub_region: "창원시", address: "경상남도 창원시 의창구 용지로 296" },
  { place_id: "tongyeong-dpirang", place_name: "통영 디피랑", category: "venue", region: "경남", sub_region: "통영시", address: "경상남도 통영시 남망공원길 29" },
  { place_id: "gimhae-sea-of-wisdom", place_name: "김해 지혜의바다도서관", category: "library", region: "경남", sub_region: "김해시", address: "경상남도 김해시 주촌면 서부로 1490" },
  { place_id: "changwon-masan-happo-library", place_name: "마산합포도서관", category: "library", region: "경남", sub_region: "창원시", address: "경상남도 창원시 마산합포구 월영동서로 23" },
  { place_id: "yangsan-siju-library", place_name: "양산시립시주도서관", category: "library", region: "경남", sub_region: "양산시", address: "경상남도 양산시 물금읍 황산로 614" },
  { place_id: "hadong-hwagae-market", place_name: "하동 화개장터", category: "market", region: "경남", sub_region: "하동군", address: "경상남도 하동군 화개면 쌍계로 15" },
  { place_id: "miryang-arirang-market", place_name: "밀양 아리랑시장", category: "market", region: "경남", sub_region: "밀양시", address: "경상남도 밀양시 상설시장3길 18" },
  { place_id: "changwon-sangnam-market", place_name: "창원 상남시장", category: "market", region: "경남", sub_region: "창원시", address: "경상남도 창원시 성산구 마디미서로 54" },
  { place_id: "changwon-masan-fish-market", place_name: "마산어시장", category: "market", region: "경남", sub_region: "창원시", address: "경상남도 창원시 마산합포구 복요리로 37" },
  { place_id: "jinju-jungang-yudeung-market", place_name: "진주 중앙유등시장", category: "market", region: "경남", sub_region: "진주시", address: "경상남도 진주시 진양호로547번길 8-1" },
  { place_id: "tongyeong-jungang-market", place_name: "통영 중앙전통시장", category: "market", region: "경남", sub_region: "통영시", address: "경상남도 통영시 중앙시장1길 14-16" },
  { place_id: "sacheon-samcheonpo-market", place_name: "삼천포용궁수산시장", category: "market", region: "경남", sub_region: "사천시", address: "경상남도 사천시 어시장길 64" },
  { place_id: "yangsan-nambu-market", place_name: "양산 남부시장", category: "market", region: "경남", sub_region: "양산시", address: "경상남도 양산시 탑골길 7" },
  { place_id: "jinju-chokseongnu-jinjustle", place_name: "진주 촉석루", category: "nature", region: "경남", sub_region: "진주시", address: "경상남도 진주시 남강로 626 (진주성)" },
  { place_id: "changwon-jinhae-dreampark", place_name: "진해드림파크", category: "nature", region: "경남", sub_region: "창원시", address: "경상남도 창원시 진해구 명동로 115" },
  { place_id: "sacheon-ocean-cablecar", place_name: "사천바다케이블카", category: "nature", region: "경남", sub_region: "사천시", address: "경상남도 사천시 사천대로 18" },
  { place_id: "miryang-yeongnamnu", place_name: "밀양 영남루", category: "nature", region: "경남", sub_region: "밀양시", address: "경상남도 밀양시 중앙로 324" },
  { place_id: "yangsan-tongdosa", place_name: "양산 통도사", category: "nature", region: "경남", sub_region: "양산시", address: "경상남도 양산시 하북면 통도사로 108" },
  { place_id: "namhae-german-village", place_name: "남해 독일마을", category: "nature", region: "경남", sub_region: "남해군", address: "경상남도 남해군 삼동면 독일로 89-7" }
];

// 3. 다중 쿼리 생성 (2024~2026년 최신 쿼리 집중)
function generateSearchQueries(venue) {
  const name = venue.place_name;
  const reg = venue.region;
  const sub = venue.sub_region || "";

  if (venue.category === "market") {
    return [`${name} 2026`, `${name} 2025`, `${name} 2024`, `${name} 최근 전경`, `${name} ${reg}`];
  } else if (venue.category === "library") {
    return [`${name} 2026`, `${name} 2025`, `${name} 2024`, `${name} 최근 외관`, `${name} ${reg}`];
  } else if (venue.category === "nature") {
    return [`${name} 2026`, `${name} 2025`, `${name} 2024`, `${name} 최근 풍경`, `${name} ${reg}`];
  } else {
    return [`${name} 2026`, `${name} 2025`, `${name} 2024`, `${name} 최근 전경`, `${name} ${reg} ${sub}`];
  }
}

// 4. 네이버 이미지 검색
async function fetchNaverImages(query, display = 6) {
  const url = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encodeURIComponent(query)}&display=${display}&sort=sim`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    return [];
  }
}

// 5. 사진 연도 정밀 추출
function extractYear(url, title) {
  const urlMatch = url.match(/(20[0-2][0-9])[\/\-_]/);
  if (urlMatch) return parseInt(urlMatch[1], 10);

  if (url.includes("blogfiles.naver.net/")) {
    const base64Part = url.split("blogfiles.naver.net/")[1]?.split("/")[0];
    if (base64Part) {
      try {
        const decoded = Buffer.from(base64Part, "base64").toString("utf8");
        const b64Match = decoded.match(/(20[0-2][0-9])/);
        if (b64Match) return parseInt(b64Match[1], 10);
      } catch (e) {}
    }
  }

  const titleMatch = (title || "").match(/(20[0-2][0-9])년?/);
  if (titleMatch) return parseInt(titleMatch[1], 10);

  return null;
}

// 6. 실제 원본 URL 및 도메인 정밀 추출
function extractRealSourceInfo(item) {
  let realUrl = item.link || "";
  let domain = "";

  if (item.thumbnail && item.thumbnail.includes("src=")) {
    try {
      const match = item.thumbnail.match(/src=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (decoded.startsWith("http")) {
          realUrl = decoded;
        }
      }
    } catch {}
  }

  try {
    const parsed = new URL(realUrl);
    domain = parsed.hostname.toLowerCase();
  } catch {
    domain = "unknown";
  }

  return { realUrl, domain };
}

// 7. 출처 도메인 신뢰도 평가
function evaluateSourceDomain(domain, realUrl) {
  const isRejected = /pinterest|shutterstock|getty|istock|alamy|123rf|aliexpress|coupang|gmarket|11st|auction|tmon|smartstore/i.test(domain + " " + realUrl);
  if (isRejected) {
    return { score: 0, tier: "D", reason: "스톡/쇼핑몰/재배포 사이트 (자동 탈락)" };
  }

  const isGovOrOfficial = /\.go\.kr|\.or\.kr|visitkorea|mcst|museum|korea\.kr|dureraum|f1963|clayarch|ottchil|geojeart|tongdosa|nmm\.go\.kr/i.test(domain + " " + realUrl);
  if (isGovOrOfficial) {
    return { score: 40, tier: "A", reason: "공공기관 및 공식 기관 출처 (+40점)" };
  }

  const isNews = /imgnews\.naver\.net|news\.naver\.com|yonhapnews|donga|chosun|khan|hani|busan\.com|knnews|idomin|ksilbo|iusm|newsis|news1/i.test(domain + " " + realUrl);
  if (isNews) {
    return { score: 30, tier: "B", reason: "언론사 보도 사진 출처 (+30점)" };
  }

  const isBlog = /blogfiles\.naver\.net|pup-post-phinf\.pstatic\.net|blog\.naver\.com|post\.naver\.com|cafe\.naver\.com|pstatic\.net|tistory|daum\.net/i.test(domain + " " + realUrl);
  if (isBlog) {
    return { score: 15, tier: "C", reason: "블로그/포스트 출처 (+15점)" };
  }

  return { score: 10, tier: "C", reason: "일반 웹페이지 출처 (+10점)" };
}

// 8. 제목 일치도 평가
function evaluateTitleAndContext(rawTitle, venue) {
  const cleanTitle = (rawTitle || "").replace(/<[^>]*>?/gm, "").trim();
  let titleScore = 0;
  let regionScore = 0;
  let rejectReason = null;

  const badKeywords = /피규어|장난감|애니|웹툰|네일|헤어|성형|다이어트|쿠폰|분양|매매|협찬광고|인형/i;
  if (badKeywords.test(cleanTitle)) {
    return { total: 0, titleScore: 0, regionScore: 0, cleanTitle, rejectReason: `부정 키워드 감지 (${cleanTitle})` };
  }

  if (cleanTitle.includes(venue.place_name)) {
    titleScore = 25;
  } else {
    const words = venue.place_name.split(/\s+/).filter(w => w.length > 1);
    const matchedWords = words.filter(w => cleanTitle.includes(w));
    if (matchedWords.length > 0) {
      titleScore = 15;
    } else {
      titleScore = 5;
    }
  }

  if (cleanTitle.includes(venue.region) || (venue.sub_region && cleanTitle.includes(venue.sub_region))) {
    regionScore = 10;
  } else {
    regionScore = 5;
  }

  return {
    total: titleScore + regionScore,
    titleScore,
    regionScore,
    cleanTitle,
    rejectReason
  };
}

// 9. Vision 및 최신성 평가
function evaluateImageVisionHeuristic(title, item, sourceTier, year) {
  const isPoster = /포스터|배너|현수막|일정표|안내문|요금표/i.test(title);
  const isFoodOnly = /먹방|존맛|맛집추천|카페디저트|메뉴판|케이크/i.test(title);
  const isRealPlace = /전경|외관|건물|입구|전시실|서가|광장|풍경|거리/i.test(title);

  let isDisqualified = false;
  let failReason = "";

  // 2022년 이전 과거 아카이브 엄격 탈락
  if (year && year < 2023) {
    isDisqualified = true;
    failReason = `과거 아카이브 사진 (${year}년 - 최신성 미달)`;
  } else if (isPoster) {
    isDisqualified = true;
    failReason = "포스터/안내문 배너";
  } else if (isFoodOnly && !title.includes("시장")) {
    isDisqualified = true;
    failReason = "음식 단독 촬영";
  }

  let visionScore = isDisqualified ? 0 : (isRealPlace ? 15 : 12);
  let qualityScore = isDisqualified ? 0 : (sourceTier === "A" || sourceTier === "B" ? 10 : 8);

  if (year && year >= 2024 && !isDisqualified) {
    qualityScore += 5;
  }

  return {
    is_disqualified: isDisqualified,
    fail_reason: failReason,
    vision_score: visionScore,
    quality_score: qualityScore,
    total_vision: visionScore + qualityScore,
    notes: isDisqualified ? failReason : (year ? `${year}년 최신 현장 실사` : "최신 현장 실사 사진")
  };
}

// 10. 전체 60개 명소 통합 파이프라인 가동
export async function runAll60VenuesPipeline() {
  console.log("==================================================");
  console.log("🚀 [나드리 AI] 전체 60개 명소 2024~2026 최신 실사 전면 수집 가동");
  console.log("==================================================");

  const allCandidates = [];
  const venueSummary = [];
  const usedUrls = new Set();

  for (let i = 0; i < ALL_60_VENUES.length; i++) {
    const venue = ALL_60_VENUES[i];
    console.log(`\n📍 [${i + 1}/${ALL_60_VENUES.length}] ${venue.place_name} (${venue.region} ${venue.sub_region})`);

    const queries = generateSearchQueries(venue);
    const rawItems = [];

    for (const q of queries) {
      const items = await fetchNaverImages(q, 4);
      for (const it of items) {
        if (!rawItems.some(existing => existing.link === it.link)) {
          rawItems.push({ ...it, query: q });
        }
      }
    }

    console.log(`  📥 수집 후보: ${rawItems.length}장`);

    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let mismatchedCount = 0;
    let officialSourceCount = 0;
    const approvedList = [];

    for (const item of rawItems) {
      const { realUrl, domain } = extractRealSourceInfo(item);
      const sourceEval = evaluateSourceDomain(domain, realUrl);
      const titleEval = evaluateTitleAndContext(item.title, venue);
      const photoYear = extractYear(realUrl, item.title);

      if (sourceEval.tier === "A" || sourceEval.tier === "B") {
        officialSourceCount++;
      }

      let rejectReason = sourceEval.tier === "D" ? sourceEval.reason : titleEval.rejectReason;
      let isRejected = !!rejectReason;

      let visionEval = { total_vision: 0, vision_score: 0, quality_score: 0, notes: "" };
      if (!isRejected) {
        visionEval = evaluateImageVisionHeuristic(titleEval.cleanTitle, item, sourceEval.tier, photoYear);
        if (visionEval.is_disqualified) {
          isRejected = true;
          rejectReason = `Vision/최신성 탈락: ${visionEval.fail_reason}`;
          mismatchedCount++;
        }
      }

      const totalScore = isRejected ? 0 : (sourceEval.score + titleEval.total + visionEval.total_vision);

      let status = "rejected";
      if (!isRejected) {
        if (totalScore >= 75 && (sourceEval.tier === "A" || sourceEval.tier === "B" || titleEval.titleScore === 25)) {
          status = "approved";
        } else if (totalScore >= 60) {
          status = "pending";
        } else {
          status = "rejected";
          rejectReason = "총점 60점 미만";
        }
      }

      if (status === "approved") {
        if (!usedUrls.has(realUrl) && approvedList.length < 3) {
          approvedCount++;
          approvedList.push({
            url: realUrl,
            thumbnail: item.thumbnail,
            title: titleEval.cleanTitle,
            score: totalScore,
            source_domain: domain,
            source_tier: sourceEval.tier,
            photo_year: photoYear
          });
          usedUrls.add(realUrl);
        } else {
          status = "pending";
          pendingCount++;
        }
      } else if (status === "pending") {
        pendingCount++;
      } else {
        rejectedCount++;
      }

      allCandidates.push({
        candidate_id: `cand-${venue.place_id}-${allCandidates.length + 1}`,
        place_id: venue.place_id,
        place_name: venue.place_name,
        category: venue.category,
        region: venue.region,
        search_query: item.query,
        image_url: realUrl,
        thumbnail_url: item.thumbnail,
        original_source_url: realUrl,
        title: titleEval.cleanTitle,
        source_domain: domain,
        source_tier: sourceEval.tier,
        photo_year: photoYear,
        fetched_at: new Date().toISOString(),
        status,
        score: totalScore,
        score_breakdown: {
          source_score: sourceEval.score,
          title_score: titleEval.titleScore,
          region_score: titleEval.regionScore,
          vision_score: visionEval.vision_score,
          quality_score: visionEval.quality_score
        },
        vision_notes: visionEval.notes,
        reject_reason: rejectReason
      });
    }

    venueSummary.push({
      index: i + 1,
      place_id: venue.place_id,
      place_name: venue.place_name,
      category: venue.category === "venue" ? "미술관/문화공간" : venue.category === "library" ? "특화도서관" : venue.category === "market" ? "전통시장" : "힐링/자연",
      region: venue.region,
      sub_region: venue.sub_region,
      total_candidates: rawItems.length,
      approved_count: approvedList.length,
      pending_count: pendingCount,
      rejected_count: rejectedCount,
      mismatched_detected: mismatchedCount,
      official_source_ratio: rawItems.length > 0 ? ((officialSourceCount / rawItems.length) * 100).toFixed(1) + "%" : "0%",
      use_placeholder: approvedList.length === 0,
      approved_images: approvedList
    });

    console.log(`  ✅ [선별 완료] Approved: ${approvedList.length}장 | Pending: ${pendingCount}장 | Rejected: ${rejectedCount}장`);
  }

  // 전체 데이터 저장 (과거 데이터 완전히 덮어쓰기)
  const candidatesPath = path.join(rootDir, "public", "data", "naver-image-candidates.json");
  fs.writeFileSync(candidatesPath, JSON.stringify(allCandidates, null, 2), "utf8");

  const summaryPath = path.join(rootDir, "scripts", "naver_all_60_venues_audit_result.json");
  fs.writeFileSync(summaryPath, JSON.stringify(venueSummary, null, 2), "utf8");

  console.log("\n==================================================");
  console.log(`🎉 전체 60개 명소 2024~2026 최신 실사 수집 완료!`);
  console.log(`- 전체 명소 수: ${ALL_60_VENUES.length}곳`);
  console.log(`- 총 수집 후보: ${allCandidates.length}건`);
  console.log(`- 최종 Approved 자산: ${allCandidates.filter(c => c.status === "approved").length}건`);
  console.log(`- 관리자 검토 Pending: ${allCandidates.filter(c => c.status === "pending").length}건`);
  console.log(`- 부적격/과거 탈락 Rejected: ${allCandidates.filter(c => c.status === "rejected").length}건`);
  console.log(`- 저장 파일: public/data/naver-image-candidates.json`);
  console.log("==================================================");

  return { allCandidates, venueSummary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAll60VenuesPipeline();
}
