import { LIBRARIES_DATA, LibraryItem } from "@/data/libraries";

/**
 * 전시장 지역(region, subRegion)에 맞는 가장 가까운 대표/쌈지 도서관을 찾습니다.
 */
export function getLibraryForExhibition(region: string, subRegion?: string): LibraryItem | undefined {
  if (subRegion) {
    const cleanSub = subRegion.replace(/시|군|구/g, "");
    const matched = LIBRARIES_DATA.find(
      lib => lib.region === region && lib.subRegion.includes(cleanSub)
    );
    if (matched) return matched;
  }

  return LIBRARIES_DATA.find(lib => lib.region === region);
}

/**
 * 필터 조건에 따른 도서관 목록을 가져옵니다.
 */
export function getFilteredLibraries(filterType?: string, regionFilter?: string): LibraryItem[] {
  return LIBRARIES_DATA.filter(item => {
    if (regionFilter && regionFilter !== "전체" && item.region !== regionFilter) {
      return false;
    }
    if (!filterType || filterType === "전체") {
      return true;
    }
    if (filterType === "가족특화") {
      return item.type === "어린이·가족특화" || item.features.some(f => f.includes("어린이") || f.includes("키즈") || f.includes("그림책"));
    }
    if (filterType === "작은도서관") {
      return item.type === "쌈지·숲속 작은도서관";
    }
    if (filterType === "복합문화") {
      return item.type === "복합문화도서관" || item.type === "시·도립 대표도서관";
    }
    return item.type === filterType;
  });
}
