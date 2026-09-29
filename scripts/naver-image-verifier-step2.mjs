import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. .env.local 로드 함수
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

// 2. 2단계 확장 40개 명소 정의 (부산 14, 울산 10, 경남 16)
export const STEP2_40_VENUES = [
  // [부산 14곳]
  {
    place_id: "busan-maritime-museum",
    place_name: "국립해양박물관",
    category: "venue",
    region: "부산",
    sub_region: "영도구",
    address: "부산광역시 영도구 해양로301번길 45"
  },
  {
    place_id: "busan-modern-history-museum",
    place_name: "부산근현대역사관",
    category: "venue",
    region: "부산",
    sub_region: "중구",
    address: "부산광역시 중구 대청로 112"
  },
  {
    place_id: "busan-dadaepo-sunset",
    place_name: "다대포 꿈의 낙조분수",
    category: "nature",
    region: "부산",
    sub_region: "사하구",
    address: "부산광역시 사하구 몰운대1길 14"
  },
  {
    place_id: "busan-blueline-park",
    place_name: "해운대 블루라인파크",
    category: "nature",
    region: "부산",
    sub_region: "해운대구",
    address: "부산광역시 해운대구 청사포로 116"
  },
  {
    place_id: "busan-haedong-yonggungsa",
    place_name: "해동용궁사",
    category: "nature",
    region: "부산",
    sub_region: "기장군",
    address: "부산광역시 기장군 기장읍 용궁사로 86"
  },
  {
    place_id: "busan-bujeon-market",
    place_name: "부전마켓타운",
    category: "market",
    region: "부산",
    sub_region: "부산진구",
    address: "부산광역시 부산진구 중앙대로 783"
  },
  {
    place_id: "busan-dongnae-market",
    place_name: "동래시장",
    category: "market",
    region: "부산",
    sub_region: "동래구",
    address: "부산광역시 동래구 동래시장길 14"
  },
  {
    place_id: "busan-gijang-market",
    place_name: "기장시장",
    category: "market",
    region: "부산",
    sub_region: "기장군",
    address: "부산광역시 기장군 기장읍 읍내로104번길 16"
  },
  {
    place_id: "busan-geumjeong-library",
    place_name: "금정도서관",
    category: "library",
    region: "부산",
    sub_region: "금정구",
    address: "부산광역시 금정구 체육공원로 294"
  },
  {
    place_id: "busan-haeundae-humanities-library",
    place_name: "해운대인문학도서관",
    category: "library",
    region: "부산",
    sub_region: "해운대구",
    address: "부산광역시 해운대구 대천로 67"
  },
  {
    place_id: "busan-nat-assembly-library",
    place_name: "국회부산도서관",
    category: "library",
    region: "부산",
    sub_region: "강서구",
    address: "부산광역시 강서구 명지국제1로 161"
  },
  {
    place_id: "busan-hwamyeong-ecopark",
    place_name: "화명생태공원",
    category: "nature",
    region: "부산",
    sub_region: "북구",
    address: "부산광역시 북구 화명동 1718-17"
  },
  {
    place_id: "busan-samnak-ecopark",
    place_name: "삼락생태공원",
    category: "nature",
    region: "부산",
    sub_region: "사상구",
    address: "부산광역시 사상구 삼락동 29-46"
  },
  {
    place_id: "busan-huinnyeoul-culture-village",
    place_name: "흰여울문화마을",
    category: "nature",
    region: "부산",
    sub_region: "영도구",
    address: "부산광역시 영도구 영선동4가 1044-6"
  },

  // [울산 10곳]
  {
    place_id: "ulsan-daewangam-park",
    place_name: "대왕암공원",
    category: "nature",
    region: "울산",
    sub_region: "동구",
    address: "울산광역시 동구 등대로 95"
  },
  {
    place_id: "ulsan-ganjeolgot",
    place_name: "간절곶",
    category: "nature",
    region: "울산",
    sub_region: "울주군",
    address: "울산광역시 울주군 서생면 간절곶1길 39-2"
  },
  {
    place_id: "ulsan-museum",
    place_name: "울산박물관",
    category: "venue",
    region: "울산",
    sub_region: "남구",
    address: "울산광역시 남구 두왕로 277"
  },
  {
    place_id: "ulsan-jangsaengpo-whale-village",
    place_name: "장생포 고래문화마을",
    category: "venue",
    region: "울산",
    sub_region: "남구",
    address: "울산광역시 남구 장생포고래로 271-1"
  },
  {
    place_id: "ulsan-jungang-market",
    place_name: "울산 중앙전통시장",
    category: "market",
    region: "울산",
    sub_region: "중구",
    address: "울산광역시 중구 중앙시장길 2"
  },
  {
    place_id: "ulsan-suam-market",
    place_name: "수암상가시장",
    category: "market",
    region: "울산",
    sub_region: "남구",
    address: "울산광역시 남구 수암로 116"
  },
  {
    place_id: "ulsan-eonyang-market",
    place_name: "언양알프스시장",
    category: "market",
    region: "울산",
    sub_region: "울주군",
    address: "울산광역시 울주군 언양읍 장터2길 11-5"
  },
  {
    place_id: "ulsan-seonbawi-library",
    place_name: "울주선바위도서관",
    category: "library",
    region: "울산",
    sub_region: "울주군",
    address: "울산광역시 울주군 범서읍 구영로 101-35"
  },
  {
    place_id: "ulsan-yaksa-library",
    place_name: "중구약사희망도서관",
    category: "library",
    region: "울산",
    sub_region: "중구",
    address: "울산광역시 중구 종가5길 15"
  },
  {
    place_id: "ulsan-ganwoljae-reed",
    place_name: "영남알프스 간월재",
    category: "nature",
    region: "울산",
    sub_region: "울주군",
    address: "울산광역시 울주군 상북면 간월산길"
  },

  // [경남 16곳]
  {
    place_id: "changwon-gam-art-museum",
    place_name: "경남도립미술관",
    category: "venue",
    region: "경남",
    sub_region: "창원시",
    address: "경상남도 창원시 의창구 용지로 296"
  },
  {
    place_id: "changwon-jinhae-dreampark",
    place_name: "진해드림파크",
    category: "nature",
    region: "경남",
    sub_region: "창원시",
    address: "경상남도 창원시 진해구 명동로 115"
  },
  {
    place_id: "changwon-sangnam-market",
    place_name: "창원 상남시장",
    category: "market",
    region: "경남",
    sub_region: "창원시",
    address: "경상남도 창원시 성산구 마디미서로 54"
  },
  {
    place_id: "changwon-masan-fish-market",
    place_name: "마산어시장",
    category: "market",
    region: "경남",
    sub_region: "창원시",
    address: "경상남도 창원시 마산합포구 복요리로 37"
  },
  {
    place_id: "changwon-masan-happo-library",
    place_name: "마산합포도서관",
    category: "library",
    region: "경남",
    sub_region: "창원시",
    address: "경상남도 창원시 마산합포구 월영동서로 23"
  },
  {
    place_id: "jinju-chokseongnu-jinjustle",
    place_name: "진주 촉석루",
    category: "nature",
    region: "경남",
    sub_region: "진주시",
    address: "경상남도 진주시 남강로 626 (진주성)"
  },
  {
    place_id: "jinju-jungang-yudeung-market",
    place_name: "진주 중앙유등시장",
    category: "market",
    region: "경남",
    sub_region: "진주시",
    address: "경상남도 진주시 진양호로547번길 8-1"
  },
  {
    place_id: "tongyeong-dpirang",
    place_name: "통영 디피랑",
    category: "venue",
    region: "경남",
    sub_region: "통영시",
    address: "경상남도 통영시 남망공원길 29"
  },
  {
    place_id: "tongyeong-jungang-market",
    place_name: "통영 중앙전통시장",
    category: "market",
    region: "경남",
    sub_region: "통영시",
    address: "경상남도 통영시 중앙시장1길 14-16"
  },
  {
    place_id: "sacheon-ocean-cablecar",
    place_name: "사천바다케이블카",
    category: "nature",
    region: "경남",
    sub_region: "사천시",
    address: "경상남도 사천시 사천대로 18"
  },
  {
    place_id: "sacheon-samcheonpo-market",
    place_name: "삼천포용궁수산시장",
    category: "market",
    region: "경남",
    sub_region: "사천시",
    address: "경상남도 사천시 어시장길 64"
  },
  {
    place_id: "miryang-yeongnamnu",
    place_name: "밀양 영남루",
    category: "nature",
    region: "경남",
    sub_region: "밀양시",
    address: "경상남도 밀양시 중앙로 324"
  },
  {
    place_id: "yangsan-tongdosa",
    place_name: "양산 통도사",
    category: "nature",
    region: "경남",
    sub_region: "양산시",
    address: "경상남도 양산시 하북면 통도사로 108"
  },
  {
    place_id: "yangsan-nambu-market",
    place_name: "양산 남부시장",
    category: "market",
    region: "경남",
    sub_region: "양산시",
    address: "경상남도 양산시 탑골길 7"
  },
  {
    place_id: "yangsan-siju-library",
    place_name: "양산시립시주도서관",
    category: "library",
    region: "경남",
    sub_region: "양산시",
    address: "경상남도 양산시 물금읍 황산로 614"
  },
  {
    place_id: "namhae-german-village",
    place_name: "남해 독일마을",
    category: "nature",
    region: "경남",
    sub_region: "남해군",
    address: "경상남도 남해군 삼동면 독일로 89-7"
  }
];

