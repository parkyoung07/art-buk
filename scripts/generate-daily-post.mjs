import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. .env.local 또는 .env 파일 로드 함수 (외부 라이브러리 없이 직접 파싱)
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY가 설정되지 않았습니다.");
  process.exit(1);
}

// 네이버 API HUB 다채로운 검색 호출 함수 (맛집, 볼거리, 행사, 블로그 후기)
async function fetchNaverSearchData(venueName, region) {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.warn("ℹ️ NAVER API 키 없음: 네이버 실시간 검색 데이터를 건너뜁니다.");
    return { blogReviews: [], localRestaurants: [], nearbyAttractions: [], localEvents: [] };
  }

  const cleanVenue = venueName.split(" 및 ")[0].split(" (")[0].trim();
  const baseHeaders = {
    "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
    "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
  };

  try {
    // 1. 블로그 생생 후기 검색
    const blogUrl = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(cleanVenue + " 전시")}&display=3&sort=sim`;
    const blogRes = await fetch(blogUrl, { headers: baseHeaders });
    const blogData = blogRes.ok ? await blogRes.json() : { items: [] };

    // 2. 전시장 주변 인기 맛집 & 감성 카페 검색
    const foodUrl = `https://naverapihub.apigw.ntruss.com/search/v1/local?query=${encodeURIComponent(cleanVenue + " 맛집 카페")}&display=4&sort=comment`;
    const foodRes = await fetch(foodUrl, { headers: baseHeaders });
    const foodData = foodRes.ok ? await foodRes.json() : { items: [] };

    // 3. 전시장 주변 가볼 만한 곳 & 핫플레이스 볼거리 검색
    const spotUrl = `https://naverapihub.apigw.ntruss.com/search/v1/local?query=${encodeURIComponent(region + " " + cleanVenue + " 가볼만한곳")}&display=3&sort=comment`;
    const spotRes = await fetch(spotUrl, { headers: baseHeaders });
    const spotData = spotRes.ok ? await spotRes.json() : { items: [] };

    // 4. 주변 최신 문화 행사 & 축제 뉴스 검색
    const newsUrl = `https://naverapihub.apigw.ntruss.com/search/v1/news?query=${encodeURIComponent(region + " 문화 행사 축제")}&display=3&sort=sim`;
    const newsRes = await fetch(newsUrl, { headers: baseHeaders });
    const newsData = newsRes.ok ? await newsRes.json() : { items: [] };

    return {
      blogReviews: (blogData.items || []).map(item => ({
        title: (item.title || "").replace(/<[^>]*>?/gm, ""),
        description: (item.description || "").replace(/<[^>]*>?/gm, ""),
        blogger: item.bloggername || "네이버 블로거"
      })),
      localRestaurants: (foodData.items || []).map(item => ({
        title: (item.title || "").replace(/<[^>]*>?/gm, ""),
        category: (item.category || "").split(">").pop() || "맛집/카페",
        address: item.roadAddress || item.address || ""
      })),
      nearbyAttractions: (spotData.items || []).map(item => ({
        title: (item.title || "").replace(/<[^>]*>?/gm, ""),
        category: (item.category || "").split(">").pop() || "명소",
        address: item.roadAddress || item.address || ""
      })),
      localEvents: (newsData.items || []).map(item => ({
        title: (item.title || "").replace(/<[^>]*>?/gm, ""),
        description: (item.description || "").replace(/<[^>]*>?/gm, "").slice(0, 100)
      }))
    };
  } catch (err) {
    console.warn("⚠️ 네이버 검색 API 호출 중 오류:", err.message);
    return { blogReviews: [], localRestaurants: [], nearbyAttractions: [], localEvents: [] };
  }
}

