import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src/content/posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

const sacheonRealPhoto = "http://imgnews.naver.net/image/047/2023/03/14/0002385169_001_20230314154201117.jpg";

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // 1. 사천 관련 포스트 청소
  if (file.includes("sacheon-ocean-art-museum")) {
    content = content.replace(/thumbnail:[\s\S]*?---/, `thumbnail: "${sacheonRealPhoto}"\n---`);
    // 본문에 사천 실사 삽입
    content = content.replace(/!\[.*?\]\(.*?\)\n*/g, "");
    content = content.replace(/<사천미술관 바다 기획전 : 삼천포 푸른 물결과 현대미술>\*\*과 함께 오감 만족 힐링 나들이를 떠나보세요!/, `<사천미술관 바다 기획전 : 삼천포 푸른 물결과 현대미술>**과 함께 오감 만족 힐링 나들이를 떠나보세요!\n\n![사천미술관 본관 외관 및 삼천포 바다 실사](${sacheonRealPhoto})`);
  }

  // 2. 포스터 URL (sacheon.go.kr, board/image.do 등) 잔여물 완전 청소
  content = content.replace(/https:\/\/www\.sacheon\.go\.kr\/board\/image\.do[^\n]*/g, "");

  fs.writeFileSync(filePath, content, "utf8");
}

console.log("✅ 전체 포스트 잔여 포스터 URL 완전 청소 완료!");
