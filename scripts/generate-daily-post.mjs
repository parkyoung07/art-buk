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

  const cleanVenue = venueName
    .replace(/\s*(제?\d+[·,\-~0-9]*전시장|전관|돔하우스|석천홀|비프힐.*|미술관\s*$)/g, "")
    .split(" 및 ")[0]
    .split(" (")[0]
    .trim() || venueName;
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

// 2. 부울경 전시 후보 풀 (순차 큐레이션)
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
  },
  {
    slug: "busan-f1963-art-exhibition",
    title: "F1963 현대미술 특별전 : 재생과 창조의 숲",
    region: "부산",
    subRegion: "수영구",
    venueName: "F1963 석천홀",
    address: "부산광역시 수영구 구락로123번길 20",
    period: "2026.09.05 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "F1963", "망미단길", "복합문화공간", "대나무숲", "부산데이트"],
    photoKeywords: "industrial architecture art gallery installation nature bamboo",
    summary: "옛 와이어 공장을 리노베이션한 복합문화공간 F1963의 가을 특별전! 소리길 대나무숲 산책과 테라로사 커피 나들이.",
    nearbySpots: ["F1963 대나무 소리길", "테라로사 수영점", "수영사적공원", "망미단길 감성카페"]
  },
  {
    slug: "busan-namgu-culture-center",
    title: "부산문화회관 가을 기획전 : 바다의 서정과 현대 조형의 울림",
    region: "부산",
    subRegion: "남구",
    venueName: "부산문화회관",
    address: "부산광역시 남구 유엔평화로76번길 1",
    period: "2026.09.10 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "부산문화회관", "부산남구", "UN기념공원", "오륙도스카이워크", "이기대"],
    photoKeywords: "modern sculpture maritime art gallery exhibition hall",
    summary: "부산 문화예술의 중심 부산문화회관의 현대 조각 및 회화 기획전! UN기념공원과 오륙도 스카이워크 해안 산책로 연계 감성 투어.",
    nearbySpots: ["UN기념공원", "평화공원", "오륙도 스카이워크", "이기대 해안산책로"]
  },
  {
    slug: "busan-geumjeong-culture-center",
    title: "금정문화회관 기획전 : 금정산의 사계와 영남 수묵의 결",
    region: "부산",
    subRegion: "금정구",
    venueName: "금정문화회관",
    address: "부산광역시 금정구 체육공원로 7",
    period: "2026.09.15 ~ 2026.11.25",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "금정문화회관", "부산금정구", "범어사", "금정산성", "회동수원지"],
    photoKeywords: "korean traditional ink painting mountain nature temple forest",
    summary: "부산의 명산 금정산의 사계절과 천년고찰 범어사의 정취를 현대 수묵으로 담아낸 명품 기획전! 회동수원지 황토숲길 힐링 산책.",
    nearbySpots: ["범어사", "금정산성 북문", "회동수원지 황토숲길", "스포원파크"]
  },
  {
    slug: "busan-dongnae-culture-center",
    title: "동래문화회관 가을 특별전 : 동래학춤의 선율과 전통 회화의 숨결",
    region: "부산",
    subRegion: "동래구",
    venueName: "동래문화회관",
    address: "부산광역시 동래구 명륜로112번길 63",
    period: "2026.09.05 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "동래문화회관", "부산동래구", "동래읍성", "복천동고분군", "동래온천"],
    photoKeywords: "traditional korean dance costume classical ink painting fortress",
    summary: "부산 전통 문화의 뿌리 동래의 역사성과 동래학춤의 미학을 시각예술로 재해석한 특별전! 동래읍성 북문과 온천천 산책 코스.",
    nearbySpots: ["동래읍성지", "복천동 고분군 & 박물관", "동래온천 노천족탕", "온천천 시민공원"]
  },
  {
    slug: "busan-busanjin-citizens-park",
    title: "부산시민공원 다솜갤러리 기획전 : 도심 속 녹색 쉼표와 현대미술",
    region: "부산",
    subRegion: "부산진구",
    venueName: "부산시민공원 다솜갤러리",
    address: "부산광역시 부산진구 시민공원로 73",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "부산시민공원", "다솜갤러리", "부산진구", "전포카페거리", "서면나들이"],
    photoKeywords: "city park green lawn modern art gallery installation",
    summary: "광활한 도심 숲 부산시민공원에서 만나는 감성 현대미술 기획전! 푸른 잔디광장 피크닉과 전포카페거리 미식 투어 연계.",
    nearbySpots: ["부산시민공원 잔디광장", "전포카페거리", "송상현광장", "어린이대공원"]
  },
  {
    slug: "busan-yeongdo-culture-art-center",
    title: "영도문화예술회관 해양 기획전 : 절영도의 푸른 파도와 항구의 미학",
    region: "부산",
    subRegion: "영도구",
    venueName: "영도문화예술회관",
    address: "부산광역시 영도구 함지로 79번길 6",
    period: "2026.09.12 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "영도문화예술회관", "부산영도구", "흰여울문화마을", "피아크", "태종대"],
    photoKeywords: "ocean sea coastal view modern maritime photography gallery",
    summary: "남해 바다와 부산항 오션뷰를 조망하며 감상하는 해양 현대미술전! 흰여울문화마을과 초대형 복합문화공간 피아크(P.ARK) 연계 코스.",
    nearbySpots: ["흰여울문화마을", "피아크(P.ARK) 복합문화공간", "태종대 유원지", "깡깡이예술마을"]
  },
  {
    slug: "busan-junggu-modern-history-museum",
    title: "부산근현대역사관 특별기획 : 원도심의 기억과 근대 건축의 미학",
    region: "부산",
    subRegion: "중구",
    venueName: "부산근현대역사관",
    address: "부산광역시 중구 대청로 112",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "부산근현대역사관", "부산중구", "용두산공원", "보수동책방골목", "자갈치"],
    photoKeywords: "historic modern architecture vintage archive museum exhibition",
    summary: "옛 한국은행 부산본부 건물을 리노베이션한 원도심 문화 랜드마크 기획전! 용두산공원 부산타워와 자갈치시장 먹거리 투어.",
    nearbySpots: ["용두산공원 & 부산타워", "보수동 책방골목", "자갈치시장", "남포동 BIFF광장"]
  },
  {
    slug: "busan-donggu-culture-platform",
    title: "동구문화플랫폼 기획전 : 철길 위의 예술, 부산진역의 재탄생",
    region: "부산",
    subRegion: "동구",
    venueName: "동구문화플랫폼",
    address: "부산광역시 동구 중앙대로 380",
    period: "2026.09.05 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "동구문화플랫폼", "부산동구", "초량이바구길", "부산진역", "원도심투어"],
    photoKeywords: "railway station urban regeneration modern gallery exhibition",
    summary: "117년 역사를 지닌 옛 부산진역사를 복합 문화공간으로 재탄생시킨 도심 갤러리! 초량 이바구길 168계단과 문화공감 수정 연계.",
    nearbySpots: ["초량 이바구길 168계단", "문화공감 수정 (정란각)", "부산역 유라시아플랫폼", "차이나타운"]
  },
  {
    slug: "busan-seogu-songdo-ocean-art",
    title: "서구문화예술 기획전 : 대한민국 제1호 송도해변과 해양 조각전",
    region: "부산",
    subRegion: "서구",
    venueName: "서구문화원",
    address: "부산광역시 서구 암남공원로 127",
    period: "2026.09.01 ~ 2026.10.31",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "서구문화원", "부산서구", "송도해상케이블카", "송도구름산책로", "암남공원"],
    photoKeywords: "beach ocean cable car outdoor sculpture sea coast",
    summary: "대한민국 제1호 송도해수욕장 바다를 배경으로 펼쳐지는 해양 조각전! 송도해상케이블카와 암남공원 용궁구름다리 연계 투어.",
    nearbySpots: ["송도해상케이블카", "송도구름산책로", "암남공원 용궁구름다리", "천마산 모노레일"]
  },
  {
    slug: "busan-bukgu-culture-center",
    title: "부산북구문화예술회관 가을 기획전 : 낙동강의 숨결과 구포의 역사",
    region: "부산",
    subRegion: "북구",
    venueName: "부산북구문화예술회관",
    address: "부산광역시 북구 금곡대로 46",
    period: "2026.09.10 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "북구문화예술회관", "부산북구", "화명생태공원", "화명수목원", "구포나들이"],
    photoKeywords: "river wetland nature botanic garden modern painting gallery",
    summary: "유서 깊은 구포의 역사와 낙동강변의 서정을 담아낸 가을 명품 무료 기획전! 화명생태공원과 화명수목원 숲길 산책.",
    nearbySpots: ["화명생태공원", "화명수목원", "구포 만세거리 문화광장", "대천천 계곡"]
  },
  {
    slug: "busan-sasang-living-culture",
    title: "사상생활문화센터 기획전 : 삼락 억새물결과 도심 속 청년 예술",
    region: "부산",
    subRegion: "사상구",
    venueName: "사상생활문화센터",
    address: "부산광역시 사상구 사상로 200",
    period: "2026.09.05 ~ 2026.11.15",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "사상생활문화센터", "부산사상구", "삼락생태공원", "사상인디스테이션", "갈대숲"],
    photoKeywords: "reed field autumn wetland youth art creative studio",
    summary: "청년 작가들의 독창적인 감각과 생활 문화가 어우러진 현대 시각예술전! 광활한 삼락생태공원 갈대억새숲 연계 코스.",
    nearbySpots: ["삼락생태공원 갈대숲", "사상인디스테이션", "사상 근린공원", "르네시떼"]
  },
  {
    slug: "busan-gangseo-nakdong-river-center",
    title: "낙동강문화관 기획전 : 하구 삼각주의 생태와 대지예술",
    region: "부산",
    subRegion: "강서구",
    venueName: "낙동강문화관",
    address: "부산광역시 강서구 낙동남로 1236",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "강서문화원", "부산강서구", "낙동강문화관", "대저생태공원", "을숙도"],
    photoKeywords: "river delta estuary nature ecology installation media art",
    summary: "낙동강 하구 삼각주의 생태와 생명을 주제로 한 인터랙티브 미디어 및 친환경 설치미술전! 대저생태공원 핑크뮬리 투어.",
    nearbySpots: ["을숙도 에코센터", "대저생태공원", "맥도생태공원", "가덕도 대항전망대"]
  },
  {
    slug: "busan-yeonje-culture-art",
    title: "연제문화예술 특별전 : 배산(盃山)의 역사와 온천천의 사계",
    region: "부산",
    subRegion: "연제구",
    venueName: "연제문화원",
    address: "부산광역시 연제구 연제로 2",
    period: "2026.09.10 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "연제문화원", "부산연제구", "온천천카페거리", "배산성지", "연산동나들이"],
    photoKeywords: "stream cafe city walk traditional landscape painting",
    summary: "배산 성지의 역사와 온천천의 수변 풍경을 서정적인 붓끝으로 담아낸 연제 가을 기획전! 온천천 카페거리 브런치 나들이.",
    nearbySpots: ["온천천 카페거리", "배산 성지 및 둘레길", "부산시청 녹음광장", "연제문화체육공원"]
  },
  {
    slug: "busan-gijang-andersen-fairy-tale",
    title: "기장 안데르센 동화 문화기획전 : 바다마을 동화와 상상 조형전",
    region: "부산",
    subRegion: "기장군",
    venueName: "기장 안데르센 동화마을",
    address: "부산광역시 기장군 장안읍 기룡두호로 107",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "기장문화센터", "부산기장군", "안데르센동화마을", "해동용궁사", "아홉산숲"],
    photoKeywords: "fairy tale sculpture forest theme park ocean temple bamboo",
    summary: "기장 숲속에 펼쳐진 동화 같은 상상 예술의 세계! 해동용궁사와 아홉산숲 대나무밭, 오시리아 관광단지를 잇는 가족 나들이 코스.",
    nearbySpots: ["안데르센 동화마을", "해동용궁사", "아홉산숲 대나무밭", "오시리아 롯데월드 부산"]
  },
  {
    slug: "ulsan-culture-art-center-autumn",
    title: "울산문화예술회관 가을 특별기획 : 영남 구상회화의 숨결",
    region: "울산",
    subRegion: "남구",
    venueName: "울산문화예술회관 제1·2전시장",
    address: "울산광역시 남구 번영로 200",
    period: "2026.09.15 ~ 2026.11.10",
    price: "무료",
    category: "전시 리뷰",
    tags: ["울산전시", "울산문화예술회관", "구상회화", "울산남구", "삼산동데이트", "가을전시"],
    photoKeywords: "oil painting gallery fine art exhibition classical frame",
    summary: "영남 구상회화 거장들의 명품 원화와 조각을 만나는 특별전! 울산 도심 속 예술 힐링과 삼산동 맛집 투어.",
    nearbySpots: ["태화강 삼호대숲", "울산 삼산동 디자인거리", "울산문화공원", "달동 문화공원"]
  },
  {
    slug: "ulsan-donggu-daewangam-art",
    title: "대왕암공원 해맞이 기획전 : 동해의 푸른 파도와 기암괴석 조형전",
    region: "울산",
    subRegion: "동구",
    venueName: "울산동구문화원",
    address: "울산광역시 동구 등대로 95 (일산동)",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["울산전시", "울산동구", "대왕암공원", "출렁다리", "슬도", "일산해수욕장"],
    photoKeywords: "ocean coast rock pine forest modern outdoor sculpture",
    summary: "기암괴석과 해송 숲, 푸른 동해 바다가 어우러진 대왕암공원 가을 조형전! 대왕암 출렁다리와 슬도 바위길 산책 코스.",
    nearbySpots: ["대왕암공원 출렁다리", "슬도 등대 바위길", "일산해수욕장", "울기등대 해송숲"]
  },
  {
    slug: "ulsan-bukgu-soeburi-art",
    title: "울산북구문화예술회관 기획전 : 달천철장의 불꽃과 현대 금속공예",
    region: "울산",
    subRegion: "북구",
    venueName: "울산북구문화예술회관",
    address: "울산광역시 북구 산하중앙2로 53",
    period: "2026.09.10 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["울산전시", "울산북구", "북구문화예술회관", "달천철장", "강동몽돌해변", "정자항"],
    photoKeywords: "metal sculpture steel furnace modern installation exhibition",
    summary: "한반도 철기 문화의 요람 달천철장의 유구한 쇠부리 역사와 현대 금속 조형 예술의 만남! 강동 몽돌해변과 정자항 연계 코스.",
    nearbySpots: ["달천철장 유적지", "강동 몽돌해변", "정자항 활어회거리", "편백산림욕장"]
  },
  {
    slug: "ulsan-uljugun-onggi-museum",
    title: "외고산 옹기박물관 특별전 : 숨 쉬는 그릇, 천년 옹기의 미학",
    region: "울산",
    subRegion: "울주군",
    venueName: "외고산 옹기박물관",
    address: "울산광역시 울주군 온양읍 외고산길 23",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["울산전시", "울산울주군", "외고산옹기마을", "간절곶", "반구대암각화", "영남알프스"],
    photoKeywords: "pottery ceramic onggi traditional clay pottery village",
    summary: "국내 최대의 전통 민속 옹기마을 외고산에서 열리는 가을 옹기 특별전! 간절곶 일출 명소와 반구대 암각화 연계 투어.",
    nearbySpots: ["외고산 옹기마을", "간절곶 소망우체통", "영남알프스 작천정", "국보 반구대 암각화"]
  },
  {
    slug: "gimhae-clayarch-autumn",
    title: "클레이아크김해미술관 기획전 : 흙과 미래 건축",
    region: "경남",
    subRegion: "김해시",
    venueName: "클레이아크김해미술관 돔하우스",
    address: "경상남도 김해시 진례면 진례로 275-51",
    period: "2026.06.01 ~ 2026.09.28",
    price: "3,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "김해전시", "클레이아크김해", "건축도자", "돔하우스", "가족나들이"],
    photoKeywords: "ceramic pottery architectural tile modern dome sculpture",
    summary: "건축 도자의 무한한 가능성을 조명하는 돔하우스 특별 기획전! 자연광이 쏟아지는 아름다운 돔 미술관과 도자 체험.",
    nearbySpots: ["진례 분청도자마을", "화포천습지생태공원", "김해분청도자박물관", "봉하마을 생태문화공원"]
  },
  {
    slug: "gyeongnam-autumn-masterpiece",
    title: "경남도립미술관 가을 기획전 : 남도의 붓길",
    region: "경남",
    subRegion: "창원시",
    venueName: "경남도립미술관 전관",
    address: "경상남도 창원시 의창구 용지로 296",
    period: "2026.08.10 ~ 2026.11.15",
    price: "2,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "창원전시", "경남도립미술관", "한국근현대회화", "용지호수", "창원데이트"],
    photoKeywords: "korean traditional ink painting modern canvas landscape",
    summary: "영남 근현대 회화의 깊은 정취를 느끼는 가을 명품전! 미술관 관람 후 용지호수 산책로와 가로수길 카페 투어.",
    nearbySpots: ["용지호수공원", "창원 가로수길 카페거리", "경남도청 연못", "창원역사민속관"]
  },
  {
    slug: "yangsan-ssangbyeongnu-autumn",
    title: "양산 쌍벽루아트홀 가을 기획전 : 영남알프스와 양산천의 사계",
    region: "경남",
    subRegion: "양산시",
    venueName: "양산 쌍벽루아트홀",
    address: "경상남도 양산시 중앙우회로 149",
    period: "2026.09.10 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "양산전시", "쌍벽루아트홀", "영남알프스", "황산공원", "양산데이트"],
    photoKeywords: "mountain landscape river nature fine art gallery",
    summary: "영남알프스의 웅장한 능선과 맑은 양산천의 사계절 풍경을 서정적 화폭으로 담아낸 가을 명품 무료 기획전! 통도사와 황산공원 연계 나들이 코스.",
    nearbySpots: ["통도사", "황산공원 댑싸리생태숲", "양산타워", "양산천 음악분수"]
  },
  {
    slug: "miryang-arirang-art-center",
    title: "밀양아리랑아트센터 특별기획 : 아리랑의 선율과 영남루의 미학",
    region: "경남",
    subRegion: "밀양시",
    venueName: "밀양아리랑아트센터",
    address: "경상남도 밀양시 밀양대공원로 112",
    period: "2026.09.15 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "밀양전시", "밀양아리랑아트센터", "영남루", "위양지", "밀양나들이"],
    photoKeywords: "traditional korean architecture pavillion river historic art",
    summary: "국보로 승격된 영남루의 우아한 건축미와 유네스코 인류무형유산 밀양아리랑의 흥을 현대 시각예술로 재해석한 특별전! 위양지 드라이브 추천 코스.",
    nearbySpots: ["영남루 (국보)", "위양지", "밀양아리랑우주천문대", "표충사 계곡"]
  },
  {
    slug: "changnyeong-gaya-tumuli-museum",
    title: "창녕박물관 유네스코 세계유산 등재 기념전 : 비화가야의 숨결",
    region: "경남",
    subRegion: "창녕군",
    venueName: "창녕박물관",
    address: "경상남도 창녕군 창녕읍 창녕장터로 28",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "창녕전시", "창녕박물관", "비화가야", "우포늪", "창녕여행"],
    photoKeywords: "ancient gold artifact pottery museum excavation relics",
    summary: "유네스코 세계유산으로 등재된 창녕 교동과 송현동 고분군의 찬란한 비화가야 황금 유물과 토기 예술을 집대성한 가을 특별전! 우포늪 생태 나들이.",
    nearbySpots: ["교동과 송현동 고분군", "우포늪 생태공원", "부곡온천 특구", "화왕산 억새군락"]
  },
  {
    slug: "goseong-sogaya-heritage-museum",
    title: "고성박물관 가을 기획전 : 소가야의 해양 교류와 남해의 미학",
    region: "경남",
    subRegion: "고성군",
    venueName: "고성박물관",
    address: "경상남도 고성군 고성읍 송학로113번길 50",
    period: "2026.09.05 ~ 2026.11.25",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "고성전시", "고성박물관", "소가야", "상족암", "고성나들이"],
    photoKeywords: "ocean coast sea cliff ancient bronze pottery museum",
    summary: "해상 실크로드를 주름잡던 해상왕국 소가야의 고대 토기와 해양 교류 유물을 조명하는 고성박물관 가을 기획전! 송학동 고분군과 상족암 해안 절경 투어.",
    nearbySpots: ["송학동 고분군", "상족암 군립공원", "당항포 관광지", "고성 공룡박물관"]
  },
  {
    slug: "sacheon-ocean-art-museum",
    title: "사천미술관 바다 기획전 : 삼천포 푸른 물결과 현대미술",
    region: "경남",
    subRegion: "사천시",
    venueName: "사천미술관",
    address: "경상남도 사천시 사천대로 17 (대방동)",
    period: "2026.09.01 ~ 2026.10.31",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "사천전시", "사천미술관", "삼천포대교", "사천바다케이블카", "사천데이트"],
    photoKeywords: "ocean sea bridge modern art gallery coastal view",
    summary: "한려수도 푸른 바다와 붉은 삼천포대교를 배경으로 펼쳐지는 현대미술 기획전! 사천바다케이블카 탑승과 실안낙조 카페거리 드라이브 코스.",
    nearbySpots: ["사천바다케이블카", "삼천포대교공원", "실안낙조 카페거리", "삼천포 용궁수산시장"]
  },
  {
    slug: "namhae-wind-trace-museum",
    title: "남해 바람흔적미술관 기획전 : 쪽빛 바다와 바람의 조각",
    region: "경남",
    subRegion: "남해군",
    venueName: "남해 바람흔적미술관",
    address: "경상남도 남해군 삼동면 바람흔적길 39",
    period: "2026.09.10 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "남해전시", "바람흔적미술관", "독일마을", "남해드라이브", "남해여행"],
    photoKeywords: "outdoor sculpture windmill nature lake sea garden art",
    summary: "푸른 남해 산과 호수가 어우러진 언덕에 수십 개의 붉은 바람개비 조각이 돌아가는 동화 같은 무인 미술관 특별전! 남해 독일마을 연계 투어.",
    nearbySpots: ["남해 독일마을", "원예예술촌", "물건항 방조어부림", "보리암 금산"]
  },
  {
    slug: "hadong-jirisan-art-farm",
    title: "지리산아트팜 특별기획 : 섬진강의 서정과 지리산 대지예술",
    region: "경남",
    subRegion: "하동군",
    venueName: "지리산아트팜",
    address: "경상남도 하동군 적량면 삼화실로 506-1",
    period: "2026.09.15 ~ 2026.12.10",
    price: "5,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "하동전시", "지리산아트팜", "섬진강", "최참판댁", "하동여행"],
    photoKeywords: "nature land art forest stream modern organic sculpture",
    summary: "자연과 예술이 하나 되는 지리산 자락의 복합 문화예술 공간 지리산아트팜 특별전! 평사리 최참판댁, 화개장터와 함께 엮는 감성 슬로트래블 코스.",
    nearbySpots: ["악양 평사리 최참판댁", "화개장터", "쌍계사 십리벚꽃길", "스타웨이 하동 전망대"]
  },
  {
    slug: "hamyang-sangrim-art-center",
    title: "함양문화예술회관 가을 기획전 : 천년의 상림숲과 지리산의 사계",
    region: "경남",
    subRegion: "함양군",
    venueName: "함양문화예술회관",
    address: "경상남도 함양군 함양읍 고운로 169",
    period: "2026.09.10 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "함양전시", "함양문화예술회관", "상림공원", "개평한옥마을", "함양여행"],
    photoKeywords: "ancient forest trees autumn foliage pine mountain stream",
    summary: "최치원 선생이 조성한 천년의 숲 함양 상림공원의 숨결과 지리산 능선의 사계절을 담은 가을 명품 무료 기획전! 개평한옥마을 일두고택 힐링 산책.",
    nearbySpots: ["함양 상림공원 (천년의 숲)", "개평한옥마을 일두고택", "대봉산 휴양밸리 모노레일", "용추폭포"]
  },
  {
    slug: "geochang-suseungdae-museum",
    title: "거창박물관 가을 특별기획 : 수승대의 풍류와 영남 유학의 미학",
    region: "경남",
    subRegion: "거창군",
    venueName: "거창박물관",
    address: "경상남도 거창군 거창읍 수남로 2181",
    period: "2026.09.05 ~ 2026.11.25",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "거창전시", "거창박물관", "수승대", "거창창포원", "감악산"],
    photoKeywords: "historic pavillion rock stream landscape classical calligraphy art",
    summary: "국가지정 명승 수승대의 거북바위와 요수정, 영남 선비들의 풍류와 학문적 깊이를 조명하는 거창박물관 가을 특별전! 감악산 아스타국화 언덕 투어.",
    nearbySpots: ["수승대 명승지 (요수정)", "거창 창포원", "감악산 풍력발전단지 아스타국화", "Y자형 출렁다리"]
  },
  {
    slug: "hapcheon-okjeon-tumuli-museum",
    title: "합천박물관 유네스코 세계유산전 : 옥전고분군과 다라국의 황금유산",
    region: "경남",
    subRegion: "합천군",
    venueName: "합천박물관",
    address: "경상남도 합천군 쌍책면 황강옥전로 1558",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "합천전시", "합천박물관", "옥전고분군", "해인사", "황매산"],
    photoKeywords: "ancient gold sword artifacts burial mound historical relics",
    summary: "세계문화유산 옥전고분군에서 출토된 찬란한 황금 장신구와 철기 유물을 총망라한 특별전! 가야산 해인사 팔만대장경과 황매산 억새평원 연계 투어.",
    nearbySpots: ["옥전고분군", "해인사 (팔만대장경)", "황매산 억새군락지", "합천영상테마파크"]
  },
  {
    slug: "sancheong-donguibogam-museum",
    title: "산청 동의보감촌 특별기획 : 지리산 약초의 향기와 힐링 예술",
    region: "경남",
    subRegion: "산청군",
    venueName: "산청 한의학박물관",
    address: "경상남도 산청군 금서면 동의보감로1112번길 45-6",
    period: "2026.09.15 ~ 2026.11.30",
    price: "2,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "산청전시", "동의보감촌", "남사예담촌", "지리산약초", "산청힐링"],
    photoKeywords: "medicinal herbs traditional medicine garden mountain wellness",
    summary: "지리산 자생 약초의 치유력과 유네스코 세계기록유산 동의보감의 역사적 가치를 시각 예술로 만나는 웰니스 전시! 무릉교 출렁다리와 남사예담촌 나들이.",
    nearbySpots: ["동의보감촌 테마파크", "무릉교 출렁다리", "남사예담촌 한옥마을", "대원사 계곡길"]
  },
  {
    slug: "haman-marisan-tumuli-museum",
    title: "함안박물관 유네스코 세계유산 특별전 : 아라가야의 찬란한 불꽃",
    region: "경남",
    subRegion: "함안군",
    venueName: "함안박물관",
    address: "경상남도 함안군 가야읍 고분길 153-31",
    period: "2026.09.01 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "함안전시", "함안박물관", "말이산고분군", "아라가야", "악양생태공원"],
    photoKeywords: "ancient clay pottery ancient flame pattern tumuli museum",
    summary: "철의 왕국 아라가야의 중심지 말이산 고분군의 불꽃무늬 토기와 상형토기를 만나는 세계유산전! 악양생태공원 핑크뮬리와 악양루 노을 나들이.",
    nearbySpots: ["말이산 고분군 (세계유산)", "악양생태공원 핑크뮬리", "악양루", "함안 연꽃테마파크"]
  },
  {
    slug: "uiryeong-righteous-army-museum",
    title: "의령 의병박물관 가을 특별전 : 곽재우 의병장의 호국혼과 남강의 기상",
    region: "경남",
    subRegion: "의령군",
    venueName: "의령 의병박물관",
    address: "경상남도 의령군 의령읍 충익로 1-25",
    period: "2026.09.10 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "의령전시", "의병박물관", "충익사", "솥바위", "의령나들이"],
    photoKeywords: "historic sword traditional armor historic museum monument river",
    summary: "임진왜란 최초의 의병장 홍의장군 곽재우와 17장령의 호국 유물, 보물 장검을 만나는 특별전! 부자 기운의 남강 솥바위와 한우산 억새 드라이브 코스.",
    nearbySpots: ["충익사 & 의병탑", "남강 솥바위 (부자명당)", "의령 구름다리", "한우산 풍력발전단지"]
  },
  {
    slug: "changwon-seongsan-art-hall",
    title: "창원 성산아트홀 가을 기획전 : 남도 현대미술의 새로운 지평",
    region: "경남",
    subRegion: "창원시 성산구",
    venueName: "창원 성산아트홀 전시관",
    address: "경상남도 창원시 성산구 중앙대로 181",
    period: "2026.09.15 ~ 2026.11.30",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "창원전시", "성산아트홀", "용지호수", "창원가로수길", "남도현대미술"],
    photoKeywords: "modern art exhibition gallery changwon lake park sculpture",
    summary: "남도의 풍부한 서정성과 현대미술의 혁신적인 조형 언어가 만나는 성산아트홀 가을 기획전! 용지호수 음악분수와 창원 가로수길 카페거리 감성 투어.",
    nearbySpots: ["용지호수공원 (음악분수)", "창원 가로수길 카페거리", "창원NC파크", "대상공원"]
  },
  {
    slug: "tongyeong-jeon-hyeok-lim-museum",
    title: "통영 전혁림미술관 특별전 : 바다의 화폭과 코발트블루의 미학",
    region: "경남",
    subRegion: "통영시",
    venueName: "전혁림미술관",
    address: "경상남도 통영시 봉수1길 10",
    period: "2026.09.10 ~ 2026.12.15",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "통영전시", "전혁림미술관", "한국의피카소", "미륵산케이블카", "통영여행"],
    photoKeywords: "blue abstract painting modern korean art ocean ceramic tile",
    summary: "'한국의 피카소'라 불리는 화백 전혁림의 강렬한 코발트블루 바다 화폭을 만나는 특별전! 미륵산 케이블카와 봉평동 감성 골목 투어.",
    nearbySpots: ["통영 케이블카 (미륵산)", "통영 해저터널", "달아공원 일몰", "동피랑 벽화마을"]
  },
  {
    slug: "geoje-haegeumgang-theme-museum",
    title: "거제 해금강테마박물관 기획전 : 동서양 근현대 미술의 향연",
    region: "경남",
    subRegion: "거제시",
    venueName: "해금강테마박물관 유경미술관",
    address: "경상남도 거제시 남부면 갈곶리 262",
    period: "2026.09.05 ~ 2026.11.30",
    price: "6,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "거제전시", "해금강테마박물관", "바람의언덕", "신선대", "거제남부"],
    photoKeywords: "ocean view museum antique retro vintage lighthouse coastal",
    summary: "푸른 남해 바다가 한눈에 내려다보이는 해금강 언덕 위 복합예술관! 거제 8경 바람의 언덕, 신선대와 함께 즐기는 감성 오션 드라이브 코스.",
    nearbySpots: ["바람의 언덕 (풍차)", "신선대 바위전망대", "해금강 유람선", "도장포마을"]
  },
  {
    slug: "busan-moca-eulsukdo",
    title: "부산현대미술관(MoCA) 생태환경전 : 을숙도의 갈대와 지속가능한 미래",
    region: "부산",
    subRegion: "사하구",
    venueName: "부산현대미술관 (MoCA)",
    address: "부산광역시 사하구 낙동남로 1191 (을숙도)",
    period: "2026.09.12 ~ 2026.12.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["부산전시", "부산현대미술관", "을숙도", "낙동강하구", "수직정원", "친환경전시"],
    photoKeywords: "vertical garden modern contemporary museum reeds wetland",
    summary: "패트릭 블랑의 거대한 수직정원과 생태 미학이 살아 숨쉬는 을숙도 MoCA 특별전! 낙동강하구에코센터와 핑크뮬리 군락지 힐링 산책.",
    nearbySpots: ["을숙도 철새공원 & 에코센터", "다대포 해변공원 (몰운대)", "장림포구 부네치아", "아미산전망대"]
  },
  {
    slug: "sacheon-aerospace-museum",
    title: "사천 우주항공박물관 특별기획 : 푸른 하늘을 향한 비상과 미래 우주",
    region: "경남",
    subRegion: "사천시",
    venueName: "사천 우주항공박물관",
    address: "경상남도 사천시 사남면 공단1로 78",
    period: "2026.09.01 ~ 2026.11.30",
    price: "3,000원",
    category: "전시 리뷰",
    tags: ["경남전시", "사천전시", "우주항공박물관", "사천바다케이블카", "실안낙조", "가족나들이"],
    photoKeywords: "aircraft aerospace museum rocket model historic plane sky",
    summary: "대한민국 우주항공의 수도 사천에서 펼쳐지는 비행의 역사와 미래 우주 과학 전시! 사천바다케이블카와 한국 9대 일몰 실안낙조 투어.",
    nearbySpots: ["사천바다케이블카 & 아쿠아리움", "실안해안도로 (실안낙조)", "대방진굴항", "무지개빛 해안도로"]
  },
  {
    slug: "jinju-gyeongnam-culture-art-center",
    title: "경남문화예술회관 특별전 : 남강의 물결과 영남 조형예술의 맥",
    region: "경남",
    subRegion: "진주시",
    venueName: "경남문화예술회관 제1·2전시실",
    address: "경상남도 진주시 강남로 215",
    period: "2026.09.15 ~ 2026.11.20",
    price: "무료",
    category: "전시 리뷰",
    tags: ["경남전시", "진주전시", "경남문화예술회관", "진주남강", "촉석루", "진주나들이"],
    photoKeywords: "contemporary sculpture painting river view exhibition hall",
    summary: "유유히 흐르는 진주 남강변을 배경으로 펼쳐지는 영남 대표 조형예술가들의 대작 향연! 촉석루 야경과 물빛나루 쉼터 산책 코스.",
    nearbySpots: ["진주성 & 촉석루", "진주 남강 유등테마공원", "망진산 봉수대 전망대", "중앙유등시장"]
  }
];