// 3. 다중 쿼리 생성
function generateSearchQueries(venue) {
  const name = venue.place_name;
  const reg = venue.region;
  const sub = venue.sub_region || "";

  if (venue.category === "market") {
    return [`${name} 전경`, `${name} 장터`, `${name} 공식`, `${name} ${reg}`, `${name} 먹거리`];
  } else if (venue.category === "library") {
    return [`${name} 외관`, `${name} 내부 서가`, `${name} 공식`, `${name} ${reg}`, `${name} 어린이자료실`];
  } else if (venue.category === "nature") {
    return [`${name} 전경`, `${name} 풍경`, `${name} 공식`, `${name} 산책로`];
  } else {
    return [`${name} 전경`, `${name} 전시실`, `${name} 내부`, `${name} 공식`, `${name} ${reg} ${sub}`];
  }
}

// 4. 네이버 이미지 검색 호출
async function fetchNaverImages(query, display = 4) {
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

// 5. 실제 원본 URL 및 도메인 정밀 추출
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

// 6. 출처 도메인 신뢰도 평가 (40점 만점)
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
    return { score: 15, tier: "C", reason: "블로그/포스트 출처 (+15점, 2차 검수 대상)" };
  }

  return { score: 10, tier: "C", reason: "일반 웹페이지 출처 (+10점)" };
}

