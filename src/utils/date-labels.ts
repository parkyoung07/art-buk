const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstDateKey(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function addUtcDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatPostDateLabel(dateKey: string, now: Date = new Date()): string {
  const today = getKstDateKey(now);
  if (dateKey === today) return "오늘";
  if (dateKey === addUtcDays(today, -1)) return "어제";
  if (dateKey === addUtcDays(today, 1)) return "내일";
  return formatAbsoluteDateLabel(dateKey);
}

export function formatAbsoluteDateLabel(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  return `${Number(match[2])}월 ${Number(match[3])}일`;
}
