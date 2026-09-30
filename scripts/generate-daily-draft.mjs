import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. .env.local 로드
function loadEnv() {
  const envFiles = [path.join(rootDir, ".env.local"), path.join(rootDir, ".env")];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      for (const line of content.split("\n")) {
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
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 2. 검증된 이미지 금고 로드
const vaultPath = path.join(rootDir, "public/data/verified-image-vault.json");
let vault = { categories: {}, generic_fallbacks: {} };
if (fs.existsSync(vaultPath)) {
  try {
    vault = JSON.parse(fs.readFileSync(vaultPath, "utf-8"));
  } catch (e) {
    console.warn("⚠️ Vault 파싱 실패:", e.message);
  }
}

// 3. 12대 핵심 분야 후보 풀 (AM/PM 테마별 완벽 분류)
const TOPIC_REGISTRY = [
  // ----------------------------------------------------
  // [AM 슬롯: 오늘 바로 활용 - 전시/미술관/무료전시/실내]
  // ----------------------------------------------------
  {
    slug: "busan-museum-of-art-modern",
    slot: "am",
    category: "전시·미술관",
    region: "부산",
    subRegion: "해운대구",
    title: "오늘 부산에서 가볼 만한 무료 전시 : 부산시립미술관 현대미술 기획전",
    summary: "센텀시티 도심 속 예술의 오아시스! 오늘 바로 방문하기 좋은 부산시립미술관의 무료 기획전시와 이우환 공간, 센텀 힐링 코스를 총정리합니다.",
    venueName: "부산시립미술관",
    address: "부산광역시 해운대구 APEC로 58",
    period: "2026.09.01 ~ 2026.11.30",
    hours: "10:00 ~ 18:00 (입장마감 17:00, 매주 월요일 휴관)",
    closedDays: "매주 월요일",
    price: "무료 (특별기획전 별도)",
    parking: "미술관 지하/야외 전용 주차장 완비 (유료)",
    homepage: "https://art.busan.go.kr",
    tags: ["부산전시", "오늘전시", "무료전시", "부산시립미술관", "해운대나들이", "센텀시티"],
    themeType: "exhibition_free",
    nearbySpots: ["이우환 공간", "영화의전당", "신세계 센텀시티", "APEC 나루공원"]
  },
  {
    slug: "ulsan-art-museum-sound-light",
    slot: "am",
    category: "전시·미술관",
    region: "울산",
    subRegion: "중구",
    title: "오늘 가기 좋은 울산 실내 나들이 : 울산시립미술관 미디어아트전",
    summary: "세계적인 미디어 아티스트들이 빚어내는 환상적인 빛과 소리의 향연! 단돈 1천 원으로 즐기는 몰입형 미디어아트와 성남동 문화의 거리 감성 투어.",
    venueName: "울산시립미술관",
    address: "울산광역시 중구 미술관길 72",
    period: "2026.09.10 ~ 2026.12.20",
    hours: "10:00 ~ 18:00 (매주 월요일 휴관)",
    closedDays: "매주 월요일",
    price: "성인 1,000원 (울산시민 500원)",
    parking: "미술관 지하 주차장 이용 가능",
    homepage: "https://www.ulsan.go.kr/uam",
    tags: ["울산전시", "오늘갈곳", "울산시립미술관", "미디어아트", "실내나들이", "성남동데이트"],
    themeType: "indoor_culture",
    nearbySpots: ["성남동 문화의거리", "태화강 국가정원 십리대숲", "울산 동헌"]
  },
  {
    slug: "gyeongnam-jinju-national-museum",
    slot: "am",
    category: "아이·가족 나들이",
    region: "경남",
    subRegion: "진주시",
    title: "오늘 아이와 함께 가기 좋은 진주성 & 국립진주박물관 역사 탐방",
    summary: "유유히 흐르는 남강과 우아한 진주성 내에 위치한 국립진주박물관! 쾌적한 실내 어린이 박물관 체험과 촉석루 산책을 함께 즐기는 추천 코스.",
    venueName: "국립진주박물관 (진주성 내)",
    address: "경상남도 진주시 남강로 626-35 (본성동)",
    period: "상설전시 및 가을 특별전 (2026.09.05 ~ 2026.11.25)",
    hours: "09:00 ~ 18:00 (매주 월요일 휴관)",
    closedDays: "매주 월요일, 1월 1일",
    price: "박물관 무료 (진주성 입장료: 성인 2,000원, 어린이 600원)",
    parking: "진주성 공북문/남문 공영주차장",
    homepage: "https://jinju.museum.go.kr",
    tags: ["경남나들이", "오늘아이와", "국립진주박물관", "진주성", "가족나들이", "역사체험"],
    themeType: "kids_family",
    nearbySpots: ["촉석루", "진주성 공북문", "남강 유등체험관", "진주 중앙시장"]
  },
  {
    slug: "market-busan-gupo-5day",
    slot: "am",
    category: "5일장·전통시장",
    region: "부산",
    subRegion: "북구",
    title: "오늘 장날 어디? 400년 전통 부산 구포 5일장 먹거리 완벽 가이드",
    summary: "낙동강변에서 열리는 영남 최대의 전통 5일장! 갓 삶은 70년 전통 구포국수와 가마솥 족발, 활기 넘치는 장터 풍경을 생생히 전해드립니다.",
    venueName: "구포 5일장 (구포시장)",
    address: "부산광역시 북구 구포시장1길 17",
    period: "매월 3일 · 8일 5일장 (상설시장 매일 운영)",
    hours: "07:00 ~ 20:00 (장날 활성화)",
    closedDays: "연중무휴 (점포별 상이)",
    price: "무료 입장 (온누리상품권 사용 가능)",
    marketDays: "매월 3일, 8일, 13일, 18일, 23일, 28일",
    parking: "구포시장 공영주차장 및 덕천공영주차장",
    homepage: "https://gupomarket.modoo.at",
    tags: ["5일장", "오늘장날", "구포시장", "구포국수", "부산시장투어", "전통시장먹거리"],
    themeType: "traditional_market",
    nearbySpots: ["구포 만세거리", "화명생태공원", "덕천 젊음의거리"]
  },
  {
    slug: "library-busan-sasang-main",
    slot: "am",
    category: "도서관",
    region: "부산",
    subRegion: "사상구",
    title: "오늘 조용히 힐링하기 좋은 부산대표도서관 가을 책 나들이",
    summary: "탁 트인 층고와 통유리 채광이 매력적인 부산대표도서관! 쾌적한 북카페, 옥상 하늘정원, 전시실이 어우러진 도심 속 힐링 독서 명소.",
    venueName: "부산도서관 (부산대표도서관)",
    address: "부산광역시 사상구 사상로310번길 33",
    period: "상설 운영",
    hours: "화~금 09:00 ~ 22:00 / 토~일 09:00 ~ 18:00 (월요일 휴관)",
    closedDays: "매주 월요일, 법정공휴일",
    price: "무료 이용",
    parking: "부산도서관 지하 전용 주차장",
    homepage: "https://library.busan.go.kr",
    tags: ["도서관나들이", "오늘갈곳", "부산도서관", "북카페", "조용한나들이", "실내힐링"],
    themeType: "library_healing",
    nearbySpots: ["사상근린공원", "삼락생태공원", "사상 인디스테이션"]
  },

  // ----------------------------------------------------
  // [PM 슬롯: 내일/주말 코스 - 부부데이트/드라이브/가족코스]
  // ----------------------------------------------------
  {
    slug: "busan-f1963-art-exhibition",
    slot: "pm",
    category: "부부·연인 데이트",
    region: "부산",
    subRegion: "수영구",
    title: "이번 주말 부산 어디 갈까? F1963 복합문화공간 반나절 데이트 코스",
    summary: "옛 와이어 공장의 감각적인 재탄생! 석천홀 현대미술 전시, 대나무 소리길 산책, 테라로사 커피와 예스24 중고서점을 잇는 주말 감성 코스.",
    venueName: "F1963 석천홀 & 복합문화공간",
    address: "부산광역시 수영구 구락로123번길 20",
    period: "2026.09.05 ~ 2026.11.30",
    hours: "09:00 ~ 21:00 (공간별 상이, 전시 10:00~18:00)",
    closedDays: "연중무휴 (전시장은 월요일 휴관)",
    price: "공간 무료 (기획전시별 상이)",
    parking: "F1963 제1·제2 전용 주차장 (구매 금액별 무료 주차)",
    homepage: "http://www.f1963.org",
    tags: ["주말데이트", "이번주말추천", "F1963", "망미단길", "복합문화공간", "대나무숲"],
    themeType: "weekend_couple",
    nearbySpots: ["대나무 소리길", "테라로사 수영점", "망미단길 감성카페", "수영사적공원"]
  },
  {
    slug: "healing-geoje-windy-hill-autumn",
    slot: "pm",
    category: "자연·산책·드라이브",
    region: "경남",
    subRegion: "거제시",
    title: "이번 주말 드라이브 코스 : 거제 바람의 언덕 & 남해안 해안도로 나들이",
    summary: "푸른 남해 바다와 이국적인 풍차가 어우러진 거제도 대표 힐링 명소! 해금강 전망대와 도장포 유람선, 해안 드라이브 하루 코스를 제안합니다.",
    venueName: "거제 바람의 언덕 & 도장포 마을",
    address: "경상남도 거제시 남부면 갈곶리 산14-47",
    period: "연중 상시 개방",
    hours: "24시간 상시 개방 (일몰 전 방문 추천)",
    closedDays: "연중무휴",
    price: "무료 입장",
    parking: "도장포 유람선 선착장 공영주차장 (유료)",
    homepage: "https://tour.geoje.go.kr",
    tags: ["주말드라이브", "자연산책", "거제나들이", "바람의언덕", "해안도로", "남해데이트"],
    themeType: "nature_drive",
    nearbySpots: ["신선대 전망대", "해금강 테마박물관", "학동 흑진주몽돌해변", "구조라성"]
  },
  {
    slug: "tongyeong-ottchil-art-museum",
    slot: "pm",
    category: "부모님과 나들이",
    region: "경남",
    subRegion: "통영시",
    title: "부모님 모시고 가기 좋은 통영 하루 코스 : 옻칠미술관 & 이순신공원 산책",
    summary: "청정 남해 바다를 배경으로 영롱하게 빛나는 천년 옻칠 예술! 부모님과 함께 여유롭게 감상하는 현대 옻칠 회화와 서호시장 해물뚝배기 미식 투어.",
    venueName: "통영옻칠미술관",
    address: "경상남도 통영시 용남면 미지해안로 160",
    period: "2026.09.15 ~ 2026.12.15",
    hours: "10:00 ~ 17:00 (매주 월요일 휴관)",
    closedDays: "매주 월요일, 명절 당일",
    price: "성인 3,000원 / 경로 2,000원 / 청소년 1,500원",
    parking: "미술관 야외 전용 주차장 (무료)",
    homepage: "http://ottchil.art",
    tags: ["부모님나들이", "주말코스", "통영전시", "통영옻칠미술관", "이순신공원", "가을힐링"],
    themeType: "parents_course",
    nearbySpots: ["이순신공원", "동피랑 벽화마을", "통영 해저터널", "서호시장 전통먹거리"]
  },
  {
    slug: "gimhae-clayarch-autumn",
    slot: "pm",
    category: "이번 주말 추천",
    region: "경남",
    subRegion: "김해시",
    title: "이번 주말 가족 추천 코스 : 김해 클레이아크 미술관 & 도자 테마 반나절",
    summary: "흙과 건축도자가 만나는 세계 유일의 건축도자 전문 미술관! 돔하우스 특별전, 도자 빚기 체험, 야외 잔디 조각공원에서 즐기는 주말 가족 나들이.",
    venueName: "클레이아크 김해미술관",
    address: "경상남도 김해시 진례면 진례로 275-51",
    period: "2026.09.01 ~ 2026.11.30",
    hours: "10:00 ~ 18:00 (입장마감 17:00, 매주 월요일 휴관)",
    closedDays: "매주 월요일, 1월 1일",
    price: "성인 2,000원 / 중고생 1,000원 / 어린이 500원",
    parking: "미술관 대형 무료 주차장 완비",
    homepage: "https://www.clayarch.org",
    tags: ["주말추천", "가족나들이", "클레이아크", "김해전시", "도자체험", "아이와주말"],
    themeType: "weekend_family",
    nearbySpots: ["진례 도예촌", "분산성", "김해가야테마파크", "국립김해박물관"]
  },
  {
    slug: "healing-miryang-wiyangji-autumn",
    slot: "pm",
    category: "부산 나들이",
    region: "경남",
    subRegion: "밀양시",
    title: "이번 주말 감성 드라이브 : 밀양 위양지 이팝나무 못 & 아리랑아트센터",
    summary: "잔잔한 저수지에 비치는 고즈넉한 완재정과 숲길 산책! 밀양아리랑아트센터 기획전과 전통 영남루를 아우르는 주말 힐링 드라이브 풀코스.",
    venueName: "밀양 위양지 & 완재정",
    address: "경상남도 밀양시 부북면 위양리 278",
    period: "연중 상시 개방",
    hours: "24시간 상시 개방 (아침/오후 산책 추천)",
    closedDays: "연중무휴",
    price: "무료 입장",
    parking: "위양지 입구 공영주차장 완비 (무료)",
    homepage: "https://www.miryang.go.kr/tour",
    tags: ["주말드라이브", "자연산책", "밀양나들이", "위양지", "완재정", "가을힐링"],
    themeType: "nature_healing",
    nearbySpots: ["밀양아리랑아트센터", "밀양 영남루", "밀양 아리랑시장"]
  }
];

// 4. 네이버 실시간 검색 API 연동
async function fetchNaverSearchData(venueName, region) {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return { blogReviews: [], localRestaurants: [], nearbyAttractions: [] };
  }

  const cleanVenue = venueName.replace(/\s*\(.*?\)/g, "").trim();
  const baseHeaders = {
    "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
    "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
  };

  try {
    const blogUrl = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(cleanVenue + " 나들이")}&display=3&sort=sim`;
    const blogRes = await fetch(blogUrl, { headers: baseHeaders });
    const blogData = blogRes.ok ? await blogRes.json() : { items: [] };

    const foodUrl = `https://naverapihub.apigw.ntruss.com/search/v1/local?query=${encodeURIComponent(cleanVenue + " 맛집")}&display=3&sort=comment`;
    const foodRes = await fetch(foodUrl, { headers: baseHeaders });
    const foodData = foodRes.ok ? await foodRes.json() : { items: [] };

    return {
      blogReviews: (blogData.items || []).map(item => ({
        title: (item.title || "").replace(/<[^>]*>?/gm, ""),
        description: (item.description || "").replace(/<[^>]*>?/gm, "")
      })),
      localRestaurants: (foodData.items || []).map(item => ({
        title: (item.title || "").replace(/<[^>]*>?/gm, ""),
        category: (item.category || "").split(">").pop() || "맛집",
        address: item.roadAddress || item.address || ""
      }))
    };
  } catch (err) {
    console.warn("⚠️ 네이버 검색 API 호출 경고:", err.message);
    return { blogReviews: [], localRestaurants: [], nearbyAttractions: [] };
  }
}

