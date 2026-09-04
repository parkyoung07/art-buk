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
} {
  const today = getKoreanToday();

  // period 문자열 ("2026.09.03 ~ 2026.09.07")에서 자동 추출 지원
  let start: Date | undefined;
  let end: Date | undefined;

  if (startDateStr) {
    start = parseDateString(startDateStr).end || parseDateString(startDateStr).start;
  }
  if (endDateStr) {
    const parsed = parseDateString(endDateStr);
    if (!start && parsed.start) start = parsed.start;
    end = parsed.end || parsed.start;
  }

  if (!end) {
    return { badgeText: '상설/진행중', badgeType: 'active', diffDays: 999, isOpenToday: true };
  }

  // 개막 전인지 체크
  if (start && start.getTime() > today.getTime()) {
    const startDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      badgeText: `✨ D-${startDiff} 개막 예정`,
      badgeType: 'upcoming',
      diffDays: startDiff,
      isOpenToday: false,
    };
  }

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { badgeText: '전시 종료', badgeType: 'ended', diffDays, isOpenToday: false };
  }
  if (diffDays === 0) {
    return { badgeText: '🚨 오늘 마감 D-Day', badgeType: 'urgent', diffDays: 0, isOpenToday: true };
  }
  if (diffDays <= 7) {
    return { badgeText: `⏳ 마감 D-${diffDays}`, badgeType: 'urgent', diffDays, isOpenToday: true };
  }
  if (diffDays <= 30) {
    return { badgeText: `⏳ 마감 D-${diffDays}`, badgeType: 'soon', diffDays, isOpenToday: true };
  }

  return { badgeText: '진행중', badgeType: 'active', diffDays, isOpenToday: true };
}

