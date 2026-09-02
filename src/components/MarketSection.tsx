'use client';

import React, { useState, useMemo } from 'react';
import { TRADITIONAL_MARKETS } from '@/data/markets';
import { getMarketStatus } from '@/utils/market';
import MarketInfoCard from '@/components/MarketInfoCard';

export default function MarketSection() {
  const [selectedFilter, setSelectedFilter] = useState<'전체' | '오늘장날' | '부산' | '울산' | '경남'>('오늘장날');

  // 시장별 상태 계산 및 필터링
  const marketsWithStatus = useMemo(() => {
    return TRADITIONAL_MARKETS.map(market => ({
      market,
      status: getMarketStatus(market)
    }));
  }, []);

  const filteredMarkets = useMemo(() => {
    if (selectedFilter === '오늘장날') {
      return marketsWithStatus.filter(item => item.status.badgeType === 'today' || item.status.badgeType === 'tomorrow');
    }
    if (selectedFilter === '전체') {
      return marketsWithStatus;
    }
    return marketsWithStatus.filter(item => item.market.region === selectedFilter);
  }, [marketsWithStatus, selectedFilter]);

  const todayCount = useMemo(() => {
    return marketsWithStatus.filter(item => item.status.badgeType === 'today').length;
  }, [marketsWithStatus]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-amber-50/40 via-orange-50/20 to-transparent border-t border-b border-amber-100/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 섹션 타이틀 헤더 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs mb-3 border border-amber-200">
              <span>🧺</span>
              <span>미술관 옆 로컬 미식 탐방</span>
              {todayCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-extrabold text-[10px] animate-pulse">
                  오늘 {todayCount}곳 장날!
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>부울경 5일장 & 전통 재래시장 나들이</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
              전시 관람 후 들르기 좋은 39개 시·군·구 대표 전통시장과 5일장 장날 정보를 실시간으로 확인하세요.
            </p>
          </div>

          {/* 필터 탭 */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSelectedFilter('오늘장날')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '오늘장날'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              🔥 오늘/내일 장날
            </button>
            <button
              onClick={() => setSelectedFilter('전체')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '전체'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              전체 ({marketsWithStatus.length})
            </button>
            <button
              onClick={() => setSelectedFilter('부산')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '부산'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              부산 (16)
            </button>
            <button
              onClick={() => setSelectedFilter('울산')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '울산'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              울산 (6)
            </button>
            <button
              onClick={() => setSelectedFilter('경남')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === '경남'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              경남 (17)
            </button>
          </div>
        </div>

        {/* 시장 카드 그리드 */}
        {filteredMarkets.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300">
            <span className="text-4xl block mb-2">🧺</span>
            <p className="font-bold text-slate-700 text-sm">해당 조건의 전통시장 정보가 없습니다.</p>
            <button
              onClick={() => setSelectedFilter('전체')}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              전체 시장 둘러보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMarkets.map(({ market }) => (
              <MarketInfoCard key={market.id} market={market} compact={true} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