// 네이버 API HUB 이미지 검색 단일 쿼리 호출 함수
async function fetchNaverImages(query, count = 2) {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) return [];
  const cleanQuery = query.replace(/\(.*?\)/g, "").replace(/&/g, " ").trim();
  const hubUrl = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encodeURIComponent(cleanQuery)}&display=${count}&sort=sim&filter=all`;
  const baseHeaders = {
    "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
    "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
  };

  try {
    const res = await fetch(hubUrl, { headers: baseHeaders });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => {
      const rawTitle = (item.title || "").replace(/<[^>]*>?/gm, "").trim();
      const secureUrl = item.link.startsWith("https://")
        ? item.link
        : `https://search.pstatic.net/common/?src=${encodeURIComponent(item.link)}`;
      return {
        url: secureUrl,
        alt: rawTitle || cleanQuery
      };
    });
  } catch (err) {
    console.warn(`⚠️ 네이버 이미지 수집 실패 [${query}]:`, err.message);
    return [];
  }
}

// 현재 KST 기준 계절 및 시기 정보 계산 함수
function getSeasonInfo(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const kstOffset = 9 * 60;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kst = new Date(utc + kstOffset * 60000);
  const month = kst.getMonth() + 1; // 1~12

  if (month >= 3 && month <= 5) {
    return { name: "봄", keyword: "봄", themes: ["봄", "신록", "봄꽃"], desc: "화사한 봄빛과 싱그러운 신록" };
  } else if (month >= 6 && month <= 8) {
    return { name: "여름", keyword: "여름", themes: ["여름", "녹음", "바다"], desc: "푸르른 녹음과 시원한 풍경" };
  } else if (month >= 9 && month <= 11) {
    return { name: "가을", keyword: "가을", themes: ["가을", "단풍", "꽃무릇"], desc: "고즈넉한 가을 단풍과 정취" };
  } else {
    return { name: "겨울", keyword: "겨울", themes: ["겨울", "설경", "차분한"], desc: "포근하고 아늑한 겨울 풍경" };
  }
}

