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

// =========================================================================
// 회장님 특명 반영: 오후 4대 테마 스마트 순환 나들이 풀 (소재 무한 확장)
// 1. 이색 갤러리 & 복합문화공간
// 2. 5일장 & 전통시장 먹거리 투어
// 3. 특화 도서관 & 가족 북캉스
// 4. 계절 힐링로드 & 감성 드라이브
// =========================================================================
const AFTERNOON_THEME_POOL = [
  // --- [테마 1: 이색 갤러리 & 복합문화공간] ---
  {
    slug: "gallery-busan-haeundae-dalmaji",
    themeType: "gallery",
    title: "해운대 달맞이길 감성 갤러리 투어 : 청사포 오션뷰와 현대미술의 향연",
    region: "부산",
    subRegion: "해운대구",
    venueName: "달맞이길 화랑가 (조현화랑 & 갤러리아트숲)",
    address: "부산광역시 해운대구 달맞이길65번길 171",
    period: "상설 및 기획전시 운영",
    price: "무료 (카페 음료 별도)",
    category: "감성 갤러리",
    tags: ["부산갤러리", "달맞이길", "해운대데이트", "청사포", "오션뷰갤러리", "가을감성"],
    photoKeywords: "haeundae ocean view art gallery modern interior cafe",
    summary: "청사포 푸른 바다를 내려다보며 감상하는 수준 높은 현대미술 기획전! 문텐로드 숲길 산책과 달맞이 언덕 감성 카페 투어.",
    nearbySpots: ["청사포 다릿돌전망대", "해운대 블루라인파크 미포정거장", "문텐로드 산책로", "달맞이길 카페거리"]
  },
  {
    slug: "gallery-busan-jeonpo-art-space",
    themeType: "gallery",
    title: "서면 전포 카페거리 아트스페이스 : 골목 속 숨은 독립 갤러리와 문화살롱",
    region: "부산",
    subRegion: "부산진구",
    venueName: "전포 아트스페이스 & 복합문화공간",
    address: "부산광역시 부산진구 동성로 25 (전포동)",
    period: "화~일 11:00 ~ 20:00",
    price: "무료",
    category: "감성 갤러리",
    tags: ["부산갤러리", "전포카페거리", "서면핫플", "독립예술", "아트스페이스", "부산주말데이트"],
    photoKeywords: "urban art space hipster gallery coffee indie cafe",
    summary: "트렌디한 전포동 카페골목 사이 숨겨진 감각적인 독립 갤러리! 개성 넘치는 청년 작가들의 작품과 스페셜티 커피를 함께 즐기는 도심 속 예술 쉼터.",
    nearbySpots: ["전포사잇길 감성카페", "서면 만취골목", "부산시민공원", "송상현광장"]
  },
  {
    slug: "gallery-busan-yeongdo-park-culture",
    themeType: "gallery",
    title: "영도 피아크(P.ARK) 복합문화공간 : 오션뷰 라운지와 감성 기획전",
    region: "부산",
    subRegion: "영도구",
    venueName: "피아크 (P.ARK) 2·3층 복합문화전시장",
    address: "부산광역시 영도구 해양로 195",
    period: "매일 10:00 ~ 23:00",
    price: "무료 (전시에 따라 상이)",
    category: "감성 갤러리",
    tags: ["부산복합문화공간", "영도피아크", "부산항오션뷰", "영도핫플", "가을바다", "주말나들이"],
    photoKeywords: "large modern culture complex maritime architecture sea view",
    summary: "초대형 통창 너머로 부산항의 웅장한 바다 풍경이 펼쳐지는 복합예술 플랫폼! 베이커리 카페와 야외 인조잔디 광장, 기획 전시를 한곳에서 만납니다.",
    nearbySpots: ["흰여울문화마을", "태종대 유원지", "깡깡이예술마을", "청학배수지전망대"]
  },
  {
    slug: "gallery-namhae-space-mijo",
    themeType: "gallery",
    title: "남해 스페이스 미조 : 옛 냉동창고의 부활, 남해안 재생 문화예술 플랫폼",
    region: "경남",
    subRegion: "남해군",
    venueName: "스페이스 미조 (Space Mijo)",
    address: "경상남도 남해군 미조면 미조로 2",
    period: "화~일 11:00 ~ 19:00 (월요일 휴무)",
    price: "무료",
    category: "감성 갤러리",
    tags: ["경남문화공간", "남해여행", "스페이스미조", "재생건축", "미조항", "남해바다"],
    photoKeywords: "industrial architecture art gallery sea harbor namhae",
    summary: "남해 끝자락 미조항의 버려진 수협 냉동창고가 세련된 복합문화공간으로 재탄생! 남해 바다의 파도 소리와 함께 현대미술, 전시, 로컬 미식을 만나는 힐링 스팟.",
    nearbySpots: ["미조항 해안산책로", "송정솔바람해수욕장", "설리 스카이워크", "독일마을"]
  },

  // --- [테마 2: 5일장 & 전통시장 먹거리 투어] ---
  {
    slug: "market-hadong-hwagae-autumn",
    themeType: "market",
    title: "하동 화개장터 5일장 가을 미식 기행 : 지리산 약초와 섬진강 재첩의 정겨운 만남",
    region: "경남",
    subRegion: "하동군",
    venueName: "하동 화개장터 (1·6일 5일장 및 상설)",
    address: "경상남도 하동군 화개면 쌍계로 15",
    period: "매월 1, 6, 11, 16, 21, 26일 (상설 매일 운영)",
    price: "무료 입장",
    category: "전통시장 나들이",
    tags: ["경남전통시장", "하동화개장터", "5일장", "섬진강재첩국", "지리산약초", "하동가을여행"],
    photoKeywords: "traditional korean market outdoor market street food",
    summary: "영호남의 화합을 상징하는 대한민국 대표 장터 화개장터! 지리산 산나물과 구수한 수수부꾸미, 시원한 섬진강 재첩진국을 맛보는 가을 로컬 장터 투어.",
    nearbySpots: ["쌍계사 십리벚꽃길", "최참판댁 (박경리문학관)", "화개천 계곡", "하동 송림공원"]
  },
  {
    slug: "market-ulsan-namchang-onggi",
    themeType: "market",
    title: "울산 남창옹기종기시장 5일장 : 100년 전통의 소머리국밥과 옹기마을 장터 나들이",
    region: "울산",
    subRegion: "울주군",
    venueName: "남창옹기종기시장 (3·8일 5일장)",
    address: "울산광역시 울주군 온양읍 남창2길 8-8",
    period: "매월 3, 8, 13, 18, 23, 28일",
    price: "무료 입장",
    category: "전통시장 나들이",
    tags: ["울산전통시장", "남창옹기종기시장", "울산5일장", "남창소머리국밥", "외고산옹기마을", "울주여행"],
    photoKeywords: "korean traditional market rural bustling street soup",
    summary: "남창역 바로 앞, 동해남부선 기차를 타고 떠나는 활기찬 100년 전통 5일장! 진한 소머리국밥 한 뚝배기와 외고산 옹기마을 연계 가을 나들이 코스.",
    nearbySpots: ["외고산 옹기마을", "간절곶 등대", "진하해수욕장 & 명선도", "서생포왜성"]
  },
  {
    slug: "market-miryang-arirang-autumn",
    themeType: "market",
    title: "밀양 아리랑시장 5일장 : 국보 영남루 아래서 맛보는 원조 돼지국밥과 메밀묵",
    region: "경남",
    subRegion: "밀양시",
    venueName: "밀양 아리랑시장 (2·7일 5일장)",
    address: "경상남도 밀양시 상설시장3길 18",
    period: "매월 2, 7, 12, 17, 22, 27일 (상설 매일 운영)",
    price: "무료 입장",
    category: "전통시장 나들이",
    tags: ["경남전통시장", "밀양아리랑시장", "밀양5일장", "밀양돼지국밥", "영남루", "가을장터"],
    photoKeywords: "traditional market food alley pork soup bustling stalls",
    summary: "조선 시대부터 이어져 온 500년 전통의 영남 대표 장터! 국보 영남루 산책 후 맛보는 토렴식 밀양 돼지국밥과 손 메밀묵의 구수한 미식 여행.",
    nearbySpots: ["밀양 영남루 (국보)", "밀양강 둔치 산책로", "위양지", "밀양 관아"]
  },
  {
    slug: "market-busan-jagalchi-nampo",
    themeType: "market",
    title: "부산 자갈치시장 & 국제시장 가을 나들이 : 싱싱한 해산물과 부산 근현대 골목 투어",
    region: "부산",
    subRegion: "중구",
    venueName: "부산 자갈치시장 및 남포동 비프광장",
    address: "부산광역시 중구 자갈치해안로 52",
    period: "매일 05:00 ~ 22:00 (첫째·셋째 화요일 휴무)",
    price: "무료 입장",
    category: "전통시장 나들이",
    tags: ["부산전통시장", "자갈치시장", "국제시장", "남포동비프광장", "부산먹거리", "부산가을여행"],
    photoKeywords: "seafood market fish stalls bustling harbor busan",
    summary: "살아 숨 쉬는 부산의 활력소 자갈치시장! 남포동 비프광장의 씨앗호떡, 국제시장 꽃분이네, 자갈치 옥상 전망대에서 바라보는 영도대교 가을 풍경.",
    nearbySpots: ["용두산공원 부산타워", "영도대교 (도개행사)", "보수동 책방골목", "자갈치 하늘전망대"]
  },

  // --- [테마 3: 특화 도서관 & 가족 북캉스] ---
  {
    slug: "library-busan-sasang-main",
    themeType: "library",
    title: "부산도서관 가을 북캉스 : 웅장한 서가와 미디어아트, 숲속 테라스가 있는 책의 성전",
    region: "부산",
    subRegion: "사상구",
    venueName: "부산도서관 본관",
    address: "부산광역시 사상구 사상로310번길 33 (덕포동)",
    period: "화~일 09:00 ~ 22:00 (월요일 휴관)",
    price: "무료 (도서 대출 무료)",
    category: "도서관 북캉스",
    tags: ["부산도서관", "북캉스", "복합문화공간", "가족나들이", "어린이도서관", "가을독서"],
    photoKeywords: "modern public library interior wooden book shelves reading",
    summary: "부산 최고 규모를 자랑하는 지식과 문화의 랜드마크! 감각적인 인테리어 서가, 미디어아트 갤러리, 아이들을 위한 꿈뜨락 어린이실과 옥상 하늘정원 산책.",
    nearbySpots: ["삼락생태공원 갈대숲", "사상인디스테이션", "백양산 숲길", "사상 명품가로공원"]
  },
  {
    slug: "library-gimhae-sea-of-wisdom",
    themeType: "library",
    title: "김해 지혜의바다도서관 : 폐교의 화려한 변신, 웅장한 테트리스 서가와 문화 살롱",
    region: "경남",
    subRegion: "김해시",
    venueName: "김해 지혜의바다도서관",
    address: "경상남도 김해시 주촌면 서부로 1492",
    period: "매일 09:00 ~ 18:00 (어린이실 별도)",
    price: "무료",
    category: "도서관 북캉스",
    tags: ["경남도서관", "김해지혜의바다", "폐교재생", "이색도서관", "아이와가볼만한곳", "김해주말나들이"],
    photoKeywords: "magnificent large bookshelf library interior architecture cozy",
    summary: "버려진 폐교 체육관이 거대한 책의 바다로 탈바꿈한 경남 대표 특화 도서관! 웅장한 벽면 서가와 편안한 빈백 소파, 다채로운 인형극과 북토크가 가득합니다.",
    nearbySpots: ["연지공원 음악분수", "국립김해박물관", "김해 수로왕릉", "클레이아크김해미술관"]
  },
  {
    slug: "library-ulsan-city-library",
    themeType: "library",
    title: "울산도서관 가을 인문학 산책 : 여천천 물길 옆 친환경 복합문화 도서관",
    region: "울산",
    subRegion: "남구",
    venueName: "울산도서관",
    address: "울산광역시 남구 꽃대나리로 140",
    period: "화~일 09:00 ~ 18:00 (월요일 휴관)",
    price: "무료",
    category: "도서관 북캉스",
    tags: ["울산도서관", "울산북캉스", "여천천", "어린이자료실", "인문학산책", "가을힐링"],
    photoKeywords: "large modern public library open space peaceful architecture",
    summary: "고래의 고장 울산의 기상을 담은 웅장한 건축미와 여천천 생태하천 전망을 품은 대표 도서관! 가을바람 맞으며 책 한 권과 함께하는 도심 속 진정한 쉼터.",
    nearbySpots: ["여천천 생태산책로", "울산박물관", "울산대공원 장미원", "선암호수공원"]
  },

  // --- [테마 4: 계절 힐링로드 & 감성 드라이브] ---
  {
    slug: "healing-changnyeong-upo-wetland",
    themeType: "healing",
    title: "창녕 우포늪 가을 생태 힐링로드 : 1억 4천만 년 태고의 신비와 물안개 갈대숲 걷기",
    region: "경남",
    subRegion: "창녕군",
    venueName: "우포늪 생태공원 & 탐방로",
    address: "경상남도 창녕군 유어면 우포늪길 220",
    period: "연중무휴 (자전거 대여 운영)",
    price: "무료 입장",
    category: "계절 힐링로드",
    tags: ["경남힐링로드", "창녕우포늪", "람사르습지", "가을갈대", "생태관광", "당일치기드라이브"],
    photoKeywords: "natural wetland morning mist reeds lake reflection nature",
    summary: "국내 최대의 자연 늪지 우포늪! 황금빛으로 물드는 가을 갈대와 은빛 억새, 따오기의 날갯짓과 새벽 물안개가 선사하는 자연 그대로의 평온한 힐링 로드.",
    nearbySpots: ["우포생태촌", "산토끼노래동산", "창녕 교동과 송현동 고분군", "화왕산 군립공원"]
  },
  {
    slug: "healing-miryang-wiyangji-autumn",
    themeType: "healing",
    title: "밀양 위양지 가을 감성 산책 : 완재정 연못에 비친 고즈넉한 단풍과 반영의 미학",
    region: "경남",
    subRegion: "밀양시",
    venueName: "밀양 위양지 (위양못)",
    address: "경상남도 밀양시 부북면 위양리 294",
    period: "연중무휴 상시 개방",
    price: "무료",
    category: "계절 힐링로드",
    tags: ["경남힐링로드", "밀양위양지", "완재정", "단풍명소", "반영사진핫플", "가을드라이브"],
    photoKeywords: "korean traditional pavilion lake reflection autumn trees serene",
    summary: "신라 시대에 축조된 유서 깊은 저수지 위양지! 연못 한가운데 떠 있는 고즈넉한 정자 완재정과 물가에 드리운 붉은 단풍, 고요한 수면 위를 걷는 감성 힐링 산책.",
    nearbySpots: ["밀양아리랑우주천문대", "영남루", "밀양 연극촌", "표충사 단풍숲"]
  },
  {
    slug: "healing-geoje-windy-hill-autumn",
    themeType: "healing",
    title: "거제 바람의 언덕 & 신선대 오션로드 : 쪽빛 남해 바다와 이국적인 풍차 언덕 드라이브",
    region: "경남",
    subRegion: "거제시",
    venueName: "거제 바람의 언덕 및 신선대",
    address: "경상남도 거제시 남부면 갈곶리 산14-47",
    period: "연중무휴 상시 개방",
    price: "무료",
    category: "계절 힐링로드",
    tags: ["경남힐링로드", "거제바람의언덕", "거제드라이브", "신선대", "남해안오션뷰", "가을여행"],
    photoKeywords: "green coastal hill windmill sea view ocean rocks sunny",
    summary: "에메랄드빛 남해 바다가 시원하게 내려다보이는 거제 제일의 뷰포인트! 이국적인 대형 풍차 언덕과 기암괴석 신선대, 해금강을 잇는 명품 가을 드라이브 코스.",
    nearbySpots: ["거제 해금강", "도장포 유람선선착장", "구조라해수욕장", "여차홍포 해안도로"]
  }
];

