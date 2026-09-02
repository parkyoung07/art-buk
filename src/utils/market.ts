import { TRADITIONAL_MARKETS, TraditionalMarket } from "@/data/markets";

export interface MarketStatus {
  isToday: boolean;
  isUpcoming: boolean;
  daysUntilNext: number;
  nextMarketDateStr: string;
  badgeText: string;
  badgeType: "today" | "tomorrow" | "upcoming" | "permanent" | "dawn";
}

/**
 * 특정 날짜(기본: KST 오늘) 기준 시장의 장날 상태를 계산합니다.
 */
export function getMarketStatus(market: TraditionalMarket, targetDate?: Date): MarketStatus {
  const now = targetDate || new Date();
  
  // 한국 시간(KST) 기준 날짜 계산
  const kstOffset = 9 * 60; // 9 hours
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + kstOffset * 60000);
  
  const currentDay = kst.getDate();
  const currentMonth = kst.getMonth() + 1;

  if (market.marketType === "상설시장") {
    return {
      isToday: true,
      isUpcoming: false,
      daysUntilNext: 0,
      nextMarketDateStr: "매일 상설 운영",
      badgeText: "🏪 상시 운영",
      badgeType: "permanent"
    };
  }

  if (market.marketType === "새벽시장") {
    return {
      isToday: true,
      isUpcoming: false,
      daysUntilNext: 0,
      nextMarketDateStr: "매일 새벽 운영",
      badgeText: "🌅 새벽 장터",
      badgeType: "dawn"
    };
  }

  // 5일장 계산 (예: [3, 8] -> 3, 8, 13, 18, 23, 28)
  const isMatchDay = (dayNum: number, schedule: number[]) => {
    return schedule.some(s => {
      if (s === 10) {
        return dayNum % 10 === 0;
      }
      return dayNum % 10 === s;
    });
  };

  const isToday = isMatchDay(currentDay, market.scheduleDays);

  if (isToday) {
    return {
      isToday: true,
      isUpcoming: false,
      daysUntilNext: 0,
      nextMarketDateStr: "오늘 장날!",
      badgeText: "🔥 오늘 장 서는 날!",
      badgeType: "today"
    };
  }

  // 다음 장날까지 남은 일수 계산 (최대 10일 탐색)
  let daysUntilNext = 1;
  let nextDateStr = "";

  for (let i = 1; i <= 10; i++) {
    const futureDate = new Date(kst);
    futureDate.setDate(currentDay + i);
    const futureDay = futureDate.getDate();

    if (isMatchDay(futureDay, market.scheduleDays)) {
      daysUntilNext = i;
      nextDateStr = `${futureDate.getMonth() + 1}월 ${futureDay}일`;
      break;
    }
  }

  if (daysUntilNext === 1) {
    return {
      isToday: false,
      isUpcoming: true,
      daysUntilNext: 1,
      nextMarketDateStr: nextDateStr,
      badgeText: `📅 내일 장날 (${nextDateStr})`,
      badgeType: "tomorrow"
    };
  }

  return {
    isToday: false,
    isUpcoming: true,
    daysUntilNext,
    nextMarketDateStr: nextDateStr,
    badgeText: `📅 다음 장날: ${nextDateStr} (D-${daysUntilNext})`,
    badgeType: "upcoming"
  };
}

export function getMarketForExhibition(region: string, subRegion?: string): TraditionalMarket | undefined {
  if (subRegion) {
    const cleanSub = subRegion.replace(/시|군|구/g, "").trim();
    // 1. 정확한 행정구역명 우선 일치 (예: 동구 vs 동래구 구분)
    const exact = TRADITIONAL_MARKETS.find(
      m => m.region === region && m.subRegion.replace(/시|군|구/g, "").trim() === cleanSub
    );
    if (exact) return exact;

    // 2. 부분 일치 검색
    const matched = TRADITIONAL_MARKETS.find(
      m => m.region === region && m.subRegion.includes(cleanSub)
    );
    if (matched) return matched;
  }

  return TRADITIONAL_MARKETS.find(m => m.region === region);
}

/**
 * 오늘 장이 서는 5일장 및 대표 시장 목록을 가져옵니다.
 */
export function getTodayActiveMarkets(regionFilter?: string): Array<{ market: TraditionalMarket; status: MarketStatus }> {
  return TRADITIONAL_MARKETS
    .filter(m => !regionFilter || regionFilter === "전체" || m.region === regionFilter)
    .map(market => ({
      market,
      status: getMarketStatus(market)
    }))
    .sort((a, b) => {
      // 오늘 5일장 우선 -> 내일 5일장 -> 상설시장 순 정렬
      const getPriority = (item: { market: TraditionalMarket; status: MarketStatus }) => {
        if (item.status.badgeType === "today") return 1;
        if (item.status.badgeType === "tomorrow") return 2;
        if (item.status.badgeType === "permanent") return 3;
        return 4;
      };
      return getPriority(a) - getPriority(b);
    });
}