// 2. 부울경 전시 후보 풀 (추후 공공데이터 API와 결합 가능)
const EXHIBITION_POOL = [
  {
    slug: "busan-museum-of-art-modern",
    title: "부산시립미술관 기획전 : 공간과 시간의 경계",
    region: "부산",
    subRegion: "해운대구",
    venueName: "부산시립미술관",
    address: "부산광역시 해운대구 APEC로 58",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "부산시립미술관", "해운대데이트", "센텀시티", "현대미술", "가을전시"],
    photoKeywords: "art museum gallery modern sculpture minimalist",
    summary: "센텀시티 도심 속 예술의 오아시스 부산시립미술관의 특별 기획전! 시공간을 초월하는 현대미술 대작들과 벡스코, 영화의전당 나들이 코스를 총정리합니다.",
    nearbySpots: ["영화의전당", "신세계 센텀시티", "APEC 나루공원", "벡스코 야외광장"]
  },
  {
    slug: "ulsan-art-museum-sound-light",
    title: "울산시립미술관 미디어아트전 : 빛과 파동의 교향곡",
    region: "울산",
    subRegion: "중구",
    venueName: "울산시립미술관",
    address: "울산광역시 중구 미술관길 72",
    period: "2026.09.10 ~ 2026.12.20",
    price: "1,000원",
    category: "전시 리뷰",
    tags: ["울산전시", "울산시립미술관", "미디어아트", "울산중구", "실감체험", "태화강데이트"],
    photoKeywords: "digital art media immersive projection light show neon",
    summary: "세계적인 미디어 아티스트들이 빚어내는 환상적인 빛과 소리의 향연! 단돈 1천 원으로 즐기는 초대형 몰입형 미디어아트와 성남동 문화의 거리 감성 투어.",
    nearbySpots: ["성남동 문화의거리", "태화강 국가정원 십리대숲", "울산 동헌", "젊음의거리 맛집"]
  },
  {
    slug: "gyeongnam-jinju-national-museum",
    title: "국립진주박물관 특별전 : 남강의 역사와 영남의 미학",
    region: "경남",
    subRegion: "진주시",
    venueName: "국립진주박물관 (진주성 내)",
    address: "경상남도 진주시 남강로 626-35 (본성동, 진주성)",
    period: "2026.09.05 ~ 2026.11.25",
    price: "무료 (진주성 입장료 별도)",
    category: "전시 리뷰",
    tags: ["경남전시", "국립진주박물관", "진주성", "촉석루", "진주데이트", "가을여행"],
    photoKeywords: "ancient artifacts museum gallery historical pottery ceramic",
    summary: "유유히 흐르는 남강과 우아한 진주성 내에 위치한 국립진주박물관의 가을 특별전! 영남의 역사적 숨결과 촉석루, 남강 산책로를 아우르는 낭만 예술 투어.",
    nearbySpots: ["촉석루", "진주성 공북문", "남강 유등체험관", "진주 중앙시장 육회비빔밥거리"]
  },
  {
    slug: "tongyeong-ottchil-art-museum",
    title: "통영 옻칠미술관 기획전 : 천년의 빛, 현대 옻칠 조형전",
    region: "경남",
    subRegion: "통영시",
    venueName: "통영옻칠미술관",
    address: "경상남도 통영시 용남면 미지해안로 160",
    period: "2026.09.15 ~ 2026.12.15",
    price: "성인 3,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "통영전시", "통영옻칠미술관", "한국전통공예", "남해안드라이브", "통영나들이"],
    photoKeywords: "lacquer art wooden craft traditional mother of pearl sculpture",
    summary: "청정 남해 바다를 배경으로 영롱하게 빛나는 현대 옻칠 회화와 나전칠기 예술! 한국 옻칠 예술의 진수를 맛보는 통영 바다 드라이브 코스.",
    nearbySpots: ["동피랑 벽화마을", "이순신공원", "통영 해저터널", "서호시장 전통먹거리"]
  },
  {
    slug: "busan-cinema-center-media-art",
    title: "부산 영화의전당 비프힐 기획전 : 시네마틱 아트와 스크린의 미래",
    region: "부산",
    subRegion: "해운대구",
    venueName: "영화의전당 비프힐 1층",
    address: "부산광역시 해운대구 수영강변대로 120",
    period: "2026.09.01 ~ 2026.10.31",
    price: "성인 6,000원",
    category: "전시 리뷰",
    tags: ["부산전시", "영화의전당", "시네마틱아트", "해운대전시", "수영강산책", "영화제핫플"],
    photoKeywords: "cinema screen modern projection cinematic digital exhibition gallery",
    summary: "세계적인 건축미를 자랑하는 영화의전당에서 만나는 스크린 예술의 모든 것! 환상적인 야외 루프 LED 조명과 수영강변 야경 데이트 코스.",
    nearbySpots: ["수영강변 나루공원", "센텀 신세계 스파랜드", "밀락더마켓", "민락수변공원"]
  },
  {
    slug: "geoje-art-center-ocean-view",
    title: "거제문화예술회관 가을 기획전 : 푸른 남해와 현대 조각의 만남",
    region: "경남",
    subRegion: "거제시",
    venueName: "거제문화예술회관 미술관",
    address: "경상남도 거제시 장승포로 145",
    period: "2026.09.12 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["거제전시", "거제문화예술회관", "남해바다", "야외조각", "거제도데이트", "가을힐링"],
    photoKeywords: "ocean sea outdoor sculpture modern art sea view museum",
    summary: "에메랄드빛 장승포 바다를 굽어보며 감상하는 수준 높은 현대 조각 및 회화전! 옥포대첩기념공원과 지세포항 해안 드라이브 추천 코스.",
    nearbySpots: ["장승포 수변공원", "지세포항 해양레저타운", "공곶이 수목원", "바람의 언덕"]
  }
];

