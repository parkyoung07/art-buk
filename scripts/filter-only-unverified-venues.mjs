import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidatesPath = path.join(rootDir, "public/data/naver-image-candidates.json");
const registryPath = path.join(rootDir, "public/data/verified-image-registry.json");

const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

// 1. 이미 승인 확정된 장소 세트
const alreadyApprovedPlaces = new Set(
  registry.images.map(img => (img.entity_name || img.entity_id || "").trim())
);

console.log("📌 이미 승인 확정된 기존 장소 수:", alreadyApprovedPlaces.size);

// 2. 이미 선택 완료된 장소 체크 함수
function isAlreadyApproved(placeName) {
  const cleanName = placeName.trim();
  for (const approved of alreadyApprovedPlaces) {
    if (approved.includes(cleanName) || cleanName.includes(approved)) {
      return true;
    }
  }
  return false;
}

// 3. 진짜 신규 선택이 필요한 장소만 추출
const newOnlyCandidates = candidates.filter(c => !isAlreadyApproved(c.place_name));

console.log("==================================================");
console.log(`🧹 [기존 승인 완료 장소 전량 제외 필터링]`);
console.log(`- 기존 등록된 장소들 제외 완료!`);
console.log(`- 진짜 회장님 선택이 필요한 신규 명소: ${Array.from(new Set(newOnlyCandidates.map(c => c.place_name))).length}곳`);
console.log(`- 신규 명소 엄선 후보 사진 수: 총 ${newOnlyCandidates.length}건 (장소당 4장)`);
console.log("==================================================");

// 4. 저장
fs.writeFileSync(candidatesPath, JSON.stringify(newOnlyCandidates, null, 2), "utf8");

// 남은 장소 목록 출력
const remainingPlaces = Array.from(new Set(newOnlyCandidates.map(c => c.place_name)));
console.log("📋 [검수실에 노출될 신규 장소 35곳 목록]:");
remainingPlaces.forEach((p, i) => {
  console.log(`${i + 1}. ${p}`);
});