// 3. 실제 해당 지역/장소와 계절(봄/여름/가을/겨울)을 네이버에서 정밀 매칭 수집하는 함수
async function fetchRealPlacePhotos(exhibition, naverData = {}, dateStr) {
  const photos = [];
  const season = getSeasonInfo(dateStr);
  const cleanVenue = (exhibition.venueName || exhibition.location || "")
    .replace(/\s*(제?\d+[·,\-~0-9]*전시장|전관|돔하우스|석천홀|비프힐.*|미술관\s*$)/g, "")
    .split(" 및 ")[0]
    .split(" (")[0]
    .trim();

  console.log(`📸 [네이버 정밀 매칭 시작] 장소: ${cleanVenue} | 계절: ${season.name} (${season.desc})`);

  // 검색 헬퍼: 계절 키워드 우선 검색 후 필요시 일반 검색 폴백
  async function searchSeasonPlace(baseQuery, count = 2) {
    const seasonQuery = `${baseQuery} ${season.keyword}`;
    let res = await fetchNaverImages(seasonQuery, count);
    if (res.length === 0) {
      // 계절 키워드로 결과가 없으면 기본 장소명으로 재검색
      res = await fetchNaverImages(baseQuery, count);
    }
    return res;
  }

  // 1) 대표 전시장 / 전시 공간 실제 사진 (장소 + 계절)
  const venueImgs = await searchSeasonPlace(`${exhibition.region} ${cleanVenue}`, 2);
  if (venueImgs[0]) {
    photos.push({
      url: venueImgs[0].url,
      alt: `${exhibition.venueName || cleanVenue} ${season.name} 전경 및 전시 공간`
    });
  }

  // 2) 주변 대표 명소 1번 실제 현장 사진 (장소 + 계절 연계: 예: 상림공원 가을, 충익사 가을)
  const spot1 = (exhibition.nearbySpots && exhibition.nearbySpots[0]) || cleanVenue;
  const spot1Imgs = await searchSeasonPlace(spot1, 2);
  if (spot1Imgs[0]) {
    photos.push({
      url: spot1Imgs[0].url,
      alt: `${spot1}의 아름다운 ${season.name} 실제 풍경`
    });
  }

  // 3) 주변 인기 맛집 / 감성 카페 실제 사진 (현장 플레이스 매칭)
  const foodSpot = (naverData.localRestaurants && naverData.localRestaurants[0]?.title) || `${cleanVenue} 맛집 카페`;
  const foodImgs = await fetchNaverImages(foodSpot, 2);
  if (foodImgs[0]) {
    photos.push({
      url: foodImgs[0].url,
      alt: `${foodSpot} 대표 미식 & 감성 공간`
    });
  }

  // 4) 주변 대표 명소 2번 실제 사진 (고택/자연/산책로 + 계절: 예: 개평한옥마을 일두고택 가을)
  const spot2 = (exhibition.nearbySpots && exhibition.nearbySpots[1]) || `${exhibition.region} ${season.name} 명소`;
  const spot2Imgs = await searchSeasonPlace(spot2, 2);
  if (spot2Imgs[0]) {
    photos.push({
      url: spot2Imgs[0].url,
      alt: `${spot2} 고즈넉한 ${season.name} 정취`
    });
  }

  // 5) 추가 전시 안내 / 연계 문화 공간 사진 보강
  if (venueImgs[1]) {
    photos.push({
      url: venueImgs[1].url,
      alt: `${exhibition.title} ${season.name} 전시 안내 풍경`
    });
  }

  // 안전장치: 네이버 검색으로 3장 미만 확보된 경우에만 Pexels로 보강
  if (photos.length < 3 && PEXELS_API_KEY) {
    try {
      const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(exhibition.photoKeywords || "korean gallery culture")}&per_page=3&orientation=landscape`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      if (pexelsRes.ok) {
        const pData = await pexelsRes.json();
        for (const p of pData.photos || []) {
          if (photos.length >= 4) break;
          photos.push({
            url: p.src.large2x || p.src.large || p.src.original,
            alt: `부울경 ${season.name} 문화예술 및 나들이`
          });
        }
      }
    } catch {
      // ignore
    }
  }

  // 최종 기본 안전 이미지
  if (photos.length === 0) {
    photos.push({
      url: "https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      alt: `${exhibition.title}`
    });
  }

  console.log(`✅ [장소+계절 정밀 매칭 완료] 총 ${photos.length}장의 ${season.name} 현장 사진 확보`);
  return photos;
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
- **🧺 미술관 옆 정겨운 전통시장 & 5일장 장터 나들이**: ${exhibition.region} ${exhibition.subRegion || ''} 인근의 대표 전통 재래시장 및 5일장 장날 정보, 대표 장터 먹거리(국밥, 손국수, 전통 떡, 수산물 등)와 연계 장터 힐링 코스 소개!
- **📚 아이와 함께! 미술관 옆 도서관 & 쌈지 작은도서관 쉼표**: ${exhibition.region} ${exhibition.subRegion || ''} 인근의 대표 복합문화도서관이나 감성 쌈지·숲속 작은도서관, 아이들을 위한 북플레이존과 가족 힐링 포인트 소개!
- **🎡 함께 즐기는 주변 볼거리 & 핫플 투어 코스**: 네이버 볼거리 데이터 및 주변 명소를 엮어 알찬 당일치기/반나절 나들이 코스 구성. 네 번째 주변 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치!
- **🎉 함께 둘러보기 좋은 인근 문화 행사 & 축제**: 네이버 행사/축제 데이터를 소개하며 풍성한 볼거리 안내.
- **💡 AI 도슨트의 관람 & 주차 꿀팁**: 주차 정보, 가장 쾌적한 방문 시간대, 사진 촬영 포인트.
- **따뜻한 마무리 멘트**.

3. 오직 완성된 마크다운 내용만 출력해 (앞뒤에 \`\`\`markdown 또는 추가 설명 붙이지 말 것).
`;

  const candidateModels = [
    "gemini-flash-lite-latest",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro"
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
        await new Promise(r => setTimeout(r, 1500));
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
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  throw lastError || new Error("모든 Gemini 모델 호출에 실패했습니다.");
}

// 5. 2단계 철저 중복 검증 및 메인 실행 루틴
async function main() {
  console.log("🚀 [AI 자동 포스팅] 부울경 전시 글 생성 시작 (2단계 철저 중복 검증 모드)...");
  const postsDir = path.join(rootDir, "src", "content", "posts");
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(postsDir);
  const targetDateArg = process.argv[2];
  const today = (targetDateArg && /^\d{4}-\d{2}-\d{2}$/.test(targetDateArg)) ? targetDateArg : getKSTDateString();

  // =========================================================================
  // [1단계 검증] 최근 14일(2주) 쿨다운 & 최장 미작성(LRU) 후보 스마트 선별
  // =========================================================================
  const lastWrittenMap = new Map();
  const todayWrittenSlugs = new Set();
  const recent14DaysSlugs = new Set();

  const todayTime = new Date(today).getTime();

  for (const file of existingFiles) {
    if (!file.endsWith(".md") || file === ".gitkeep") continue;
    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, postDate, postSlug] = match;
      if (postDate === today) {
        todayWrittenSlugs.add(postSlug);
      }
      const postTime = new Date(postDate).getTime();
      const diffDays = Math.floor((todayTime - postTime) / (1000 * 60 * 60 * 24));
      
      // 최근 14일 이내(0일~13일) 발행된 글은 2주 쿨다운 블랙리스트에 등록
      if (diffDays >= 0 && diffDays < 14) {
        recent14DaysSlugs.add(postSlug);
      }

      const prevDate = lastWrittenMap.get(postSlug);
      if (!prevDate || postDate > prevDate) {
        lastWrittenMap.set(postSlug, postDate);
      }
    }
  }

  console.log(`📊 [1단계 검증 시작] 최근 14일(2주) 이내 발행된 제외 대상: ${recent14DaysSlugs.size}개`);

  // 1. 당일 이미 발행된 전시 제외
  // 2. 최근 14일 이내에 발행된 전시 엄격 제외 (2주 쿨다운 보장)
  let availablePool = EXHIBITION_POOL.filter(ex => !todayWrittenSlugs.has(ex.slug) && !recent14DaysSlugs.has(ex.slug));

  // 만약 14일 초과 미작성 전시가 부족한 경우, 전체 풀 중 가장 오래전에 소개된 전시 순으로 안전 순환
  if (availablePool.length === 0) {
    console.warn("⚠️ 14일 초과 미작성 전시가 모두 소진되어, 전체 풀 중 가장 오래전에 소개된 전시를 엄격 순환합니다.");
    availablePool = EXHIBITION_POOL.filter(ex => !todayWrittenSlugs.has(ex.slug));
  }

  if (availablePool.length === 0) {
    console.error("❌ 오늘 작성 가능한 전시 후보가 없습니다.");
    process.exit(1);
  }

  // 각 후보별 경과일수(daysSince) 계산
  const scoredCandidates = availablePool.map(ex => {
    const lastDate = lastWrittenMap.get(ex.slug);
    const daysSince = lastDate 
      ? Math.floor((todayTime - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : 99999;
    return {
      exhibition: ex,
      lastDate: lastDate || "미작성(최초)",
      daysSince
    };
  });

  // 점수 순 정렬: daysSince가 큰 순 (가장 오랫동안 작성되지 않은 전시가 최상단)
  scoredCandidates.sort((a, b) => b.daysSince - a.daysSince);

  // 상위 후보 선택 (1순위 최장 미작성 전시)
  const chosen = scoredCandidates[0];
  const targetExhibition = chosen.exhibition;

  console.log(`✅ [1단계 검증 통과] 1차 선정 전시: [${targetExhibition.region}] ${targetExhibition.title}`);
  console.log(`   - 마지막 작성일: ${chosen.lastDate} (${chosen.daysSince === 99999 ? '최초 작성' : `${chosen.daysSince}일 전`}) -> 14일 쿨다운 완벽 충족!`);

  // 네이버 실시간 블로그 후기, 주변 맛집, 볼거리, 행사 검색
  console.log(`🔍 네이버 API HUB 실시간 맛집/볼거리/행사/후기 검색 중 (${targetExhibition.venueName})...`);
  const naverData = await fetchNaverSearchData(targetExhibition.venueName, targetExhibition.region);
  console.log(`✅ 네이버 데이터 수집 완료: 블로그 ${naverData.blogReviews.length}건, 맛집 ${naverData.localRestaurants.length}건, 볼거리 ${naverData.nearbyAttractions.length}건, 행사 ${naverData.localEvents.length}건`);

  // 네이버 API 기반 실제 해당 장소/명소 및 계절(봄/여름/가을/겨울) 현장 고화질 사진 정밀 검색
  console.log(`📸 네이버 OpenAPI/API HUB 실제 장소 현장 및 계절 사진 정밀 검색 중...`);
  const photos = await fetchRealPlacePhotos(targetExhibition, naverData, today);
  console.log(`✅ ${photos.length}장의 실제 장소 & 계절 맞춤 현장 사진 준비 완료.`);

  // Gemini AI로 글 작성
  console.log("✍️ Gemini AI로 네이버 맛집/행사/볼거리 포함 프리미엄 전시 리뷰 본문 작성 중...");
  const postContent = await generatePostWithGemini(targetExhibition, photos, today, naverData);

  // =========================================================================
  // [2단계 검증] 파일 저장 직전 14일(2주) 사후 세이프가드 단언 검증 (Pre-Save Assert)
  // =========================================================================
  console.log("🔒 [2단계 검증 시작] 파일 저장 직전 14일 이내 중복 여부 최종 단언 검사 중...");
  const reloadedFiles = fs.readdirSync(postsDir);
  const preSaveConflicts = [];

  for (const file of reloadedFiles) {
    if (!file.endsWith(".md") || file === ".gitkeep") continue;
    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, pDate, pSlug] = match;
      if (pSlug === targetExhibition.slug) {
        const diff = Math.floor((todayTime - new Date(pDate).getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 14) {
          preSaveConflicts.push({ file, date: pDate, diff });
        }
      }
    }
  }

  if (preSaveConflicts.length > 0) {
    console.error(`🚨 [2단계 검증 실패] ${targetExhibition.slug}는 최근 14일 내 이미 발행된 이력이 있습니다:`, preSaveConflicts);
    throw new Error(`[2단계 세이프가드 차단] 14일 이내 중복 감지로 인해 파일 저장을 안전하게 중단했습니다.`);
  }

  console.log(`🎉 [2단계 검증 통과] 14일 이내 중복 0건 확인 완료! 안전하게 디스크에 저장합니다.`);

  // 파일명 지정: YYYY-MM-DD-slug.md
  const fileName = `${today}-${targetExhibition.slug}.md`;
  const filePath = path.join(postsDir, fileName);

  fs.writeFileSync(filePath, postContent, "utf8");
  console.log(`🎉 [발행 성공] 새 글 파일이 안전하게 저장되었습니다: src/content/posts/${fileName}`);
}

main().catch(err => {
  console.error("❌ 오류 발생:", err);
  process.exit(1);
});
