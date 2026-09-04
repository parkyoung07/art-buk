"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExhibitionSimpleCard from "@/components/ExhibitionSimpleCard";
import TrustBadge from "@/components/TrustBadge";
import rawData from "../../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

const exhibitionsData: Exhibition[] = rawData as Exhibition[];

const THEME_OPTIONS = [
  "전체 테마",
  "📸 인생샷/포토존",
  "🌿 자연/힐링",
  "🏛️ 역사/세계유산",
  "👶 가족/체험",
  "🎬 미디어/현대미술",
] as const;

export default function ExhibitionsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("전체");
  const [showOnlyFree, setShowOnlyFree] = useState<boolean>(false);
  const [showOnlyClosingSoon, setShowOnlyClosingSoon] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("전체 테마");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 지역별 개수 계산 (100% 동적)
  const regionCounts = useMemo(() => {
    const counts = { 전체: exhibitionsData.length, 부산: 0, 울산: 0, 경남: 0 };
    exhibitionsData.forEach((item) => {
      if (item.region in counts) {
        counts[item.region as keyof typeof counts]++;
      }
    });
    return counts;
  }, []);

  // 하위 구·군 목록
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
      return text.includes("포토") || text.includes("뷰") || text.includes("야경") || text.includes("오션") || text.includes("인생샷") || text.includes("사진");
    }
    if (theme === "🌿 자연/힐링") {
      return text.includes("자연") || text.includes("힐링") || text.includes("야외") || text.includes("숲") || text.includes("공원") || text.includes("생태");
    }
    if (theme === "🏛️ 역사/세계유산") {
      return text.includes("역사") || text.includes("유산") || text.includes("고고") || text.includes("전통") || text.includes("근현대") || text.includes("유물");
    }
    if (theme === "👶 가족/체험") {
      return text.includes("어린이") || text.includes("가족") || text.includes("체험") || text.includes("키즈") || text.includes("교육");
    }
    if (theme === "🎬 미디어/현대미술") {
      return text.includes("미디어") || text.includes("현대미술") || text.includes("설치") || text.includes("빛") || text.includes("영상");
    }
    return true;
  };

  // 필터링 결과
  const filteredExhibitions = useMemo(() => {
    return exhibitionsData.filter((item) => {
      if (selectedRegion !== "전체" && item.region !== selectedRegion) return false;
      if (selectedSubRegion !== "전체" && item.subRegion !== selectedSubRegion) return false;
      if (showOnlyFree && !item.isFree) return false;
      if (!matchesTheme(item, selectedTheme)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = `${item.title} ${item.venueName || ""} ${item.location} ${item.region} ${item.subRegion || ""} ${item.category} ${item.description}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [selectedRegion, selectedSubRegion, showOnlyFree, selectedTheme, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 페이지 타이틀 & 뱃지 */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <span>🎨</span>
              <span>부울경 전체 미술관 & 전시 탐색</span>
            </div>
            <TrustBadge />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            부산 · 울산 · 경남 전시 전체보기
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            현재 진행 중인 {exhibitionsData.length}개 주요 전시의 관람료, AI 추천 포인트, 위치를 비교하고 원하는 전시를 찾아보세요.
          </p>
        </div>

        {/* 필터 및 검색 컨트롤 */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 1차 지역 필터 탭 */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
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
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    <span>{region}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 검색 및 필터 옵션 */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="전시명, 미술관명 검색..."
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
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

              {/* 무료 필터 */}
              <button
                type="button"
                onClick={() => setShowOnlyFree((prev) => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  showOnlyFree
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500"
                }`}
              >
                🎁 무료 전시
              </button>

              {/* 뷰 모드 전환 */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  🎴 카드
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === "list" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  📋 목록
                </button>
              </div>
            </div>
          </div>

          {/* 세부 구·군 칩 */}
          {selectedRegion !== "전체" && availableSubRegions.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">📍 시·군·구:</span>
              <button
                type="button"
                onClick={() => setSelectedSubRegion("전체")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSubRegion === "전체"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                전체
              </button>
              {availableSubRegions.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubRegion(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedSubRegion === sub
                      ? "bg-indigo-600 text-white font-bold shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* 테마 필터 칩 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0">🏷️ 테마:</span>
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTheme === theme
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 통계 헤더 */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-bold text-slate-600">
            총 <span className="text-indigo-600 font-black">{filteredExhibitions.length}</span>개의 전시
          </p>
        </div>

        {/* 전시 그리드 / 리스트 */}
        {filteredExhibitions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <span className="text-4xl block mb-2">🎨</span>
            <h3 className="font-bold text-slate-800 text-base">선택한 조건의 전시가 없습니다.</h3>
            <p className="text-xs text-slate-500 mt-1">필터를 초기화하거나 다른 지역/테마를 검색해 보세요.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion("전체");
                setSelectedSubRegion("전체");
                setSelectedTheme("전체 테마");
                setShowOnlyFree(false);
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExhibitions.map((exhibition) => (
              <ExhibitionSimpleCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExhibitions.map((exhibition) => (
              <div
                key={exhibition.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                      {exhibition.region} {exhibition.subRegion}
                    </span>
                    <span className="text-xs text-slate-500">{exhibition.venueName || exhibition.location}</span>
                    {exhibition.isFree && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                        무료
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    <Link href={`/events/${exhibition.id}`} className="hover:text-indigo-600 transition-colors">
                      {exhibition.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-400">{exhibition.period}</p>
                </div>

                <Link
                  href={`/events/${exhibition.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white font-bold text-xs transition-all text-center shrink-0"
                >
                  상세보기 →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
