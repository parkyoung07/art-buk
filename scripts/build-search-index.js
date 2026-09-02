const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "src", "content", "posts");
const ART_DATA_FILE = path.join(ROOT_DIR, "public", "data", "art-sample.json");
const OUTPUT_DATA_FILE = path.join(ROOT_DIR, "public", "data", "search-index.json");
const OUTPUT_PUBLIC_FILE = path.join(ROOT_DIR, "public", "search-index.json");

/**
 * 마크다운 문법 기호 제거 함수
 */
function cleanMarkdown(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 태그 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 링크 태그 제거
    .replace(/#{1,6}\s+/g, "") // 헤더 제거
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 굵게 제거
    .replace(/(\*|_)(.*?)\1/g, "$2") // 기울임 제거
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // 코드 블록 제거
    .replace(/>\s+/g, "") // 인용구 제거
    .replace(/\|.*?\|/g, "") // 표 마크다운 제거
    .replace(/[-*+]\s+/g, " ") // 불릿 기호 제거
    .replace(/\s+/g, " ") // 중복 공백 정리
    .trim();
}

/**
 * 전시 및 아카이브 검색 인덱스 생성 메인 함수
 */
function buildSearchIndex() {
  const indexEntries = [];

  // 1. 전시 및 아카이브 기본 데이터 (art-sample.json) 색인화
  if (fs.existsSync(ART_DATA_FILE)) {
    try {
      const artRaw = fs.readFileSync(ART_DATA_FILE, "utf-8");
      const artList = JSON.parse(artRaw);

      for (const item of artList) {
        const fullContent = [
          item.title,
          item.region,
          item.subRegion,
          item.venueName,
          item.address,
          item.category,
          item.price,
          item.period,
          item.description,
          item.curatorNote,
          (item.nearbySpots || []).join(" "),
        ]
          .filter(Boolean)
          .join(" ");

        indexEntries.push({
          id: item.id,
          type: "exhibition",
          title: item.title,
          url: `/events/${item.id}`,
          category: item.category || "전시",
          region: item.region || "",
          subRegion: item.subRegion || "",
          venue: item.venueName || "",
          period: item.period || "",
          price: item.price || "",
          summary: item.description || "",
          content: fullContent,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("⚠️ art-sample.json 읽기 실패:", err.message);
    }
  }

  // 2. 블로그 및 AI 도슨트 아티클 (src/content/posts/*.md) 색인화
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs
      .readdirSync(POSTS_DIR)
      .filter((file) => file.endsWith(".md") && !file.startsWith("."));

    for (const file of files) {
      try {
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);
        const slug = file.replace(/\.md$/, "");

        const cleanedBody = cleanMarkdown(content).slice(0, 1500); // 본문 요약

        indexEntries.push({
          id: slug,
          type: "article",
          title: data.title || slug,
          url: `/blog/${slug}`,
          category: data.category || "블로그",
          region: data.region || "",
          subRegion: data.subRegion || "",
          tags: data.tags || [],
          summary: data.summary || "",
          content: `${data.title || ""} ${data.summary || ""} ${(data.tags || []).join(" ")} ${cleanedBody}`,
          updatedAt: data.date || new Date().toISOString(),
        });
      } catch (err) {
        console.warn(`⚠️ ${file} 파싱 실패:`, err.message);
      }
    }
  }

  // 3. 전통시장 및 5일장 데이터 (public/data/markets.json) 색인화
  const MARKETS_DATA_FILE = path.join(ROOT_DIR, "public", "data", "markets.json");
  if (fs.existsSync(MARKETS_DATA_FILE)) {
    try {
      const marketRaw = fs.readFileSync(MARKETS_DATA_FILE, "utf-8");
      const marketList = JSON.parse(marketRaw);

      for (const m of marketList) {
        const fullContent = [
          m.name,
          m.region,
          m.subRegion,
          m.marketType,
          m.scheduleDescription,
          (m.specialties || []).join(" "),
          m.address,
          m.description,
          m.tips,
          "전통시장",
          "5일장",
          "장날",
          "재래시장",
          "시장먹거리"
        ]
          .filter(Boolean)
          .join(" ");

        indexEntries.push({
          id: m.id,
          type: "market",
          title: `[전통시장] ${m.name} (${m.region} ${m.subRegion})`,
          url: `/#market-section`,
          category: `전통시장 (${m.marketType})`,
          region: m.region || "",
          subRegion: m.subRegion || "",
          venue: m.name,
          period: m.scheduleDescription,
          price: (m.specialties || []).slice(0, 3).join(", "),
          summary: `${m.scheduleDescription} - ${m.description}`,
          content: fullContent,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("⚠️ markets.json 읽기 실패:", err.message);
    }
  }

  // 4. 디렉토리 생성 및 JSON 파일 출력
  const outputDataDir = path.dirname(OUTPUT_DATA_FILE);
  if (!fs.existsSync(outputDataDir)) {
    fs.mkdirSync(outputDataDir, { recursive: true });
  }

  const jsonContent = JSON.stringify(indexEntries, null, 2);

  // public/data/search-index.json 저장
  fs.writeFileSync(OUTPUT_DATA_FILE, jsonContent, "utf-8");

  // public/search-index.json 저장 (다양한 경로 접근 호환성)
  fs.writeFileSync(OUTPUT_PUBLIC_FILE, jsonContent, "utf-8");

  // 4. 요구된 콘솔 출력 메시지
  console.log(`Search index built: ${indexEntries.length} entries`);

  return indexEntries;
}

// 모듈 export 및 직접 실행
module.exports = { buildSearchIndex };

if (require.main === module) {
  buildSearchIndex();
}