// 3. 다채로운 테마별 고화질 사진 검색 (전시 3장 + 카페/맛집 1장 + 주변 명소/풍경 1장)
async function fetchRichPhotos(artKeyword, count = 5) {
  if (!PEXELS_API_KEY) {
    return [
      { url: "https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "현대미술 갤러리 전시" },
      { url: "https://images.pexels.com/photos/10220276/pexels-photo-10220276.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "미술관 모던 조각 작품" },
      { url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "감성 카페 커피와 디저트" },
      { url: "https://images.pexels.com/photos/2088203/pexels-photo-2088203.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "주변 힐링 자연 풍경" }
    ];
  }

  async function searchOne(q, perPage = 3) {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=landscape`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.photos || []).map(p => ({
        url: p.src.large2x || p.src.large || p.src.original,
        alt: p.alt || "부울경 문화예술 및 나들이"
      }));
    } catch {
      return [];
    }
  }

  const [artPhotos, cafePhotos, travelPhotos] = await Promise.all([
    searchOne(artKeyword, 4),
    searchOne("cafe coffee dessert gourmet food restaurant", 2),
    searchOne("travel landscape scenic nature city view", 2)
  ]);

  const combined = [];
  if (artPhotos[0]) combined.push(artPhotos[0]);
  if (artPhotos[1]) combined.push(artPhotos[1]);
  if (cafePhotos[0]) combined.push(cafePhotos[0]);
  if (artPhotos[2]) combined.push(artPhotos[2]);
  if (travelPhotos[0]) combined.push(travelPhotos[0]);

  return combined.length > 0 ? combined : [
    { url: "https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "현대미술 갤러리 전시" }
  ];
}

// 한국 시간(KST, UTC+9) 기준 오늘 날짜 문자열(YYYY-MM-DD) 반환 함수
function getKSTDateString() {
  const now = new Date();
  const kstOffset = 9 * 60; // 9 hours in minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + kstOffset * 60000);
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, "0");
  const day = String(kst.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 4. Gemini API로 마크다운 글 생성 (네이버 맛집, 볼거리, 행사, 생생 후기 완벽 반영)
async function generatePostWithGemini(exhibition, photos, dateStr, naverData = {}) {
  const { blogReviews = [], localRestaurants = [], nearbyAttractions = [], localEvents = [] } = naverData;

  const naverBlogContext = blogReviews.length > 0 
    ? blogReviews.map((r, i) => `  ${i+1}. [${r.blogger}] ${r.title} - ${r.description}`).join("\n")
    : "네이버 블로그 후기 수집 정보 없음";

  const naverFoodContext = localRestaurants.length > 0
    ? localRestaurants.map((p, i) => `  ${i+1}. ${p.title} (${p.category}) - 주소: ${p.address}`).join("\n")
    : "네이버 주변 맛집 수집 정보 없음";

  const naverSpotContext = nearbyAttractions.length > 0
    ? nearbyAttractions.map((s, i) => `  ${i+1}. ${s.title} (${s.category}) - 주소: ${s.address}`).join("\n")
    : "네이버 주변 볼거리 수집 정보 없음";

  const naverEventContext = localEvents.length > 0
    ? localEvents.map((e, i) => `  ${i+1}. ${e.title} (${e.description})`).join("\n")
    : "네이버 주변 문화 축제 정보 없음";

  const prompt = `
너는 '부울경(부산, 울산, 경남) 아트·전시 나들이' 웹사이트의 최고 수석 큐레이터이자 다정하고 박학다식한 **AI 도슨트**야.
관람객이 이번 주말 당장 전시를 보러 떠나고 싶어지도록, **전시 작품 해설 + 네이버 실시간 맛집 & 카페 + 주변 볼거리 핫플 + 지역 축제/행사 소식**을 매우 풍부하고 감성 넘치게 작성해줘.

### [전시 기본 정보]
- 전시명: ${exhibition.title}
- 지역: ${exhibition.region} (${exhibition.subRegion})
- 장소: ${exhibition.venueName} (${exhibition.address})
- 기간: ${exhibition.period}
- 관람료: ${exhibition.price}
- 요약: ${exhibition.summary}
- 추천 태그: ${exhibition.tags.join(", ")}

### [네이버 실시간 검색 빅데이터]
- 1. 실제 네이버 블로그 관람객 생생 후기:
${naverBlogContext}
- 2. 전시장 주변 네이버 인기 맛집 & 감성 카페:
${naverFoodContext}
- 3. 전시장 주변 네이버 추천 볼거리 & 핫플레이스:
${naverSpotContext}
- 4. 주변 최신 문화 예술 행사 & 축제 소식:
${naverEventContext}

### [본문에 배치할 테마별 고화질 사진 목록]
${photos.map((p, idx) => `${idx + 1}. URL: ${p.url} (테마 설명: ${p.alt})`).join("\n")}

### [반드시 지켜야 할 마크다운 작성 규칙]
1. 최상단 Frontmatter(---):
---
title: "${exhibition.title}"
date: "${dateStr}"
summary: "${exhibition.summary}"
category: "전시 리뷰"
tags: [${exhibition.tags.map(t => `"${t}"`).join(", ")}]
region: "${exhibition.region}"
eventId: "${exhibition.slug}"
thumbnail: "${photos[0]?.url || ''}"
---

2. 본문 구성 (매우 중요):
- **도입부**: 'AI 도슨트'의 다정한 인사와 계절감, 전시장소의 분위기 소개
- **첫 번째 대표 전시 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 전시 핵심 정보 한눈에 보기**: 마크다운 표 형식 (전시명, 기간, 장소, 관람시간, 휴관일, 관람료, 문의 등)
- **🌟 놓칠 수 없는 관람 포인트 TOP 3**: 세부 소제목(### 1, ### 2, ### 3)과 흥미진진한 도슨트 해설. 중간에 두 번째 전시 사진(![설명](${photos[1]?.url || photos[0]?.url})) 배치.
- **🍽️ 전시장 주변 핫플레이스 맛집 & 감성 카페 BEST**: 네이버 검색 데이터에 있는 실제 맛집/카페 상호명과 특징을 소개하고, 세 번째 감성 카페/미식 사진(![설명](${photos[2]?.url || photos[0]?.url})) 배치!
- **🎡 함께 즐기는 주변 볼거리 & 핫플 투어 코스**: 네이버 볼거리 데이터 및 주변 명소를 엮어 알찬 당일치기/반나절 나들이 코스 구성. 네 번째 주변 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치!
- **🎉 함께 둘러보기 좋은 인근 문화 행사 & 축제**: 네이버 행사/축제 데이터를 소개하며 풍성한 볼거리 안내.
- **💡 AI 도슨트의 관람 & 주차 꿀팁**: 주차 정보, 가장 쾌적한 방문 시간대, 사진 촬영 포인트.
- **따뜻한 마무리 멘트**.

3. 오직 완성된 마크다운 내용만 출력해 (앞뒤에 \`\`\`markdown 또는 추가 설명 붙이지 말 것).
`;

  const candidateModels = [
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.5-flash"
  ];

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`🤖 Gemini 모델 시도 중: ${modelName}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ [${modelName}] 호출 실패 (${response.status}): 다음 모델로 재시도합니다.`);
        lastError = new Error(`Gemini API Error (${response.status}): ${errorText}`);
        continue;
      }

      const result = await response.json();
      let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (generatedText) {
        // 마크다운 코드 블록 래핑 제거 (있을 경우)
        if (generatedText.startsWith("```markdown")) {
          generatedText = generatedText.slice(11);
        } else if (generatedText.startsWith("```")) {
          generatedText = generatedText.slice(3);
        }
        if (generatedText.endsWith("```")) {
          generatedText = generatedText.slice(0, -3);
        }

        console.log(`✨ [${modelName}] 성공적으로 본문을 작성했습니다!`);
        return generatedText.trim();
      }
    } catch (err) {
      console.warn(`⚠️ [${modelName}] 요청 에러: ${err.message}. 다음 모델로 시도합니다.`);
      lastError = err;
    }
  }

  throw lastError || new Error("모든 Gemini 모델 호출에 실패했습니다.");
}

// 5. 메인 실행 루틴
async function main() {
  console.log("🚀 [AI 자동 포스팅] 부울경 전시 글 생성 시작...");
  const postsDir = path.join(rootDir, "src", "content", "posts");
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(postsDir);
  const today = getKSTDateString();

  // 아직 작성되지 않은 전시 후보 선택
  let targetExhibition = EXHIBITION_POOL.find(ex => {
    return !existingFiles.some(file => file.includes(ex.slug));
  });

  if (!targetExhibition) {
    // 모든 전시가 작성되었다면 무작위로 하나 골라 새로운 날짜로 업데이트 작성
    console.log("ℹ️ 기존 후보가 모두 작성되어 최신 추천 전시를 큐레이션합니다.");
    const randomIndex = Math.floor(Math.random() * EXHIBITION_POOL.length);
    targetExhibition = EXHIBITION_POOL[randomIndex];
  }

  console.log(`📌 선택된 전시: [${targetExhibition.region}] ${targetExhibition.title}`);

  // 네이버 실시간 블로그 후기, 주변 맛집, 볼거리, 행사 검색
  console.log(`🔍 네이버 API HUB 실시간 맛집/볼거리/행사/후기 검색 중 (${targetExhibition.venueName})...`);
  const naverData = await fetchNaverSearchData(targetExhibition.venueName, targetExhibition.region);
  console.log(`✅ 네이버 데이터 수집 완료: 블로그 ${naverData.blogReviews.length}건, 맛집 ${naverData.localRestaurants.length}건, 볼거리 ${naverData.nearbyAttractions.length}건, 행사 ${naverData.localEvents.length}건`);

  // Pexels에서 전시 + 카페/미식 + 주변 풍경 고화질 사진 다채롭게 검색
  console.log(`📸 Pexels 전시 & 감성 카페/풍경 사진 다채로운 검색 중...`);
  const photos = await fetchRichPhotos(targetExhibition.photoKeywords, 5);
  console.log(`✅ ${photos.length}장의 고화질 사진 준비 완료.`);

  // Gemini AI로 글 작성
  console.log("✍️ Gemini AI로 네이버 맛집/행사/볼거리 포함 프리미엄 전시 리뷰 본문 작성 중...");
  const postContent = await generatePostWithGemini(targetExhibition, photos, today, naverData);

  // 파일명 지정: YYYY-MM-DD-slug.md
  const fileName = `${today}-${targetExhibition.slug}.md`;
  const filePath = path.join(postsDir, fileName);

  fs.writeFileSync(filePath, postContent, "utf8");
  console.log(`🎉 [작성 완료] 새 글 파일이 저장되었습니다: src/content/posts/${fileName}`);
}

main().catch(err => {
  console.error("❌ 오류 발생:", err);
  process.exit(1);
});
