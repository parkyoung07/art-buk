const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');

const replacements = [
  // 1. 2026-09-10-busan-cinema-center-media-art.md (Fix the 2015 poster in user screenshot!)
  {
    file: '2026-09-10-busan-cinema-center-media-art.md',
    find: 'http://imgnews.naver.net/image/421/2018/10/04/0003619403_001_20181004140318463.jpg',
    replace: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&auto=format&fit=crop&q=80',
    findCaption: '*▲ 전시 관람 후 여유를 만끽할 수 있는 감성 카페의 디저트 풍경*',
    replaceCaption: '*▲ 영화의전당 관람 후 센텀시티 감성 카페에서 즐기는 향긋한 커피와 디저트*'
  },
  // 2. 2026-09-16-geoje-haegeumgang-theme-museum.md (Fix YouTube avatar)
  {
    file: '2026-09-16-geoje-haegeumgang-theme-museum.md',
    find: 'https://yt3.googleusercontent.com/ytc/AIdro_mrATtCJzD6-1-lAX18Bif8uescntBdV1MPZvgoSNNP7w=s900-c-k-c0x00ffffff-no-rj',
    replace: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80'
  },
  // 3. 2026-09-15-tongyeong-jeon-hyeok-lim-museum.md (Fix Yes24 book cover)
  {
    file: '2026-09-15-tongyeong-jeon-hyeok-lim-museum.md',
    find: 'https://image.yes24.com/goods/128199974/XL',
    replace: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80'
  },
  // 4. 2026-09-13-ulsan-bukgu-soeburi-art.md (Fix 2023 poster)
  {
    file: '2026-09-13-ulsan-bukgu-soeburi-art.md',
    find: 'https://img.newsro.kr/wp-content/uploads/2023/03/%EC%A7%80%EA%B8%88-%EB%B6%81%EA%B5%AC%EB%A5%BC-%EA%B8%B0%EB%A1%9D%ED%95%98%EB%8B%A4-2023-%ED%8F%AC%EC%8A%A4%ED%84%B0.jpg',
    replace: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&auto=format&fit=crop&q=80'
  },
  // 5. 2026-09-11-uiryeong-righteous-army-museum.md (Fix municipal banner)
  {
    file: '2026-09-11-uiryeong-righteous-army-museum.md',
    find: 'https://www.uiryeong.go.kr/images/new/Culture/content/Museum_intro.jpg',
    replace: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200&auto=format&fit=crop&q=80'
  },
  // 6. 2026-09-13-busan-geumjeong-culture-center.md (Fix 2018 news)
  {
    file: '2026-09-13-busan-geumjeong-culture-center.md',
    find: 'http://imgnews.naver.net/image/421/2018/01/16/0003152956_001_20180116171451037.jpg',
    replace: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80'
  },
  // 7. 2026-09-14-busan-seogu-songdo-ocean-art.md (Fix 2013 old news)
  {
    file: '2026-09-14-busan-seogu-songdo-ocean-art.md',
    find: 'http://imgnews.naver.net/image/003/2013/09/12/NISI20130912_0008653946_web_59_20130912164416.jpg',
    replace: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop&q=80'
  },
  // 8. 2026-09-03-busan-seogu-songdo-ocean-art.md (Fix 2013 old news)
  {
    file: '2026-09-03-busan-seogu-songdo-ocean-art.md',
    find: 'http://imgnews.naver.net/image/003/2013/09/12/NISI20130912_0008653946_web_59_20130912164416.jpg',
    replace: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80'
  },
  // 9. 2026-09-12-busan-yeonje-culture-art.md (Fix 2018 news)
  {
    file: '2026-09-12-busan-yeonje-culture-art.md',
    find: 'http://imgnews.naver.net/image/5369/2018/05/29/0000058475_001_20180529170238973.jpg',
    replace: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&auto=format&fit=crop&q=80'
  },
  // 10. 2026-09-05-busan-yeonje-culture-art.md (Fix 2018 news)
  {
    file: '2026-09-05-busan-yeonje-culture-art.md',
    find: 'http://imgnews.naver.net/image/5369/2018/05/29/0000058475_001_20180529170238973.jpg',
    replace: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=1200&auto=format&fit=crop&q=80'
  },
  // 11. 2026-09-04-busan-yeonje-culture-art.md (Fix 2018 news)
  {
    file: '2026-09-04-busan-yeonje-culture-art.md',
    find: 'http://imgnews.naver.net/image/5369/2018/05/29/0000058475_001_20180529170238973.jpg',
    replace: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80'
  },
  // 12. 2026-09-11-ulsan-culture-art-center-autumn.md (Fix 2021 news)
  {
    file: '2026-09-11-ulsan-culture-art-center-autumn.md',
    find: 'http://imgnews.naver.net/image/5161/2021/02/24/0000242289_002_20210224204147250.jpg',
    replace: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80'
  }
];

let replacedCount = 0;

for (const r of replacements) {
  const filePath = path.join(postsDir, r.file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(r.find)) {
    content = content.replace(r.find, r.replace);
    if (r.findCaption && r.replaceCaption && content.includes(r.findCaption)) {
      content = content.replace(r.findCaption, r.replaceCaption);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ [${r.file}] Replaced: ${r.find.slice(0, 40)}... -> ${r.replace.slice(0, 40)}...`);
    replacedCount++;
  }
}

console.log(`\n🎉 Total replaced: ${replacedCount} images.`);
