"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadge from "@/components/TrustBadge";
import LibraryInfoCard from "@/components/LibraryInfoCard";
import { LIBRARIES_DATA, LibraryItem } from "@/data/libraries";

export default function LibrariesPage() {
  const [selectedFilter, setSelectedFilter] = useState<
    "전체" | "가족특화" | "작은도서관" | "복합문화" | "부산" | "울산" | "경남"
  >("가족특화");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 지역별 수치 동적 계산
  const busanCount = useMemo(() => LIBRARIES_DATA.filter((l) => l.region === "부산").length, []);
  const ulsanCount = useMemo(() => LIBRARIES_DATA.filter((l) => l.region === "울산").length, []);
  const gyeongnamCount = useMemo(
    () => LIBRARIES_DATA.filter((l) => l.region === "경남").length,
    []
  );

  // 테마별 수치 동적 계산
  const familyCount = useMemo(
    () =>
      LIBRARIES_DATA.filter(
        (l) =>
          l.type === "어린이·가족특화" ||
          l.features.some((f) => f.includes("어린이") || f.includes("키즈") || f.includes("그림책"))
      ).length,
    []
  );
  const smallCount = useMemo(
    () => LIBRARIES_DATA.filter((l) => l.type === "쌈지·숲속 작은도서관").length,
    []
  );
  const complexCount = useMemo(
    () =>
      LIBRARIES_DATA.filter(
        (l) => l.type === "복합문화도서관" || l.type === "시·도립 대표도서관"
      ).length,
    []
  );

  // 필터링 결과
  const filteredLibraries = useMemo(() => {
    return LIBRARIES_DATA.filter((item: LibraryItem) => {
      // 1. 탭 필터
      if (selectedFilter === "가족특화") {
        const isFam =
          item.type === "어린이·가족특화" ||
          item.features.some(
            (f) => f.includes("어린이") || f.includes("키즈") || f.includes("그림책")
          );
        if (!isFam) return false;
      } else if (selectedFilter === "작은도서관") {
        if (item.type !== "쌈지·숲속 작은도서관") return false;
      } else if (selectedFilter === "복합문화") {
        if (item.type !== "복합문화도서관" && item.type !== "시·도립 대표도서관") return false;
      } else if (selectedFilter !== "전체") {
        if (item.region !== selectedFilter) return false;
      }

      // 2. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${item.name} ${item.region} ${item.subRegion} ${item.address} ${item.features.join(" ")} ${item.type}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [selectedFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 페이지 타이틀 & 뱃지 */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span>📚</span>
              <span>부울경 대표 도서관 & 쌈지 작은도서관 탐방</span>
            </div>
            <TrustBadge source="지자체 도서관 통합포털 & 공공데이터" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            부산 · 울산 · 경남 도서관 전체보기
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            웅장한 북타워 랜드마크부터 숲속 힐링 쌈지 작은도서관까지, 아이들과 함께 책과 쉼을 즐길 수 있는 {LIBRARIES_DATA.length}개 특별한 문화공간을 만나보세요.
          </p>
        </div>

        {/* 필터 및 검색 바 */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 필터 탭 */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedFilter("가족특화")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "가족특화"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                👶 아이·가족특화 ({familyCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("작은도서관")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "작은도서관"
                    ? "bg-green-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                🌿 쌈지·숲속도서관 ({smallCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("복합문화")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedFilter === "복합문화"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                🏛️ 복합문화 랜드마크 ({complexCount})
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
                전체 ({LIBRARIES_DATA.length})
              </button>
            </div>

            {/* 검색창 */}
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="도서관명, 지역, 특화시설 검색..."
                className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
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

          {/* 지역별 바로가기 칩 (동적 수치 반영) */}
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

        {/* 결과 헤더 */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-bold text-slate-600">
            총 <span className="text-emerald-700 font-black">{filteredLibraries.length}</span>개의 도서관
          </p>
        </div>

        {/* 도서관 그리드 */}
        {filteredLibraries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <span className="text-4xl block mb-2">📚</span>
            <h3 className="font-bold text-slate-800 text-base">해당 조건의 도서관 정보가 없습니다.</h3>
            <p className="text-xs text-slate-500 mt-1">필터를 초기화하거나 다른 검색어를 입력해 보세요.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("전체");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              전체 도서관 둘러보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibraries.map((library) => (
              <LibraryInfoCard key={library.id} library={library} compact={false} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