// 7. 제목 및 문맥 일치도 평가 (제목 25점 + 지역 10점 = 35점)
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

// 8. 시각적 휴리스틱 및 Vision 점수
function evaluateImageVisionHeuristic(title, item, sourceTier) {
  const isPoster = /포스터|배너|현수막|일정표|안내문|요금표/i.test(title);
  const isFoodOnly = /먹방|존맛|맛집추천|카페디저트|메뉴판|케이크/i.test(title);
  const isRealPlace = /전경|외관|건물|입구|전시실|서가|광장|풍경|거리/i.test(title);

  let isDisqualified = false;
  let failReason = "";

  if (isPoster) { isDisqualified = true; failReason = "포스터/안내문 배너"; }
  else if (isFoodOnly && !title.includes("시장")) { isDisqualified = true; failReason = "음식 단독 촬영"; }

  let visionScore = isDisqualified ? 0 : (isRealPlace ? 15 : 12);
  let qualityScore = isDisqualified ? 0 : (sourceTier === "A" || sourceTier === "B" ? 10 : 8);

  return {
    is_disqualified: isDisqualified,
    fail_reason: failReason,
    vision_score: visionScore,
    quality_score: qualityScore,
    total_vision: visionScore + qualityScore,
    notes: isDisqualified ? failReason : (isRealPlace ? "실제 장소 전경 및 주요 공간" : "장소 관련 현장 사진")
  };
}

// 9. 2단계 40개 장소 검수 파이프라인 메인 실행
export async function runStep2Pipeline() {
  console.log("==================================================");
  console.log("🚀 [나드리 AI 2단계] 네이버 이미지 API 40개 명소 정밀 수집 가동");
  console.log("==================================================");

  // 기존 1단계 후보 로드 (보존)
  const candidatesPath = path.join(rootDir, "public", "data", "naver-image-candidates.json");
  let existingCandidates = [];
  if (fs.existsSync(candidatesPath)) {
    try {
      existingCandidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
    } catch {}
  }

  // 2단계 후보 리스트 준비 (기존 1단계 후보에 없는 40개 장소)
  const allCandidates = [...existingCandidates];
  const step2Summary = [];
  const usedUrls = new Set(existingCandidates.map(c => c.image_url));

  for (let i = 0; i < STEP2_40_VENUES.length; i++) {
    const venue = STEP2_40_VENUES[i];
    console.log(`\n📍 [${i + 1}/${STEP2_40_VENUES.length}] ${venue.place_name} (${venue.region} ${venue.sub_region})`);

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

    console.log(`  📥 네이버 API 수집 후보: ${rawItems.length}장`);

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

      if (sourceEval.tier === "A" || sourceEval.tier === "B") {
        officialSourceCount++;
      }

      let rejectReason = sourceEval.tier === "D" ? sourceEval.reason : titleEval.rejectReason;
      let isRejected = !!rejectReason;

      let visionEval = { total_vision: 0, vision_score: 0, quality_score: 0, notes: "" };
      if (!isRejected) {
        visionEval = evaluateImageVisionHeuristic(titleEval.cleanTitle, item, sourceEval.tier);
        if (visionEval.is_disqualified) {
          isRejected = true;
          rejectReason = `Vision 탈락: ${visionEval.fail_reason}`;
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
            source_tier: sourceEval.tier
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

    step2Summary.push({
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

  // 데이터 파일 저장
  fs.writeFileSync(candidatesPath, JSON.stringify(allCandidates, null, 2), "utf8");

  const summaryPath = path.join(rootDir, "scripts", "naver_step2_40_venues_audit_result.json");
  fs.writeFileSync(summaryPath, JSON.stringify(step2Summary, null, 2), "utf8");

  console.log("\n==================================================");
  console.log(`🎉 2단계 40개 명소 네이버 안전 선별 수집 완료!`);
  console.log(`- 2단계 수집 장소: ${STEP2_40_VENUES.length}곳`);
  console.log(`- 전체 누적 후보: ${allCandidates.length}건`);
  console.log(`- 2단계 Approved 자산: ${allCandidates.filter(c => c.status === "approved").length}건`);
  console.log(`- 후보 데이터 저장: public/data/naver-image-candidates.json`);
  console.log(`- 2단계 결과 요약: scripts/naver_step2_40_venues_audit_result.json`);
  console.log("==================================================");

  return { allCandidates, step2Summary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runStep2Pipeline();
}
