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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 2. 시험 대상 20개 장소 정의 (부산 7, 울산 5, 경남 8)
export const TEST_20_VENUES = [
  // [부산 7곳]
  {
    place_id: "busan-museum-of-art",
    place_name: "부산시립미술관",
    category: "venue",
    region: "부산",
    sub_region: "해운대구",
    address: "부산광역시 해운대구 APEC로 58"
  },
  {
    place_id: "busan-moca-eulsukdo",
    place_name: "부산현대미술관",
    category: "venue",
    region: "부산",
    sub_region: "사하구",
    address: "부산광역시 사하구 낙동남로 1191 (을숙도)"
  },
  {
    place_id: "busan-cinema-center",
    place_name: "영화의전당",
    category: "venue",
    region: "부산",
    sub_region: "해운대구",
    address: "부산광역시 해운대구 수영강변대로 120"
  },
  {
    place_id: "busan-f1963",
    place_name: "F1963",
    category: "venue",
    region: "부산",
    sub_region: "수영구",
    address: "부산광역시 수영구 구락로123번길 20"
  },
  {
    place_id: "busan-library-main",
    place_name: "부산도서관",
    category: "library",
    region: "부산",
    sub_region: "사상구",
    address: "부산광역시 사상구 사상로310번길 33"
  },
  {
    place_id: "busan-jagalchi",
    place_name: "자갈치시장",
    category: "market",
    region: "부산",
    sub_region: "중구",
    address: "부산광역시 중구 자갈치해안로 52"
  },
  {
    place_id: "busan-gupo-market",
    place_name: "구포시장",
    category: "market",
    region: "부산",
    sub_region: "북구",
    address: "부산광역시 북구 구포시장1길 17"
  },

  // [울산 5곳]
  {
    place_id: "ulsan-art-museum",
    place_name: "울산시립미술관",
    category: "venue",
    region: "울산",
    sub_region: "중구",
    address: "울산광역시 중구 미술관길 72"
  },
  {
    place_id: "ulsan-culture-center",
    place_name: "울산문화예술회관",
    category: "venue",
    region: "울산",
    sub_region: "남구",
    address: "울산광역시 남구 번영로 200"
  },
  {
    place_id: "ulsan-library-main",
    place_name: "울산도서관",
    category: "library",
    region: "울산",
    sub_region: "남구",
    address: "울산광역시 남구 꽃대나리로 140"
  },
  {
    place_id: "ulsan-namchang-market",
    place_name: "남창옹기종기시장",
    category: "market",
    region: "울산",
    sub_region: "울주군",
    address: "울산광역시 울주군 온양읍 남창2길 8-8"
  },
  {
    place_id: "ulsan-taehwa-garden",
    place_name: "태화강국가정원 십리대숲",
    category: "nature",
    region: "울산",
    sub_region: "중구",
    address: "울산광역시 중구 태화강국가정원길"
  },

  // [경남 8곳]
  {
    place_id: "sacheon-art-museum",
    place_name: "사천미술관",
    category: "venue",
    region: "경남",
    sub_region: "사천시",
    address: "경상남도 사천시 사천대로 17"
  },
  {
    place_id: "jinju-national-museum",
    place_name: "국립진주박물관",
    category: "venue",
    region: "경남",
    sub_region: "진주시",
    address: "경상남도 진주시 남강로 626-35 (진주성)"
  },
  {
    place_id: "gimhae-clayarch",
    place_name: "클레이아크김해미술관",
    category: "venue",
    region: "경남",
    sub_region: "김해시",
    address: "경상남도 김해시 진례면 진례로 275-51"
  },
  {
    place_id: "gimhae-sea-of-wisdom",
    place_name: "김해 지혜의바다도서관",
    category: "library",
    region: "경남",
    sub_region: "김해시",
    address: "경상남도 김해시 주촌면 서부로 1490"
  },
  {
    place_id: "hadong-hwagae-market",
    place_name: "하동 화개장터",
    category: "market",
    region: "경남",
    sub_region: "하동군",
    address: "경상남도 하동군 화개면 쌍계로 15"
  },
  {
    place_id: "miryang-arirang-market",
    place_name: "밀양 아리랑시장",
    category: "market",
    region: "경남",
    sub_region: "밀양시",
    address: "경상남도 밀양시 상설시장3길 18"
  },
  {
    place_id: "tongyeong-ottchil",
    place_name: "통영옻칠미술관",
    category: "venue",
    region: "경남",
    sub_region: "통영시",
    address: "경상남도 통영시 용남면 미지해안로 160"
  },
  {
    place_id: "geoje-art-center",
    place_name: "거제문화예술회관",
    category: "venue",
    region: "경남",
    sub_region: "거제시",
    address: "경상남도 거제시 장승포로 145"
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

  // 썸네일에 원본 인코딩이 들어있는 경우 디코딩
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
  // Tier D: 스톡 / 쇼핑몰 / Pinterest (0점, 자동 거절)
  const isRejected = /pinterest|shutterstock|getty|istock|alamy|123rf|aliexpress|coupang|gmarket|11st|auction|tmon|smartstore/i.test(domain + " " + realUrl);
  if (isRejected) {
    return { score: 0, tier: "D", reason: "스톡/쇼핑몰/재배포 사이트 (자동 탈락)" };
  }

  // Tier A: 정부, 지자체, 공식 기관, 박물관, 도서관 (+40점)
  const isGovOrOfficial = /\.go\.kr|\.or\.kr|visitkorea|mcst|museum|korea\.kr|dureraum|f1963|clayarch|ottchil|geojeart/i.test(domain + " " + realUrl);
  if (isGovOrOfficial) {
    return { score: 40, tier: "A", reason: "공공기관 및 공식 기관 출처 (+40점)" };
  }

  // Tier B: 언론사, 뉴스 보도사진 (+30점)
  const isNews = /imgnews\.naver\.net|news\.naver\.com|yonhapnews|donga|chosun|khan|hani|busan\.com|knnews|idomin|ksilbo|iusm|newsis|news1/i.test(domain + " " + realUrl);
  if (isNews) {
    return { score: 30, tier: "B", reason: "언론사 보도 사진 출처 (+30점)" };
  }

  // Tier C: 네이버 블로그/포스트/카페 (+15점)
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

  // 부정 키워드
  const badKeywords = /피규어|장난감|애니|웹툰|네일|헤어|성형|다이어트|쿠폰|분양|매매|협찬광고|인형/i;
  if (badKeywords.test(cleanTitle)) {
    return { total: 0, titleScore: 0, regionScore: 0, cleanTitle, rejectReason: `부정 키워드 감지 (${cleanTitle})` };
  }

  // 장소명 일치
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

  // 지역명 일치
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

// 8. 시각적 휴리스틱 및 Vision 점수 (Vision 15점 + 품질 10점 = 25점)
function evaluateImageVisionHeuristic(title, item, sourceTier) {
  // 제목 기반 및 메타데이터 기반 시각 품질 분석
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

// 9. 20개 장소 검수 파이프라인 메인 실행
export async function run20VenuesPipeline() {
  console.log("==================================================");
  console.log("🚀 [나드리 AI] 네이버 이미지 API 전용 안전 선별 파이프라인 가동");
  console.log("==================================================");

  const allCandidates = [];
  const venueSummary = [];
  const usedUrls = new Set();

  for (let i = 0; i < TEST_20_VENUES.length; i++) {
    const venue = TEST_20_VENUES[i];
    console.log(`\n📍 [${i + 1}/${TEST_20_VENUES.length}] ${venue.place_name} (${venue.region} ${venue.sub_region})`);

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

      // 100점 채점: 출처(40) + 제목/지역(35) + Vision/품질(25)
      const totalScore = isRejected ? 0 : (sourceEval.score + titleEval.total + visionEval.total_vision);

      let status = "rejected";
      if (!isRejected) {
        // 승인 기준: 총점 75점 이상이고 출처 A/B이거나, 제목+Vision 완벽 일치 블로그 실사
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

    venueSummary.push({
      index: i + 1,
      place_id: venue.place_id,
      place_name: venue.place_name,
      category: venue.category === "venue" ? "미술관/문화공간" : venue.category === "library" ? "특화도서관" : venue.category === "market" ? "전통시장" : "힐링/자연",
      region: venue.region,
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
  const candidatesPath = path.join(rootDir, "public", "data", "naver-image-candidates.json");
  fs.writeFileSync(candidatesPath, JSON.stringify(allCandidates, null, 2), "utf8");

  const summaryPath = path.join(rootDir, "scripts", "naver_20_venues_audit_result.json");
  fs.writeFileSync(summaryPath, JSON.stringify(venueSummary, null, 2), "utf8");

  console.log("\n==================================================");
  console.log(`🎉 20개 장소 네이버 안전 선별 검수 완료!`);
  console.log(`- 전체 수집 후보: ${allCandidates.length}건`);
  console.log(`- 최종 Approved 자산: ${allCandidates.filter(c => c.status === "approved").length}건`);
  console.log(`- 관리자 검토 Pending: ${allCandidates.filter(c => c.status === "pending").length}건`);
  console.log(`- 부적격 탈락 Rejected: ${allCandidates.filter(c => c.status === "rejected").length}건`);
  console.log(`- 후보 데이터 저장: public/data/naver-image-candidates.json`);
  console.log(`- 결과 요약 저장: scripts/naver_20_venues_audit_result.json`);
  console.log("==================================================");

  return { allCandidates, venueSummary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run20VenuesPipeline();
}
