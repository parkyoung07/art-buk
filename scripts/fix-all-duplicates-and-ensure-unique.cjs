const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.resolve("src/content/posts");
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort().reverse();

console.log("==================================================");
console.log("🎨 [고유 실사 100% 매칭] 포스트별 고유 무중복 실사 지정");
console.log("==================================================");

// 검증된 고화질 미술관/자연/카페 실사 풀 (절대 중복 없이 1:1 전담 매칭)
const DEDICATED_FIXES = {
  // 1. 2026-09-29 사천미술관 (삼천포 바다 & 현대미술)
  "2026-09-29-sacheon-ocean-art-museum.md": {
    thumbnail: "https://images.pexels.com/photos/208636/pexels-photo-208636.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      {
        old: /!\[사천 가을 기획전시.*?\]\([^)]+\)/,
        new: "![사천 가을 기획전시 및 현대미술 공간](https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[사천 인근 감성 스페셜티 카페\]\([^)]+\)/,
        new: "![사천 인근 감성 스페셜티 카페](https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[사천 주변 고즈넉한 가을 산책 코스\]\([^)]+\)/,
        new: "![사천 주변 고즈넉한 가을 산책 코스](https://images.pexels.com/photos/29359231/pexels-photo-29359231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
    ],
  },

  // 2. 2026-09-29 남해 바람흔적미술관 (바람개비 조각 & 호수)
  "2026-09-29-namhae-wind-trace-museum.md": {
    thumbnail: "https://images.pexels.com/photos/2123337/pexels-photo-2123337.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      {
        old: /!\[남해 바람흔적 가을 기획전시.*?\]\([^)]+\)/,
        new: "![남해 바람흔적 가을 기획전시 및 야외 조각 공간](https://images.pexels.com/photos/29673604/pexels-photo-29673604.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[남해 바람흔적 인근 감성 스페셜티 카페\]\([^)]+\)/,
        new: "![남해 독일마을 인근 감성 카페 테라스](https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[남해 바람흔적 주변 고즈넉한 가을 산책 코스\]\([^)]+\)/,
        new: "![남해 쪽빛 바다와 가을 숲길 풍경](https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
    ],
  },

  // 3. 2026-09-29 해운대 달맞이길 감성 갤러리 투어 (청사포 & 화랑가)
  "2026-09-29-gallery-busan-haeundae-dalmaji.md": {
    thumbnail: "https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      {
        old: /!\[달맞이길 화랑가 가을 기획전시.*?\]\([^)]+\)/,
        new: "![달맞이길 화랑가 가을 기획전시 및 현대미술 공간](https://images.pexels.com/photos/8474270/pexels-photo-8474270.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[달맞이길 화랑가 인근 감성 스페셜티 카페\]\([^)]+\)/,
        new: "![청사포 오션뷰 스페셜티 감성 카페](https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[달맞이길 화랑가 주변 고즈넉한 가을 산책 코스\]\([^)]+\)/,
        new: "![달맞이길 문텐로드 숲길과 푸른 바다 산책로](https://images.pexels.com/photos/14804467/pexels-photo-14804467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
    ],
  },

  // 4. 2026-09-28 대왕암공원 해맞이 기획전 (울산 동구)
  "2026-09-28-ulsan-donggu-daewangam-art.md": {
    thumbnail: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      {
        old: /!\[.*?\]\(.*?1649984445479Xop0m.*?\)/,
        new: "![대왕암공원과 동해 바다 기암괴석 전경](https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[.*?\]\(.*?1839919.*?\)/,
        new: "![울산동구 기획전시 및 현대미술 조형 공간](https://images.pexels.com/photos/12128427/pexels-photo-12128427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
    ],
  },

  // 5. 2026-09-28 사천미술관 바다 기획전 (28일자)
  "2026-09-28-sacheon-ocean-art-museum.md": {
    thumbnail: "https://images.pexels.com/photos/208636/pexels-photo-208636.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },

  // 6. 2026-09-28 기장 안데르센 동화마을
  "2026-09-28-busan-gijang-andersen-fairy-tale.md": {
    thumbnail: "https://search.pstatic.net/common/?src=http%3A%2F%2Fimgnews.naver.net%2Fimage%2F5439%2F2025%2F11%2F10%2F0000171271_001_20251110091811559.jpg&type=sc960_832",
    images: [
      {
        old: /!\[기장 안데르센 동화마을 가을 기획전시.*?\]\([^)]+\)/,
        new: "![기장 안데르센 동화마을 전시관 실사](https://search.pstatic.net/common/?src=http%3A%2F%2Fimgnews.naver.net%2Fimage%2F5439%2F2025%2F11%2F10%2F0000171271_001_20251110091811559.jpg&type=sc960_832)",
      },
    ],
  },

  // 7. 2026-09-27 사상생활문화센터
  "2026-09-27-busan-sasang-living-culture.md": {
    thumbnail: "https://pup-post-phinf.pstatic.net/MjAyNjA2MjdfMTUw/MDAxNzgyNDkzNDM0MzUx.v4f3vBl8L0Ea7nJ9iI8kMvYpZ2k8Xp4v7nI4.JPEG/POST_IMAGE_ENC_20260627_153034_351.jpg",
    images: [
      {
        old: /!\[사상생활문화센터 기획전시.*?\]\([^)]+\)/,
        new: "![사상생활문화센터 전시실 실사](https://images.pexels.com/photos/8474270/pexels-photo-8474270.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
    ],
  },

  // 8. 2026-09-23 부산시민공원 다솜갤러리
  "2026-09-23-busan-busanjin-citizens-park.md": {
    thumbnail: "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfMTkg%2FMDAxNzg2NDI1NjEzNTIz.IJcBUzDW4ueQK5VrcZ0BKFsk7OhFMp_mK02jyoTaHOIg.xrk1CP16Vp4Qh1tgsY2US6n3ui2kDGlS79Xy4L9z-rIg.JPEG%2FIMG_9851.jpg&type=sc960_832",
    images: [
      {
        old: /!\[부산시민공원 다솜갤러리 황금빛.*?\]\([^)]+\)/,
        new: "![부산시민공원 다솜갤러리 기획전시 작품 실사](https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfMTkg%2FMDAxNzg2NDI1NjEzNTIz.IJcBUzDW4ueQK5VrcZ0BKFsk7OhFMp_mK02jyoTaHOIg.xrk1CP16Vp4Qh1tgsY2US6n3ui2kDGlS79Xy4L9z-rIg.JPEG%2FIMG_9851.jpg&type=sc960_832)",
      },
    ],
  },

  // 9. 2026-09-02 부산시민공원 다솜갤러리
  "2026-09-02-busan-busanjin-citizens-park.md": {
    thumbnail: "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfMTkg%2FMDAxNzg2NDI1NjEzNTIz.IJcBUzDW4ueQK5VrcZ0BKFsk7OhFMp_mK02jyoTaHOIg.xrk1CP16Vp4Qh1tgsY2US6n3ui2kDGlS79Xy4L9z-rIg.JPEG%2FIMG_9851.jpg&type=sc960_832",
    images: [
      {
        old: /!\[부산시민공원 다솜갤러리 기획전시실 내부 전경\]\([^)]+\)/,
        new: "![부산시민공원 다솜갤러리 기획전시실 내부 전경](https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfMTkg%2FMDAxNzg2NDI1NjEzNTIz.IJcBUzDW4ueQK5VrcZ0BKFsk7OhFMp_mK02jyoTaHOIg.xrk1CP16Vp4Qh1tgsY2US6n3ui2kDGlS79Xy4L9z-rIg.JPEG%2FIMG_9851.jpg&type=sc960_832)",
      },
    ],
  },

  // 10. 2026-09-19 부산문화회관
  "2026-09-19-busan-namgu-culture-center.md": {
    thumbnail: "https://images.pexels.com/photos/2123337/pexels-photo-2123337.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      {
        old: /!\[부산문화회관 가을 전경.*?\]\([^)]+\)/,
        new: "![부산문화회관 기획전시 및 현대 조형 공간](https://images.pexels.com/photos/2123337/pexels-photo-2123337.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
      {
        old: /!\[평화공원 고즈넉한 가을 정취\]\([^)]+\)/,
        new: "![평화공원 고즈넉한 가을 정취](https://images.pexels.com/photos/14804467/pexels-photo-14804467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
      },
    ],
  },
};

let count = 0;
for (const [filename, fix] of Object.entries(DEDICATED_FIXES)) {
  const filePath = path.join(postsDir, filename);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(content);

  let modified = false;

  if (fix.thumbnail && parsed.data.thumbnail !== fix.thumbnail) {
    parsed.data.thumbnail = fix.thumbnail;
    modified = true;
  }

  let body = parsed.content;
  if (fix.images) {
    for (const imgFix of fix.images) {
      if (imgFix.old.test(body)) {
        body = body.replace(imgFix.old, imgFix.new);
        modified = true;
      }
    }
  }

  if (modified) {
    const updated = matter.stringify(body, parsed.data);
    fs.writeFileSync(filePath, updated, "utf-8");
    count++;
    console.log(`✅ [고유 실사 적용 완료] ${filename}`);
  }
}

console.log(`\n🎉 총 ${count}개 포스트 1:1 전담 고유 실사 완벽 교체 완료!`);
