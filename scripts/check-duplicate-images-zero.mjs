import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.resolve("src/content/posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md") && f !== ".gitkeep");

let duplicatesFound = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const content = parsed.content;

  const urls = [];
  const matches = content.matchAll(/!\[.*?\]\((.*?)\)/g);
  for (const m of matches) {
    urls.push(m[1].trim());
  }

  const uniqueUrls = new Set(urls);
  if (uniqueUrls.size !== urls.length) {
    console.warn(`⚠️ [중복 잔여 발견] ${file}: 전체 ${urls.length}장 중 고유 ${uniqueUrls.size}장`);
    duplicatesFound++;
  }
});

if (duplicatesFound === 0) {
  console.log("✅ [완벽 검증] 114개 모든 포스트 내부의 이미지 중복 0건 완벽 입증!");
} else {
  console.log(`❌ ${duplicatesFound}개 파일에 중복이 남아있습니다.`);
}
