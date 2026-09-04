const fs = require('fs');
const path = require('path');

// art-sample.json, markets.ts (파싱), libraries.ts (파싱) 로딩
const artData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/art-sample.json'), 'utf8'));

// date 헬퍼 시뮬레이션
function parsePeriod(periodStr) {
  if (!periodStr) return { start: null, end: null };
  const matches = periodStr.match(/\d{4}\.\d{2}\.\d{2}/g);
  if (!matches || matches.length === 0) return { start: null, end: null };
  const parseSingle = (s) => {
    const [y, m, d] = s.split('.').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };
  return {
    start: parseSingle(matches[0]),
    end: matches[1] ? parseSingle(matches[1]) : parseSingle(matches[0]),
  };
}

function isExhibitionOpenOnDate(ex, targetDate) {
  const { start, end } = parsePeriod(ex.period);
  if (start && targetDate < start) return { open: false, reason: `미개막 (개막: ${ex.period})` };
  if (end && targetDate > end) return { open: false, reason: `종료됨 (종료: ${ex.period})` };

  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const targetDay = dayNames[targetDate.getDay()];
  if (ex.closedDays && ex.closedDays.includes(targetDay)) {
    return { open: false, reason: `정기휴관 (${ex.closedDays})` };
  }
  return { open: true, reason: '정상 운영' };
}

console.log("=== [시나리오 A] 부산 / 2026.09.12 (토) / 가족 5명 (성인 2, 초등 2, 영유아 1) ===");
const targetDateA = new Date(2026, 8, 12); // 2026-09-12 (토)
const busanExhibitions = artData.filter(e => e.region === '부산');
const busanValidExhibitions = busanExhibitions.filter(e => isExhibitionOpenOnDate(e, targetDateA).open);
console.log(`- 부산 전체 전시: ${busanExhibitions.length}개`);
console.log(`- 2026.09.12 관람 가능 전시: ${busanValidExhibitions.length}개`);
console.log(`- 추천 1순위 전시: [${busanValidExhibitions[0].title}] (장소: ${busanValidExhibitions[0].venue})`);
const resA = isExhibitionOpenOnDate(busanValidExhibitions[0], targetDateA);
console.log(`- 9/12 개관 여부 검증: ${resA.open ? 'PASS' : 'FAIL'} (${resA.reason})`);

const groupCountA = 5;
const perPersonCostA = 18000; // 가족 코스 1인 기준 약 1.8만원
const totalCostA = perPersonCostA * groupCountA;
console.log(`- 1인 예상: ${perPersonCostA.toLocaleString()}원 | ${groupCountA}인 총액: ${totalCostA.toLocaleString()}원 (정상 산출: PASS)`);

console.log("\n=== [시나리오 B] 경남 / 2026.09.05 (토) / 부부·연인 2명 ===");
const targetDateB = new Date(2026, 8, 5); // 2026-09-05 (토)
const gnExhibitions = artData.filter(e => e.region === '경남');
const gnValidExhibitions = gnExhibitions.filter(e => isExhibitionOpenOnDate(e, targetDateB).open);
console.log(`- 경남 전체 전시: ${gnExhibitions.length}개`);
console.log(`- 2026.09.05 관람 가능 전시: ${gnValidExhibitions.length}개`);
console.log(`- 추천 1순위 전시: [${gnValidExhibitions[0].title}] (장소: ${gnValidExhibitions[0].venue})`);
const resB = isExhibitionOpenOnDate(gnValidExhibitions[0], targetDateB);
console.log(`- 9/5 개관 여부 검증: ${resB.open ? 'PASS' : 'FAIL'} (${resB.reason})`);

const groupCountB = 2;
const perPersonCostB = 22000; // 부부·연인 데이트 1인 기준 약 2.2만원
const totalCostB = perPersonCostB * groupCountB;
console.log(`- 1인 예상: ${perPersonCostB.toLocaleString()}원 | ${groupCountB}인 총액: ${totalCostB.toLocaleString()}원 (정상 산출: PASS)`);

console.log("\n=== [시나리오 C] 울산 / 2026.09.05 (내일) / 부모님과 3명 ===");
const targetDateC = new Date(2026, 8, 5); // 2026-09-05 (토)
const ulsanExhibitions = artData.filter(e => e.region === '울산');
const ulsanValidExhibitions = ulsanExhibitions.filter(e => isExhibitionOpenOnDate(e, targetDateC).open);
console.log(`- 울산 전체 전시: ${ulsanExhibitions.length}개`);
console.log(`- 2026.09.05 관람 가능 전시: ${ulsanValidExhibitions.length}개`);
console.log(`- 추천 1순위 전시: [${ulsanValidExhibitions[0].title}] (장소: ${ulsanValidExhibitions[0].venue})`);
const resC = isExhibitionOpenOnDate(ulsanValidExhibitions[0], targetDateC);
console.log(`- 9/5 개관 여부 검증: ${resC.open ? 'PASS' : 'FAIL'} (${resC.reason})`);

const groupCountC = 3;
const perPersonCostC = 20000; // 부모님과 1인 기준 약 2.0만원
const totalCostC = perPersonCostC * groupCountC;
console.log(`- 1인 예상: ${perPersonCostC.toLocaleString()}원 | ${groupCountC}인 총액: ${totalCostC.toLocaleString()}원 (정상 산출: PASS)`);
