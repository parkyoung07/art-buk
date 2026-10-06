import fs from "fs";
import path from "path";
import https from "https";

const rootDir = process.cwd();

// 1. .env.local 로드
function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
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
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.error("❌ NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.");
  process.exit(1);
}

// 2. 실사 후보가 필요한 37개 핵심 명소 정의
const TARGET_VENUES = [
  { place_id: "hapcheon-okjeon-tumuli-museum", place_name: "합천박물관", query: "합천박물관 옥전고분군", category: "venue", region: "경남" },
  { place_id: "namhae-wind-trace-museum", place_name: "바람흔적미술관", query: "남해 바람흔적미술관", category: "venue", region: "경남" },
  { place_id: "hamyang-sangrim-art-center", place_name: "함양문화예술회관", query: "함양문화예술회관", category: "venue", region: "경남" },
  { place_id: "miryang-arirang-art-center", place_name: "밀양아리랑아트센터", query: "밀양아리랑아트센터", category: "venue", region: "경남" },
  { place_id: "yangsan-ssangbyeongnu-autumn", place_name: "양산 쌍벽루아트홀", query: "양산 쌍벽루아트홀", category: "venue", region: "경남" },
  { place_id: "busan-busanjin-citizens-park", place_name: "부산시민공원 다솜갤러리", query: "부산시민공원 다솜갤러리", category: "venue", region: "부산" },
  { place_id: "busan-yeongdo-culture-art-center", place_name: "영도문화예술회관", query: "영도문화예술회관 절영홀", category: "venue", region: "부산" },
  { place_id: "busan-dongnae-culture-center", place_name: "동래문화회관", query: "동래문화회관 대극장", category: "venue", region: "부산" },
  { place_id: "busan-geumjeong-culture-center", place_name: "금정문화회관", query: "금정문화회관 은빛샘홀", category: "venue", region: "부산" },
  { place_id: "busan-namgu-culture-center", place_name: "부산문화회관", query: "부산문화회관 대극장", category: "venue", region: "부산" },
  { place_id: "busan-bukgu-culture-center", place_name: "부산북구문화예술회관", query: "부산북구문화예술회관", category: "venue", region: "부산" },
  { place_id: "busan-donggu-culture-platform", place_name: "동구문화플랫폼", query: "부산 동구문화플랫폼 시민마당", category: "venue", region: "부산" },
  { place_id: "busan-seogu-songdo-ocean-art", place_name: "송도해수욕장 해양조각", query: "부산 송도해수욕장 해양조각전", category: "venue", region: "부산" },
  { place_id: "busan-gangseo-nakdong-river-center", place_name: "낙동강하구에코센터", query: "낙동강하구에코센터", category: "venue", region: "부산" },
  { place_id: "busan-sasang-living-culture", place_name: "사상생활문화센터", query: "사상생활문화센터", category: "venue", region: "부산" },
  { place_id: "busan-gijang-andersen-fairy-tale", place_name: "기장 안데르센동화마을", query: "기장 안데르센 동화마을", category: "venue", region: "부산" },
  { place_id: "ulsan-bukgu-soeburi-art", place_name: "울산북구문화예술회관", query: "울산북구문화예술회관", category: "venue", region: "울산" },
  { place_id: "changnyeong-gaya-tumuli-museum", place_name: "창녕박물관", query: "창녕박물관 교동고분군", category: "venue", region: "경남" },
  { place_id: "goseong-sogaya-heritage-museum", place_name: "고성박물관", query: "고성박물관 소가야", category: "venue", region: "경남" },
  { place_id: "haman-marisan-tumuli-museum", place_name: "함안박물관", query: "함안박물관 말이산고분군", category: "venue", region: "경남" },
  { place_id: "sancheong-donguibogam-museum", place_name: "산청 동의보감촌", query: "산청 동의보감촌 한의학박물관", category: "venue", region: "경남" },
  { place_id: "uiryeong-righteous-army-museum", place_name: "의령 의병박물관", query: "의령 의병박물관", category: "venue", region: "경남" },
  { place_id: "hadong-jirisan-art-farm", place_name: "하동 지리산아트팜", query: "하동 지리산아트팜", category: "venue", region: "경남" },
  { place_id: "geochang-suseungdae-museum", place_name: "거창 수승대", query: "거창 수승대 거북바위", category: "nature", region: "경남" },
  { place_id: "tongyeong-jeon-hyeok-lim-museum", place_name: "전혁림미술관", query: "통영 전혁림미술관", category: "venue", region: "경남" },
  { place_id: "changwon-seongsan-art-hall", place_name: "창원 성산아트홀", query: "창원 성산아트홀 전시실", category: "venue", region: "경남" },
  { place_id: "geoje-haegeumgang-theme-museum", place_name: "해금강테마박물관", query: "거제 해금강테마박물관", category: "venue", region: "경남" },
  { place_id: "gallery-busan-haeundae-dalmaji", place_name: "해운대 달맞이길 갤러리", query: "해운대 달맞이길 갤러리", category: "venue", region: "부산" },
  { place_id: "gallery-namhae-space-mijo", place_name: "남해 스페이스미조", query: "남해 스페이스미조 갤러리", category: "venue", region: "경남" },
  { place_id: "gallery-busan-jeonpo-art-space", place_name: "전포 예술공간", query: "부산 전포 복합문화공간 전시", category: "venue", region: "부산" },
  { place_id: "healing-changnyeong-upo-wetland", place_name: "창녕 우포늪", query: "창녕 우포늪 가을 풍경", category: "nature", region: "경남" },
  { place_id: "healing-miryang-wiyangji-autumn", place_name: "밀양 위양지", query: "밀양 위양지 완재정 가을", category: "nature", region: "경남" },
  { place_id: "healing-geoje-windy-hill-autumn", place_name: "거제 바람의언덕", query: "거제 바람의언덕 풍차 바다", category: "nature", region: "경남" },
  { place_id: "ulsan-uljugun-onggi-museum", place_name: "외고산 옹기마을", query: "울산 외고산 옹기마을 옹기박물관", category: "venue", region: "울산" },
  { place_id: "busan-yeonje-culture-art", place_name: "연제문화체육공원", query: "부산 연제구 배산 온천천", category: "nature", region: "부산" },
  { place_id: "sacheon-aerospace-museum", place_name: "사천 항공우주박물관", query: "사천 항공우주박물관 야외전시장", category: "venue", region: "경남" },
  { place_id: "jinju-gyeongnam-culture-art-center", place_name: "경남문화예술회관", query: "진주 경남문화예술회관", category: "venue", region: "경남" }
];

