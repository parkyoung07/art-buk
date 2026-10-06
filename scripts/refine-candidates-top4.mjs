import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidatesPath = path.join(rootDir, "public/data/naver-image-candidates.json");

if (!fs.existsSync(candidatesPath)) {
  console.error("❌ naver-image-candidates.json 파일이 없습니다.");
  process.exit(1);
}

const rawCandidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
console.log(`📊 [정제 전] 전체 후보 이미지 수: ${rawCandidates.length}건`);

// 1. 유해/부적격 블랙리스트 필터링 함수
function isInvalid(item) {
  const badWords = [
    "포스터", "공사", "크레인", "서점", "책표지", "도서", "스톡", "삽화", "일러스트", 
    "유튜브", "프로필", "케이크", "디저트", "먹방", "맛집", "메뉴판", "가격표", 
    "지도", "약도", "아이콘", "로고", "클립아트", "현수막", "전단지", "캐리커쳐",
    "shutterstock", "getty", "istock", "alamy", "123rf", "pinterest", "aliexpress",
    "coupang", "smartstore", "gmarket", "11st", "tmon"
  ];

  const title = (item.title || "").toLowerCase();
  const url = (item.image_url || "").toLowerCase();
  const domain = (item.source_domain || "").toLowerCase();

  return badWords.some(w => title.includes(w) || url.includes(w) || domain.includes(w));
}

// 2. 장소별 그룹핑
const placesMap = {};

for (const item of rawCandidates) {
  if (isInvalid(item)) continue;
  if (!item.image_url || !item.image_url.startsWith("http")) continue;

  const placeId = item.place_id;
  if (!placesMap[placeId]) {
    placesMap[placeId] = {
      place_id: placeId,
      place_name: item.place_name,
      category: item.category,
      region: item.region,
      items: []
    };
  }

  // 점수 재계산 (공식/언론사 및 키워드 정확도 반영)
  let score = 60;
  const domain = (item.source_domain || "").toLowerCase();
  const title = item.title || "";

  // 도메인 가산점
  if (domain.includes(".go.kr") || domain.includes(".or.kr") || domain.includes("visitkorea") || domain.includes("korea.kr") || domain.includes("dureraum") || domain.includes("f1963") || domain.includes("clayarch") || domain.includes("museum")) {
    score += 35; // Tier A
    item.source_tier = "A";
  } else if (domain.includes("imgnews") || domain.includes("news") || domain.includes("press") || domain.includes("yonhapnews") || domain.includes("yna.co.kr") || domain.includes("busan.com") || domain.includes("knnews") || domain.includes("idomin") || domain.includes("ksilbo")) {
    score += 25; // Tier B
    item.source_tier = "B";
  } else {
    score += 10; // Tier C
    item.source_tier = "C";
  }

  // 장소명 매칭 가산점
  if (title.includes(item.place_name)) {
    score += 15;
  }
  if (item.region && title.includes(item.region)) {
    score += 5;
  }

  // 풍경/전경/전시실 가산점
  if (/전경|외관|풍경|전시실|작품|가을|산책|조각|본관/.test(title)) {
    score += 5;
  }

  item.score = Math.min(100, score);
  placesMap[placeId].items.push(item);
}

// 3. 장소별 상위 딱 4장 엄선
const refinedCandidates = [];
const uniqueUrls = new Set();

let totalPlacesCount = 0;

for (const [placeId, placeData] of Object.entries(placesMap)) {
  totalPlacesCount++;

  // 중복 URL 제거
  const seenInPlace = new Set();
  const uniqueItems = [];
  for (const it of placeData.items) {
    if (!seenInPlace.has(it.image_url) && !uniqueUrls.has(it.image_url)) {
      seenInPlace.add(it.image_url);
      uniqueUrls.add(it.image_url);
      uniqueItems.push(it);
    }
  }

  // 점수 내림차순 정렬
  uniqueItems.sort((a, b) => b.score - a.score);

  // 상위 4장만 추출
  const top4 = uniqueItems.slice(0, 4);

  top4.forEach((cand, rank) => {
    cand.rank = rank + 1;
    // 1순위 추천 사진은 approved + is_cover, 2~4순위는 pending 대기
    if (rank === 0 && cand.score >= 80) {
      cand.status = "approved";
      cand.is_cover = true;
      cand.vision_notes = `[수석 개발자 1차 추천 1위] ${cand.place_name} 대표 실사 (신뢰점수: ${cand.score}점)`;
    } else {
      cand.status = "pending";
      cand.is_cover = false;
      cand.vision_notes = `[후보 ${rank + 1}순위] ${cand.place_name} 대안 실사 (신뢰점수: ${cand.score}점)`;
    }
    refinedCandidates.push(cand);
  });
}

// 4. 저장
fs.writeFileSync(candidatesPath, JSON.stringify(refinedCandidates, null, 2), "utf8");

console.log("==================================================");
console.log(`✅ [1차 엄선 완료]`);
console.log(`- 전체 대상 장소: ${totalPlacesCount}곳`);
console.log(`- 장소당 선별 사진: 정확히 최대 4장씩 엄선`);
console.log(`- 최종 후보 풀 총 수: ${refinedCandidates.length}건 (탈락/부적격 사진 전량 제외)`);
console.log("==================================================");
