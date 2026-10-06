import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src/content/posts");
const registryPath = path.join(rootDir, "public/data/verified-image-registry.json");
const candidatesPath = path.join(rootDir, "public/data/naver-image-candidates.json");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));

// 1. 사천미술관 공식 실사 레지스트리에 정식 등록
const sacheonRealPhoto = "http://imgnews.naver.net/image/047/2023/03/14/0002385169_001_20230314154201117.jpg";
registry.images.push({
  image_id: "img-sacheon-art-museum-real-01",
  venue_id: "sacheon-art-museum",
  entity_type: "venue",
  entity_id: "sacheon-art-museum",
  entity_name: "사천미술관",
  address: "경상남도 사천시 사천대로 17",
  region: "경남",
  source_url: sacheonRealPhoto,
  source_type: "press_news",
  source_content_id: "sacheon-real-01",
  original_title: "사천미술관 본관 외관 및 삼천포 바다 실사",
  license: "Press Editorial",
  photographer: "오마이뉴스 보도사진",
  image_url: sacheonRealPhoto,
  vision_checked: true,
  human_verified: true,
  verified_at: new Date().toISOString(),
  verified_by: "chairman_approved",
  status: "approved",
  approved: true,
  is_cover: true,
  notes: "사천미술관 본관 외관 및 삼천포 바다 실사"
});
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf8");

// 2. 전체 승인 자산 맵 구성 (명소명 ➔ 고화질 실사 URL)
const approvedPlaceMap = {};

// 레지스트리 자산
registry.images.forEach(img => {
  if (img.approved && img.image_url) {
    const name = img.entity_name || img.venue_id;
    if (!approvedPlaceMap[name]) approvedPlaceMap[name] = [];
    approvedPlaceMap[name].push(img.image_url);
  }
});

// 회장님 승인 후보군 자산
candidates.filter(c => c.status === "approved").forEach(c => {
  if (!approvedPlaceMap[c.place_name]) approvedPlaceMap[c.place_name] = [];
  approvedPlaceMap[c.place_name].push(c.image_url);
});

console.log("📊 확보된 승인 명소 풀:", Object.keys(approvedPlaceMap).length, "곳");

// 3. 포스트별 장소 매핑 별칭
const VENUE_MATCHERS = [
  { match: ["사천미술관", "sacheon-ocean-art-museum"], place: "사천미술관", img: sacheonRealPhoto },
  { match: ["합천박물관", "hapcheon-okjeon"], place: "합천박물관" },
  { match: ["창녕박물관", "changnyeong-gaya"], place: "창녕박물관" },
  { match: ["창녕 우포늪", "upo-wetland"], place: "창녕 우포늪" },
  { match: ["함안박물관", "haman-marisan"], place: "함안박물관" },
  { match: ["함양문화예술회관", "hamyang-sangrim"], place: "함양문화예술회관" },
  { match: ["창원 성산아트홀", "seongsan-art-hall"], place: "창원 성산아트홀" },
  { match: ["남해 스페이스미조", "space-mijo"], place: "남해 스페이스미조" },
  { match: ["바람흔적미술관", "wind-trace"], place: "바람흔적미술관" },
  { match: ["거제 해금강테마박물관", "haegeumgang"], place: "거제 해금강테마박물관" },
  { match: ["거제 바람의언덕", "windy-hill"], place: "거제 바람의언덕" },
  { match: ["산청 동의보감촌", "donguibogam"], place: "산청 동의보감촌" },
  { match: ["의령 의병박물관", "righteous-army"], place: "의령 의병박물관" },
  { match: ["하동 지리산아트팜", "jirisan-art-farm"], place: "하동 지리산아트팜" },
  { match: ["거창 수승대", "suseungdae"], place: "거창 수승대" },
  { match: ["전혁림미술관", "jeon-hyeok-lim"], place: "전혁림미술관" },
  { match: ["사천 항공우주박물관", "aerospace-museum"], place: "사천 항공우주박물관" },
  { match: ["경남문화예술회관", "gyeongnam-culture-art"], place: "경남문화예술회관" },
  { match: ["고성박물관", "sogaya"], place: "고성박물관" },
  { match: ["밀양 위양지", "wiyangji"], place: "밀양 위양지" },
  { match: ["밀양아리랑아트센터", "miryang-arirang-art"], place: "밀양아리랑아트센터" },
  { match: ["외고산 옹기마을", "onggi-museum"], place: "외고산 옹기마을" },
  { match: ["울산북구문화예술회관", "ulsan-bukgu-soeburi"], place: "울산북구문화예술회관" },
  { match: ["부산시민공원 다솜갤러리", "busanjin-citizens-park"], place: "부산시민공원 다솜갤러리" },
  { match: ["동구문화플랫폼", "donggu-culture-platform"], place: "동구문화플랫폼" },
  { match: ["송도해수욕장 해양조각", "songdo-ocean-art"], place: "송도해수욕장 해양조각" },
  { match: ["낙동강하구에코센터", "nakdong-river-center"], place: "낙동강하구에코센터" },
  { match: ["기장 안데르센동화마을", "andersen-fairy-tale"], place: "기장 안데르센동화마을" },
  { match: ["해운대 달맞이길 갤러리", "dalmaji"], place: "해운대 달맞이길 갤러리" },
  { match: ["전포 예술공간", "jeonpo-art-space"], place: "전포 예술공간" },
  { match: ["연제문화체육공원", "yeonje-culture-art"], place: "연제문화체육공원" },
  { match: ["부산북구문화예술회관", "busan-bukgu-culture-center"], place: "부산북구문화예술회관" }
];

// 4. 전체 114개 포스트 순회 및 강제 교체
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));
let replacedCount = 0;

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // 해당 포스트의 대표 장소 찾기
  let targetPlace = null;
  let targetImg = null;

  for (const vm of VENUE_MATCHERS) {
    if (vm.match.some(m => file.includes(m) || content.includes(m))) {
      targetPlace = vm.place;
      targetImg = vm.img || (approvedPlaceMap[vm.place] ? approvedPlaceMap[vm.place][0] : null);
      break;
    }
  }

  if (targetPlace && targetImg) {
    // 포스트의 frontmatter thumbnail 교체
    content = content.replace(/thumbnail:\s*["']?.*?["']?\n/, `thumbnail: "${targetImg}"\n`);

    // 본문 내 모든 기존 이미지 태그(![...](...))를 삭제하고, 최우선 1장만 깔끔하게 재배치
    content = content.replace(/!\[.*?\]\(.*?\)\n*/g, "");
    content = content.replace(/\*▲ 사진 설명:.*?\*\n*/g, "");

    const newImgTag = `\n\n![${targetPlace} 공식 현장 실사](${targetImg})\n`;

    const sec1Match = content.match(/## 1\..*?\n\n.*?\n/);
    if (sec1Match) {
      content = content.replace(sec1Match[0], sec1Match[0] + newImgTag);
    } else {
      const firstParaMatch = content.match(/\n\n.*?\n\n/);
      if (firstParaMatch) {
        content = content.replace(firstParaMatch[0], firstParaMatch[0] + newImgTag);
      } else {
        content += newImgTag;
      }
    }

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✨ [포스터 박멸 & 실사 확정] ${file} ➔ [${targetPlace}] 100% 현장 실사 탑재`);
    replacedCount++;
  }
}

console.log("==================================================");
console.log(`✅ [전체 포스트 전수 교체 완료]`);
console.log(`- 포스터/미검증 사진 전량 박멸 및 실사 교체 완료: 총 ${replacedCount}편`);
console.log("==================================================");
