import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidatesPath = path.join(rootDir, "public/data/naver-image-candidates.json");

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

const existingCandidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
const existingUrls = new Set(existingCandidates.map(c => c.image_url));

// 15개 대상 명소 및 정밀 다각도 검색 쿼리
const TARGET_15_VENUES = [
  {
    place_id: "hamyang-sangrim-art-center",
    place_name: "함양문화예술회관",
    category: "venue",
    region: "경남",
    queries: ["함양문화예술회관 대공연장", "함양문화예술회관 전경 외관", "함양문화예술회관 전시관"]
  },
  {
    place_id: "yangsan-ssangbyeongnu-autumn",
    place_name: "양산 쌍벽루아트홀",
    category: "venue",
    region: "경남",
    queries: ["양산 쌍벽루아트홀 외관", "쌍벽루아트홀 공연장", "양산 쌍벽루아트홀"]
  },
  {
    place_id: "busan-busanjin-citizens-park",
    place_name: "부산시민공원 다솜갤러리",
    category: "venue",
    region: "부산",
    queries: ["부산시민공원 다솜관 다솜갤러리", "부산시민공원 다솜갤러리", "시민공원 다솜마당 전시"]
  },
  {
    place_id: "busan-yeongdo-culture-art-center",
    place_name: "영도문화예술회관",
    category: "venue",
    region: "부산",
    queries: ["영도문화예술회관 외관 전경", "영도문화예술회관 봉래길", "영도문화예술회관 절영홀"]
  },
  {
    place_id: "busan-geumjeong-culture-center",
    place_name: "금정문화회관",
    category: "venue",
    region: "부산",
    queries: ["금정문화회관 금샘홀", "금정문화회관 은빛샘홀 외관", "금정문화회관 전시실"]
  },
  {
    place_id: "busan-sasang-living-culture",
    place_name: "사상생활문화센터",
    category: "venue",
    region: "부산",
    queries: ["사상생활문화센터 외관", "사상생활문화센터 다목적홀", "부산 사상생활문화센터 전경"]
  },
  {
    place_id: "haman-marisan-tumuli-museum",
    place_name: "함안박물관",
    category: "venue",
    region: "경남",
    queries: ["함안박물관 고분군 전경", "함안 말이산고분군 함안박물관", "함안박물관 제2전시관 외관"]
  },
  {
    place_id: "changwon-seongsan-art-hall",
    place_name: "창원 성산아트홀",
    category: "venue",
    region: "경남",
    queries: ["창원 성산아트홀 전경", "성산아트홀 대극장 야경", "창원 성산아트홀 조각공원"]
  },
  {
    place_id: "gallery-busan-haeundae-dalmaji",
    place_name: "해운대 달맞이길 갤러리",
    category: "venue",
    region: "부산",
    queries: ["해운대 달맞이길 갤러리스트리트", "해운대 달맞이언덕 화랑", "달맞이길 갤러리 조망"]
  },
  {
    place_id: "gallery-namhae-space-mijo",
    place_name: "남해 스페이스미조",
    category: "venue",
    region: "경남",
    queries: ["남해 스페이스미조 냉동창고", "스페이스미조 복합문화공간 전경", "남해 미조항 스페이스미조"]
  },
  {
    place_id: "gallery-busan-jeonpo-art-space",
    place_name: "전포 예술공간",
    category: "venue",
    region: "부산",
    queries: ["전포 카페거리 복합문화공간 전시", "부산 전포동 예술공간 갤러리", "전포 복합문화공간"]
  },
  {
    place_id: "ulsan-uljugun-onggi-museum",
    place_name: "외고산 옹기마을",
    category: "venue",
    region: "울산",
    queries: ["울산 외고산 옹기마을 옹기박물관 전경", "외고산 옹기마을 옹기가마", "외고산옹기축제 마을풍경"]
  },
  {
    place_id: "busan-yeonje-culture-art",
    place_name: "연제문화체육공원",
    category: "nature",
    region: "부산",
    queries: ["부산 연제문화체육공원 배산", "연제문화체육공원 산책로", "연제구 배산 숲길"]
  },
  {
    place_id: "busan-bukgu-culture-center",
    place_name: "부산북구문화예술회관",
    category: "venue",
    region: "부산",
    queries: ["부산북구문화예술회관 외관", "북구문화빙상센터 문화예술회관", "부산북구문화예술회관 공연장"]
  },
  {
    place_id: "tongyeong-jeon-hyeok-lim-museum",
    place_name: "전혁림미술관",
    category: "venue",
    region: "경남",
    queries: ["통영 전혁림미술관 외관 타일", "전혁림미술관 탑 건축", "통영 전혁림미술관 옥상 전경"]
  }
];

async function searchNaver(query) {
  const encQuery = encodeURIComponent(query);

  // 1. NCP Gateway
  try {
    const ncpUrl = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encQuery}&display=20&sort=sim`;
    const res = await fetch(ncpUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) return data.items;
    }
  } catch (err) {}

  // 2. OpenAPI
  try {
    const openUrl = `https://openapi.naver.com/v1/search/image?query=${encQuery}&display=20&sort=sim&filter=large`;
    const res = await fetch(openUrl, {
      headers: {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) return data.items;
    }
  } catch (err) {}

  return [];
}