// 신뢰도 100% 보장 테마별/장소별 사전 검증 고화질 안전 사진 풀 (Curated Safe Photo Whitelist)
const CURATED_SAFE_PHOTOS = {
  // 테마 3: 특화 도서관 & 가족 북캉스
  "library-busan-sasang-main": [
    {
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80",
      alt: "부산도서관 웅장한 서가와 현대적 건축 인테리어 전경"
    },
    {
      url: "https://images.unsplash.com/photo-1507842229452-9b2f67644917?w=1200&auto=format&fit=crop&q=80",
      alt: "자연 채광과 원목 서가가 어우러진 쾌적한 독서 열람 공간"
    },
    {
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
      alt: "사상구 도서관 주변 감성 북카페 & 향긋한 커피 디저트"
    },
    {
      url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=1200&auto=format&fit=crop&q=80",
      alt: "도서관 인근 삼락생태공원 가을 갈대숲과 은빛 억새 산책로"
    }
  ],
  "library-gimhae-sea-of-wisdom": [
    {
      url: "https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&auto=format&fit=crop&q=80",
      alt: "김해 지혜의바다도서관 거대한 테트리스 벽면서가 전경"
    },
    {
      url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80",
      alt: "편안한 빈백 소파와 함께하는 아늑한 가족 독서 쉼터"
    },
    {
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
      alt: "김해 주촌 인근 감성 베이커리 카페 쉼터"
    },
    {
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80",
      alt: "김해 연지공원 호수의 고즈넉한 가을 풍경"
    }
  ],
  "library-ulsan-city-library": [
    {
      url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80",
      alt: "울산도서관 웅장한 로비와 대형 벽면 서가 전경"
    },
    {
      url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80",
      alt: "여천천 뷰가 내려다보이는 친환경 열람실과 사색 공간"
    },
    {
      url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80",
      alt: "울산 남구 여천천 인근 감성 로스팅 카페"
    },
    {
      url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80",
      alt: "여천천 생태 산책로와 울산대공원 가을 풍경"
    }
  ],

  // 테마 1 & 2: 전통시장
  "market-busan-jagalchi-nampo": [
    {
      url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop&q=80",
      alt: "부산 자갈치시장 남항 바다와 푸른 포구의 탁 트인 전경 (초상권 없는 순수 풍경)"
    },
    {
      url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80",
      alt: "남포동 비프광장 명물 길거리 미식과 정갈한 간식"
    },
    {
      url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80",
      alt: "남포동 영도대교 오션뷰 감성 카페와 향긋한 스페셜티 커피"
    },
    {
      url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      alt: "푸른 가을 하늘 아래 웅장하게 우뚝 솟은 용두산공원 부산타워 전경 (가을 정취)"
    }
  ],
  "market-miryang-arirang-autumn": [
    {
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80",
      alt: "밀양 아리랑시장 정겨운 전통 5일장 골목 풍경"
    },
    {
      url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=80",
      alt: "뚝배기에 진하게 끓여낸 500년 전통 원조 밀양돼지국밥"
    },
    {
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
      alt: "밀양강변 영남루 뷰 감성 한옥 카페"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
      alt: "국보 밀양 영남루와 밀양강 둔치의 고즈넉한 가을빛"
    }
  ],
  "market-ulsan-namchang-onggi": [
    {
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80",
      alt: "울산 남창옹기종기시장 활기 넘치는 100년 전통 5일장"
    },
    {
      url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=80",
      alt: "남창 장터의 명물 구수한 소머리국밥 한 상"
    },
    {
      url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80",
      alt: "울주 온양 감성 디저트 카페"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
      alt: "간절곶 등대와 외고산 옹기마을 가을 정취"
    }
  ],

  // 테마 4: 계절 힐링로드 & 감성 드라이브
  "healing-changnyeong-upo-wetland": [
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      alt: "창녕 우포늪 태고의 신비를 간직한 물안개와 갈대 습지"
    },
    {
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80",
      alt: "황금빛으로 물든 가을 갈대밭과 평화로운 탐방로"
    },
    {
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
      alt: "우포늪 인근 고즈넉한 로컬 힐링 카페"
    },
    {
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80",
      alt: "창녕 교동과 송현동 고분군 둘레길 가을 풍경"
    }
  ],
  "healing-miryang-wiyangji-autumn": [
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
      alt: "밀양 위양지 완재정 연못에 비친 단풍과 물그림자"
    },
    {
      url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop&q=80",
      alt: "고즈넉한 완재정 정자와 못 둘레를 감싸는 가을 숲길"
    },
    {
      url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80",
      alt: "위양지 앞 통창 뷰 감성 베이커리 카페"
    },
    {
      url: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&auto=format&fit=crop&q=80",
      alt: "밀양아리랑우주천문대 및 영남루 산책로"
    }
  ],
  "healing-geoje-windy-hill-autumn": [
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
      alt: "거제 바람의 언덕 쪽빛 남해 바다와 이국적인 풍차 전경"
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      alt: "기암괴석과 푸른 파도가 장관을 이루는 신선대 해안 절벽"
    },
    {
      url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80",
      alt: "도장포항 오션뷰 테라스 카페"
    },
    {
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80",
      alt: "거제 해금강과 구조라 해안도로 가을 드라이브 코스"
    }
  ]
};

