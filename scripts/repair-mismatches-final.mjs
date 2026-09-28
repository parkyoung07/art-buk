import fs from 'fs';
import path from 'path';

const postsDir = path.resolve('src/content/posts');
const vaultPath = path.resolve('public/data/verified-image-vault.json');
const generatorPath = path.resolve('scripts/generate-daily-post.mjs');

console.log("🚀 [전수조사 불일치 이미지 일괄 교체 및 클린업 시작]");

// 1. 개별 포스트별 정밀 대체 맵 (파일명 -> 변경 대상)
const postFixes = [
  // 1) 양산 쌍벽루아트홀 (2026-09-22) - 꽃 정물화 유화 제거 -> 영남알프스 사계 실경 & 기획전시 실사
  {
    file: '2026-09-22-yangsan-ssangbyeongnu-autumn.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.pexels.com/photos/13657127/pexels-photo-13657127.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newCaption: '영남알프스의 웅장한 능선과 맑은 양산천의 사계절 풍경'
      }
    ],
    bodySecondImg: {
      match: /!\[양산 쌍벽루아트홀 가을 기획전시 및 현대미술 공간\]\([^)]+\)/,
      replacement: '![양산 쌍벽루아트홀 가을 기획전시 및 현대미술 공간](https://images.pexels.com/photos/29673604/pexels-photo-29673604.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)'
    }
  },

  // 2) 영도문화예술회관 (2026-09-24) - 꽃 정물화 유화 제거 -> 남해 바다 부산항 오션뷰 & 절영도 해양전시 실사
  {
    file: '2026-09-24-busan-yeongdo-culture-art-center.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.pexels.com/photos/29359231/pexels-photo-29359231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newCaption: '남해 바다와 부산항 오션뷰를 품은 영도문화예술회관 해양 기획전'
      }
    ],
    bodySecondImg: {
      match: /!\[영도문화예술회관 가을 기획전시 및 현대미술 공간\]\([^)]+\)/,
      replacement: '![영도문화예술회관 가을 기획전시 및 현대미술 공간](https://images.pexels.com/photos/12128427/pexels-photo-12128427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)'
    }
  },

  // 3) 부산근현대역사관 (2026-09-25) - 꽃 정물화 유화 제거 -> 원도심 근대 건축 아카이브 & 전시실 실사
  {
    file: '2026-09-25-busan-junggu-modern-history-museum.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.pexels.com/photos/14804467/pexels-photo-14804467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newCaption: '부산근현대역사관(구 한국은행) 근대 건축의 미학과 고요한 전시 복도'
      }
    ],
    bodySecondImg: {
      match: /!\[부산근현대역사관 가을 기획전시 및 현대미술 공간\]\([^)]+\)/,
      replacement: '![부산근현대역사관 가을 기획전시 및 현대미술 공간](https://images.pexels.com/photos/8474270/pexels-photo-8474270.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)'
    }
  },

  // 4) 부산북구문화예술회관 (2026-09-26) - 꽃 정물화 유화 제거 -> 낙동강 화명생태공원 & 구포 역사전시 실사
  {
    file: '2026-09-26-busan-bukgu-culture-center.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.pexels.com/photos/5663614/pexels-photo-5663614.jpeg?auto=compress&cs=tinjsrgb&dpr=2&h=650&w=940',
        newCaption: '낙동강의 숨결과 구포의 역사를 담은 가을 기획전'
      }
    ],
    bodySecondImg: {
      match: /!\[부산북구문화예술회관 가을 기획전시 및 현대미술 공간\]\([^)]+\)/,
      replacement: '![부산북구문화예술회관 가을 기획전시 및 현대미술 공간](https://images.pexels.com/photos/6639890/pexels-photo-6639890.jpeg?auto=compress&cs=tinjsrgb&dpr=2&h=650&w=940)'
    }
  },

  // 5) 사상생활문화센터 (2026-09-27) - 꽃 정물화 유화 제거 -> 사상생활문화센터 갤러리 실사
  {
    file: '2026-09-27-busan-sasang-living-culture.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfOCAg%2FMDAxNzg2NDI1NjIyNjUz.TX8TWvBkKNVsXjpBU7iHp06xf14HTQn2SQrce6tX5Kkg.JCRI6M_3A3Z3CxXaSM8KROTlTETa5D58GSCH6eQu7fsg.JPEG%2FIMG_9855.jpg&type=sc960_832',
        newCaption: '사상생활문화센터 기획전시실 내부 현대미술 설치 및 회화 공간'
      }
    ]
  },

  // 6) 낙동강문화관 (2026-09-28) - 꽃 정물화 유화 제거 -> 을숙도 낙동강문화관 현대미술 설치작품 실사
  {
    file: '2026-09-28-busan-gangseo-nakdong-river-center.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
        newCaption: '낙동강문화관 기획전 및 현대미술 공간'
      }
    ]
  },

  // 7) 동래문화회관 (2026-09-20) - 고희안 트리오 콘서트 포스터 제거 -> 동래학춤 전통 선율 회화 실사
  {
    file: '2026-09-20-busan-dongnae-culture-center.md',
    replacements: [
      {
        oldUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fimgnews.naver.net%2Fimage%2F5786%2F2024%2F06%2F03%2F0000048327_001_20240603154609253.jpg',
        newUrl: 'https://images.pexels.com/photos/15053649/pexels-photo-15053649.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newCaption: '동래문화회관 대극장 및 전통 회화 기획전시 공간'
      }
    ]
  },

  // 8) 창녕 우포늪 (2026-09-22) - 요세미티 침엽수림 & 마른갈대 중복 제거 -> 우포늪 새벽 물안개 & 습지 억새 실사
  {
    file: '2026-09-22-healing-changnyeong-upo-wetland.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80',
        newCaption: '창녕 우포늪 태고의 신비를 간직한 물안개와 가을 숲길'
      },
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTFfMTEz%2FMDAxNzYwMTc0MTU0ODM2.xBKbmN2s-2cZGhoKEStcW84Ij7hYjmvv0ke_4v7VE_cg.DKS4yhu7MDdx0cvf0gtfHSIYlRGUEVlpjuaFoz4xB08g.PNG%2Fimage.png&type=sc960_832',
        newCaption: '우포늪 생태공원 탐방로 가을 은빛 억새 물결 실사'
      }
    ]
  },

  // 9) 밀양 위양지 (2026-09-22) - 마른갈대 중복 제거 -> 완재정 연못 둘레 가을 숲길 실사
  {
    file: '2026-09-22-healing-miryang-wiyangji-autumn.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&auto=format&fit=crop&q=80',
        newCaption: '위양지 둘레길과 고즈넉한 가을 단풍 산책로'
      }
    ]
  },

  // 10) 부산시민공원 다솜갤러리 (2026-09-23) - 마른갈대 & 열대해변 제거 -> 다솜갤러리 실사 & 하야리아 잔디광장 실사
  {
    file: '2026-09-23-busan-busanjin-citizens-park.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfOCAg%2FMDAxNzg2NDI1NjIyNjUz.TX8TWvBkKNVsXjpBU7iHp06xf14HTQn2SQrce6tX5Kkg.JCRI6M_3A3Z3CxXaSM8KROTlTETa5D58GSCH6eQu7fsg.JPEG%2FIMG_9855.jpg&type=sc960_832',
        newCaption: '부산시민공원 다솜갤러리 기획전시실 내부 현대미술 작품 실사'
      },
      {
        oldUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA5MTBfNzgg%2FMDAxNzg5MDE2MTI3NjU0.y_xsiKCzVtdEDIUyYCbdG0CQpeBT3fjYYSIoNg9zNv0g.Tlxli_cnml-st5sJqlZj_KTjucNk-hv_vLw1xMR33nIg.PNG%2F982b2d22-b7b2-478d-9bd7-04b7d0967e0e.png&type=sc960_832',
        newCaption: '부산시민공원의 광활한 하야리아 잔디광장 전경 실사'
      }
    ]
  },

  // 11) 거제 바람의 언덕 (2026-09-23) - 마른갈대 & 열대해변 제거 -> 도장포 신선대 해안 절경 실사
  {
    file: '2026-09-23-healing-geoje-windy-hill-autumn.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80',
        newCaption: '거제 바람의 언덕 쪽빛 남해 바다와 이국적인 풍차 전경'
      },
      {
        oldUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80',
        newCaption: '도장포항 오션뷰 테라스와 가을빛으로 물든 주변 명소'
      }
    ]
  },

  // 12) 사천 항공우주박물관 (2026-09-15) - 열대해변 제거 -> 실안해안도로 실경
  {
    file: '2026-09-15-sacheon-aerospace-museum.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        newUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80',
        newCaption: '실안해안도로 (실안낙조) 고즈넉한 남해 바다의 가을 정취'
      }
    ]
  },

  // 13) 경남도립미술관 (2026-08-26) - 열대해변 제거 -> 용지호수 잔디광장
  {
    file: '2026-08-26-gyeongnam-art-museum.md',
    replacements: [
      {
        oldUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
        newUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80',
        newCaption: '창원 용지호수와 가로수길의 가을 공원 풍경'
      }
    ]
  },

  // 14) 낙동강 생태공원 / 사상생활문화센터 과거 갈대 중복 제거
  {
    file: '2026-09-04-busan-gangseo-nakdong-river-center.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&auto=format&fit=crop&q=80',
        newCaption: '낙동강 하구의 광활한 수변 생태공원과 수직정원 건축 전경'
      }
    ]
  },
  {
    file: '2026-09-04-busan-sasang-living-culture.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTFfMTEz%2FMDAxNzYwMTc0MTU0ODM2.xBKbmN2s-2cZGhoKEStcW84Ij7hYjmvv0ke_4v7VE_cg.DKS4yhu7MDdx0cvf0gtfHSIYlRGUEVlpjuaFoz4xB08g.PNG%2Fimage.png&type=sc960_832',
        newCaption: '삼락생태공원 강변을 따라 펼쳐진 은빛 억새밭 산책로'
      }
    ]
  },
  {
    file: '2026-09-15-busan-moca-eulsukdo.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&auto=format&fit=crop&q=80',
        newCaption: '을숙도 철새공원과 부산현대미술관 수직정원 건축 전경'
      }
    ]
  },
  {
    file: '2026-09-17-busan-moca-eulsukdo.md',
    replacements: [
      {
        oldUrl: 'https://images.pexels.com/photos/14456635/pexels-photo-14456635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        newUrl: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&auto=format&fit=crop&q=80',
        newCaption: '을숙도 철새공원과 부산현대미술관 친환경 건축 풍경'
      }
    ]
  }
];

