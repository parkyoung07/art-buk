import fs from "fs";
import path from "path";
import matter from "gray-matter";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src", "content", "posts");
const dataDir = path.join(rootDir, "public", "data");

// 1. 블랙리스트 이미지 URL (딸기케이크, 홍보 배너 등)
const BAD_IMAGE_URL_BLACKLIST = new Set([
  "http://tong.visitkorea.or.kr/cms/resource/57/3497757_image2_1.jpg",
  "http://tong.visitkorea.or.kr/cms/resource/59/3497759_image2_1.jpg",
  "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=6ee6bcc8-a736-4811-89ad-2d57cefe0e4c",
  "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjEyMjRfMTcg%2FMDAxNjcxODc2MTc0NTk0.Wb41BPY1IDA8LXs2zb7802tqLcZ8MEZz7e4CpiHkGbMg.Fn37TPT28Re5MsaKY2DZ329Xpksea1ojGK6EeT6Mh3Ug.JPEG.lovinyou1%2FIMG_7466.JPG&type=sc960_832",
  "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA5MTBfNzgg%2FMDAxNzg5MDE2MTI3NjU0.y_xsiKCzVtdEDIUyYCbdG0CQpeBT3fjYYSIoNg9zNv0g.Tlxli_cnml-st5sJqlZj_KTjucNk-hv_vLw1xMR33nIg.PNG%2F982b2d22-b7b2-478d-9bd7-04b7d0967e0e.png&type=sc960_832"
]);

// 2. 레지스트리 및 Vault에서도 블랙리스트 영구 삭제
const registryPath = path.join(dataDir, "verified-image-registry.json");
if (fs.existsSync(registryPath)) {
  const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const origLen = reg.images.length;
  reg.images = reg.images.filter(img => !BAD_IMAGE_URL_BLACKLIST.has(img.image_url));
  reg.stats.total_images = reg.images.length;
  reg.stats.approved = reg.images.filter(i => i.status === "approved").length;
  fs.writeFileSync(registryPath, JSON.stringify(reg, null, 2), "utf8");
  console.log(`🧹 레지스트리 내 블랙리스트 제거: ${origLen - reg.images.length}건 삭제`);
}

const vaultPath = path.join(dataDir, "verified-image-vault.json");
if (fs.existsSync(vaultPath)) {
  const vault = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
  for (const cat of Object.keys(vault.categories || {})) {
    for (const venue of Object.keys(vault.categories[cat] || {})) {
      if (Array.isArray(vault.categories[cat][venue])) {
        vault.categories[cat][venue] = vault.categories[cat][venue].filter(
          img => !BAD_IMAGE_URL_BLACKLIST.has(img.url)
        );
      }
    }
  }
  fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2), "utf8");
  console.log("🧹 Vault 내 블랙리스트 정리 완료");
}

// 3. 포스트 전수 정리: 글당 오직 1장의 검증 대표 실사만 허용 (글 내 중복 0%, 부조화 사진 100% 삭제)
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md") && f !== ".gitkeep");

console.log(`\n🚀 [전수 정밀 클린업] 총 ${files.length}편 포스트 1글 1실사(중복 0%) 원칙 적용 시작`);

let cleanedFilesCount = 0;
let totalRemovedImagesCount = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  let content = parsed.content;

  // 1) 썸네일 검사
  if (data.thumbnail && BAD_IMAGE_URL_BLACKLIST.has(data.thumbnail)) {
    data.thumbnail = "";
  }

  // 2) 본문 줄 단위 정밀 파싱
  const lines = content.split("\n");
  const newLines = [];
  let keptOneImage = false; // 글당 대표 실사 1장만 보존

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const isImgLine = trimmed.match(/^!\[(.*?)\]\((.*?)\)\s*$/);

    if (isImgLine) {
      const alt = isImgLine[1];
      const url = isImgLine[2].trim();

      const isBad = BAD_IMAGE_URL_BLACKLIST.has(url) || url.includes("placeholder") || alt.includes("검증 대기");

      if (isBad || keptOneImage) {
        // 블랙리스트이거나 이미 대표 실사가 1장 들어간 경우 본문 추가 이미지 전량 삭제!
        totalRemovedImagesCount++;
        // 다음 줄 캡션도 함께 삭제
        if (i + 1 < lines.length) {
          const nextTrim = lines[i + 1].trim();
          if (nextTrim.startsWith("*▲") || nextTrim.startsWith("▲") || nextTrim.startsWith("*[사진") || nextTrim.startsWith("*사진")) {
            i++;
          }
        }
        continue;
      } else {
        // 검증된 고유 실사 첫 번째 1장만 유지
        keptOneImage = true;
        if (!data.thumbnail) {
          data.thumbnail = url;
        }
        newLines.push(line);
      }
    } else {
      // 독립된 이상 캡션 제거
      if (trimmed.includes("석천홀 가을 전경") && !keptOneImage) {
        // 만약 이미지가 없는데 캡션만 남은 경우
        continue;
      }
      newLines.push(line);
    }
  }

  content = newLines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";

  const updatedRaw = matter.stringify(content, data);
  if (updatedRaw !== raw) {
    fs.writeFileSync(filePath, updatedRaw, "utf8");
    cleanedFilesCount++;
  }
});

console.log("==================================================");
console.log(`✅ [완벽 정돈 완료]`);
console.log(`- 수정 및 클린업된 포스트: 총 ${cleanedFilesCount}편`);
console.log(`- 삭제된 중복 및 부조화(케이크/스톡) 이미지: 총 ${totalRemovedImagesCount}개`);
console.log("==================================================");
