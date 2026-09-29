const fs = require("fs");
const urls = JSON.parse(fs.readFileSync("scripts/all_unique_urls.json", "utf8"));

console.log("=== 전체 297개 이미지 도메인 및 출처 분석 ===");
const domains = {};
for (const u of Object.keys(urls)) {
  try {
    const d = new URL(u).hostname;
    domains[d] = (domains[d] || 0) + 1;
  } catch(e) {
    domains["invalid"] = (domains["invalid"] || 0) + 1;
  }
}
console.log(domains);

// Check Unsplash URLs
const unsplashList = Object.entries(urls).filter(([u]) => u.includes("unsplash.com"));
console.log(`\nUnsplash URLs count: ${unsplashList.length}`);
unsplashList.forEach(([u, usages]) => {
  console.log(`- ${u.split("?")[0]} (${usages.length}회)`);
  usages.forEach(us => console.log(`    [${us.file}] ${us.caption || ""}`));
});

// Check Pexels URLs
const pexelsList = Object.entries(urls).filter(([u]) => u.includes("pexels.com"));
console.log(`\nPexels URLs count: ${pexelsList.length}`);
pexelsList.forEach(([u, usages]) => {
  console.log(`- ${u.split("?")[0]} (${usages.length}회)`);
  usages.forEach(us => console.log(`    [${us.file}] ${us.caption || ""}`));
});

// Check Naver/Pstatic URLs
const pstaticList = Object.entries(urls).filter(([u]) => u.includes("pstatic.net"));
console.log(`\nPstatic URLs count: ${pstaticList.length}`);
pstaticList.forEach(([u, usages]) => {
  console.log(`- ${u.substring(0, 80)}... (${usages.length}회)`);
  usages.forEach(us => console.log(`    [${us.file}] ${us.caption || ""}`));
});