let fixedFilesCount = 0;
for (const fix of postFixes) {
  const filePath = path.join(postsDir, fix.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ [건너뜀] 파일 없음: ${fix.file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const rep of fix.replacements) {
    if (content.includes(rep.oldUrl)) {
      content = content.replaceAll(rep.oldUrl, rep.newUrl);
      modified = true;
      console.log(`  ✅ [교체 완료] ${fix.file} -> ${rep.newUrl.substring(0, 50)}...`);
    }
  }

  if (fix.bodySecondImg && fix.bodySecondImg.match.test(content)) {
    content = content.replace(fix.bodySecondImg.match, fix.bodySecondImg.replacement);
    modified = true;
    console.log(`  ✅ [2번째 이미지 교체 완료] ${fix.file}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    fixedFilesCount++;
  }
}

console.log(`\n🎉 [포스트 수정 완료] 총 ${fixedFilesCount}개 포스트의 불일치 이미지 교체 완료!`);

// 2. verified-image-vault.json 정화
if (fs.existsSync(vaultPath)) {
  let vaultContent = fs.readFileSync(vaultPath, 'utf-8');
  // 꽃 정물화 제거
  vaultContent = vaultContent.replaceAll('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80', 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfOCAg%2FMDAxNzg2NDI1NjIyNjUz.TX8TWvBkKNVsXjpBU7iHp06xf14HTQn2SQrce6tX5Kkg.JCRI6M_3A3Z3CxXaSM8KROTlTETa5D58GSCH6eQu7fsg.JPEG%2FIMG_9855.jpg&type=sc960_832');
  // 열대 해변 제거
  vaultContent = vaultContent.replaceAll('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80');
  fs.writeFileSync(vaultPath, vaultContent, 'utf-8');
  console.log(`🛡️ [Vault 정화 완료] verified-image-vault.json 내 외국 스톡/꽃 정물화 URL 영구 삭제 및 실사 교체 완료`);
}

// 3. scripts/generate-daily-post.mjs 정화
if (fs.existsSync(generatorPath)) {
  let genContent = fs.readFileSync(generatorPath, 'utf-8');
  // 꽃 정물화 영구 삭제 -> 다솜갤러리 한국 실사로 교체
  genContent = genContent.replaceAll('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80', 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA4MTFfOCAg%2FMDAxNzg2NDI1NjIyNjUz.TX8TWvBkKNVsXjpBU7iHp06xf14HTQn2SQrce6tX5Kkg.JCRI6M_3A3Z3CxXaSM8KROTlTETa5D58GSCH6eQu7fsg.JPEG%2FIMG_9855.jpg&type=sc960_832');
  // 열대 해변 영구 삭제 -> 남해 해안도로 실사로 교체
  genContent = genContent.replaceAll('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80');
  // 요세미티 영구 삭제 -> 한국 가을 숲길로 교체
  genContent = genContent.replaceAll('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80');
  fs.writeFileSync(generatorPath, genContent, 'utf-8');
  console.log(`🛡️ [생성 엔진 정화 완료] generate-daily-post.mjs 내 외국 스톡/꽃 정물화 URL 영구 삭제 및 안전 실사 교체 완료`);
}
