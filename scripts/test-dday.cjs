const fs = require('fs');

function getKoreanToday() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const korDate = new Date(utc + koreaTimeDiff);
  korDate.setHours(0, 0, 0, 0);
  return korDate;
}

function parseDateString(dateStr) {
  if (!dateStr) return {};
  const matches = dateStr.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);
  if (!matches || matches.length === 0) return {};

  const parseSingle = (s) => {
    const clean = s.replace(/\./g, '-');
    const [y, m, d] = clean.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  if (matches.length === 1) {
    return { end: parseSingle(matches[0]) };
  }

  return {
    start: parseSingle(matches[0]),
    end: parseSingle(matches[1]),
  };
}

function calculateDDay(endDateStr, startDateStr) {
  const today = getKoreanToday();
  let start;
  let end;

  if (startDateStr) {
    start = parseDateString(startDateStr).start || parseDateString(startDateStr).end;
  }
  if (endDateStr) {
    const parsed = parseDateString(endDateStr);
    if (!start && parsed.start) start = parsed.start;
    end = parsed.end || parsed.start;
  }

  if (!end) {
    return {
      badgeText: '상설/진행중',
      badgeType: 'active',
      diffDays: 999,
      isOpenToday: true,
      statusLabel: '진행 중',
    };
  }

  // 1. 개막 전 (미래 개막)
  if (start && start.getTime() > today.getTime()) {
    const startDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (startDiff === 1) {
      return {
        badgeText: '내일 개막 (D-1)',
        badgeType: 'upcoming',
        diffDays: 1,
        isOpenToday: false,
        statusLabel: '내일 개막',
      };
    }
    return {
      badgeText: `D-${startDiff} 개막 예정`,
      badgeType: 'upcoming',
      diffDays: startDiff,
      isOpenToday: false,
      statusLabel: `D-${startDiff}`,
    };
  }

  // 2. 개막 당일 (오늘 개막)
  if (start && start.getTime() === today.getTime()) {
    return {
      badgeText: '오늘 개막',
      badgeType: 'urgent',
      diffDays: 0,
      isOpenToday: true,
      statusLabel: '오늘 개막',
    };
  }

  // 3. 개막 다음날 (어제 개막)
  if (start) {
    const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceStart === 1) {
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        return {
          badgeText: '어제 개막',
          badgeType: 'active',
          diffDays,
          isOpenToday: true,
          statusLabel: '어제 개막',
        };
      }
    }
  }

  // 4. 마감일 기준 계산
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      badgeText: '종료',
      badgeType: 'ended',
      diffDays,
      isOpenToday: false,
      statusLabel: '종료',
    };
  }
  if (diffDays === 0) {
    return {
      badgeText: '오늘 마감 D-Day',
      badgeType: 'urgent',
      diffDays: 0,
      isOpenToday: true,
      statusLabel: '오늘 마감',
    };
  }
  if (diffDays === 1) {
    return {
      badgeText: '내일 마감 (D-1)',
      badgeType: 'urgent',
      diffDays: 1,
      isOpenToday: true,
      statusLabel: '마감 D-1',
    };
  }
  if (diffDays <= 7) {
    return {
      badgeText: `마감 D-${diffDays}`,
      badgeType: 'urgent',
      diffDays,
      isOpenToday: true,
      statusLabel: `마감 D-${diffDays}`,
    };
  }
  if (diffDays <= 30) {
    return {
      badgeText: `마감 D-${diffDays}`,
      badgeType: 'soon',
      diffDays,
      isOpenToday: true,
      statusLabel: `마감 D-${diffDays}`,
    };
  }

  return {
    badgeText: '진행중',
    badgeType: 'active',
    diffDays,
    isOpenToday: true,
    statusLabel: '진행 중',
  };
}

const exhibitions = JSON.parse(fs.readFileSync('./public/data/art-sample.json', 'utf8'));

console.log('Current Korean Today:', getKoreanToday().toISOString());
exhibitions.forEach(e => {
  const res = calculateDDay(e.endDate || e.period, e.startDate);
  console.log(`[${e.title}] (${e.period}) -> badge: ${res.badgeText}, type: ${res.badgeType}, isOpenToday: ${res.isOpenToday}`);
});
