const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
  const env = {};
  envFile.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      let key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const id = env.NAVER_CLIENT_ID;
const secret = env.NAVER_CLIENT_SECRET;

const usedUrls = new Set();

async function searchNaverImage(query) {
  try {
    const url = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encodeURIComponent(query)}&display=5&sort=sim&filter=large`;
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": id,
        "X-NCP-APIGW-API-KEY": secret
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.items || []) {
      const link = item.link || item.thumbnail;
      if (link && !usedUrls.has(link)) {
        usedUrls.add(link);
        return link;
      }
    }
    return data.items?.[0]?.link || null;
  } catch (err) {
    console.error(`Search error for ${query}:`, err.message);
    return null;
  }
}

async function run() {
  const postsDir = path.join(__dirname, "../src/content/posts");
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

  console.log(`Auditing and fixing ${files.length} posts...`);

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;

    // Extract title, region, tags
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const regionMatch = content.match(/region:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "";
    const region = regionMatch ? regionMatch[1] : "";

    // Extract venue/topic keywords
    const cleanTitle = title
      .replace(/기획전.*|특별전.*|초대전.*|전시.*|등재 기념전.*/g, "")
      .replace(/\[|\]|:|·/g, " ")
      .trim();

    // 1. If contains repeated dessert image 28167315
    if (content.includes("28167315")) {
      console.log(`\n🔍 Fixing repeated dessert image in: ${file} (${cleanTitle})`);
      const cafeQuery = `${region} ${cleanTitle} 카페 디저트 맛집`;
      const newCafeImg = await searchNaverImage(cafeQuery) || await searchNaverImage(`${region} 카페 디저트`);
      if (newCafeImg) {
        content = content.replace(/https:\/\/images\.pexels\.com\/photos\/28167315\/[^\s\)]+/g, newCafeImg);
        changed = true;
        console.log(`  -> Replaced 28167315 with authentic cafe photo: ${newCafeImg.slice(0, 60)}...`);
      }
      await new Promise(r => setTimeout(r, 200));
    }

    // 2. Specific fix for Songdo posts
    if (file.includes("songdo")) {
      console.log(`\n🌊 Fixing Songdo post images in: ${file}`);
      // Replace foreign Mediterranean cityscapes or wrong coast photos
      const songdoSculpture = "http://imgnews.naver.net/image/003/2013/09/12/NISI20130912_0008653946_web_59_20130912164416.jpg";
      const songdoCableCar = "http://imgnews.naver.net/image/5614/2025/12/02/0000033640_001_20251202161214762.jpg";
      const songdoBridge = "http://imgnews.naver.net/image/079/2020/06/09/0003369739_002_20200609110603522.jpg";
      const songdoCafe = "https://pup-post-phinf.pstatic.net/MjAyNjA1MjVfMjI2/MDAxNzc5Njc0ODAyMTA0.IjaVX40NJVQ4EAot8rB8U9u-hamZDV_gZU1HpOq1yEgg.3rRCKiQT8NBe_Xj6mBrh4ckOmaKEy28MfzNnQnPyFKAg.JPEG/POST_IMAGE_ENCODING_20260525_110640_409.jpg";

      content = content.replace(/thumbnail:\s*"[^"]+"/g, `thumbnail: "${songdoCableCar}"`);
      content = content.replace(/https:\/\/images\.pexels\.com\/photos\/38440405\/[^\s\)]+/g, songdoCableCar);
      content = content.replace(/https:\/\/images\.pexels\.com\/photos\/23732420\/[^\s\)]+/g, songdoBridge);
      content = content.replace(/https:\/\/images\.pexels\.com\/photos\/6072868\/[^\s\)]+/g, songdoSculpture);
      content = content.replace(/https:\/\/images\.pexels\.com\/photos\/28167315\/[^\s\)]+/g, songdoCafe);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }

  console.log("\n✅ Finished auditing and fixing all posts!");
}

run();
