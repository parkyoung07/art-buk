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

async function searchNaverImage(query) {
  const url = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encodeURIComponent(query)}&display=5&sort=sim&filter=large`;
  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": id,
      "X-NCP-APIGW-API-KEY": secret
    }
  });
  if (!res.ok) {
    console.log("Error:", res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log(`\n=== Query: ${query} ===`);
  (data.items || []).forEach((item, idx) => {
    console.log(`${idx + 1}. Title: ${item.title.replace(/<[^>]*>?/gm, "")}`);
    console.log(`   Link: ${item.link}`);
    console.log(`   Thumb: ${item.thumbnail}`);
  });
}

async function run() {
  await searchNaverImage("금정문화회관");
  await searchNaverImage("수묵화 한국화 전시");
  await searchNaverImage("회동수원지 땅뫼산 황토숲길");
  await searchNaverImage("창녕 우포늪 가을");
}

run();