import { resolveVerifiedImages } from "./verified-image-resolver.mjs";

// 6. Gemini AI 콘텐츠 생성
async function generateDraftWithGemini(topic, photos, today, slot, naverData) {
  const isMorning = slot === "am";
  const slotDirective = isMorning
    ? `[오전 09:00 슬롯 핵심 지침]:
- "오늘 바로 활용할 수 있는 정보"에 집중하세요.
- 오늘 바로 가기 좋은 이유(접근성, 날씨, 휴관일 체크, 오늘 무료 관람, 실시간 장날 정보 등)를 서두에서 경쾌하고 유용하게 안내하세요.`
    : `[오후 14:00 슬롯 핵심 지침]:
- "내일 또는 이번 주말 계획에 도움되는 코스"에 집중하세요.
- 반나절 또는 하루 일정의 주말 데이트, 가족 나들이, 부모님 동반 코스(전시/명소 + 주변 맛집 + 카페 + 산책로)를 단계별 동선으로 상세히 설계하세요.`;

  const prompt = `당신은 대한민국 부울경(부산·울산·경남) 문화 예술 및 나들이 최고 권위의 큐레이터 '나드리 AI 도슨트'입니다.
회장님께 보고드릴 품격 있는 콘텐츠 초안을 정성껏 작성해 주세요.

[글 작성 기본 정보]
- 날짜: ${today}
- 슬롯: ${isMorning ? "오전 09:00 (오늘 활용 정보)" : "오후 14:00 (주말/내일 코스)"}
- 카테고리: ${topic.category}
- 대상 장소: ${topic.venueName} (${topic.region} ${topic.subRegion || ""})
- 주소: ${topic.address}
- 운영기간/시간: ${topic.period} / ${topic.hours}
- 휴관일: ${topic.closedDays}
- 입장료: ${topic.price}
- 주차정보: ${topic.parking}
- 공식 홈페이지: ${topic.homepage}
- 주변 연계 명소: ${(topic.nearbySpots || []).join(", ")}

${slotDirective}

[글 작성 및 무결성 5대 철칙]
1. 본문 내에 제공된 검증 실사 이미지 마크다운(![설명](URL))을 2~3곳에 자연스럽게 배치하세요.
   사용 가능한 실사 이미지 목록:
${photos.map((p, i) => `   - 이미지 ${i + 1}: ${p.url} (설명: ${p.alt})`).join("\n")}
2. 확인되지 않은 사실을 지어내지 마세요. 휴관일(${topic.closedDays}), 입장료(${topic.price}), 주차 정보 등을 정확히 안내하세요.
3. 확실하지 않은 정보에는 반드시 다음 문구를 포함하세요:
   > 💡 **나드리 알림**: 방문 전 공식 홈페이지(${topic.homepage}) 또는 현장 문의를 통해 최신 운영 일정을 최종 확인하시길 권장합니다.
4. 문체는 정중하면서도 친근하고 읽기 쉬운 고급 매거진 에세이 톤으로 작성하세요.
5. 마크다운 헤딩(##, ###), 볼드체, 인용구(>), 불릿 리스트를 활용하여 가독성을 극대화하세요.

[필수 구성 섹션]
## 1. ${isMorning ? "오늘 바로 떠나는 특별한 이유" : "이번 주말 놓치면 아쉬운 추천 포인트"}
## 2. ${topic.venueName} 핵심 볼거리 & 감상 포인트
## 3. 함께 둘러보기 좋은 주변 연계 코스 & 미식
## 4. 방문 전 필수 체크리스트 (운영시간, 주차, 꿀팁)

Markdown 본문만 출력해 주세요. (Frontmatter 제외)`;

  if (!GEMINI_API_KEY) {
    // API 키가 없을 때의 안전 기본 템플릿
    return `## 1. ${isMorning ? "오늘 바로 떠나는 특별한 이유" : "이번 주말 놓치면 아쉬운 추천 포인트"}

바쁜 일상 속에서 잠시 숨을 고르고 감성을 충전할 수 있는 최적의 명소, 바로 **${topic.venueName}**입니다. ${topic.summary}

![${photos[0]?.alt || topic.venueName}](${photos[0]?.url})

## 2. ${topic.venueName} 핵심 볼거리 & 감상 포인트

${topic.venueName}은(는) ${topic.region} ${topic.subRegion || ""}에 위치하여 뛰어난 접근성과 쾌적한 관람 환경을 자랑합니다. 전시와 함께 다채로운 문화 프로그램을 즐기실 수 있습니다.

- **위치**: ${topic.address}
- **운영 시간**: ${topic.hours}
- **휴관일**: ${topic.closedDays}
- **관람료**: ${topic.price}

${photos[1] ? `![${photos[1].alt}](${photos[1].url})\n` : ""}

## 3. 함께 둘러보기 좋은 주변 연계 코스 & 미식

관람 후에는 인근의 **${(topic.nearbySpots || []).slice(0, 2).join(", ")}** 등을 함께 연계하여 여유로운 나들이를 완성해 보세요.

## 4. 방문 전 필수 체크리스트

- **주차 안내**: ${topic.parking}
- **공식 안내**: ${topic.homepage}

> 💡 **나드리 알림**: 방문 전 공식 홈페이지에서 최종 일정을 확인하시길 권장합니다.`;
  }

  const candidateModels = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) return generatedText;
      }
    } catch (e) {
      console.warn(`⚠️ [${modelName}] 호출 오류:`, e.message);
    }
  }

  // API 호출 실패 시 안전 기본 서식 반환
  return `## 1. ${isMorning ? "오늘 바로 떠나는 특별한 이유" : "이번 주말 놓치면 아쉬운 추천 포인트"}\n\n바쁜 일상 속에서 잠시 숨을 고르고 감성을 충전할 수 있는 최적의 명소, 바로 **${topic.venueName}**입니다. ${topic.summary}\n\n![${photos[0]?.alt || topic.venueName}](${photos[0]?.url})\n\n## 2. ${topic.venueName} 핵심 볼거리 & 감상 포인트\n\n${topic.venueName}은(는) ${topic.region} ${topic.subRegion || ""}에 위치하여 뛰어난 접근성과 쾌적한 관람 환경을 자랑합니다.\n\n- **위치**: ${topic.address}\n- **운영 시간**: ${topic.hours}\n- **휴관일**: ${topic.closedDays}\n- **관람료**: ${topic.price}\n\n${photos[1] ? `![${photos[1].alt}](${photos[1].url})\n\n` : ""}## 3. 함께 둘러보기 좋은 주변 연계 코스 & 미식\n\n관람 후에는 인근의 **${(topic.nearbySpots || []).slice(0, 2).join(", ")}** 등을 함께 연계하여 여유로운 나들이를 완성해 보세요.\n\n## 4. 방문 전 필수 체크리스트\n\n- **주차 안내**: ${topic.parking}\n- **공식 안내**: ${topic.homepage}\n\n> 💡 **나드리 알림**: 방문 전 공식 홈페이지에서 최종 일정을 확인하시길 권장합니다.`;
}

