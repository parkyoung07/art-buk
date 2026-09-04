/**
 * 한국 시간(Asia/Seoul) 기준 현재 Date 객체 생성
 */
export function getKoreanToday(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const korDate = new Date(utc + koreaTimeDiff);
  korDate.setHours(0, 0, 0, 0);
  return korDate;
}

/**
 * 날짜 문자열 파싱 (YYYY.MM.DD 또는 YYYY-MM-DD 또는 "2026.09.03 ~ 2026.09.07")
 */
export function parseDateString(dateStr?: string): { start?: Date; end?: Date } {
  if (!dateStr) return {};
  
  const matches = dateStr.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);
  if (!matches || matches.length === 0) return {};

  const parseSingle = (s: string) => {
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

export function calculateDDay(endDateStr?: string, startDateStr?: string): {
  badgeText: string;
  badgeType: 'urgent' | 'soon' | 'active' | 'upcoming' | 'ended';
  diffDays: number;
  isOpenToday: boolean;
  statusLabel: string;
} {
  const today = getKoreanToday();

  // period 문자열 ("2026.09.03 ~ 2026.09.07")에서 자동 추출 지원
  let start: Date | undefined;
  let end: Date | undefined;

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
        badgeText: '⏳ 내일 개막 (D-1)',
        badgeType: 'upcoming',
        diffDays: 1,
        isOpenToday: false,
        statusLabel: '내일 개막',
      };
    }
    return {
      badgeText: `✨ D-${startDiff} 개막 예정`,
      badgeType: 'upcoming',
      diffDays: startDiff,
      isOpenToday: false,
      statusLabel: `D-${startDiff}`,
    };
  }

  // 2. 개막 당일 (오늘 개막)
  if (start && start.getTime() === today.getTime()) {
    return {
      badgeText: '🎉 오늘 개막',
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
          badgeText: '✨ 어제 개막',
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
      badgeText: '전시 종료',
      badgeType: 'ended',
      diffDays,
      isOpenToday: false,
      statusLabel: '종료',
    };
  }
  if (diffDays === 0) {
    return {
      badgeText: '🚨 오늘 마감 D-Day',
      badgeType: 'urgent',
      diffDays: 0,
      isOpenToday: true,
      statusLabel: '오늘 마감',
    };
  }
  if (diffDays === 1) {
    return {
      badgeText: '🚨 내일 마감 (D-1)',
      badgeType: 'urgent',
      diffDays: 1,
      isOpenToday: true,
      statusLabel: '마감 D-1',
    };
  }
  if (diffDays <= 7) {
    return {
      badgeText: `⏳ 마감 D-${diffDays}`,
      badgeType: 'urgent',
      diffDays,
      isOpenToday: true,
      statusLabel: `마감 D-${diffDays}`,
    };
  }
  if (diffDays <= 30) {
    return {
      badgeText: `⏳ 마감 D-${diffDays}`,
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

export const KOREAN_DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 이번 주말(토/일), 다음 주말(토/일) 계산
 */
export function getUpcomingWeekendDates(baseDate = getKoreanToday()): {
  thisSat: Date;
  thisSun: Date;
  nextSat: Date;
  nextSun: Date;
} {
  const day = baseDate.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  
  let thisSatOffset = 0;
  if (day === 6) {
    thisSatOffset = 0; // 토요일 당일
  } else if (day === 0) {
    thisSatOffset = -1; // 일요일이면 어제 토요일
  } else {
    thisSatOffset = 6 - day; // 월~금
  }

  const thisSat = new Date(baseDate);
  thisSat.setDate(baseDate.getDate() + thisSatOffset);
  thisSat.setHours(0, 0, 0, 0);

  const thisSun = new Date(thisSat);
  thisSun.setDate(thisSat.getDate() + 1);
  thisSun.setHours(0, 0, 0, 0);

  const nextSat = new Date(thisSat);
  nextSat.setDate(thisSat.getDate() + 7);
  nextSat.setHours(0, 0, 0, 0);

  const nextSun = new Date(thisSun);
  nextSun.setDate(thisSun.getDate() + 7);
  nextSun.setHours(0, 0, 0, 0);

  return { thisSat, thisSun, nextSat, nextSun };
}

/**
 * 한국식 날짜 포맷 (예: 9월 12일(토))
 */
export function formatDateKorean(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayName = KOREAN_DAY_NAMES[date.getDay()];
  return `${m}월 ${d}일(${dayName})`;
}

/**
 * 상세 한국식 날짜 포맷 (예: 2026년 9월 12일 토요일)
 */
export function formatDateFullKorean(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayName = KOREAN_DAY_NAMES[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${dayName}요일`;
}

/**
 * ISO 형식 날짜 (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

