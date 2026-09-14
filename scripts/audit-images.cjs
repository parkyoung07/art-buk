const fs = require("fs");
const path = require("path");

const artSamplePath = path.join(__dirname, "../public/data/art-sample.json");
const artSample = JSON.parse(fs.readFileSync(artSamplePath, "utf8"));
const postsDir = path.join(__dirname, "../src/content/posts");
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

const urlUsage = {};

artSample.forEach(item => {
  const u = item.thumbnailUrl;
  if (!u) return;
  if (!urlUsage[u]) urlUsage[u] = [];
  urlUsage[u].push(`[artSample] ${item.id} - ${item.title}`);
});

postFiles.forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), "utf8");
  const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\)]+)\)/g;
  const thumbMatch = content.match(/thumbnail:\s*"([^"]+)"/);
  if (thumbMatch) {
    const u = thumbMatch[1];
    if (!urlUsage[u]) urlUsage[u] = [];
    urlUsage[u].push(`[post-thumb] ${file}`);
  }
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    const u = m[2];
    if (!urlUsage[u]) urlUsage[u] = [];
    urlUsage[u].push(`[post-body] ${file} (${m[1]})`);
  }
});

console.log(`Total unique image URLs: ${Object.keys(urlUsage).length}`);
Object.entries(urlUsage).forEach(([url, usages], idx) => {
  console.log(`\n${idx + 1}. URL: ${url}`);
  usages.slice(0, 4).forEach(u => console.log(`   - ${u}`));
  if (usages.length > 4) console.log(`   - ... and ${usages.length - 4} more`);
});
