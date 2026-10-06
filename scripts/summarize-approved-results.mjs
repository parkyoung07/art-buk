import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidates = JSON.parse(fs.readFileSync(path.join(rootDir, "public/data/naver-image-candidates.json"), "utf8"));

const approvedByPlace = {};
const pendingByPlace = {};
const rejectedByPlace = {};

candidates.forEach(c => {
  if (c.status === "approved") {
    if (!approvedByPlace[c.place_name]) approvedByPlace[c.place_name] = [];
    approvedByPlace[c.place_name].push(c);
  } else if (c.status === "pending") {
    if (!pendingByPlace[c.place_name]) pendingByPlace[c.place_name] = [];
    pendingByPlace[c.place_name].push(c);
  } else if (c.status === "rejected") {
    if (!rejectedByPlace[c.place_name]) rejectedByPlace[c.place_name] = [];
    rejectedByPlace[c.place_name].push(c);
  }
});

console.log("=== [1] 회장님 승인 완료 명소 및 사진 현황 ===");
console.log(`총 승인 완료 명소 수: ${Object.keys(approvedByPlace).length}곳`);
let totalApprovedImgs = 0;

Object.entries(approvedByPlace).forEach(([name, list], idx) => {
  totalApprovedImgs += list.length;
  const coverImg = list.find(x => x.is_cover) || list[0];
  console.log(`\n${idx + 1}. [${name}] (승인: ${list.length}장)`);
  console.log(`   - 대표/주요사진: "${coverImg.title}"`);
  console.log(`   - 출처 도메인: ${coverImg.source_domain} (Tier ${coverImg.source_tier})`);
  console.log(`   - 사진 URL: ${coverImg.image_url}`);
});

console.log(`\n총 승인된 사진 수: ${totalApprovedImgs}장`);

console.log("\n=== [2] 아직 대기 중인 신규 명소 현황 ===");
console.log(`대기 중 명소 수: ${Object.keys(pendingByPlace).length}곳`);
Object.entries(pendingByPlace).forEach(([name, list], idx) => {
  console.log(`${idx + 1}. ${name} (대기 후보: ${list.length}장)`);
});
