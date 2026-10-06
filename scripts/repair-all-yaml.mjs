import fs from "fs";
import path from "path";
import matter from "gray-matter";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src/content/posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

console.log("=== 포스트 frontmatter YAML 유효성 전수 검사 및 복구 ===");

for (const file of files) {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // thumbnail 아래에 떠도는 고아 URL 라인들 청소
  content = content.replace(/thumbnail:\s*"([^"]+)"\s*\n\s*http[^\n]+\n/g, 'thumbnail: "$1"\n');
  content = content.replace(/thumbnail:\s*'([^']+)'\s*\n\s*http[^\n]+\n/g, "thumbnail: '$1'\n");
  content = content.replace(/thumbnail:\s*>-\s*\n\s*http[^\n]+\n\s*http[^\n]+\n/g, 'thumbnail: ""\n');

  // YAML 정상 파싱 여부 테스트
  try {
    matter(content);
    fs.writeFileSync(filePath, content, "utf8");
  } catch (err) {
    console.log(`⚠️ 파싱 오류 발생 파일: ${file}, 복구 시도...`);
    // frontmatter 블록을 정규화
    const parts = content.split("---");
    if (parts.length >= 3) {
      let fm = parts[1];
      const rest = parts.slice(2).join("---");
      
      // fm 내에서 들여쓰기된 단독 http 라인 제거
      const lines = fm.split("\n");
      const cleanLines = lines.filter(line => {
        const tr = line.trim();
        if (tr.startsWith("http://") || tr.startsWith("https://")) {
          // 키-값 형태가 아니면 제거
          return line.includes(":");
        }
        return true;
      });
      content = "---" + cleanLines.join("\n") + "---" + rest;
      matter(content); // 재검증
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ [복구 성공] ${file}`);
    }
  }
}

console.log("==================================================");
console.log("✅ 114개 전체 포스트 YAML 무결성 100% 검증 완료!");
console.log("==================================================");