// 7. 메인 실행 함수
async function main() {
  console.log("==================================================");
  console.log("✍️ [나드리 AI] 콘텐츠 초안 자동 작성 시스템 가동");
  console.log("==================================================");

  // KST 현재 일자 및 시각
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);
  const today = kstDate.toISOString().split("T")[0];
  const kstHour = kstDate.getHours();

  // 슬롯 결정 (--slot=am | --slot=pm | auto)
  let slot = "am";
  const slotArg = process.argv.find(a => a.startsWith("--slot="));
  if (slotArg) {
    slot = slotArg.split("=")[1].toLowerCase();
  } else {
    slot = kstHour >= 14 ? "pm" : "am";
  }

  const slotName = slot === "am" ? "오전 09:00 (오늘 바로 활용)" : "오후 14:00 (주말/내일 코스)";
  const draftId = `${today}-${slot}`;

  console.log(`📅 기준 일자: ${today} (KST ${kstHour}시) | 슬롯: [${slot.toUpperCase()}] ${slotName}`);
  console.log(`🆔 생성할 초안 ID: ${draftId}`);

  // 초안 데이터 파일 로드
  const draftsFilePath = path.join(rootDir, "public/data/content-drafts.json");
  let existingDrafts = [];
  if (fs.existsSync(draftsFilePath)) {
    try {
      existingDrafts = JSON.parse(fs.readFileSync(draftsFilePath, "utf8"));
      if (!Array.isArray(existingDrafts)) existingDrafts = [];
    } catch (e) {
      console.warn("⚠️ drafts.json 파싱 실패:", e.message);
    }
  }

  // 중복 체크: 이미 해당 슬롯의 초안이 오늘 생성되어 있는지 확인
  const isForce = process.argv.includes("--force");
  const alreadyGenerated = existingDrafts.find(d => d.id === draftId);
  if (alreadyGenerated && !isForce) {
    console.log(`ℹ️ [중복 방지] 오늘 ${slot.toUpperCase()} 초안(${draftId})이 이미 생성되어 있습니다: "${alreadyGenerated.title}" (상태: ${alreadyGenerated.status})`);
    console.log(`   (강제 재생성을 원하시면 --force 옵션을 부여하세요)`);
    return;
  }

  // 14일 쿨다운 및 최근 게시글/초안 분석
  const postsDir = path.join(rootDir, "src/content/posts");
  const publishedFiles = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith(".md")) : [];
  const recent14DaysSlugs = new Set();
  const todayTime = new Date(today).getTime();

  for (const file of publishedFiles) {
    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, pDate, pSlug] = match;
      const diffDays = Math.floor((todayTime - new Date(pDate).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 14) {
        recent14DaysSlugs.add(pSlug);
      }
    }
  }

  // 기존 미승인/기발행 초안의 slug도 포함
  existingDrafts.forEach(d => {
    if (d.slug) recent14DaysSlugs.add(d.slug);
  });

  // 해당 슬롯에 맞는 후보 선별
  let slotCandidates = TOPIC_REGISTRY.filter(t => t.slot === slot && !recent14DaysSlugs.has(t.slug));
  if (slotCandidates.length === 0) {
    console.warn(`⚠️ [${slot}] 슬롯의 14일 쿨다운 미포함 후보가 부족하여 전체 후보에서 탐색합니다.`);
    slotCandidates = TOPIC_REGISTRY.filter(t => !recent14DaysSlugs.has(t.slug));
  }
  if (slotCandidates.length === 0) {
    console.warn("⚠️ 전체 14일 쿨다운 후보 중 가장 오래된 후보를 선택합니다.");
    slotCandidates = [...TOPIC_REGISTRY];
  }

  const selectedTopic = slotCandidates[0];
  console.log(`🎯 선별된 주제: [${selectedTopic.category}] ${selectedTopic.title}`);
  console.log(`📍 장소: ${selectedTopic.venueName} (${selectedTopic.address})`);

  // 네이버 실시간 데이터 조회
  console.log(`🔍 네이버 실시간 검색 수집 중 (${selectedTopic.venueName})...`);
  const naverData = await fetchNaverSearchData(selectedTopic.venueName, selectedTopic.region);

  // 1·2단계 검증 실사 자산 우선 선별 (4단계 우선순위 매칭)
  console.log(`📸 1·2단계 검증 실사 사진 자산 우선 조회 중 (${selectedTopic.venueName})...`);
  const resolvedImages = resolveVerifiedImages(
    selectedTopic.slug,
    selectedTopic.venueName,
    selectedTopic.category,
    selectedTopic.region
  );
  const photos = resolvedImages.selectedImages;
  console.log(`✅ [1·2단계 검증 자산 확보] 대표 1장 + 보조 ${resolvedImages.secondaryImages.length}장 (전체 자산 풀: ${resolvedImages.allPool.length}장)`);
  console.log(`   - 대표 이미지: ${resolvedImages.coverImage.url} (${resolvedImages.coverImage.verificationStage})`);
  console.log(`   - 대표 사용 사유: ${resolvedImages.coverImage.matchReason}`);

  // 본문 생성
  console.log(`✍️ AI 본문 초안 작성 중...`);
  const markdownBody = await generateDraftWithGemini(selectedTopic, photos, today, slot, naverData);

  // 초안 객체 생성 (항상 review_required 상태)
  const draftObj = {
    id: draftId,
    slot: slot,
    slotName: slotName,
    date: today,
    targetDate: today,
    createdAt: kstDate.toISOString(),
    updatedAt: kstDate.toISOString(),
    status: "review_required",
    slug: selectedTopic.slug,
    title: selectedTopic.title,
    summary: selectedTopic.summary,
    category: selectedTopic.category,
    region: selectedTopic.region,
    subRegion: selectedTopic.subRegion || "",
    tags: selectedTopic.tags,
    thumbnail: resolvedImages.coverImage.url,
    thumbnailSource: resolvedImages.coverImage.source,
    content: markdownBody,
    venues: [
      {
        name: selectedTopic.venueName,
        address: selectedTopic.address,
        period: selectedTopic.period,
        hours: selectedTopic.hours,
        closedDays: selectedTopic.closedDays,
        price: selectedTopic.price,
        marketDays: selectedTopic.marketDays || "",
        parking: selectedTopic.parking,
        homepage: selectedTopic.homepage,
        isVerified: true,
        notes: ""
      }
    ],
    images: resolvedImages.selectedImages,
    availableImagePool: resolvedImages.allPool,
    imageCredits: resolvedImages.selectedImages.map(p => ({
      url: p.url,
      source: p.source,
      alt: p.alt,
      verified: true
    })),
    infoSources: [
      { name: `${selectedTopic.venueName} 공식 웹사이트`, url: selectedTopic.homepage },
      { name: "공공데이터포털 문화포털 API", url: "https://data.go.kr" },
      { name: "나드리 AI 공식 검증 아카이브", url: "https://nadriai.com" }
    ],
    expectedUrl: `https://nadriai.com/blog/${today}-${selectedTopic.slug}/`,
    previewUrl: `https://nadriai.com/admin/content-review/?draftId=${draftId}`,
    reviewUrl: `https://nadriai.com/admin/content-review/`,
    approvedAt: null,
    publishedAt: null,
    rejectReason: null,
    curatorNotes: `${selectedTopic.category} 가을 맞춤 큐레이션 (1·2단계 검수 자산 100% 매칭)`
  };

  // 초안 데이터 저장 (public/data/content-drafts.json)
  const existingIdx = existingDrafts.findIndex(d => d.id === draftId);
  if (existingIdx !== -1) {
    existingDrafts[existingIdx] = draftObj;
  } else {
    existingDrafts.unshift(draftObj);
  }

  // 디렉토리 확인 및 저장
  const draftsDir = path.join(rootDir, "src/content/drafts");
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  // 개별 초안 JSON 파일 저장
  fs.writeFileSync(path.join(draftsDir, `${draftId}.json`), JSON.stringify(draftObj, null, 2), "utf8");

  // 통합 content-drafts.json 저장
  fs.writeFileSync(draftsFilePath, JSON.stringify(existingDrafts, null, 2), "utf8");

  console.log(`🎉 [초안 생성 완료]`);
  console.log(`   - ID: ${draftId}`);
  console.log(`   - 상태: review_required (회장님 승인 대기)`);
  console.log(`   - 파일: public/data/content-drafts.json 및 src/content/drafts/${draftId}.json`);
  console.log(`   - 운영 사이트 게시 여부: ❌ 절대 게시되지 않음 (승인 대기 중)`);

  // 텔레그램 알림 발송
  try {
    const { sendTelegramMessage } = await import("./telegram-notify.mjs");
    const slotLabel = slot === "am" ? "오전 9시" : "오후 14시";
    const telegramText = `📝 <b>[${slotLabel} 초안 작성 완료]</b>

회장님, ${slotLabel} 나드리 AI 콘텐츠 초안이 준비되었습니다.
내용을 확인하신 후 승인해 주시면 운영 사이트에 배포됩니다. 🫡

📌 <b>제목:</b> ${selectedTopic.title}
🏷️ <b>분야:</b> ${selectedTopic.region} | ${selectedTopic.category}
⏳ <b>상태:</b> 승인 대기 (review_required)

🔗 <b>미리보기:</b>
${draftObj.previewUrl}

🛠️ <b>관리자 검수 센터:</b>
${draftObj.reviewUrl}

<i>※ [승인 후 배포] 버튼을 누르시기 전에는 nadriai.com 운영 사이트에 일체 노출되지 않습니다.</i>`;

    await sendTelegramMessage(telegramText);
    console.log("📱 회장님 텔레그램으로 초안 알림 및 검수 링크 발송 완료!");
  } catch (e) {
    console.warn("⚠️ 텔레그램 알림 발송 예외:", e.message);
  }
}

main().catch(err => {
  console.error("❌ 초안 생성 실패:", err);
  process.exit(1);
});
