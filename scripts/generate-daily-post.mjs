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

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY가 설정되지 않았습니다.");
  process.exit(1);
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

// 3. Pexels API에서 고화질 사진 검색 함수
async function fetchPexelsPhotos(query, count = 4) {
  if (!PEXELS_API_KEY) {
    console.warn("⚠️ PEXELS_API_KEY 없음: 기본 사진으로 대체합니다.");
    return [
      { url: "https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "현대미술 갤러리 전시" },
      { url: "https://images.pexels.com/photos/10220276/pexels-photo-10220276.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "미술관 모던 조각 작품" },
      { url: "https://images.pexels.com/photos/6727765/pexels-photo-6727765.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "디지털 미디어아트 공간" }
    ];
  }

  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!res.ok) {
      throw new Error(`Pexels API Error: ${res.status}`);
    }

    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos.map(p => ({
        url: p.src.large2x || p.src.large || p.src.original,
        alt: p.alt || "부울경 문화예술 전시 작품"
      }));
    }
  } catch (err) {
    console.error("Pexels API 요청 실패:", err.message);
  }

  return [
    { url: "https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "현대미술 갤러리 전시" },
    { url: "https://images.pexels.com/photos/10220276/pexels-photo-10220276.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "미술관 모던 조각 작품" }
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

// 4. Gemini API로 마크다운 글 생성
async function generatePostWithGemini(exhibition, photos, dateStr) {
  const prompt = `
너는 '부울경(부산, 울산, 경남) 아트·전시 나들이' 웹사이트의 최고 수석 큐레이터이자 다정하고 박학다식한 **AI 도슨트**야.
관람객이 미술관에 직접 가고 싶어지도록 흥미롭고, 감성적이며, 실용적인 정보를 듬뿍 담은 고품질의 블로그 포스트를 마크다운(Markdown) 형식으로 작성해줘.

### [전시 기본 정보]
- 전시명: ${exhibition.title}
- 지역: ${exhibition.region} (${exhibition.subRegion})
- 장소: ${exhibition.venueName} (${exhibition.address})
- 기간: ${exhibition.period}
- 관람료: ${exhibition.price}
- 요약: ${exhibition.summary}
- 주변 명소/카페: ${exhibition.nearbySpots.join(", ")}
- 추천 태그: ${exhibition.tags.join(", ")}

### [활용 가능한 고화질 Pexels 사진 목록]
${photos.map((p, idx) => `${idx + 1}. URL: ${p.url} (설명: ${p.alt})`).join("\n")}

### [반드시 지켜야 할 작성 규칙]
1. 최상단에 마크다운 Frontmatter(---)를 반드시 포함할 것:
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

2. 본문 구성:
- **도입부**: 'AI 도슨트' 인사와 함께 계절감 및 해당 전시와 장소의 매력을 서정적으로 소개
- **첫 번째 사진**: ![설명](${photos[0]?.url || ''}) 및 사진 캡션(*▲ 사진 설명*)
- **📋 전시 핵심 정보 한눈에 보기**: 마크다운 표 형식 (전시명, 전시 기간, 전시 장소, 관람 시간, 정기 휴관, 관람료, 문의 등)
- **🌟 관람 포인트 TOP 3**: 세부 소제목(### 1, ### 2, ### 3)과 흥미진진한 작품/전시관 해설. 중간에 두 번째 사진(![설명](${photos[1]?.url || photos[0]?.url}))과 세 번째 사진(![설명](${photos[2]?.url || photos[0]?.url}))을 적절히 배치할 것.
- **☕ 함께 즐기는 주변 감성 카페 & 나들이 코스**: 전시 관람 후 들르기 좋은 인근 명소(${exhibition.nearbySpots.join(", ")})를 1, 2, 3번으로 정리하여 추천.
- **💡 AI 도슨트의 관람 꿀팁**: 주차 정보, 가장 쾌적한 방문 시간대, 사진 촬영 팁 등 실용 정보.
- **마무리 총평**: 주말 나들이를 독려하는 따뜻한 마무리 멘트.

3. 오직 완성된 마크다운 내용만 출력해 (앞뒤에 \`\`\`markdown 또는 추가 설명 붙이지 말 것).
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
  
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
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // 마크다운 코드 블록 래핑 제거 (있을 경우)
  if (generatedText.startsWith("```markdown")) {
    generatedText = generatedText.slice(11);
  } else if (generatedText.startsWith("```")) {
    generatedText = generatedText.slice(3);
  }
  if (generatedText.endsWith("```")) {
    generatedText = generatedText.slice(0, -3);
  }

  return generatedText.trim();
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

  // Pexels에서 고화질 사진 검색
  console.log(`📸 Pexels 고화질 사진 검색 중 (키워드: ${targetExhibition.photoKeywords})...`);
  const photos = await fetchPexelsPhotos(targetExhibition.photoKeywords, 4);
  console.log(`✅ ${photos.length}장의 고화질 사진 준비 완료.`);

  // Gemini AI로 글 작성
  console.log("✍️ Gemini AI로 전시 리뷰 본문 작성 중...");
  const postContent = await generatePostWithGemini(targetExhibition, photos, today);

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
