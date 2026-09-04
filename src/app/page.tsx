"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadge from "@/components/TrustBadge";
import ExhibitionSimpleCard from "@/components/ExhibitionSimpleCard";
import AiTripPlanner from "@/components/AiTripPlanner";
import MarketSection from "@/components/MarketSection";
import LibrarySection from "@/components/LibrarySection";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";
import rawData from "../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";
import { TRADITIONAL_MARKETS } from "@/data/markets";
import { LIBRARIES_DATA } from "@/data/libraries";
import { getMarketStatus } from "@/utils/market";

const exhibitionsData: Exhibition[] = rawData as Exhibition[];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [todayRegion, setTodayRegion] = useState<"부산" | "울산" | "경남">("부산");

  // 실시간 통계 (100% 동적 계산)
  const stats = useMemo(() => {
    const todayMarketsCount = TRADITIONAL_MARKETS.filter(
      (m) => getMarketStatus(m).badgeType === "today"
    ).length;
    return {
      totalExhibitions: exhibitionsData.length,
      freeExhibitions: exhibitionsData.filter((e) => e.isFree).length,
      totalMarkets: TRADITIONAL_MARKETS.length,
      todayMarkets: todayMarketsCount,
      totalLibraries: LIBRARIES_DATA.length,
    };
  }, []);

  // 추천 전시 TOP 6
  const topExhibitions = useMemo(() => {
    return exhibitionsData.slice(0, 6);
  }, []);

  // 오늘의 나드리 큐레이션 (선택 지역 대표 스팟 3종)
  const todayCurations = useMemo(() => {
    const ex = exhibitionsData.find((e) => e.region === todayRegion) || exhibitionsData[0];
    const mk = TRADITIONAL_MARKETS.find((m) => m.region === todayRegion) || TRADITIONAL_MARKETS[0];
    const lib = LIBRARIES_DATA.find((l) => l.region === todayRegion) || LIBRARIES_DATA[0];
    return { ex, mk, lib };
  }, [todayRegion]);

  // 검색 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/exhibitions?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  // 12개 상황별 퀵필터 처리
  const handleQuickFilter = (tag: string) => {
    if (tag === "5일장") {
      window.location.href = "/markets";
    } else if (tag === "도서관") {
      window.location.href = "/libraries";
    } else if (tag === "전시") {
      window.location.href = "/exhibitions";
    } else if (tag === "오늘" || tag === "이번 주말") {
      const el = document.getElementById("today-nadri-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (tag === "무료") {
      window.location.href = "/exhibitions?free=true";
    } else if (tag === "아이와") {
      window.location.href = "/libraries?filter=가족특화";
    } else {
      window.location.href = `/exhibitions?theme=${encodeURIComponent(tag)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      {/* 1. Hero 섹션 */}
      <section className="relative overflow-hidden text-white py-14 sm:py-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1920&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900/90 to-slate-950/95"></div>

        {/* 글로우 장식 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* 상단 뱃지 */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold backdrop-blur-md shadow-sm">
            <span>✨</span>
            <span>부산 · 울산 · 경남 AI 문화·나들이 플랫폼</span>
          </div>

          {/* 메인 카피 & 서브 카피 */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight [word-break:keep-all]">
              이번 주말, 어디 갈까요?
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed [word-break:keep-all]">
              부산·울산·경남의 전시 · 5일장 · 도서관 · 문화공간을 <br className="hidden sm:inline" />
              AI가 오늘 날짜와 취향에 맞춰 10초 만에 찾아드립니다.
            </p>
          </div>

          {/* CTA 버튼 2종 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const plannerEl = document.getElementById("ai-trip-planner-section");
                if (plannerEl) plannerEl.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
            >
              <span>✨</span>
              <span>AI에게 추천받기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const todayEl = document.getElementById("today-nadri-section");
                if (todayEl) todayEl.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>📍</span>
              <span>오늘 갈 곳 찾기</span>
            </button>
          </div>

          {/* 검색창 & 12개 상황별 Quick Filter */}
          <div className="pt-6 max-w-2xl mx-auto space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md shadow-lg transition-all focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white/20">
                <span className="pl-4 text-slate-300 text-base select-none">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="오늘 어디로 떠나고 싶으세요? (지역·전시·시장·도서관)"
                  className="w-full py-3.5 pl-3 pr-24 text-white placeholder-slate-300 text-xs sm:text-sm bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  검색
                </button>
              </div>
            </form>

            {/* 상황별 12개 Quick Filter 칩 */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {[
                "오늘",
                "이번 주말",
                "무료",
                "아이와",
                "부모님과",
                "데이트",
                "비 오는 날",
                "실내",
                "드라이브",
                "5일장",
                "도서관",
                "전시",
              ].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleQuickFilter(filter)}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-[11px] text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  #{filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4대 대형 메뉴 카드 (PC 4열, 모바일 2x2 배열) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {/* 카드 1: 🎨 전시 보러가기 */}
          <Link
            href="/exhibitions"
            className="group bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                🎨
              </span>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {stats.totalExhibitions}개 진행중
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-lg group-hover:text-indigo-600 transition-colors">
                전시 보러가기
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                현재 진행 중인 전시와 무료 전시
              </p>
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
              <span>둘러보기</span>
              <span>→</span>
            </div>
          </Link>

          {/* 카드 2: 🧺 오늘 장날 */}
          <Link
            href="/markets"
            className="group bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 hover:border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                🧺
              </span>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                오늘 {stats.todayMarkets}곳 개장
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-lg group-hover:text-amber-600 transition-colors">
                오늘 장날
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                오늘 열리는 부울경 5일장 & 전통시장
              </p>
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-amber-600 flex items-center gap-1">
              <span>장날 확인</span>
              <span>→</span>
            </div>
          </Link>

          {/* 카드 3: 📚 아이와 도서관 */}
          <Link
            href="/libraries"
            className="group bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                📚
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {stats.totalLibraries}곳 엄선
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-lg group-hover:text-emerald-600 transition-colors">
                아이와 도서관
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                가족·숲속·복합문화 도서관
              </p>
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 flex items-center gap-1">
              <span>공간 보기</span>
              <span>→</span>
            </div>
          </Link>

          {/* 카드 4: ✨ AI 나들이 추천 */}
          <Link
            href="/ai-trip"
            className="group bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer bg-gradient-to-b from-indigo-50/30 to-white"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-xs">
                ✨
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                1초 맞춤 완성
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-lg group-hover:text-indigo-600 transition-colors">
                AI 나들이 추천
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                지역·시간·동행자 맞춤 코스 자동생성
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              <span>코스 만들기</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. 본문 메인 콘텐츠 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* 🌟 1. 오늘의 나드리 (오늘 부산·울산·경남에서 갈 만한 곳) */}
        <section id="today-nadri-section" className="scroll-mt-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                  <span>📍</span>
                  <span>오늘의 추천 큐레이션</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  “오늘 {todayRegion}에서 갈 만한 곳”
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  당일 바로 방문하기 좋은 문화 전시와 로컬 장터, 힐링 도서관을 짚어드립니다.
                </p>
              </div>

              {/* 지역 선택 탭 */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {(["부산", "울산", "경남"] as const).map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setTodayRegion(reg)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      todayRegion === reg
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* 3종 큐레이션 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 전시 추천 */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    🎨 오늘 추천 전시
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                    {todayCurations.ex.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {todayCurations.ex.venueName || todayCurations.ex.location}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {todayCurations.ex.curatorNote || todayCurations.ex.description}
                  </p>
                </div>
                <Link
                  href={`/events/${todayCurations.ex.id}`}
                  className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>전시 상세정보 보기</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 5일장/시장 추천 */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    🧺 로컬 미식 장터
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                    {todayCurations.mk.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {todayCurations.mk.region} {todayCurations.mk.subRegion} · {todayCurations.mk.marketType}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    대표 특산물: {todayCurations.mk.specialties.join(", ")}
                  </p>
                </div>
                <Link
                  href="/markets"
                  className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>시장 장날 확인하기</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 도서관 추천 */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    📚 힐링 도서관
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                    {todayCurations.lib.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {todayCurations.lib.region} {todayCurations.lib.subRegion} · {todayCurations.lib.type}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {todayCurations.lib.features.join(" · ")}
                  </p>
                </div>
                <Link
                  href="/libraries"
                  className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>도서관 시설 보기</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ✨ 2. AI 나들이 플래너 코어 위젯 */}
        <AiTripPlanner />

        {/* 🎨 3. 이번 주 추천 전시 TOP 6 */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                <span>🎨</span>
                <span>이번 주말 어디 갈까?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                이번 주 추천 전시 TOP 6
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                현재 관람객 평점과 화제성이 가장 높은 부울경 대표 전시입니다.
              </p>
            </div>

            <Link
              href="/exhibitions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs sm:text-sm transition-colors shrink-0"
            >
              <span>전시 전체보기 ({stats.totalExhibitions}개)</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topExhibitions.map((exhibition) => (
              <ExhibitionSimpleCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/exhibitions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white font-black text-sm border border-indigo-200 hover:border-indigo-600 shadow-sm transition-all cursor-pointer"
            >
              <span>전시 전체목록 둘러보기 ({stats.totalExhibitions}개)</span>
              <span>➔</span>
            </Link>
          </div>
        </section>

        {/* 🧺 4. 오늘 열리는 5일장 & 추천 시장 TOP 6 */}
        <MarketSection maxItems={6} />

        {/* 📚 5. 아이와 가기 좋은 도서관 TOP 6 */}
        <LibrarySection maxItems={6} />

        {/* 카카오톡 전시 소식 무료 알림 배너 */}
        <KakaoSubscribeBanner variant="hero" />
      </main>

      {/* 4. 나드리 AI 공식 푸터 */}
      <Footer />
    </div>
  );
}
