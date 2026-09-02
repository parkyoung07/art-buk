'use client';

import React, { useState, useMemo } from 'react';
import { LIBRARIES_DATA, LibraryItem } from '@/data/libraries';
import LibraryInfoCard from '@/components/LibraryInfoCard';

export default function LibrarySection() {
  const [selectedFilter, setSelectedFilter] = useState<'전체' | '가족특화' | '작은도서관' | '복합문화' | '부산' | '울산' | '경남'>('가족특화');

  const filteredLibraries = useMemo(() => {
    return LIBRARIES_DATA.filter((item: LibraryItem) => {
      if (selectedFilter === '전체') return true;
      if (selectedFilter === '가족특화') {
        return item.type === '어린이·가족특화' || item.features.some(f => f.includes('어린이') || f.includes('키즈') || f.includes('그림책'));
      }
      if (selectedFilter === '작은도서관') {
        return item.type === '쌈지·숲속 작은도서관';
      }
      if (selectedFilter === '복합문화') {
        return item.type === '복합문화도서관' || item.type === '시·도립 대표도서관';
      }
      return item.region === selectedFilter;
    });
  }, [selectedFilter]);

  return (
    <section id="library-section" className="py-12 sm:py-16 bg-gradient-to-b from-emerald-50/40 via-teal-50/20 to-transparent border-t border-b border-emerald-100/70 relative overflow-hidden scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 섹션 타이틀 헤더 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs mb-3 border border-emerald-200">
              <span>📚</span>
              <span>아이와 함께하는 주말 문화 나들이</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-extrabold text-[10px]">
                가족 힐링 추천
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>부울경 대표 도서관 & 쌈지 작은도서관 나들이</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
              웅장한 북타워 랜드마크부터 숲속 힐링 쌈지 작은도서관까지, 아이들과 함께 책과 쉼을 즐길 수 있는 특별한 문화공간을 소개합니다.
            </p>
          </div>

          {/* 필터 탭 */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSelectedFilter('가족특화')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '가족특화'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              👶 아이·가족특화
            </button>
            <button
              onClick={() => setSelectedFilter('작은도서관')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '작은도서관'
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              🌿 쌈지·숲속도서관
            </button>
            <button
              onClick={() => setSelectedFilter('복합문화')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '복합문화'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              🏛️ 복합문화 랜드마크
            </button>
            <button
              onClick={() => setSelectedFilter('전체')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '전체'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              전체 ({LIBRARIES_DATA.length})
            </button>
            <button
              onClick={() => setSelectedFilter('부산')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '부산'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              부산 (7)
            </button>
            <button
              onClick={() => setSelectedFilter('울산')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '울산'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              울산 (4)
            </button>
            <button
              onClick={() => setSelectedFilter('경남')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '경남'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              경남 (11)
            </button>
          </div>
        </div>

        {/* 도서관 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLibraries.map((library: LibraryItem) => (
            <LibraryInfoCard key={library.id} library={library} compact={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
