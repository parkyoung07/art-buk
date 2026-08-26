import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src", "content", "posts");

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  region: string;
  thumbnail?: string;
  eventId?: string;
  content: string;
}

function formatDate(dateVal: unknown): string {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split("T")[0];
  }
  if (typeof dateVal === "string") {
    return dateVal.trim();
  }
  return String(dateVal);
}

export function getAllPosts(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || "제목 없음",
        date: formatDate(data.date),
        summary: data.summary || "",
        category: data.category || "전시 리뷰",
        tags: Array.isArray(data.tags)
          ? data.tags
          : typeof data.tags === "string"
          ? data.tags.split(",").map((t: string) => t.trim())
          : [],
        region: data.region || "부울경",
        thumbnail: data.thumbnail || "",
        eventId: data.eventId || "",
        content,
      } as PostData;
    });

  // 최신 날짜순 정렬
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): PostData | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "제목 없음",
      date: formatDate(data.date),
      summary: data.summary || "",
      category: data.category || "전시 리뷰",
      tags: Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim())
        : [],
      region: data.region || "부울경",
      thumbnail: data.thumbnail || "",
      eventId: data.eventId || "",
      content,
    };
  } catch {
    return null;
  }
}
