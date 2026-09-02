"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";
import EditorPickSection from "@/components/EditorPickSection";
import ArtRoadmapSection from "@/components/ArtRoadmapSection";
import MarketSection from "@/components/MarketSection";
import LibrarySection from "@/components/LibrarySection";
import { calculateDDay } from "@/utils/date";
import rawData from "../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

const exhibitionsData: Exhibition[] = rawData as Exhibition[];

const THEME_OPTIONS = [
  "전체 테마",
  "📸 인생샷/포토존",
  "🌿 자연/힐링",
  "🏛️ 역사/세계유산",
  "👶 가족/체험",
  "🎬 미디어/현대미술"
] as const;

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("전체");
  const [showOnlyFree, setShowOnlyFree] = useState<boolean>(false);
  const [showOnlyClosingSoon, setShowOnlyClosingSoon] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("전체 테마");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 지역별 개수 계산
  const regionCounts = useMemo(() => {
    const counts = { 전체: exhibitionsData.length, 부산: 0, 울산: 0, 경남: 0 };
    exhibitionsData.forEach((item) => {
      if (item.region in counts) {
        counts[item.region as keyof typeof counts]++;
      }
    });
    return counts;
  }, []);

  // 선택된 광역 지역의 하위 구·군 목록 계산
  const availableSubRegions = useMemo(() => {
    if (selectedRegion === "전체") return [];
    const set = new Set<string>();
    exhibitionsData.forEach((item) => {
      if (item.region === selectedRegion && item.subRegion) {
        set.add(item.subRegion);
      }
    });
    return Array.from(set);
  }, [selectedRegion]);

  // 테마 매칭 헬퍼 함수
  const matchesTheme = (item: Exhibition, theme: string) => {
    if (theme === "전체 테마") return true;
    const text = `${item.title} ${item.category} ${item.description} ${item.tag || ""} ${(item.nearbySpots || []).join(" ")}`.toLowerCase();
    if (theme === "📸 인생샷/포토존") {
      return text.includes("포토") || text.includes("뷰") || text.includes("야경") || text.includes("오션") || text.includes("인생샷") || text.includes("사진") || text.includes("풍경");
    }
    if (theme === "🌿 자연/힐링") {
      return text.includes("자연") || text.includes("숲") || text.includes("힐링") || text.includes("공원") || text.includes("바다") || text.includes("산책") || text.includes("정원");
    }
    if (theme === "🏛️ 역사/세계유산") {
      return text.includes("유네스코") || text.includes("고분") || text.includes("역사") || text.includes("박물관") || text.includes("가야") || text.includes("유물") || text.includes("문화재");
    }
    if (theme === "👶 가족/체험") {
      return text.includes("체험") || text.includes("가족") || text.includes("동화") || text.includes("어린이") || text.includes("옹기") || text.includes("아이") || text.includes("나들이");
    }
    if (theme === "🎬 미디어/현대미술") {
      return text.includes("미디어") || text.includes("비엔날레") || text.includes("현대미술") || text.includes("시네마") || text.includes("xr") || text.includes("설치") || text.includes("빛");
    }
    return true;
  };

  // 검색 핸들러: 엔터 키 또는 검색 버튼 클릭 시
  const handleSearchSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const trimmed = searchQuery.trim();
    if (trimmed) {
      // 특정 필터(지역/테마 등) 때문에 결과가 0개이지만 전체 전시 중에는 일치하는 전시가 있는 경우,
      // 엔터를 쳤을 때 전체 전시에서 바로 찾을 수 있도록 필터를 자동으로 '전체'로 풀어줍니다.
      const queryTokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
      const hasOverallMatches = exhibitionsData.some((item) => {
        const searchableContent = [
          item.title,
          item.venueName || "",
          item.location,
          item.region,
          item.subRegion || "",
          item.category,
          item.description,
          item.curatorNote || "",
          item.tag || "",
          item.address || "",
          (item.nearbySpots || []).join(" "),
          item.isFree ? "무료 free" : (item.price || ""),
        ]
          .join(" ")
          .toLowerCase();
        return queryTokens.every((token) => searchableContent.includes(token));
      });

      if (hasOverallMatches) {
        setSelectedRegion("전체");
        setSelectedSubRegion("전체");
        setSelectedTheme("전체 테마");
        setShowOnlyFree(false);
        setShowOnlyClosingSoon(false);
      }
    }

    const section = document.getElementById("search-results-section") || document.getElementById("exhibitions-list-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 추천 검색어 태그 클릭 핸들러
  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    // 추천 태그 클릭 시 전체 지역/테마에서 바로 찾을 수 있도록 기본값으로 전환
    setSelectedRegion("전체");
    setSelectedSubRegion("전체");
    setSelectedTheme("전체 테마");
    const section = document.getElementById("exhibitions-list-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 모든 필터 및 검색어 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedRegion("전체");
    setSelectedSubRegion("전체");
    setShowOnlyFree(false);
    setShowOnlyClosingSoon(false);
    setSelectedTheme("전체 테마");
    setSearchQuery("");
  };

  // 필터링된 전시 목록
  const filteredExhibitions = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const queryTokens = trimmedQuery ? trimmedQuery.split(/\s+/).filter(Boolean) : [];

    return exhibitionsData.filter((item) => {
      // 1. 지역 필터
      if (selectedRegion !== "전체" && item.region !== selectedRegion) {
        return false;
      }
      // 1-2. 세부 구·군 필터
      if (selectedSubRegion !== "전체" && item.subRegion !== selectedSubRegion) {
        return false;
      }
      // 2. 무료 필터
      if (showOnlyFree && !item.isFree) {
        return false;
      }
      // 3. 마감 임박 필터 (D-30 이내)
      if (showOnlyClosingSoon) {
        const dDayInfo = calculateDDay(item.endDate);
        if (dDayInfo.diffDays > 30 || dDayInfo.badgeType === "ended") {
          return false;
        }
      }
      // 4. 감성 테마 필터
      if (!matchesTheme(item, selectedTheme)) {
        return false;
      }
      // 5. 검색어 필터 (제목, 미술관, 주소, 카테고리, 설명, 큐레이터노트, 태그, 인근명소, 가격 등 모든 정보 포괄 검색 및 띄어쓰기 무관 검색)
      if (queryTokens.length > 0) {
        const searchableContent = [
          item.title,
          item.venueName || "",
          item.location,
          item.region,
          item.subRegion || "",
          item.category,
          item.description,
          item.curatorNote || "",
          item.tag || "",
          item.address || "",
          (item.nearbySpots || []).join(" "),
          item.isFree ? "무료 free" : (item.price || ""),
        ]
          .join(" ")
          .toLowerCase();

        const normalizedContent = searchableContent.replace(/\s+/g, "");

        const isMatch = queryTokens.every((token) => {
          const cleanToken = token.replace(/\s+/g, "");
          return searchableContent.includes(token) || (cleanToken && normalizedContent.includes(cleanToken));
        });
        if (!isMatch) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, selectedSubRegion, showOnlyFree, showOnlyClosingSoon, selectedTheme, searchQuery]);

  // 지역/테마 제한 없이 전체 전시 데이터 중 검색어와 일치하는 개수 계산
  const allMatchingExhibitionsCount = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return exhibitionsData.length;
    const queryTokens = trimmedQuery.split(/\s+/).filter(Boolean);

    return exhibitionsData.filter((item) => {
      const searchableContent = [
        item.title,
        item.venueName || "",
        item.location,
        item.region,
        item.subRegion || "",
        item.category,
        item.description,
        item.curatorNote || "",
        item.tag || "",
        item.address || "",
        (item.nearbySpots || []).join(" "),
        item.isFree ? "무료 free" : (item.price || ""),
      ]
        .join(" ")
        .toLowerCase();

      const normalizedContent = searchableContent.replace(/\s+/g, "");

      return queryTokens.every((token) => {
        const cleanToken = token.replace(/\s+/g, "");
        return searchableContent.includes(token) || (cleanToken && normalizedContent.includes(cleanToken));
      });
    }).length;
  }, [searchQuery]);

  // Google Event List JSON-LD 스키마
  const eventListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: exhibitionsData.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: item.title,
        startDate: item.startDate || "2026-08-01",
        endDate: item.endDate || "2026-11-30",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: item.venueName || item.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: item.region,
            streetAddress: item.address || item.location,
            addressCountry: "KR",
          },
        },
        description: item.description,
        offers: {
          "@type": "Offer",
          price: item.isFree ? "0" : item.price.replace(/[^0-9]/g, ""),
          priceCurrency: "KRW",
          availability: "https://schema.org/InStock",
          url: `https://nadriai.com/events/${item.id}/`,
        },
        organizer: {
          "@type": "Organization",
          name: item.venueName || "부울경 미술관",
          url: item.link,
        },
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 구조화 데이터 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListJsonLd) }}
      />

      {/* 1. 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-1 sm:gap-2">
          {/* 좌측 브랜드 로고 */}
          <button
            type="button"
            onClick={() => {
              setSelectedRegion("전체");
              setSelectedSubRegion("전체");
              setSelectedTheme("전체 테마");
              setShowOnlyFree(false);
              setShowOnlyClosingSoon(false);
              setSearchQuery("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1 sm:gap-2 text-left group cursor-pointer shrink-0"
            title="나드리 AI 홈으로"
          >
            <div className="w-6.5 h-6.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs sm:text-lg shadow-sm shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
              🎨
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs sm:text-base md:text-lg tracking-tight text-slate-900 leading-none whitespace-nowrap">
                  나드리 AI
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  부울경
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 whitespace-nowrap hidden sm:block">
                부산 · 울산 · 경남 문화 나들이
              </p>
            </div>
          </button>

          {/* 우측 네비게이션 메뉴 버튼 (5개 버튼 모바일 완벽 1줄 노출) */}
          <nav className="flex items-center gap-0.5 sm:gap-1.5 text-xs font-semibold shrink-0 py-0.5">
            {/* 1. 전시 */}
            <button
              type="button"
              onClick={() => {
                setSelectedRegion("전체");
                setSelectedSubRegion("전체");
                setSelectedTheme("전체 테마");
                setShowOnlyFree(false);
                setShowOnlyClosingSoon(false);
                setSearchQuery("");
                const section = document.getElementById("exhibitions-list-section");
                if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-indigo-700 font-extrabold bg-indigo-50 hover:bg-indigo-100 rounded-md sm:rounded-xl text-[10.5px] sm:text-xs transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-0.5 sm:gap-1 border border-indigo-200 shrink-0"
              title="부울경 전시 목록"
            >
              <span className="text-[11px] sm:text-xs">🖼️</span>
              <span>전시</span>
            </button>

            {/* 2. 5일장 */}
            <button
              type="button"
              onClick={() => {
                const marketSec = document.getElementById("market-section");
                if (marketSec) marketSec.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-amber-900 hover:text-amber-950 font-bold bg-amber-100/90 hover:bg-amber-200 rounded-md sm:rounded-xl text-[10.5px] sm:text-xs transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-0.5 sm:gap-1 border border-amber-300 shrink-0"
              title="부울경 5일장 & 전통시장 장날 검색"
            >
              <span className="text-[11px] sm:text-xs">🧺</span>
              <span>5일장</span>
            </button>

            {/* 3. 도서관 */}
            <button
              type="button"
              onClick={() => {
                const libSec = document.getElementById("library-section");
                if (libSec) libSec.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-emerald-900 hover:text-emerald-950 font-bold bg-emerald-100/90 hover:bg-emerald-200 rounded-md sm:rounded-xl text-[10.5px] sm:text-xs transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-0.5 sm:gap-1 border border-emerald-300 shrink-0"
              title="부울경 대표 도서관 & 쌈지 작은도서관 탐방"
            >
              <span className="text-[11px] sm:text-xs">📚</span>
              <span>도서관</span>
            </button>

            {/* 4. 블로그 */}
            <Link
              href="/blog"
              className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-slate-800 hover:text-indigo-600 font-bold bg-slate-100/90 hover:bg-slate-200 rounded-md sm:rounded-xl text-[10.5px] sm:text-xs transition-all whitespace-nowrap flex items-center gap-0.5 sm:gap-1 border border-slate-300 shadow-2xs shrink-0"
              title="AI 도슨트 전시 리뷰 & 나들이 블로그"
            >
              <span className="text-[11px] sm:text-xs">📝</span>
              <span>블로그</span>
            </Link>

            {/* 5. 소개 (모바일에서도 완벽하게 끝까지 표시) */}
            <Link
              href="/intro"
              className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-indigo-900 font-extrabold bg-gradient-to-r from-violet-100 to-indigo-100 hover:from-violet-200 hover:to-indigo-200 rounded-md sm:rounded-xl text-[10.5px] sm:text-xs transition-all whitespace-nowrap flex items-center gap-0.5 sm:gap-1 border border-indigo-300 shadow-2xs shrink-0"
              title="나드리AI 1장 소개서 & 지인 피드백"
            >
              <span className="text-[11px] sm:text-xs">🌟</span>
              <span>소개</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              실시간 연동
            </div>
          </nav>
        </div>
      </header>


      {/* 2. Hero 섹션 */}
      <section className="relative overflow-hidden text-white py-14 sm:py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1920&auto=format&fit=crop&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-slate-900/90 to-slate-950/95 backdrop-blur-[2px]"></div>

        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 상단 뱃지 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] sm:text-xs font-medium mb-4 sm:mb-5 backdrop-blur-md shadow-sm">
            <span>🎨</span>
            <span>2026 부울경 미술관 & 전시 통합 가이드</span>
          </div>

          {/* 메인 헤드라인 (모바일/데스크톱 모두 깔끔한 2단 분리 & 자연스러운 행간) */}
          <h1 className="font-extrabold tracking-tight text-white max-w-3xl mx-auto [word-break:keep-all]">
            <span className="block text-base sm:text-2xl md:text-3xl font-bold text-slate-200 mb-1 sm:mb-2">
              부산 · 울산 · 경남의 모든 전시를
            </span>
            <span className="block text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-snug sm:leading-tight bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200 bg-clip-text text-transparent">
              한 페이지에서 한눈에 비교하고 떠나세요!
            </span>
          </h1>

          {/* 서브 설명 */}
          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed [word-break:keep-all] px-2">
            현재 진행 중인 {exhibitionsData.length}개 주요 전시의 관람료부터 AI 도슨트 해설, <br className="hidden sm:inline" />
            주변 네이버 맛집과 지도 길찾기까지 한 번에 확인하세요.
          </p>

          {/* 검색창 */}
          <div className="mt-8 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md shadow-lg transition-all focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white/15 focus-within:border-white/40">
                <span className="pl-4 text-slate-300 text-base select-none">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit(e);
                    }
                  }}
                  placeholder="전시명, 미술관명, 지역 검색 (예: 부산시립, 미디어아트, 통영, 거제)"
                  className="w-full py-3.5 pl-3 pr-24 text-white placeholder-slate-300 text-xs sm:text-sm bg-transparent focus:outline-none"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="px-2 py-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      title="검색어 지우기"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 shrink-0"
                    title="검색하기 (Enter)"
                  >
                    <span>검색</span>
                    <span className="text-[10px] opacity-80">↵</span>
                  </button>
                </div>
              </div>
            </form>

            {/* 인기 추천 검색어 태그 */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-300">
              <span className="text-indigo-300 font-semibold text-[11px] sm:text-xs">🔥 추천:</span>
              {[
                "부산비엔날레",
                "부산시립미술관",
                "울산시립미술관",
                "경남도립미술관",
                "미디어아트",
                "무료",
                "가족체험"
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-[11px] text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const marketSec = document.getElementById("market-section");
                  if (marketSec) marketSec.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-2.5 py-0.5 rounded-full bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/60 text-[11px] text-amber-200 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>🧺</span>
                <span>오늘 5일장 장날 검색</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const libSec = document.getElementById("library-section");
                  if (libSec) libSec.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/60 text-[11px] text-emerald-200 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>📚</span>
                <span>아이와 도서관 나들이</span>
              </button>
            </div>


          </div>

          {/* 실시간 통계 칩 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              전체 전시 <b>{exhibitionsData.length}건</b>
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              무료 전시 <b>{exhibitionsData.filter((d) => d.isFree).length}건</b>
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              부산 {regionCounts["부산"]}건 · 울산 {regionCounts["울산"]}건 · 경남 {regionCounts["경남"]}건
            </span>
          </div>
        </div>
      </section>

      {/* 카카오톡 전시 소식 무료 알림 배너 */}
      <KakaoSubscribeBanner variant="hero" />

      {/* 3. 본문: 에디터스 픽, 아트 로드맵 & 필터 탭/전시 그리드 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* 🌟 1. 이번 주 에디터스 픽 TOP 3 명품전 */}
        <EditorPickSection exhibitions={exhibitionsData} />

        {/* 🗺️ 2. 부울경 4대 테마 아트 로드맵 (Gallery Hopping) */}
        <ArtRoadmapSection />

        {/* 3. 필터 컨트롤 바 (지역 + 무료/마감임박 + 테마) */}
        <div id="exhibitions-list-section" className="space-y-4 pb-6 border-b border-slate-200 scroll-mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 1차 지역 필터 탭 */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
              {(["전체", "부산", "울산", "경남"] as const).map((region) => {
                const count = regionCounts[region];
                const isActive = selectedRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(region);
                      setSelectedSubRegion("전체");
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-indigo-600 shadow-xs scale-100 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <span>{region}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-indigo-50 text-indigo-600 font-bold" : "bg-slate-300/60 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 우측 컨트롤 (목록 내 검색창, 무료 전시, 마감 임박, 뷰 모드 전환) */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* 목록 내 빠른 검색창 */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 sm:flex-initial min-w-[220px] max-w-xs"
              >
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs select-none pointer-events-none">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(e);
                      }
                    }}
                    placeholder="목록 내 검색 (전시명, 미술관)..."
                    className="w-full pl-8 pr-16 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 placeholder-slate-400 shadow-2xs"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-slate-400 hover:text-slate-600 text-xs px-1 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title="검색어 지우기"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-0.5"
                      title="검색하기 (Enter)"
                    >
                      <span>검색</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* 무료 전시 필터 */}
              <button
                type="button"
                onClick={() => setShowOnlyFree((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  showOnlyFree
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
                }`}
              >
                <span>{showOnlyFree ? "✓" : "🎁"}</span>
                <span>무료 ({exhibitionsData.filter((d) => d.isFree).length})</span>
              </button>

              {/* 마감 임박 필터 (D-30 이내) */}
              <button
                type="button"
                onClick={() => setShowOnlyClosingSoon((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  showOnlyClosingSoon
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-rose-500 hover:text-rose-700"
                }`}
              >
                <span>{showOnlyClosingSoon ? "✓" : "⏳"}</span>
                <span>마감 임박 (D-30)</span>
              </button>

              {/* 5일장 & 장날 검색 바로가기 */}
              <button
                type="button"
                onClick={() => {
                  const marketSec = document.getElementById("market-section");
                  if (marketSec) marketSec.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer bg-amber-50/90 text-amber-900 border-amber-300 hover:border-amber-400 hover:bg-amber-100 shadow-2xs"
                title="부울경 5일장 및 전통시장 장날 확인"
              >
                <span>🧺</span>
                <span>5일장·장날</span>
              </button>

              {/* 도서관 & 작은도서관 바로가기 */}
              <button
                type="button"
                onClick={() => {
                  const libSec = document.getElementById("library-section");
                  if (libSec) libSec.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer bg-emerald-50/90 text-emerald-900 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-100 shadow-2xs"
                title="부울경 대표 도서관 & 쌈지 작은도서관 탐방"
              >
                <span>📚</span>
                <span>도서관</span>
              </button>


              {/* 보기 모드 (카드 vs 일정표 리스트) */}
              <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="카드 그리드 뷰"
                >
                  🎴 카드 뷰
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === "list" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="일정표 리스트 뷰"
                >
                  📋 일정표 뷰
                </button>
              </div>
            </div>
          </div>

          {/* 감성 테마 태그 필터 바 */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0">🏷️ 테마:</span>
            {THEME_OPTIONS.map((theme) => {
              const isThemeActive = selectedTheme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isThemeActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2차 세부 구·군/시·군 바로가기 칩 영역 */}
        {selectedRegion !== "전체" && availableSubRegions.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  📍 {selectedRegion === "부산" ? "부산 16개 구·군 전수 등록" : selectedRegion === "경남" ? "경남 18개 시·군 전수 등록" : "울산 5개 구·군 전수 등록"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-200">
                  {availableSubRegions.length}개 지자체 완료
                </span>
              </div>
              {selectedSubRegion !== "전체" && (
                <button
                  type="button"
                  onClick={() => setSelectedSubRegion("전체")}
                  className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                >
                  전체 구·군 다시보기
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedSubRegion("전체")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSubRegion === "전체"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                전체 ({availableSubRegions.length})
              </button>
              {availableSubRegions.map((sub) => {
                const isSubActive = selectedSubRegion === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubRegion(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSubActive
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 검색 활성화 상태 배너 */}
        <div id="search-results-section" className="scroll-mt-24">
          {searchQuery.trim() !== "" && (
            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔍</span>
                <div>
                  <span className="text-sm font-bold text-slate-900">
                    &apos;<span className="text-indigo-700 font-extrabold">{searchQuery}</span>&apos; 검색 결과: 총 <span className="text-indigo-700 font-black">{filteredExhibitions.length}</span>건
                  </span>
                  <span className="text-xs text-slate-500 ml-2">(전체 {exhibitionsData.length}개 전시 중)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>✕ 검색어 초기화</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 결과 현황 문구 */}
        <div className="flex items-center justify-between my-5">
          <p className="text-sm text-slate-600 font-medium">
            현재 진행 중인 전시 <span className="font-extrabold text-indigo-600">{filteredExhibitions.length}</span>건
            {selectedRegion !== "전체" && <span className="text-xs text-slate-500 ml-1.5">({selectedRegion} {selectedSubRegion !== "전체" ? `· ${selectedSubRegion}` : "전역"})</span>}
            {selectedTheme !== "전체 테마" && <span className="text-xs font-bold text-indigo-600 ml-1.5">· {selectedTheme}</span>}
          </p>
          {(selectedRegion !== "전체" || selectedSubRegion !== "전체" || showOnlyFree || showOnlyClosingSoon || selectedTheme !== "전체 테마" || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-indigo-600 underline underline-offset-2 cursor-pointer font-medium"
            >
              전체 목록으로 초기화
            </button>
          )}
        </div>

        {/* 4. 전시 목록 렌더링 (카드 뷰 or 리스트 뷰) */}
        {filteredExhibitions.length > 0 ? (
          viewMode === "grid" ? (
            /* [모드 A] 감성 카드 그리드 뷰 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExhibitions.map((exhibition) => {
                const dDayInfo = calculateDDay(exhibition.endDate, exhibition.startDate);
                return (
                  <article
                    key={exhibition.id}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* 포스터 / 고화질 사진 영역 */}
                    <Link
                      href={`/events/${exhibition.id}`}
                      className="relative h-48 w-full overflow-hidden block bg-slate-900"
                    >
                      {exhibition.thumbnailUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url('${exhibition.thumbnailUrl}')` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                        </div>
                      ) : (
                        <div
                          className={`absolute inset-0 ${exhibition.posterTheme || "bg-gradient-to-br from-indigo-950 to-slate-900"}`}
                        ></div>
                      )}

                      {/* 상단 뱃지 영역 (지역 + D-Day + 관람료) */}
                      <div className="relative z-10 p-3.5 flex items-center justify-between gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {exhibition.region} · {exhibition.subRegion}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* D-Day 뱃지 */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs ${
                              dDayInfo.badgeType === "urgent"
                                ? "bg-rose-600 text-white"
                                : dDayInfo.badgeType === "soon"
                                ? "bg-amber-500 text-slate-950 font-bold"
                                : "bg-black/60 text-slate-200 border border-white/20"
                            }`}
                          >
                            {dDayInfo.badgeText}
                          </span>

                          {exhibition.isFree ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs">
                              무료
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-xs text-amber-300 border border-white/10">
                              {exhibition.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 포스터 하단 전시명 */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <span className="text-[10px] tracking-wider uppercase font-bold text-indigo-300 block mb-1">
                          {exhibition.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">
                          {exhibition.title}
                        </h3>
                      </div>
                    </Link>

                    {/* 카드 본문 상세 정보 */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-2.5">
                        {/* 장소 & 일정 */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-indigo-500 shrink-0 mt-0.5">🏛️</span>
                            <span className="font-bold text-slate-800 line-clamp-1">{exhibition.venueName || exhibition.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-indigo-500 shrink-0">📅</span>
                            <span className="font-medium text-slate-600">{exhibition.period}</span>
                          </div>
                        </div>

                        {/* 요약 설명 */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                          {exhibition.description}
                        </p>

                        {/* AI 도슨트 리뷰 바로가기 뱃지 */}
                        {exhibition.blogSlug && (
                          <div className="pt-1">
                            <Link
                              href={`/blog/${exhibition.blogSlug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg w-full justify-between"
                            >
                              <span>✍️ AI 해설 & 주변 맛집/코스</span>
                              <span>→</span>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* 하단 4-Way 원클릭 액션 버튼 그룹 */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5">
                        <Link
                          href={`/events/${exhibition.id}`}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all text-center shadow-xs"
                        >
                          전시 상세 →
                        </Link>
                        <a
                          href={`https://map.naver.com/p/search/${encodeURIComponent(exhibition.venueName || exhibition.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200"
                          title="네이버 지도 길찾기"
                        >
                          길찾기 📍
                        </a>
                        <a
                          href={exhibition.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                          title="공식 홈페이지"
                        >
                          공식 ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* [모드 B] 한눈에 비교하는 타임라인/일정표 리스트 뷰 */
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold border-b border-slate-200">
                      <th className="py-4 px-5">지역</th>
                      <th className="py-4 px-5">전시명 및 미술관</th>
                      <th className="py-4 px-5">전시 기간 및 D-Day</th>
                      <th className="py-4 px-5">관람료</th>
                      <th className="py-4 px-5 text-center">원클릭 바로가기</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredExhibitions.map((exhibition) => {
                      const dDayInfo = calculateDDay(exhibition.endDate, exhibition.startDate);
                      return (
                        <tr key={exhibition.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 지역 */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {exhibition.region}
                            </span>
                            <span className="block text-[11px] text-slate-400 mt-1 font-medium">
                              {exhibition.subRegion}
                            </span>
                          </td>

                          {/* 전시명 & 장소 */}
                          <td className="py-4 px-5">
                            <Link href={`/events/${exhibition.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block">
                              {exhibition.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                              <span>🏛️</span>
                              <span>{exhibition.venueName || exhibition.location}</span>
                            </p>
                          </td>

                          {/* 기간 & D-Day */}
                          <td className="py-4 px-5 whitespace-nowrap text-slate-600 font-medium">
                            <div>{exhibition.period}</div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                dDayInfo.badgeType === "urgent"
                                  ? "bg-rose-100 text-rose-700 font-extrabold"
                                  : dDayInfo.badgeType === "soon"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {dDayInfo.badgeText}
                            </span>
                          </td>

                          {/* 가격 */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            {exhibition.isFree ? (
                              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                무료
                              </span>
                            ) : (
                              <span className="font-bold text-slate-800">
                                {exhibition.price}
                              </span>
                            )}
                          </td>

                          {/* 액션 버튼 */}
                          <td className="py-4 px-5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={`/events/${exhibition.id}`}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                              >
                                전시 안내
                              </Link>
                              {exhibition.blogSlug && (
                                <Link
                                  href={`/blog/${exhibition.blogSlug}`}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                                >
                                  AI 해설 ➔
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* 빈 검색 결과 안내 */
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <span className="text-5xl block mb-3">🔍</span>
            
            {allMatchingExhibitionsCount > 0 && searchQuery ? (
              /* 현재 필터에는 없지만 다른 지역/테마에 결과가 있는 경우 */
              <div className="max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-slate-800">
                  선택하신 필터({selectedRegion !== "전체" ? selectedRegion : ""}{selectedRegion !== "전체" && selectedTheme !== "전체 테마" ? " / " : ""}{selectedTheme !== "전체 테마" ? selectedTheme : ""})에서는 검색 결과가 없습니다.
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  하지만 <b>전체 지역</b>에서 &apos;<span className="text-indigo-600 font-bold">{searchQuery}</span>&apos;와 일치하는 전시가 <b className="text-indigo-600 font-extrabold">{allMatchingExhibitionsCount}건</b> 있습니다!
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegion("전체");
                      setSelectedSubRegion("전체");
                      setSelectedTheme("전체 테마");
                      setShowOnlyFree(false);
                      setShowOnlyClosingSoon(false);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-md"
                  >
                    전체 지역에서 &apos;{searchQuery}&apos; 결과 ({allMatchingExhibitionsCount}건) 보기 ➔
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            ) : (
              /* 전체 데이터에도 결과가 없는 경우 */
              <div className="max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-slate-800">
                  {searchQuery ? `'${searchQuery}'에 대한 검색 결과를 찾을 수 없습니다.` : "조건에 맞는 전시가 없습니다."}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  검색어가 올바른지 확인하시거나, 아래 인기 추천 검색어를 선택해보세요.
                </p>

                {/* 추천 검색어 바로가기 버튼 */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {["부산비엔날레", "부산시립미술관", "울산시립미술관", "경남도립미술관", "미디어아트", "무료", "가족체험"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer border border-indigo-100"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-indigo-600 transition-all cursor-pointer shadow-md"
                  >
                    전체 전시 목록 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. 부울경 5일장 & 전통 재래시장 나들이 섹션 */}
        <div className="mt-16">
          <MarketSection />
        </div>

        {/* 6. 부울경 대표 도서관 & 쌈지 작은도서관 나들이 섹션 */}
        <div className="mt-16">
          <LibrarySection />
        </div>

        {/* 7. AI 도슨트 & 나들이 추천 안내 배너 섹션 */}
        <section id="ai-docent-section" className="mt-16 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
              🤖 Gemini AI 전시 큐레이션
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              어려운 현대미술도 쉽고 재미있게! <br />
              <span className="text-indigo-300">AI 도슨트가 전하는 전시 해설</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              부산비엔날레부터 통영 옻칠미술관, 거제 야외조각전까지! 작품 속에 담긴 숨겨진 스토리와 네이버 실시간 맛집, 주변 드라이브 코스를 친절하게 짚어드립니다.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-colors shadow-md"
              >
                전시 블로그 & 맛집 보러가기 →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. 푸터 */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                A
              </span>
              <span className="font-extrabold text-white text-base">부울경 아트·전시 (art-buk)</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              부산, 울산, 경남의 미술관 전시 정보와 문화예술 나들이 코스를 제공하는 오픈 데이터 포털입니다.
            </p>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>© 2026 art-buk. All rights reserved.</p>
            <p>공공데이터포털 & NAVER API HUB & Google Gemini AI 연동</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
