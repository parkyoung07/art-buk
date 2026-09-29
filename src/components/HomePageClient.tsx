"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExhibitionSimpleCard from "@/components/ExhibitionSimpleCard";
import AiTripPlanner from "@/components/AiTripPlanner";
import MarketSection from "@/components/MarketSection";
import LibrarySection from "@/components/LibrarySection";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";
import DailyPostHighlightSection from "@/components/DailyPostHighlightSection";
import rawData from "../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";
import { TRADITIONAL_MARKETS } from "@/data/markets";
import { LIBRARIES_DATA } from "@/data/libraries";
import { getMarketStatus } from "@/utils/market";
import NoticeModal from "@/components/NoticeModal";
import { calculateDDay } from "@/utils/date";
import { PostData } from "@/lib/posts";

const exhibitionsData: Exhibition[] = rawData as Exhibition[];

interface HomePageClientProps {
  posts: PostData[];
}

export default function HomePageClient({ posts }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [todayRegion, setTodayRegion] = useState<"부산" | "울산" | "경남">("부산");

  // 실시간 통계 (100% 동적 계산)
  const stats = useMemo(() => {
    const todayMarketsCount = TRADITIONAL_MARKETS.filter(
      (m) => getMarketStatus(m).badgeType === "today"
    ).length;
    const openTodayExhibitionsCount = exhibitionsData.filter(
      (e) => calculateDDay(e.period).isOpenToday
    ).length;
    return {
      totalExhibitions: exhibitionsData.length,
      openTodayExhibitions: openTodayExhibitionsCount,
      freeExhibitions: exhibitionsData.filter((e) => e.isFree).length,
      totalMarkets: TRADITIONAL_MARKETS.length,
      todayMarkets: todayMarketsCount,
      totalLibraries: LIBRARIES_DATA.length,
      totalPosts: posts.length,
    };
  }, [posts.length]);

  // 최신 포스트 (Hero 상단 바 연동)
  const latestPost = posts.length > 0 ? posts[0] : null;

  // 추천 전시 TOP 6 (최신 일일 AI 추천 전시 우선 배치 + 해당 전시와 매칭된 블로그 소글 실시간 연동!)
  const topExhibitionsWithPosts = useMemo(() => {
    // 1. 포스트에서 언급된 전시 id 매칭
    const postEventIds = posts.map((p) => p.eventId).filter(Boolean);
    const postMatchedExhibitions = exhibitionsData.filter((e) => postEventIds.includes(e.id));
    
    // 2. 매칭되지 않은 나머지 전시
    const remaining = exhibitionsData.filter((e) => !postEventIds.includes(e.id));
    
    // 3. 최신 AI 추천 전시를 앞에 두고 상위 6개 선정
    const combined = [...postMatchedExhibitions, ...remaining].slice(0, 6);

    return combined.map((ex) => {
      const matchedPost = posts.find((p) => p.eventId === ex.id || p.slug.includes(ex.id));
      return { exhibition: ex, post: matchedPost };
    });
  }, [posts]);

  // 오늘의 나드리 큐레이션 (선택 지역에서 가장 최근에 다룬 실시간 블로그 소글 및 장터, 도서관 매칭)
  const todayCurations = useMemo(() => {
    // 해당 지역의 최신 포스트 찾기 (가장 최신순)
    const regionPost = posts.find((p) => p.region.includes(todayRegion));
    let ex = exhibitionsData.find((e) => regionPost?.eventId && e.id === regionPost.eventId);
    if (!ex) {
      ex = exhibitionsData.find((e) => e.region === todayRegion) || exhibitionsData[0];
    }
    const mk = TRADITIONAL_MARKETS.find((m) => m.region === todayRegion) || TRADITIONAL_MARKETS[0];
    const lib = LIBRARIES_DATA.find((l) => l.region === todayRegion) || LIBRARIES_DATA[0];
    return { ex, mk, lib, regionPost };
  }, [todayRegion, posts]);

  // 검색 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/exhibitions?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      {/* 1. Hero 섹션 (모바일 최적화 심플 & 직관적 디자인) */}
      <section className="relative overflow-hidden text-white py-8 sm:py-14 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
        <div className="relative max-w-3xl mx-auto px-4 text-center space-y-2 sm:space-y-3">
          {/* 메인 타이틀 */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight [word-break:keep-all]">
            이번 주말, 어디로 떠날까요?
          </h1>
          <p className="text-xs sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed [word-break:keep-all]">
            부산 · 울산 · 경남 문화 전시 · 5일장 · 도서관 나들이
          </p>

          {/* 심플 검색창 */}
          <div className="pt-2 max-w-lg mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center bg-white/15 hover:bg-white/20 rounded-2xl border border-white/20 backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white/25">
                <span className="pl-4 text-slate-300 text-sm select-none">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="전시, 5일장, 도서관 검색..."
                  className="w-full py-3.5 pl-3 pr-20 text-white placeholder-slate-300 text-xs sm:text-sm bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  검색
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. 본문 메인 콘텐츠 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* 🌟 1. [핵심 신규] 매일 올라오는 글 바탕의 오늘의 AI 추천 전시 & 매거진 섹션 */}
        <div id="daily-highlight-section" className="scroll-mt-20">
          <DailyPostHighlightSection posts={posts} />
        </div>

        {/* 📍 2. 오늘의 나드리 (선택 지역별 대표 스팟 3종 큐레이션) */}
        <section id="today-nadri-section" className="scroll-mt-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                  <span>📍</span>
                  <span>오늘의 지역별 추천 코스</span>
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
              {/* 전시 추천 (최신 AI 도슨트 소글 연동) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-200/80 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>🎨</span>
                      <span>오늘 {todayRegion} 추천 전시</span>
                    </span>
                    {todayCurations.regionPost && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                        {todayCurations.regionPost.date} 도슨트
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base mt-2 line-clamp-1">
                    {todayCurations.regionPost?.title || todayCurations.ex.title}
                  </h4>
                  <p className="text-xs text-indigo-600 font-bold">
                    🏛️ {todayCurations.ex.venueName || todayCurations.ex.location}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded-xl border border-indigo-100/50">
                    💬 {todayCurations.regionPost?.summary || todayCurations.ex.curatorNote || todayCurations.ex.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  {todayCurations.regionPost ? (
                    <Link
                      href={`/blog/${todayCurations.regionPost.slug}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      <span>✨ 도슨트 코스 보기</span>
                      <span>➔</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/events/${todayCurations.ex.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      <span>전시 상세정보 보기</span>
                      <span>➔</span>
                    </Link>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {todayCurations.ex.isFree ? "무료 관람" : "관람료 확인"}
                  </span>
                </div>
              </div>

              {/* 5일장/시장 추천 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/80 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      🧺 로컬 미식 장터
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {todayCurations.mk.marketType}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                    {todayCurations.mk.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {todayCurations.mk.region} {todayCurations.mk.subRegion} · {todayCurations.mk.scheduleDescription}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded-xl border border-amber-100/50">
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
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/80 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      📚 힐링 도서관
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {todayCurations.lib.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                    {todayCurations.lib.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {todayCurations.lib.region} {todayCurations.lib.subRegion}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded-xl border border-emerald-100/50">
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

        {/* ✨ 3. AI 나들이 플래너 코어 위젯 */}
        <AiTripPlanner />

        {/* 🎨 4. 이번 주 추천 전시 TOP 6 (최신 AI 블로그 도슨트 소글 연동) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                <span>🎨</span>
                <span>실시간 도슨트 큐레이션 연동</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                이번 주 추천 전시 TOP 6
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                매일 연재되는 AI 도슨트 매거진의 최신 소글과 화제성 높은 대표 전시를 함께 확인하세요.
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
            {topExhibitionsWithPosts.map(({ exhibition, post }) => (
              <ExhibitionSimpleCard key={exhibition.id} exhibition={exhibition} post={post} />
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

        {/* 🧺 5. 오늘 열리는 5일장 & 추천 시장 TOP 6 */}
        <MarketSection maxItems={6} />

        {/* 📚 6. 아이와 가기 좋은 도서관 TOP 6 */}
        <LibrarySection maxItems={6} />

        {/* 카카오톡 전시 소식 무료 알림 배너 */}
        <KakaoSubscribeBanner variant="hero" />
      </main>

      {/* 4. 나드리 AI 공식 푸터 */}
      <Footer />

      {/* 메인 공지 알림창 (만료된 지난 공지는 비활성화) */}
      <NoticeModal isActive={false} />
    </div>
  );
}
