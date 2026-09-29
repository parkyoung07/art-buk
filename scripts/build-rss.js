const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "src", "content", "posts");
const OUTPUT_RSS = path.join(ROOT_DIR, "public", "rss.xml");
const OUTPUT_FEED = path.join(ROOT_DIR, "public", "feed.xml");
const SITE_URL = "https://nadriai.com";

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRssFeed() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn("⚠️ posts 디렉토리가 없습니다.");
    return;
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("."));

  const posts = [];

  for (const file of files) {
    try {
      const filePath = path.join(POSTS_DIR, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");

      const cleanSummary = data.summary || content.slice(0, 200).replace(/[#*`\n\r]/g, " ").trim();
      const postDate = data.date ? new Date(data.date) : new Date();

      posts.push({
        slug,
        title: data.title || slug,
        summary: cleanSummary,
        category: data.category || "문화·나들이",
        date: postDate,
        author: "나드리 AI 팀",
        url: `${SITE_URL}/blog/${slug}/`,
      });
    } catch (e) {
      console.warn(`⚠️ RSS 포스트 파싱 오류 (${file}):`, e.message);
    }
  }

  // 최신순 정렬 (최대 50개)
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentPosts = posts.slice(0, 50);

  const now = new Date().toUTCString();

  const itemsXml = recentPosts
    .map((p) => {
      return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <description><![CDATA[${p.summary}]]></description>
      <category><![CDATA[${p.category}]]></category>
      <author>nadriai.com@gmail.com (${p.author})</author>
      <pubDate>${p.date.toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>나드리 AI (nadriai.com)</title>
    <link>${SITE_URL}</link>
    <description>부산·울산·경남 AI 문화·나들이 플랫폼 (전시, 5일장, 전통시장, 도서관, AI 코스 추천)</description>
    <language>ko-KR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  fs.writeFileSync(OUTPUT_RSS, rssXml, "utf-8");
  fs.writeFileSync(OUTPUT_FEED, rssXml, "utf-8");
  console.log(`✅ RSS 피드 생성 완료: ${recentPosts.length}개 포스트 수록 (public/rss.xml, public/feed.xml)`);
}

module.exports = { buildRssFeed };

if (require.main === module) {
  buildRssFeed();
}
