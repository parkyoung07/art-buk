const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDirectory = path.join(__dirname, "../src/content/posts");
const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith(".md"));

const posts = fileNames.map(fileName => {
  const fullPath = path.join(postsDirectory, fileName);
  const content = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(content);
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: data.title,
    date: String(data.date).split("T")[0],
    summary: data.summary,
    region: data.region,
    eventId: data.eventId
  };
}).sort((a, b) => b.date.localeCompare(a.date));

console.log("최신 5개 포스트:");
posts.slice(0, 5).forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.date}] ${p.title} (eventId: ${p.eventId})`);
});