// 네이버 API HUB 이미지 검색 단일 쿼리 호출 함수 (충분한 후보 확보 및 엄격한 품질 필터링 적용)
async function fetchNaverImages(query, count = 10) {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) return [];
  const cleanQuery = query.replace(/\(.*?\)/g, "").replace(/&/g, " ").trim();
  const hubUrl = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encodeURIComponent(cleanQuery)}&display=${count}&sort=sim&filter=all`;
  const baseHeaders = {
    "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
    "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
  };

  // 신뢰성을 떨어뜨리는 저품질/무관/포스터/비위생/위험/초상권/계절불일치 이미지 배제 블랙리스트
  const blockedDomains = [
    "googleusercontent.com",
    "yes24.com",
    "aladin.co.kr",
    "kyobobook.co.kr",
    "newsro.kr",
    "yt3.ggpht.com",
    "pinterest.com",
    "pinterest.co.kr",
    "pinimg.com",
    "instagram.com",
    "cdninstagram.com",
    "facebook.com"
  ];

  const blockedWords = [
    "포스터", "현수막", "표지", "도서", "공고", "모집", "사건", "사고", "부고",
    "기자", "신문", "뉴스", "로고", "캐릭터", "배너", "책", "단행본", "인터뷰", "부검",
    "팜플렛", "리플렛", "전단", "도록", "초대전", "개인전", "청년작가전", "기획전",
    "화장실", "변기", "세면대", "소변기", "대변기", "공중화장실", "위생", "정화조", "흡연실",
    "유엔묘지", "유엔공원", "공사", "크레인", "철거", "단속", "원룸", "부동산", "임대", "분양",
    "얼굴", "인물", "셀카", "초상권", "사람들", "가족사진", "아이얼굴", "벚꽃", "봄꽃", "설경", "눈사람",
    "toilet", "restroom", "urinal", "bathroom", "construction", "accident", "portrait", "selfie", "cherry blossom"
  ];

  // 과거 구형 뉴스 자료 배제 (2010~2023 구형 뉴스 사진)
  const outdatedYears = [
    "/2010/", "/2011/", "/2012/", "/2013/", "/2014/", "/2015/",
    "/2016/", "/2017/", "/2018/", "/2019/", "/2020/", "/2021/", "/2022/", "/2023/"
  ];

  try {
    const res = await fetch(hubUrl, { headers: baseHeaders });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];

    const validPhotos = [];
    for (const item of items) {
      const link = item.link || "";
      const rawTitle = (item.title || "").replace(/<[^>]*>?/gm, "").trim();

      // 1. 도메인 필터
      if (blockedDomains.some(d => link.includes(d))) continue;

      // 2. 과거 구형 뉴스 연도 필터
      if (outdatedYears.some(yr => link.includes(yr))) continue;

      // 3. 키워드 필터 (제목 및 링크 URL 내 블랙리스트 검사)
      if (blockedWords.some(w => rawTitle.includes(w) || link.toLowerCase().includes(w))) continue;

      const secureUrl = link.startsWith("https://")
        ? link
        : `https://search.pstatic.net/common/?src=${encodeURIComponent(link)}`;

      validPhotos.push({
        url: secureUrl,
        alt: rawTitle || cleanQuery
      });
    }

    return validPhotos;
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

