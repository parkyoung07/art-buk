import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const postsDir = path.join(rootDir, "src", "content", "posts");

const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md") && f !== ".gitkeep");

console.log("==================================================");
console.log(`🚀 [나드리 AI] 플레이스홀더 표기물 및 중복 이미지 전면 삭제 작업 시작 (총 ${files.length}편)`);
console.log("==================================================");

let totalPlaceholderImgsRemoved = 0;
let totalDuplicateImgsRemoved = 0;
let totalCaptionsRemoved = 0;
let totalThumbnailsCleaned = 0;
let modifiedFilesCount = 0;

const modifiedList = [];

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  let content = parsed.content;

  let fileModified = false;
  let placeholdersInThisFile = 0;
  let duplicatesInThisFile = 0;

  // 1. 썸네일 검사 및 정돈 (플레이스홀더 SVG는 완전 제거)
  const origThumb = (data.thumbnail || "").trim();
  if (origThumb.includes("placeholder") || origThumb.includes("/images/placeholders/")) {
    data.thumbnail = "";
    totalThumbnailsCleaned++;
    fileModified = true;
  }

  // 2. 본문 줄 단위 정밀 파싱
  const lines = content.split("\n");
  const newLines = [];
  const seenUrlsInPost = new Set();

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // 이미지 마크다운 매칭 (공백 허용)
    const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)\s*$/);

    if (imgMatch || trimmedLine.includes("![") && trimmedLine.includes("](/images/placeholders/")) {
      const altText = imgMatch ? imgMatch[1] : "";
      const imgUrl = imgMatch ? imgMatch[2].trim() : "/images/placeholders/";

      const isPlaceholder = imgUrl.includes("placeholder") || 
                            imgUrl.includes("/images/placeholders/") || 
                            altText.includes("공식 검증 대기 중") ||
                            trimmedLine.includes("공식 검증 대기 중");

      const isDuplicate = !isPlaceholder && seenUrlsInPost.has(imgUrl);

      if (isPlaceholder) {
        // [조건 1] 공식 검증 대기 중 플레이스홀더 이미지 전면 삭제!
        placeholdersInThisFile++;
        totalPlaceholderImgsRemoved++;
        fileModified = true;

        // 바로 다음 줄이 캡션(▲ ...)인 경우 함께 삭제
        if (i + 1 < lines.length) {
          const nextTrimmed = lines[i + 1].trim();
          if (nextTrimmed.startsWith("*▲") || nextTrimmed.startsWith("▲") || nextTrimmed.startsWith("*[사진") || nextTrimmed.startsWith("*사진") || nextTrimmed.includes("공식 검증 대기 중")) {
            i++; // 캡션 줄 건너뜀
            totalCaptionsRemoved++;
          }
        }
        continue;
      } else if (isDuplicate) {
        // [조건 2] 글 하나에 3개씩 동일한 중복 이미지 삭제!
        duplicatesInThisFile++;
        totalDuplicateImgsRemoved++;
        fileModified = true;

        // 바로 다음 줄이 캡션인 경우 함께 삭제
        if (i + 1 < lines.length) {
          const nextTrimmed = lines[i + 1].trim();
          if (nextTrimmed.startsWith("*▲") || nextTrimmed.startsWith("▲") || nextTrimmed.startsWith("*[사진") || nextTrimmed.startsWith("*사진")) {
            i++; // 캡션 줄 건너뜀
            totalCaptionsRemoved++;
          }
        }
        continue;
      } else {
        // 유효한 고유 검증 실사 (1회만 보존)
        seenUrlsInPost.add(imgUrl);
        newLines.push(lines[i]);
      }
    } else {
      // 독립적으로 남아있는 '공식 검증 대기 중' 캡션 줄 제거
      if (trimmedLine.includes("공식 검증 대기 중") && (trimmedLine.startsWith("*▲") || trimmedLine.startsWith("▲") || trimmedLine.startsWith("*"))) {
        totalCaptionsRemoved++;
        fileModified = true;
        continue;
      }
      newLines.push(lines[i]);
    }
  }

  content = newLines.join("\n");

  // 3. 본문 내 검증 실사가 1개 이상 있는데 썸네일이 비어있으면 첫 번째 검증 실사를 썸네일로 설정
  if (!data.thumbnail && seenUrlsInPost.size > 0) {
    const firstRealUrl = Array.from(seenUrlsInPost)[0];
    data.thumbnail = firstRealUrl;
    fileModified = true;
  }

  // 4. 연속된 빈 줄 정리 및 고립된 빈 구분선 정리
  content = content.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  if (fileModified) {
    const updatedRaw = matter.stringify(content, data);
    fs.writeFileSync(filePath, updatedRaw, "utf8");
    modifiedFilesCount++;
    modifiedList.push({
      file,
      title: data.title,
      placeholdersRemoved: placeholdersInThisFile,
      duplicatesRemoved: duplicatesInThisFile,
      hasThumbnail: !!data.thumbnail
    });
  }
});

console.log(`\n📊 [작업 완료 통계]`);
console.log(`- 정리된 포스트 파일 수: 총 ${modifiedFilesCount}편`);
console.log(`- 삭제된 [공식 검증 대기 중] 플레이스홀더 이미지: ${totalPlaceholderImgsRemoved}개`);
console.log(`- 삭제된 [글 내 동일 중복] 이미지: ${totalDuplicateImgsRemoved}개`);
console.log(`- 함께 삭제된 관련 캡션 텍스트: ${totalCaptionsRemoved}개`);
console.log(`- 정리된 플레이스홀더 썸네일: ${totalThumbnailsCleaned}개`);

fs.writeFileSync(
  path.join(rootDir, "scripts", "purge_placeholders_result.json"),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    stats: {
      modifiedFilesCount,
      totalPlaceholderImgsRemoved,
      totalDuplicateImgsRemoved,
      totalCaptionsRemoved,
      totalThumbnailsCleaned
    },
    modifiedList
  }, null, 2),
  "utf8"
);