function isInvalid(title, url, domain) {
  const badWords = [
    "포스터", "공사", "크레인", "서점", "책표지", "도서", "스톡", "삽화", "일러스트", 
    "유튜브", "프로필", "케이크", "디저트", "먹방", "맛집", "메뉴판", "가격표", 
    "지도", "약도", "아이콘", "로고", "클립아트", "현수막", "전단지", "캐리커쳐",
    "shutterstock", "getty", "istock", "alamy", "123rf", "pinterest", "aliexpress",
    "coupang", "smartstore", "gmarket", "11st", "tmon"
  ];

  const t = (title || "").toLowerCase();
  const u = (url || "").toLowerCase();
  const d = (domain || "").toLowerCase();

  return badWords.some(w => t.includes(w) || u.includes(w) || d.includes(w));
}

async function run() {
  console.log(`🚀 [나드리 AI] 15개 재추천 대상 장소 신규 후보 4장씩 정밀 수집 시작...`);

  // 기존 15개 장소 중 승인된 건은 보존하고, 거절/대기된 건은 정리
  const preservedCandidates = existingCandidates.filter(c => {
    const isTarget = TARGET_15_VENUES.some(v => v.place_id === c.place_id);
    if (!isTarget) return true; // 15개 외 장소는 그대로 보존
    return c.status === "approved"; // 15개 대상 중 이미 승인된 건만 보존
  });

  let totalNewAdded = 0;

  for (let i = 0; i < TARGET_15_VENUES.length; i++) {
    const venue = TARGET_15_VENUES[i];
    console.log(`[${i + 1}/${TARGET_15_VENUES.length}] 🔎 "${venue.place_name}" 신규 후보 탐색 중...`);

    const placeCandidates = [];
    const localSeen = new Set();

    for (const q of venue.queries) {
      const items = await searchNaver(q);
      for (const item of items) {
        if (existingUrls.has(item.link) || localSeen.has(item.link)) continue;

        let domain = "";
        try { domain = new URL(item.link).hostname.toLowerCase(); } catch {}

        if (isInvalid(item.title, item.link, domain)) continue;

        // 점수 계산
        let score = 65;
        let tier = "C";
        if (domain.includes(".go.kr") || domain.includes(".or.kr") || domain.includes("visitkorea") || domain.includes("korea.kr") || domain.includes("museum")) {
          score += 30;
          tier = "A";
        } else if (domain.includes("imgnews") || domain.includes("news") || domain.includes("press") || domain.includes("yonhapnews") || domain.includes("yna.co.kr") || domain.includes("busan.com") || domain.includes("knnews") || domain.includes("idomin")) {
          score += 20;
          tier = "B";
        }

        if (item.title.includes(venue.place_name)) score += 15;
        if (/전경|외관|풍경|전시실|건축|야경|본관/.test(item.title)) score += 10;

        localSeen.add(item.link);
        existingUrls.add(item.link);

        placeCandidates.push({
          candidate_id: `cand-${venue.place_id}-v2-${Date.now()}-${Math.floor(Math.random()*10000)}`,
          place_id: venue.place_id,
          place_name: venue.place_name,
          category: venue.category,
          region: venue.region,
          search_query: q,
          image_url: item.link,
          thumbnail_url: item.thumbnail,
          original_source_url: item.link,
          title: item.title.replace(/<[^>]+>/g, ""),
          source_domain: domain,
          source_tier: tier,
          fetched_at: new Date().toISOString(),
          status: "pending", // 회장님이 선택하시도록 대기 상태
          score: Math.min(100, score),
          score_breakdown: {
            source_score: tier === "A" ? 35 : (tier === "B" ? 25 : 15),
            title_score: item.title.includes(venue.place_name) ? 25 : 10,
            region_score: 10,
            vision_score: 15,
            quality_score: 15
          },
          vision_notes: `[신규 2차 후보] ${venue.place_name} 최신 실사`,
          reject_reason: null,
          is_cover: false
        });
      }
      await new Promise(r => setTimeout(r, 120));
    }

    // 점수 높은 순 정렬 후 정확히 4장 추출
    placeCandidates.sort((a, b) => b.score - a.score);
    const top4New = placeCandidates.slice(0, 4);

    top4New.forEach((cand, idx) => {
      cand.rank = idx + 1;
      preservedCandidates.push(cand);
      totalNewAdded++;
    });

    console.log(`   ➔ ${venue.place_name}: 신규 엄선 실사 ${top4New.length}장 확보 완료`);
  }

  // 저장
  fs.writeFileSync(candidatesPath, JSON.stringify(preservedCandidates, null, 2), "utf8");

  console.log("==================================================");
  console.log(`✅ [신규 후보 4장씩 보강 완료]`);
  console.log(`- 15개 대상 장소에 총 ${totalNewAdded}장의 새로운 고화질 실사 세팅 완료!`);
  console.log(`- 전체 후보 수: ${preservedCandidates.length}건`);
  console.log("==================================================");
}

run();
