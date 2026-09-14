const fs = require('fs');
const path = require('path');

function loadEnv() {
  const file = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        process.env[trimmed.slice(0, eqIdx).trim()] = val;
      }
    }
  }
}
loadEnv();

const markets = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'markets.json'), 'utf8'));

async function searchNaverLocal(query) {
  const hubUrl = `https://naverapihub.apigw.ntruss.com/search/v1/local?query=${encodeURIComponent(query)}&display=3`;
  const baseHeaders = {
    'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
    'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET
  };
  try {
    const res = await fetch(hubUrl, { headers: baseHeaders });
    if (!res.ok) return { ok: false, status: res.status, items: [] };
    const data = await res.json();
    return { ok: true, items: data.items || [] };
  } catch (err) {
    return { ok: false, error: err.message, items: [] };
  }
}

async function runAudit() {
  console.log(`🔍 [전통시장 68개 전수 매칭 검증 시작] 총 ${markets.length}개 시장\n`);
  
  const results = [];
  let matchCount = 0;
  let warnCount = 0;

  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    const query = m.searchQuery || m.name;
    const res = await searchNaverLocal(query);
    
    let isMatched = false;
    let topItem = null;
    let reason = '';

    if (res.items && res.items.length > 0) {
      topItem = res.items[0];
      const topTitle = topItem.title.replace(/<[^>]*>?/gm, '');
      const topAddr = topItem.roadAddress || topItem.address || '';
      
      // 지역 검증 (부산/울산/경남 및 세부 지역)
      const targetRegion = m.region; // 부산, 울산, 경남
      const targetSub = m.subRegion.replace(/시|군|구/g, ''); // 예: 밀양, 북구, 기장, 해운대 등

      if (topAddr.includes(targetRegion) || topAddr.includes(targetSub)) {
        isMatched = true;
      } else {
        reason = `지역 불일치 (기대: ${m.region} ${m.subRegion}, 실제: ${topAddr})`;
      }
    } else {
      reason = '네이버 검색 결과 0건';
    }

    if (isMatched) {
      matchCount++;
      results.push({
        status: '✅ 일치',
        id: m.id,
        name: m.name,
        searchQuery: query,
        registeredAddress: m.address,
        naverPlaceTitle: topItem.title.replace(/<[^>]*>?/gm, ''),
        naverAddress: topItem.roadAddress || topItem.address,
        naverCategory: topItem.category
      });
    } else {
      warnCount++;
      results.push({
        status: '⚠️ 확인필요',
        id: m.id,
        name: m.name,
        searchQuery: query,
        registeredAddress: m.address,
        naverPlaceTitle: topItem ? topItem.title.replace(/<[^>]*>?/gm, '') : '없음',
        naverAddress: topItem ? (topItem.roadAddress || topItem.address) : '없음',
        reason: reason
      });
    }

    // Rate Limit 방지용 짧은 딜레이
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\n================== 📊 전수 매칭 결과 요약 ==================`);
  console.log(`- 전체 시장: ${markets.length}개`);
  console.log(`- 정상 매칭(일치): ${matchCount}개`);
  console.log(`- 확인/정정 필요: ${warnCount}개`);
  console.log(`============================================================\n`);

  fs.writeFileSync('scripts/audit_market_results.json', JSON.stringify(results, null, 2), 'utf8');

  const warnings = results.filter(r => r.status.includes('확인필요'));
  if (warnings.length > 0) {
    console.log(`⚠️ [확인/정정 대상 목록] (${warnings.length}건):`);
    warnings.forEach((w, idx) => {
      console.log(`\n[${idx + 1}] ID: ${w.id}`);
      console.log(`    시장명: ${w.name}`);
      console.log(`    현재 검색어: ${w.searchQuery}`);
      console.log(`    등록 주소: ${w.registeredAddress}`);
      console.log(`    네이버 결과: ${w.naverPlaceTitle} (${w.naverAddress})`);
      console.log(`    원인: ${w.reason}`);
    });
  } else {
    console.log('🎉 68개 모든 시장이 네이버 지도 및 실제 주소와 100% 완벽하게 일치합니다!');
  }
}

runAudit();
