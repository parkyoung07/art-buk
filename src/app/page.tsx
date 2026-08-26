"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import rawData from "../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

const exhibitionsData: Exhibition[] = rawData as Exhibition[];

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [showOnlyFree, setShowOnlyFree] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalItem, setActiveModalItem] = useState<Exhibition | null>(null);

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
        if (!matchTitle && !matchLocation && !matchCategory) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, showOnlyFree, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
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

          <nav className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={() => {
                setSelectedRegion("전체");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              전시 탐색
            </button>
            <a
              href="#ai-docent-section"
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              AI 도슨트
            </a>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              공공데이터 연동 완료
            </div>
          </nav>
        </div>
      </header>

      {/* 2. Hero 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white py-16 sm:py-20">
        {/* 배경 은은한 빛 효과 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs">
            <span>🎨</span>
            <span>2026 부울경 미술관 & 갤러리 통합 가이드</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-tight">
            이번 주말, 부울경의 예술과 함께하는 <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-pink-300 bg-clip-text text-transparent">
              감성 가득한 나들이
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            부산의 바다, 울산의 빛, 경남의 자연을 담은 미술관 전시 정보와 AI 도슨트 추천 코스를 한눈에 확인하세요.
          </p>

          {/* 검색창 */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="전시명, 미술관명, 카테고리 검색 (예: 현대미술, 미디어, 도자)"
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 backdrop-blur-md transition-all"
              />
              <span className="absolute left-4 text-slate-400 text-base">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 px-2 py-1 text-xs text-slate-300 hover:text-white bg-white/10 rounded-md"
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
              부산 1건 · 울산 1건 · 경남 2건
            </span>
          </div>
        </div>
      </section>

      {/* 3. 본문: 필터 탭 & 전시 그리드 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* 필터 컨트롤 바 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          {/* 1차 지역 필터 탭 */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
            {(["전체", "부산", "울산", "경남"] as const).map((region) => {
              const count = regionCounts[region];
              const isActive = selectedRegion === region;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-xs scale-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <span>{region}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-300/60 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 우측 보조 필터 (무료 전시만 보기) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnlyFree((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                showOnlyFree
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              <span className="text-base">{showOnlyFree ? "✓" : "🎁"}</span>
              <span>무료 전시만 보기</span>
            </button>
          </div>
        </div>

        {/* 결과 현황 문구 */}
        <div className="flex items-center justify-between my-6">
          <p className="text-sm text-slate-600">
            총 <span className="font-bold text-indigo-600">{filteredExhibitions.length}</span>개의 전시가 진행 중입니다.
          </p>
          {(selectedRegion !== "전체" || showOnlyFree || searchQuery) && (
            <button
              onClick={() => {
                setSelectedRegion("전체");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
              className="text-xs text-slate-500 hover:text-indigo-600 underline underline-offset-2"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* 4. 전시 카드 그리드 */}
        {filteredExhibitions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredExhibitions.map((exhibition) => (
              <article
                key={exhibition.id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* 포스터 비주얼 영역 (클릭 시 상세페이지로 이동) */}
                <Link
                  href={`/events/${exhibition.id}`}
                  className={`relative h-48 w-full p-5 flex flex-col justify-between overflow-hidden text-white block ${
                    exhibition.posterTheme || "bg-gradient-to-br from-slate-900 to-indigo-950"
                  }`}
                >
                  {/* 배경 장식 원형 오브젝트 */}
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500"></div>

                  {/* 상단 뱃지 영역 */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {exhibition.region} · {exhibition.subRegion}
                    </span>
                    {exhibition.isFree ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-xs animate-bounce">
                        무료 관람
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/60 backdrop-blur-xs text-slate-200 border border-white/10">
                        {exhibition.price}
                      </span>
                    )}
                  </div>

                  {/* 포스터 중앙 타이포그래픽 무드 */}
                  <div className="relative z-10 my-auto">
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-white/70 block mb-1">
                      {exhibition.category}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-indigo-200 transition-colors">
                      {exhibition.title}
                    </h3>
                  </div>

                  {/* 포스터 하단 태그 */}
                  {exhibition.tag && (
                    <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-white/80 font-medium">
                      <span>✨</span>
                      <span>{exhibition.tag}</span>
                    </div>
                  )}
                </Link>

                {/* 카드 본문 상세 정보 */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    {/* 전시명 (클릭 시 상세페이지 이동) */}
                    <Link href={`/events/${exhibition.id}`}>
                      <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {exhibition.title}
                      </h4>
                    </Link>

                    {/* 장소 & 일정 */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-500 shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1 font-medium text-slate-700">{exhibition.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-500 shrink-0">📅</span>
                        <span className="font-medium text-slate-700">{exhibition.period}</span>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                      {exhibition.description}
                    </p>
                  </div>

                  {/* 하단 액션 버튼 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href={`/events/${exhibition.id}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all text-center"
                    >
                      전시 상세정보 →
                    </Link>
                    <a
                      href={exhibition.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                      title="공식 예매 / 미술관 링크"
                    >
                      홈페이지 ↗
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* 검색/필터 결과 없음 */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">조건에 맞는 전시를 찾을 수 없습니다.</h3>
            <p className="text-sm text-slate-500 mb-6">지역 필터를 변경하거나 다른 검색어로 찾아보세요.</p>
            <button
              onClick={() => {
                setSelectedRegion("전체");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
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
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              매일 아침 부울경 전역의 새로운 전시 데이터를 분석하여, 작품 속 숨겨진 이야기와 미술관 주변 데이트·나들이 맛집 코스를 함께 추천해 드립니다.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => alert("AI 도슨트 블로그 및 코스 추천 기능이 곧 정식 오픈됩니다!")}
                className="px-5 py-3 rounded-xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md"
              >
                도슨트 추천 글 읽어보기 →
              </button>
              <span className="text-xs text-indigo-300">
                매일 오전 06:00 자동 발행
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 6. 상세 보기 모달 팝업 */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* 모달 상단 비주얼 */}
            <div className={`p-6 text-white ${activeModalItem.posterTheme || "bg-indigo-950"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/20">
                  {activeModalItem.region} · {activeModalItem.subRegion}
                </span>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              <span className="text-xs text-indigo-200 font-semibold">{activeModalItem.category}</span>
              <h3 className="text-xl font-extrabold mt-1 text-white leading-snug">{activeModalItem.title}</h3>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-4 text-sm">
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold w-16 shrink-0">장소</span>
                  <span className="text-slate-800 font-medium">{activeModalItem.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold w-16 shrink-0">기간</span>
                  <span className="text-slate-800 font-medium">{activeModalItem.period}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold w-16 shrink-0">관람료</span>
                  <span className="text-slate-800 font-bold">
                    {activeModalItem.isFree ? (
                      <span className="text-emerald-600">무료 관람</span>
                    ) : (
                      activeModalItem.price
                    )}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">전시 소개</h5>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{activeModalItem.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  닫기
                </button>
                <a
                  href={activeModalItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-center hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  미술관 바로가기 ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. 하단 푸터 */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <p className="font-bold text-slate-200 text-sm">부울경 아트·전시 나들이 (art-buk)</p>
            <p className="mt-1 text-slate-400">
              부산광역시 · 울산광역시 · 경상남도 전시 및 미술관 공공데이터 통합 포털
            </p>
            <p className="mt-1 text-slate-500">
              본 사이트의 전시 데이터는 한국문화정보원 문화공공데이터 및 공공누리(KOGL) 오픈API를 활용합니다.
            </p>
          </div>
          <div className="text-slate-500 sm:text-right">
            <p>© 2026 art-buk. All rights reserved.</p>
            <p className="mt-1">Powered by Next.js & Cloudflare Pages</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
