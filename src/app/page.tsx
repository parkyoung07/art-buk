"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";
import rawData from "../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

const exhibitionsData: Exhibition[] = rawData as Exhibition[];

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [showOnlyFree, setShowOnlyFree] = useState<boolean>(false);
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

  // 필터링된 전시 목록
  const filteredExhibitions = useMemo(() => {
    return exhibitionsData.filter((item) => {
      // 1. 지역 필터
      if (selectedRegion !== "전체" && item.region !== selectedRegion) {
        return false;
      }
      // 2. 무료 필터
      if (showOnlyFree && !item.isFree) {
        return false;
      }
      // 3. 검색어 필터
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchLocation = item.location.toLowerCase().includes(query);
        const matchCategory = item.category.toLowerCase().includes(query);
        const matchVenue = (item.venueName || "").toLowerCase().includes(query);
        if (!matchTitle && !matchLocation && !matchCategory && !matchVenue) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, showOnlyFree, searchQuery]);

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
          url: `https://art-buk.pages.dev/events/${item.id}/`,
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
              A
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2">
                부울경 아트·전시
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  art-buk
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">부산 · 울산 · 경남 문화예술 나들이 포털</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm font-medium">
            <button
              onClick={() => {
                setSelectedRegion("전체");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
              className="px-3 py-1.5 text-indigo-600 font-bold bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            >
              전시 둘러보기
            </button>
            <Link
              href="/blog"
              className="px-3 py-1.5 text-slate-700 hover:text-indigo-600 transition-colors"
            >
              전시 블로그 & 맛집
            </Link>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              실시간 연동 완료
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-medium mb-5 backdrop-blur-md shadow-sm">
            <span>🎨</span>
            <span>2026 부울경 현재 진행 중인 전체 미술관 & 전시 통합 가이드</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-tight">
            부산 · 울산 · 경남의 모든 전시를 <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200 bg-clip-text text-transparent">
              한 페이지에서 한눈에 비교하고 떠나세요!
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed [word-break:keep-all]">
            현재 진행 중인 {exhibitionsData.length}개 주요 전시의 관람료부터 AI 도슨트 해설, <br className="hidden sm:inline" />
            주변 네이버 맛집과 지도 길찾기까지 한 번에 확인하세요.
          </p>

          {/* 검색창 */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="전시명, 미술관명, 지역 검색 (예: 부산시립, 미디어아트, 통영, 거제)"
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 backdrop-blur-md transition-all"
              />
              <span className="absolute left-4 text-slate-400 text-base">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 px-2 py-1 text-xs text-slate-300 hover:text-white bg-white/10 rounded-md cursor-pointer"
                >
                  지우기
                </button>
              )}
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

      {/* 3. 본문: 필터 탭 & 전시 그리드/리스트 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* 필터 컨트롤 바 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          {/* 1차 지역 필터 탭 */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
            {(["전체", "부산", "울산", "경남"] as const).map((region) => {
              const count = regionCounts[region];
              const isActive = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
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

          {/* 우측 컨트롤 (무료 전시 필터 & 뷰 모드 전환) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              type="button"
              onClick={() => setShowOnlyFree((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                showOnlyFree
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              <span className="text-base">{showOnlyFree ? "✓" : "🎁"}</span>
              <span>무료 전시만 ({exhibitionsData.filter((d) => d.isFree).length})</span>
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

        {/* 결과 현황 문구 */}
        <div className="flex items-center justify-between my-5">
          <p className="text-sm text-slate-600 font-medium">
            현재 진행 중인 전시 <span className="font-extrabold text-indigo-600">{filteredExhibitions.length}</span>건
          </p>
          {(selectedRegion !== "전체" || showOnlyFree || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRegion("전체");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
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
              {filteredExhibitions.map((exhibition) => (
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

                    {/* 상단 뱃지 영역 */}
                    <div className="relative z-10 p-4 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {exhibition.region} · {exhibition.subRegion}
                      </span>
                      {exhibition.isFree ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-md">
                          무료 관람
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur-xs text-amber-300 border border-white/10">
                          {exhibition.price}
                        </span>
                      )}
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
              ))}
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
                      <th className="py-4 px-5">전시 기간</th>
                      <th className="py-4 px-5">관람료</th>
                      <th className="py-4 px-5 text-center">원클릭 바로가기</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredExhibitions.map((exhibition) => (
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

                        {/* 기간 */}
                        <td className="py-4 px-5 whitespace-nowrap text-slate-600 font-medium">
                          {exhibition.period}
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
                                AI 해설
                              </Link>
                            )}
                            <a
                              href={`https://map.naver.com/p/search/${encodeURIComponent(exhibition.venueName || exhibition.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200"
                            >
                              길찾기 📍
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* 검색/필터 결과 없음 */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">조건에 맞는 전시를 찾을 수 없습니다.</h3>
            <p className="text-sm text-slate-500 mb-6">지역 필터를 변경하거나 다른 검색어로 찾아보세요.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion("전체");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              전체 전시 보기
            </button>
          </div>
        )}

        {/* 5. AI 도슨트 & 나들이 추천 안내 배너 섹션 */}
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
