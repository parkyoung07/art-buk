import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.resolve("src/content/posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md") && f !== ".gitkeep");

const postDetails = [];

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  const content = parsed.content;

  const images = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^!\[(.*?)\]\((.*?)\)/);
    if (m) {
      let caption = "";
      if (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (next.startsWith("*▲") || next.startsWith("▲")) {
          caption = next;
        }
      }
      images.push({
        alt: m[1],
        url: m[2],
        caption
      });
    }
  }

  if (images.length > 0) {
    postDetails.push({
      file,
      title: data.title,
      thumbnail: data.thumbnail,
      imageCount: images.length,
      images
    });
  }
});

fs.writeFileSync(
  path.resolve("scripts/all_post_images_detail.json"),
  JSON.stringify(postDetails, null, 2),
  "utf8"
);

console.log(`📊 이미지가 있는 포스트: 총 ${postDetails.length}편`);
let totalImgs = 0;
postDetails.forEach(p => totalImgs += p.imageCount);
console.log(`🖼️ 총 이미지 개수: ${totalImgs}개`);