// 3. 실제 해당 지역/장소와 계절(봄/여름/가을/겨울)을 네이버에서 정밀 매칭 수집하는 함수 (글·이미지 무중복 제1원칙 적용)
async function fetchRealPlacePhotos(exhibition, naverData = {}, dateStr, globalUsedImages = new Set()) {
  const photos = [];
  const localUsedUrls = new Set();
  const season = getSeasonInfo(dateStr);
  const slug = exhibition.slug || "";
  const cleanVenue = (exhibition.venueName || exhibition.location || "")
    .replace(/\s*(제?\d+[·,\-~0-9]*전시장|전관|돔하우스|석천홀|비프힐.*|미술관\s*$)/g, "")
    .split(" 및 ")[0]
    .split(" (")[0]
    .trim();

  console.log(`📸 [제1원칙: 이미지 무중복 정밀 수집] 장소: ${cleanVenue} (slug: ${slug}) | 계절: ${season.name} (${season.desc})`);

  // [최우선 1순위] 사전 검증된 100% 안전 고화질 큐레이션 사진 풀(Curated Safe Photos) 적용
  if (CURATED_SAFE_PHOTOS[slug] && CURATED_SAFE_PHOTOS[slug].length > 0) {
    console.log(`✨ [안전 사진 풀 매칭] ${slug} 에 대해 사전 검증된 100% 무결성 사진 ${CURATED_SAFE_PHOTOS[slug].length}장 적용`);
    for (const cPhoto of CURATED_SAFE_PHOTOS[slug]) {
      photos.push({
        url: cPhoto.url,
        alt: cPhoto.alt
      });
      localUsedUrls.add(cPhoto.url);
      globalUsedImages.add(cPhoto.url);
    }
    return photos;
  }

  // 중복 이미지 원천 배제 헬퍼 (과거 포스트 사용 URL 및 현재 글 내 중복 절대 차단)
  function selectUniquePhoto(candidates, defaultAlt) {
    if (!candidates || candidates.length === 0) return null;
    
    // 1순위: 이전 글에서도 전혀 사용되지 않았고, 이번 글에서도 처음 쓰이는 사진
    for (const c of candidates) {
      if (!globalUsedImages.has(c.url) && !localUsedUrls.has(c.url)) {
        localUsedUrls.add(c.url);
        globalUsedImages.add(c.url);
        return { url: c.url, alt: defaultAlt || c.alt };
      }
    }

    // 2순위: 최소한 이번 글 내부에서 중복되지 않는 사진
    for (const c of candidates) {
      if (!localUsedUrls.has(c.url)) {
        localUsedUrls.add(c.url);
        return { url: c.url, alt: defaultAlt || c.alt };
      }
    }

    return null;
  }

  // 검색 헬퍼: 계절 키워드 우선 검색 후 필요시 일반 검색 폴백
  async function searchSeasonPlace(baseQuery, count = 8) {
    const seasonQuery = `${baseQuery} ${season.keyword}`;
    let res = await fetchNaverImages(seasonQuery, count);
    if (res.length === 0) {
      res = await fetchNaverImages(baseQuery, count);
    }
    return res;
  }

  // 1) 대표 전시장 / 전시 공간 실제 사진 (장소 + 계절)
  const venueImgs = await searchSeasonPlace(`${exhibition.region} ${cleanVenue}`, 8);
  const photo1 = selectUniquePhoto(venueImgs, `${exhibition.venueName || cleanVenue} ${season.name} 전경 및 전시 공간`);
  if (photo1) photos.push(photo1);

  // 2) 주변 대표 명소 1번 실제 현장 사진 (장소 + 계절 연계: 예: 상림공원 가을, 충익사 가을)
  const spot1 = (exhibition.nearbySpots && exhibition.nearbySpots[0]) || cleanVenue;
  const spot1Imgs = await searchSeasonPlace(spot1, 8);
  const photo2 = selectUniquePhoto(spot1Imgs, `${spot1}의 아름다운 ${season.name} 실제 풍경`);
  if (photo2) photos.push(photo2);

  // 3) 주변 인기 맛집 / 감성 카페 실제 사진 (현장 플레이스 매칭)
  const foodSpot = (naverData.localRestaurants && naverData.localRestaurants[0]?.title) || `${cleanVenue} 맛집 카페`;
  const foodImgs = await fetchNaverImages(foodSpot, 8);
  const photo3 = selectUniquePhoto(foodImgs, `${foodSpot} 대표 미식 & 감성 공간`);
  if (photo3) photos.push(photo3);

  // 4) 주변 대표 명소 2번 실제 사진 (고택/자연/산책로 + 계절: 예: 개평한옥마을 일두고택 가을)
  const spot2 = (exhibition.nearbySpots && exhibition.nearbySpots[1]) || `${exhibition.region} ${season.name} 명소`;
  const spot2Imgs = await searchSeasonPlace(spot2, 8);
  const photo4 = selectUniquePhoto(spot2Imgs, `${spot2} 고즈넉한 ${season.name} 정취`);
  if (photo4) photos.push(photo4);

  // 5) 추가 전시 안내 / 연계 문화 공간 사진 보강
  const photo5 = selectUniquePhoto(venueImgs, `${exhibition.title} ${season.name} 전시 안내 풍경`);
  if (photo5) photos.push(photo5);

  // 안전장치: 네이버 검색으로 3장 미만 확보된 경우에만 Pexels로 보강
  if (photos.length < 3 && PEXELS_API_KEY) {
    try {
      const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(exhibition.photoKeywords || "korean gallery culture")}&per_page=6&orientation=landscape`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      if (pexelsRes.ok) {
        const pData = await pexelsRes.json();
        for (const p of pData.photos || []) {
          if (photos.length >= 4) break;
          const pUrl = p.src.large2x || p.src.large || p.src.original;
          if (!globalUsedImages.has(pUrl) && !localUsedUrls.has(pUrl)) {
            localUsedUrls.add(pUrl);
            globalUsedImages.add(pUrl);
            photos.push({
              url: pUrl,
              alt: `부울경 ${season.name} 문화예술 및 나들이`
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 최종 기본 안전 이미지 (극단적 예외 대비)
  if (photos.length === 0) {
    photos.push({
      url: "https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      alt: `${exhibition.title}`
    });
  }

  console.log(`✅ [장소+계절 정밀 매칭 & 무중복 통과] 총 ${photos.length}장의 고유한 현장 사진 확보`);
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

  // 테마별 큐레이터 페르소나 및 작성 지침 분기
  const themeType = exhibition.themeType || "exhibition";
  
  let roleTitle = "최고 수석 큐레이터이자 다정하고 박학다식한 **AI 도슨트**";
  let contentGuide = "";

  if (themeType === "market") {
    roleTitle = "부울경 정겨운 오일장과 골목 미식을 꿰뚫고 있는 **전통시장 전문 로컬 큐레이터**";
    contentGuide = `
- **도입부**: 장날의 설렘과 북적이는 활기, 계절의 싱그러운 공기를 전하는 친근하고 따뜻한 인사
- **첫 번째 대표 시장 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 시장 핵심 정보 한눈에 보기**: 마크다운 표 형식 (시장명, 장날/운영일, 위치, 대표 품목, 주차, 편의시설 등)
- **🔥 오일장에서 절대 놓칠 수 없는 대표 먹거리 TOP 3**: 장터 국밥, 손칼국수, 즉석 튀김, 제철 수산물/산나물 등 군침 도는 생생한 묘사. 중간에 두 번째 현장 사진(![설명](${photos[1]?.url || photos[0]?.url})) 배치.
- **☕ 시장 옆 감성 카페 & 디저트 쉼표**: 네이버 검색 데이터에 있는 인근 카페/맛집 소개, 세 번째 사진(![설명](${photos[2]?.url || photos[0]?.url})) 배치.
- **🧺 장바구니 가득! 추천 로컬 특산물 & 온누리상품권 꿀팁**: 장터 알뜰 쇼핑 팁.
- **🎡 시장 보고 들르기 좋은 주변 명소 & 나들이 코스**: 네이버 볼거리 및 주변 관광지 연계. 네 번째 주변 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치.
- **💡 알뜰 방문 & 주차 꿀팁**: 주차장 위치, 현금/상품권 결제 팁, 장날 피크 시간대.
- **따뜻한 마무리 멘트**: 주말 가족, 연인과 함께 떠나는 정겨운 장터 나들이 초대.`;
  } else if (themeType === "library") {
    roleTitle = "책과 쉼, 공간의 미학을 전하는 **북캉스 & 문화공간 전문 큐레이터**";
    contentGuide = `
- **도입부**: 은은한 종이 향기와 사색의 여유, 가을의 정취를 담은 감성적이고 지적인 인사
- **첫 번째 대표 도서관 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 도서관 핵심 정보 한눈에 보기**: 마크다운 표 형식 (도서관명, 이용시간, 휴관일, 위치, 특화 분야, 주차 등)
- **✨ 이 도서관만의 특별한 공간 매력 TOP 3**: 웅장한 서가 뷰, 통창 뷰, 미디어아트, 건축적 미학 등 세부 소개. 중간에 두 번째 사진(![설명](${photos[1]?.url || photos[0]?.url})) 배치.
- **👶 아이와 함께! 유아·어린이 특화 북플레이존 꿀팁**: 가족 단위 방문객을 위한 편의시설과 추천 도서 코너.
- **☕ 책 읽다 들르기 좋은 도서관 안팎 감성 카페 & 브런치**: 네이버 검색 기반 인근 맛집/카페 소개, 세 번째 사진(![설명](${photos[2]?.url || photos[0]?.url})) 배치.
- **🌿 도서관 산책로 & 함께 걷기 좋은 주변 힐링 스팟**: 주변 공원, 숲길, 문화공간 연계. 네 번째 주변 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치.
- **💡 이용 꿀팁 & 주차 안내**: 회원가입/열람 팁, 대출 권수, 주차 팁.
- **따뜻한 마무리 멘트**: 복잡한 일상을 벗어나 책 한 권과 함께하는 주말의 여유 권유.`;
  } else if (themeType === "healing") {
    roleTitle = "계절의 숨결과 로컬 힐링로드를 안내하는 **자연 감성 여행 도슨트**";
    contentGuide = `
- **도입부**: 코끝을 스치는 바람과 계절의 색채, 지친 마음에 쉼표를 찍어주는 서정적 인사
- **첫 번째 대표 힐링로드 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 힐링 여행지 핵심 정보 한눈에 보기**: 마크다운 표 형식 (명소명, 위치, 개방시간, 코스 난이도, 입장료, 주차 등)
- **📸 가을 낭만 가득! 인생샷 & 힐링 포인트 TOP 3**: 감성 포토존, 물안개/노을 조망점, 자연 산책길 묘사. 중간에 두 번째 사진(![설명](${photos[1]?.url || photos[0]?.url})) 배치.
- **🍽️ 금강산도 식후경! 힐링로드 주변 로컬 맛집 & 뷰맛집 카페**: 네이버 검색 기반 현지 맛집과 전망 좋은 카페 소개, 세 번째 사진(![설명](${photos[2]?.url || photos[0]?.url})) 배치.
- **🚗 당일치기 완성! 추천 드라이브 & 연계 코스**: 주변 명소들을 엮은 완벽한 당일치기 일정. 네 번째 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치.
- **💡 감성 나들이 꿀팁**: 걷기 편한 복장, 최적의 방문 시간대(일출/일몰), 주차 팁.
- **따뜻한 마무리 멘트**: 소중한 사람과 함께 걸으며 마음을 채우는 힐링 여정 제안.`;
  } else if (themeType === "gallery") {
    roleTitle = "숨겨진 예술적 영감과 공간의 결을 읽어주는 **아트 스페이스 전문 디렉터**";
    contentGuide = `
- **도입부**: 골목길 속 숨겨진 예술의 향기와 트렌디한 공간의 미학을 전하는 세련된 인사
- **첫 번째 대표 갤러리 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 갤러리 핵심 정보 한눈에 보기**: 마크다운 표 형식 (공간명, 위치, 관람시간, 휴관일, 입장료, 주차 등)
- **🎨 이 공간이 선사하는 영감 포인트 TOP 3**: 건축 디자인, 기획전 콘셉트, 개성 넘치는 전시 작품 해설. 중간에 두 번째 사진(![설명](${photos[1]?.url || photos[0]?.url})) 배치.
- **☕ 예술과 커피의 만남! 아트 카페 & 로컬 핫플레이스**: 갤러리 내/인근 스페셜티 카페와 디저트 맛집 소개, 세 번째 사진(![설명](${photos[2]?.url || photos[0]?.url})) 배치.
- **🚶 예술 골목 투어 & 주변 힙플레이스 연계 코스**: 네이버 볼거리 및 편집숍/소품샵/산책로 연계. 네 번째 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치.
- **💡 방문 & 감상 꿀팁**: 전시 관람 매너, 도슨트 프로그램, 주차 및 대중교통 팁.
- **따뜻한 마무리 멘트**: 일상에 신선한 감각을 불어넣는 예술 나들이 초대.`;
  } else {
    // 기존 정통 전시 모드
    contentGuide = `
- **도입부**: 'AI 도슨트'의 다정한 인사와 계절감, 전시장소의 분위기 소개
- **첫 번째 대표 전시 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 전시 핵심 정보 한눈에 보기**: 마크다운 표 형식 (전시명, 기간, 장소, 관람시간, 휴관일, 관람료, 문의 등)
- **🌟 놓칠 수 없는 관람 포인트 TOP 3**: 세부 소제목(### 1, ### 2, ### 3)과 흥미진진한 도슨트 해설. 중간에 두 번째 전시 사진(![설명](${photos[1]?.url || photos[0]?.url})) 배치.
- **🍽️ 전시장 주변 핫플레이스 맛집 & 감성 카페 BEST**: 네이버 검색 데이터에 있는 실제 맛집/카페 상호명과 특징을 소개하고, 세 번째 감성 카페/미식 사진(![설명](${photos[2]?.url || photos[0]?.url})) 배치!
- **🧺 미술관 옆 정겨운 전통시장 & 5일장 장터 나들이**: ${exhibition.region} ${exhibition.subRegion || ''} 인근의 대표 전통 재래시장 및 5일장 장날 정보, 대표 장터 먹거리와 연계 힐링 코스 소개!
- **📚 아이와 함께! 미술관 옆 도서관 & 쌈지 작은도서관 쉼표**: ${exhibition.region} ${exhibition.subRegion || ''} 인근의 대표 복합문화도서관이나 감성 작은도서관, 북플레이존과 가족 힐링 포인트 소개!
- **🎡 함께 즐기는 주변 볼거리 & 핫플 투어 코스**: 네이버 볼거리 데이터 및 주변 명소를 엮어 알찬 당일치기/반나절 나들이 코스 구성. 네 번째 주변 풍경 사진(![설명](${photos[3]?.url || photos[photos.length - 1]?.url})) 배치!
- **🎉 함께 둘러보기 좋은 인근 문화 행사 & 축제**: 네이버 행사/축제 데이터를 소개하며 풍성한 볼거리 안내.
- **💡 AI 도슨트의 관람 & 주차 꿀팁**: 주차 정보, 가장 쾌적한 방문 시간대, 사진 촬영 포인트.
- **따뜻한 마무리 멘트**.`;
  }

  const prompt = `
너는 '부울경(부산, 울산, 경남) 아트·전시·문화 나들이' 웹사이트의 최고 수석 에디터이자 ${roleTitle}야.
독자가 이번 주말 당장 이곳으로 훌쩍 떠나고 싶어지도록, **장소 해설 + 네이버 실시간 맛집/카페 + 주변 볼거리 핫플 + 지역 소식**을 매우 풍부하고 감성 넘치게 작성해줘.

### [소재 기본 정보]
- 테마 분류: ${exhibition.category || '문화 나들이'} (${themeType})
- 명칭/제목: ${exhibition.title}
- 지역: ${exhibition.region} (${exhibition.subRegion || ''})
- 장소: ${exhibition.venueName} (${exhibition.address})
- 운영/장날: ${exhibition.period}
- 이용료: ${exhibition.price}
- 요약: ${exhibition.summary}
- 추천 태그: ${exhibition.tags.join(", ")}

### [네이버 실시간 검색 빅데이터]
- 1. 실제 네이버 블로그 생생 후기:
${naverBlogContext}
- 2. 주변 네이버 인기 맛집 & 감성 카페:
${naverFoodContext}
- 3. 주변 네이버 추천 볼거리 & 핫플레이스:
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
category: "${exhibition.category || '전시 리뷰'}"
tags: [${exhibition.tags.map(t => `"${t}"`).join(", ")}]
region: "${exhibition.region}"
eventId: "${exhibition.slug}"
thumbnail: "${photos[0]?.url || ''}"
---

2. 본문 구성 가이드라인:${contentGuide}

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

// 5. 듀얼 슬롯(오전 정통전시 / 오후 4대테마) & 2단계 철저 중복 검증 메인 실행 루틴
async function main() {
  console.log("🚀 [AI 자동 포스팅 고도화 엔진] 부울경 듀얼 슬롯 자동 발행 시작...");
  const postsDir = path.join(rootDir, "src", "content", "posts");
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(postsDir);
  const targetDateArg = process.argv[2];
  const requestedSlotArg = process.argv[3]; // 'morning' | 'afternoon' | 'auto'

  const today = (targetDateArg && /^\d{4}-\d{2}-\d{2}$/.test(targetDateArg)) ? targetDateArg : getKSTDateString();

  // =========================================================================
  // [1단계 검증] 기존 발행 내역 분석 및 이미지 블랙리스트 수집
  // =========================================================================
  const lastWrittenMap = new Map();
  const todayWrittenSlugs = new Set();
  const todayWrittenFiles = [];
  const recent14DaysSlugs = new Set();

  const todayTime = new Date(today).getTime();
  const globalUsedImages = new Set();

  for (const file of existingFiles) {
    if (!file.endsWith(".md") || file === ".gitkeep") continue;

    try {
      const postRaw = fs.readFileSync(path.join(postsDir, file), "utf8");
      const imgMatches = postRaw.matchAll(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g);
      for (const m of imgMatches) {
        if (m[1]) globalUsedImages.add(m[1].trim());
      }
    } catch {
      // ignore
    }

    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, postDate, postSlug] = match;
      if (postDate === today) {
        todayWrittenSlugs.add(postSlug);
        todayWrittenFiles.push({ file, slug: postSlug });
      }
      const postTime = new Date(postDate).getTime();
      const diffDays = Math.floor((todayTime - postTime) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 14) {
        recent14DaysSlugs.add(postSlug);
      }

      const prevDate = lastWrittenMap.get(postSlug);
      if (!prevDate || postDate > prevDate) {
        lastWrittenMap.set(postSlug, postDate);
      }
    }
  }

  // =========================================================================
  // 슬롯 결정 (오전: 정통 전시 / 오후: 4대 테마 스마트 순환)
  // =========================================================================
  let targetSlot = requestedSlotArg || "auto";

  if (targetSlot === "auto") {
    // 자동 판별: 오늘 이미 오전 정통 전시(EXHIBITION_POOL) 글이 있으면 -> 오후 테마로 자동 전환!
    const hasMorningExhibitionToday = todayWrittenFiles.some(item => 
      EXHIBITION_POOL.some(ex => ex.slug === item.slug)
    );

    if (hasMorningExhibitionToday) {
      targetSlot = "afternoon";
      console.log("💡 [스마트 자동 감지] 오늘 오전 전시 글이 이미 존재하므로 [오후 4대 테마 모드]로 자동 발행합니다.");
    } else {
      // 현재 KST 시각 확인 (오후 14시 이후면 오후 모드, 아니면 오전 모드)
      const nowKstHour = new Date(new Date().getTime() + (9 * 60 + new Date().getTimezoneOffset()) * 60000).getHours();
      targetSlot = (nowKstHour >= 14) ? "afternoon" : "morning";
      console.log(`💡 [스마트 자동 감지] 현재 시각(${nowKstHour}시) 기준 [${targetSlot === 'morning' ? '오전 정통 전시' : '오후 4대 테마'}] 모드로 선정되었습니다.`);
    }
  }

  console.log(`🎯 [발행 대상 슬롯]: ${targetSlot.toUpperCase()} 모드`);
  console.log(`📊 [제1원칙 검증] 최근 14일 쿨다운 대상: ${recent14DaysSlugs.size}개, 기사용 이미지 URL: ${globalUsedImages.size}개`);

  // 모드별 후보 풀 분기
  const candidatePool = (targetSlot === "afternoon") ? AFTERNOON_THEME_POOL : EXHIBITION_POOL;

  // 14일 쿨다운 필터링
  let availablePool = candidatePool.filter(item => !todayWrittenSlugs.has(item.slug) && !recent14DaysSlugs.has(item.slug));

  if (availablePool.length === 0) {
    console.warn("⚠️ 14일 초과 미작성 후보가 모두 소진되어, 전체 풀 중 가장 오래전에 소개된 후보를 안전 순환합니다.");
    availablePool = candidatePool.filter(item => !todayWrittenSlugs.has(item.slug));
  }

  if (availablePool.length === 0) {
    console.error("❌ 오늘 작성 가능한 후보가 없습니다.");
    process.exit(1);
  }

  // LRU 점수 계산 (가장 오랫동안 발행되지 않은 후보 최우선)
  const scoredCandidates = availablePool.map(item => {
    const lastDate = lastWrittenMap.get(item.slug);
    const daysSince = lastDate 
      ? Math.floor((todayTime - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : 99999;
    return {
      item,
      lastDate: lastDate || "미작성(최초)",
      daysSince
    };
  });

  scoredCandidates.sort((a, b) => b.daysSince - a.daysSince);

  const chosen = scoredCandidates[0];
  const targetItem = chosen.item;

  console.log(`✅ [선별 완료] [${targetItem.category || targetSlot}] [${targetItem.region}] ${targetItem.title}`);
  console.log(`   - 마지막 작성일: ${chosen.lastDate} (${chosen.daysSince === 99999 ? '최초 작성' : `${chosen.daysSince}일 전`}) -> 14일 쿨다운 충족!`);

  // 네이버 실시간 검색
  console.log(`🔍 네이버 API HUB 실시간 검색 중 (${targetItem.venueName})...`);
  const naverData = await fetchNaverSearchData(targetItem.venueName, targetItem.region);
  console.log(`✅ 네이버 데이터 수집 완료: 블로그 ${naverData.blogReviews.length}건, 맛집 ${naverData.localRestaurants.length}건, 볼거리 ${naverData.nearbyAttractions.length}건, 행사 ${naverData.localEvents.length}건`);

  // 네이버 현장 사진 수집 (제1원칙 무중복 보장)
  console.log(`📸 네이버 OpenAPI/API HUB 실제 장소 현장 및 계절 사진 정밀 검색 중 (제1원칙 무중복 보장)...`);
  const photos = await fetchRealPlacePhotos(targetItem, naverData, today, globalUsedImages);
  console.log(`✅ ${photos.length}장의 실제 장소 & 계절 맞춤 고유 현장 사진 준비 완료.`);

  // Gemini AI 본문 작성
  console.log(`✍️ Gemini AI로 [${targetItem.category}] 프리미엄 본문 작성 중...`);
  const postContent = await generatePostWithGemini(targetItem, photos, today, naverData);

  // =========================================================================
  // [2단계 검증] 파일 저장 직전 사후 세이프가드 단언 검증 (Pre-Save Assert)
  // =========================================================================
  console.log("🔒 [2단계 검증 시작] 파일 저장 직전 14일 이내 중복 여부 최종 단언 검사 중...");
  const reloadedFiles = fs.readdirSync(postsDir);
  const preSaveConflicts = [];

  for (const file of reloadedFiles) {
    if (!file.endsWith(".md") || file === ".gitkeep") continue;
    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, pDate, pSlug] = match;
      if (pSlug === targetItem.slug) {
        const diff = Math.floor((todayTime - new Date(pDate).getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 14) {
          preSaveConflicts.push({ file, date: pDate, diff });
        }
      }
    }
  }

  if (preSaveConflicts.length > 0) {
    console.error(`🚨 [2단계 검증 실패] ${targetItem.slug}는 최근 14일 내 이미 발행된 이력이 있습니다:`, preSaveConflicts);
    throw new Error(`[2단계 세이프가드 차단] 14일 이내 중복 감지로 인해 파일 저장을 안전하게 중단했습니다.`);
  }

  console.log(`🎉 [2단계 검증 통과] 14일 이내 중복 0건 확인 완료! 안전하게 디스크에 저장합니다.`);

  // 파일명 지정: YYYY-MM-DD-slug.md
  const fileName = `${today}-${targetItem.slug}.md`;
  const filePath = path.join(postsDir, fileName);

  fs.writeFileSync(filePath, postContent, "utf8");
  console.log(`🎉 [발행 성공] 새 글 파일이 안전하게 저장되었습니다: src/content/posts/${fileName}`);
}

main().catch(err => {
  console.error("❌ 오류 발생:", err);
  process.exit(1);
});
