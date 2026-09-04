"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadge from "@/components/TrustBadge";
import MarketInfoCard from "@/components/MarketInfoCard";
import { TRADITIONAL_MARKETS } from "@/data/markets";
import { getMarketStatus } from "@/utils/market";

export default function MarketsPage() {
  const [selectedFilter, setSelectedFilter] = useState<
    "오늘장날" | "정기5일장" | "상설시장" | "전체" | "부산" | "울산" | "경남"
  >("오늘장날");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 시장별 상태 계산
  const marketsWithStatus = useMemo(() => {
    return TRADITIONAL_MARKETS.map((market) => ({
      market,
      status: getMarketStatus(market),
    }));
  }, []);

  // 통계 계산 (100% 동적 계산)
  const todayCount = useMemo(
    () => marketsWithStatus.filter((item) => item.status.badgeType === "today").length,
    [marketsWithStatus]
  );
  const fiveDayCount = useMemo(
    () => marketsWithStatus.filter((item) => item.market.marketType === "5일장").length,
    [marketsWithStatus]
  );
  const permanentCount = useMemo(
    () =>
      marketsWithStatus.filter(
        (item) => item.market.marketType === "상설시장" || item.market.marketType === "새벽시장"
      ).length,
    [marketsWithStatus]
  );
  const busanCount = useMemo(
    () => marketsWithStatus.filter((item) => item.market.region === "부산").length,
    [marketsWithStatus]
  );
  const ulsanCount = useMemo(
    () => marketsWithStatus.filter((item) => item.market.region === "울산").length,
    [marketsWithStatus]
  );
  const gyeongnamCount = useMemo(
    () => marketsWithStatus.filter((item) => item.market.region === "경남").length,
    [marketsWithStatus]
  );

  // 필터링 결과
  const filteredMarkets = useMemo(() => {
    return marketsWithStatus.filter((item) => {
      // 1. 탭 필터
      if (selectedFilter === "오늘장날") {
        if (item.status.badgeType !== "today" && item.status.badgeType !== "tomorrow") return false;
      } else if (selectedFilter === "정기5일장") {
        if (item.market.marketType !== "5일장") return false;
      } else if (selectedFilter === "상설시장") {
        if (item.market.marketType !== "상설시장" && item.market.marketType !== "새벽시장")
          return false;
      } else if (selectedFilter !== "전체") {
        if (item.market.region !== selectedFilter) return false;
      }

      // 2. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${item.market.name} ${item.market.region} ${item.market.subRegion} ${item.market.address} ${(item.market.specialties || []).join(" ")}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [marketsWithStatus, selectedFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 페이지 타이틀 & 뱃지 */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span>🧺</span>
              <span>부울경 5일장 & 전통시장 실시간 장날</span>
              {todayCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-black text-[10px] animate-pulse">
                  오늘 {todayCount}곳 개장
                </span>
              )}
            </div>
            <TrustBadge source="지자체 시장정보 & 실시간 달력 계산" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            부산 · 울산 · 경남 5일장 & 전통시장 전체보기
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            오늘 열리는 장날부터 {TRADITIONAL_MARKETS.length}개 대표 재래시장의 장날 주기와 대표 먹거리 특산물을 한눈에 확인하세요.
          </p>
        </div>

        {/* 필터 및 검색 바 */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 필터 탭 */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedFilter("오늘장날")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "오늘장날"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                🔥 오늘·내일 장날 ({todayCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("정기5일장")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "정기5일장"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                🔴 정기 5일장 ({fiveDayCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("상설시장")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "상설시장"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                🏛️ 상설 재래시장 ({permanentCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("전체")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "전체"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                전체 ({TRADITIONAL_MARKETS.length})
              </button>
            </div>

            {/* 검색창 */}
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="시장명, 특산물, 지역 검색..."
                className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 지역별 바로가기 칩 */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">📍 광역 지역:</span>
            {[
              { id: "부산", count: busanCount },
              { id: "울산", count: ulsanCount },
              { id: "경남", count: gyeongnamCount },
            ].map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setSelectedFilter(reg.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === reg.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {reg.id} ({reg.count})
              </button>
            ))}
          </div>
        </div>

        {/* 결과 통계 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">
              전체 등록 시장 <b className="text-slate-900 font-bold">{TRADITIONAL_MARKETS.length}곳</b>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-700">
              현재 조건 검색 결과 <b className="text-amber-600 font-black">{filteredMarkets.length}곳</b>
            </span>
          </div>
          {filteredMarkets.length !== TRADITIONAL_MARKETS.length && (
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("전체");
                setSearchQuery("");
              }}
              className="text-slate-500 hover:text-indigo-600 font-bold underline cursor-pointer"
            >
              전체 목록 보기 ({TRADITIONAL_MARKETS.length}곳)
            </button>
          )}
        </div>

        {/* 시장 그리드 */}
        {filteredMarkets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <span className="text-4xl block mb-2">🧺</span>
            <h3 className="font-bold text-slate-800 text-base">해당 조건의 전통시장 정보가 없습니다.</h3>
            <p className="text-xs text-slate-500 mt-1">필터를 초기화하거나 다른 검색어를 입력해 보세요.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("전체");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              전체 시장 둘러보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map(({ market }) => (
              <MarketInfoCard key={market.id} market={market} compact={false} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
