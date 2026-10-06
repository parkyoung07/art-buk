import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidates = JSON.parse(fs.readFileSync(path.join(rootDir, "public/data/naver-image-candidates.json"), "utf8"));
const approved = candidates.filter(c => c.status === "approved");

const placeMap = {};
approved.forEach(c => {
  if (!placeMap[c.place_name]) placeMap[c.place_name] = [];
  placeMap[c.place_name].push(c);
});

const postsDir = path.join(rootDir, "src/content/posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

console.log("=== 포스트별 매칭 정밀 감사 및 교정 ===");

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // 파일명 슬러그에 기반한 엄밀한 1:1 매칭
  let targetPlace = null;
  if (file.includes("ulsan-bukgu-soeburi-art")) targetPlace = "울산북구문화예술회관";
  else if (file.includes("busan-dongnae-culture-center")) targetPlace = "동래문화회관";
  else if (file.includes("busan-bukgu-culture-center")) targetPlace = "부산북구문화예술회관";
  else if (file.includes("busan-yeonje-culture-art")) targetPlace = "연제문화체육공원";
  else if (file.includes("goseong-sogaya")) targetPlace = "고성박물관";
  else if (file.includes("sancheong-donguibogam")) targetPlace = "산청 동의보감촌";
  else if (file.includes("uiryeong-righteous-army")) targetPlace = "의령 의병박물관";

  if (targetPlace && placeMap[targetPlace] && placeMap[targetPlace].length > 0) {
    const bestImg = placeMap[targetPlace].find(x => x.is_cover) || placeMap[targetPlace][0];
    
    // 기존 이미지 태그를 정확한 실사로 교체
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    const newImgTag = `![${targetPlace} 공식 현장 실사](${bestImg.image_url})`;

    if (imgRegex.test(content)) {
      content = content.replace(imgRegex, newImgTag);
    } else {
      const sec1Match = content.match(/## 1\..*?\n\n.*?\n/);
      if (sec1Match) {
        content = content.replace(sec1Match[0], sec1Match[0] + `\n\n${newImgTag}\n`);
      }
    }
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`🎯 [정밀 교정 완료] ${file} ➔ [${targetPlace}] 실사 확정`);
  }
}
