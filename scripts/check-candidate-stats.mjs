import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const candidates = JSON.parse(fs.readFileSync(path.join(rootDir, "public/data/naver-image-candidates.json"), "utf8"));

const statusCounts = {};
const placeMap = {};

candidates.forEach(c => {
  statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  if (!placeMap[c.place_name]) {
    placeMap[c.place_name] = { total: 0, approved: 0, pending: 0, rejected: 0 };
  }
  placeMap[c.place_name].total++;
  placeMap[c.place_name][c.status] = (placeMap[c.place_name][c.status] || 0) + 1;
});

console.log("=== 후보군 종합 통계 ===");
console.log("총 후보 사진 수:", candidates.length);
console.log("상태별 통계:", statusCounts);
console.log("총 명소 수:", Object.keys(placeMap).length);

console.log("\n=== 주요 명소별 후보 사진 현황 ===");
Object.entries(placeMap).forEach(([name, data]) => {
  console.log(`- ${name.padEnd(20, ' ')} : 총 ${String(data.total).padStart(2, ' ')}장 (승인권장: ${data.approved}, 대기: ${data.pending}, 탈락: ${data.rejected})`);
});
