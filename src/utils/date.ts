export function calculateDDay(endDateStr?: string, startDateStr?: string): {
  badgeText: string;
  badgeType: 'urgent' | 'soon' | 'active' | 'upcoming' | 'ended';
  diffDays: number;
} {
  if (!endDateStr) return { badgeText: '진행중', badgeType: 'active', diffDays: 999 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { badgeText: '전시 종료', badgeType: 'ended', diffDays };
  }
  if (diffDays === 0) {
    return { badgeText: '🚨 오늘 마감 D-Day', badgeType: 'urgent', diffDays: 0 };
  }
  if (diffDays <= 7) {
    return { badgeText: `⏳ 마감 D-${diffDays}`, badgeType: 'urgent', diffDays };
  }
  if (diffDays <= 30) {
    return { badgeText: `⏳ 마감 D-${diffDays}`, badgeType: 'soon', diffDays };
  }

  if (startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const startDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (startDiff > 0) {
      return { badgeText: `✨ D-${startDiff} 개막 예정`, badgeType: 'upcoming', diffDays: startDiff };
    }
  }

  return { badgeText: '진행중', badgeType: 'active', diffDays };
}
