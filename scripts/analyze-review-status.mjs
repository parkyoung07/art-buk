import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidates = JSON.parse(fs.readFileSync(path.join(rootDir, "public/data/naver-image-candidates.json"), "utf8"));

const placeStatus = {};
candidates.forEach(c => {
  if (!placeStatus[c.place_name]) {
    placeStatus[c.place_name] = { place_id: c.place_id, approved: 0, pending: 0, rejected: 0, total: 0 };
  }
  placeStatus[c.place_name].total++;
  placeStatus[c.place_name][c.status] = (placeStatus[c.place_name][c.status] || 0) + 1;
});

console.log("=== 회장님 검수 결과 현황 ===");
const allRejected = [];
const onlyOneApproved = [];
const enoughApproved = [];

Object.entries(placeStatus).forEach(([name, s]) => {
  console.log(`- ${name.padEnd(20, ' ')} : 총 ${s.total}장 (승인: ${s.approved}, 대기: ${s.pending}, 거절: ${s.rejected})`);
  if (s.approved === 0 && s.pending === 0 && s.rejected > 0) {
    allRejected.push({ name, place_id: s.place_id });
  } else if (s.approved <= 1) {
    onlyOneApproved.push({ name, place_id: s.place_id, approved: s.approved, pending: s.pending, rejected: s.rejected });
  } else {
    enoughApproved.push({ name, place_id: s.place_id, approved: s.approved });
  }
});

console.log("\n[전부 거절된 장소]:", allRejected.length, "곳");
console.log(allRejected.map(x => x.name));

console.log("\n[0~1곳만 승인되어 추가 후보 4장이 필요한 장소]:", onlyOneApproved.length, "곳");
console.log(onlyOneApproved.map(x => `${x.name} (승인: ${x.approved}, 대기: ${x.pending}, 거절: ${x.rejected})`));
