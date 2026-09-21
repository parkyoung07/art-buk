import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("🚀 [나드리 AI] 일일 통합 올인원(All-in-One) 자동화 가동");
console.log("==================================================");

// 1. KST 날짜 확인
const now = new Date();
const kstOffset = 9 * 60 * 60 * 1000;
const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);
const today = kstDate.toISOString().split("T")[0];
const kstHour = kstDate.getHours();

const postsDir = path.join(rootDir, "src/content/posts");
const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir) : [];
const todayPosts = files.filter(f => f.startsWith(today) && f.endsWith(".md"));

console.log(`📅 기준 일자: ${today} (현재 KST ${kstHour}시)`);
console.log(`📝 오늘 이미 발행된 글: ${todayPosts.length}편`);

// 2. 글 발행 필요 여부 판단 및 1회 통합 실행
let needGeneration = false;
if (kstHour < 14 && todayPosts.length === 0) {
  console.log("💡 오전 슬롯 발행 필요 -> 자동 글 생성 실행");
  needGeneration = true;
} else if (kstHour >= 14 && todayPosts.length < 2) {
  console.log("💡 오후 슬롯 발행 필요 -> 자동 글 생성 실행");
  needGeneration = true;
}

if (needGeneration) {
  try {
    console.log("✍️ [1/3] 신규 추천 포스트 자동 생성 중...");
    execSync("node scripts/generate-daily-post.mjs", { cwd: rootDir, stdio: "inherit" });
  } catch (e) {
    console.error("⚠️ 포스트 생성 중 오류:", e.message);
  }
} else {
  console.log("✅ 현재 슬롯 발행이 이미 완료되어 있습니다.");
}

// 2. 글 시각 무결성 100% 사전 검증 및 자동 치유 (Tri-Shield Vision Verifier)
try {
  console.log("🛡️ [2/4] 3중 무결성 시각 감사관 (Vision Verifier) 검사 중...");
  execSync("node scripts/verify-image-vision.mjs", { cwd: rootDir, stdio: "inherit" });
} catch (e) {
  console.error("⚠️ 시각 무결성 검증 중 오류:", e.message);
}

// 3. 검색 색인 갱신 (1회 통합)
try {
  console.log("🔍 [3/4] 검색 색인(search-index.json) 갱신 중...");
  execSync("node scripts/build-search-index.js", { cwd: rootDir, stdio: "inherit" });
} catch (e) {
  console.error("⚠️ 검색 색인 갱신 중 오류:", e.message);
}

// 4. 일일 정기 점검 실행 (1회 통합)
try {
  console.log("📊 [4/5] 일일 정기 점검 및 제1원칙 감사 수행 중...");
  execSync("node scripts/daily-inspect.mjs", { cwd: rootDir, stdio: "inherit" });
} catch (e) {
  console.error("⚠️ 점검 스크립트 실행 중 오류:", e.message);
}

// 5. GitHub 자동 배포 (Git Commit & Push 원스톱 완결)
try {
  console.log("🚀 [5/5] GitHub 자동 배포(Push) 진행 중...");
  execSync("git add .", { cwd: rootDir, stdio: "inherit" });
  const status = execSync("git status --porcelain", { cwd: rootDir }).toString();
  if (status.trim()) {
    execSync('git commit -m "fix(images): 부산도서관 실사 사진 교체 및 이미지 무결성 최신화"', { cwd: rootDir, stdio: "inherit" });
    execSync("git push origin main", { cwd: rootDir, stdio: "inherit" });
    console.log("✅ GitHub 배포 완료! Cloudflare Pages 자동 빌드가 시작되었습니다.");
  } else {
    console.log("ℹ️ 변경된 파일이 없어 푸시를 건너뜁니다.");
  }
} catch (e) {
  console.error("⚠️ Git 배포 중 오류:", e.message);
}

console.log("==================================================");
console.log("🎉 [나드리 AI] 올인원 일일 작업 및 배포 원스톱 완료!");
console.log("==================================================");