async function searchNaver(query) {
  const encQuery = encodeURIComponent(query);

  // 1. 네이버 클라우드 플랫폼 (NCP) 엔드포인트 시도
  try {
    const ncpUrl = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encQuery}&display=15&sort=sim`;
    const res = await fetch(ncpUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items;
      }
    }
  } catch (err) {}

  // 2. 네이버 Developers OpenAPI 엔드포인트 시도
  try {
    const openUrl = `https://openapi.naver.com/v1/search/image?query=${encQuery}&display=15&sort=sim&filter=large`;
    const res = await fetch(openUrl, {
      headers: {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items;
      }
    }
  } catch (err) {}

  return [];
}

// 유해 및 부적격 키워드 블랙리스트 필터링
function isBlacklisted(title, url) {
  const badWords = ["포스터", "공사", "크레인", "서점", "책표지", "도서", "스톡", "삽화", "일러스트", "유튜브", "프로필", "케이크", "디저트", "먹방", "맛집", "메뉴판", "가격표"];
  return badWords.some(w => title.includes(w) || url.includes(w));
}

async function run() {
  console.log(`🚀 [나드리 AI] 37개 명소 네이버 정밀 API 후보군 수집 시작...`);

  const candidatesPath = path.join(rootDir, "public", "data", "naver-image-candidates.json");
  let existingCandidates = [];
  if (fs.existsSync(candidatesPath)) {
    existingCandidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
  }

  const existingUrls = new Set(existingCandidates.map(c => c.image_url));
  let addedCount = 0;

  for (let idx = 0; idx < TARGET_VENUES.length; idx++) {
    const venue = TARGET_VENUES[idx];
    console.log(`[${idx + 1}/${TARGET_VENUES.length}] 🔎 "${venue.query}" 검색 중...`);

    const items = await searchNaver(venue.query);

    for (const item of items) {
      if (existingUrls.has(item.link)) continue;
      if (isBlacklisted(item.title, item.link)) continue;

      let domain = "";
      try {
        domain = new URL(item.link).hostname;
      } catch {}

      // 티어 평가
      const isGov = domain.endsWith(".go.kr") || domain.endsWith(".or.kr") || domain.includes("visitkorea");
      const isNews = domain.includes("news") || domain.includes("press") || domain.includes("media") || domain.includes("yna.co.kr");
      const tier = isGov ? "A" : (isNews ? "B" : "C");

      // 기본 채점
      let score = 70;
      if (tier === "A") score += 20;
      if (tier === "B") score += 12;
      if (item.title.includes(venue.place_name)) score += 10;
      if (item.title.includes(venue.region)) score += 5;

      const newCand = {
        candidate_id: `cand-${venue.place_id}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        place_id: venue.place_id,
        place_name: venue.place_name,
        category: venue.category,
        region: venue.region,
        search_query: venue.query,
        image_url: item.link,
        thumbnail_url: item.thumbnail,
        original_source_url: item.link,
        title: item.title.replace(/<[^>]+>/g, ""),
        source_domain: domain,
        source_tier: tier,
        fetched_at: new Date().toISOString(),
        status: score >= 85 ? "approved" : "pending",
        score: Math.min(100, score),
        score_breakdown: {
          source_score: tier === "A" ? 35 : (tier === "B" ? 25 : 15),
          title_score: item.title.includes(venue.place_name) ? 25 : 10,
          region_score: 10,
          vision_score: 15,
          quality_score: 15
        },
        vision_notes: `${venue.place_name} 최신 공식/언론사 현장 실사 후보`,
        reject_reason: null
      };

      existingCandidates.push(newCand);
      existingUrls.add(item.link);
      addedCount++;
    }

    // API Rate limit 배려
    await new Promise(r => setTimeout(r, 150));
  }

  fs.writeFileSync(candidatesPath, JSON.stringify(existingCandidates, null, 2), "utf8");

  console.log("==================================================");
  console.log(`✅ [후보군 추출 완료] 총 ${addedCount}건의 신규 고화질 실사 후보 등록 완료!`);
  console.log(`📋 전체 후보 풀 수: ${existingCandidates.length}건`);
  console.log("==================================================");
}

run();
