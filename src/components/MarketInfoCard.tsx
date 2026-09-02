'use client';

import React, { useState } from 'react';
import { TraditionalMarket } from '@/data/markets';
import { getMarketStatus } from '@/utils/market';

interface MarketInfoCardProps {
  market: TraditionalMarket;
  compact?: boolean;
}

export default function MarketInfoCard({ market, compact = false }: MarketInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const status = getMarketStatus(market);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(market.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBadgeStyle = () => {
    switch (status.badgeType) {
      case 'today':
        return 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/30 animate-pulse';
      case 'tomorrow':
        return 'bg-amber-500 text-white shadow-sm shadow-amber-500/20';
      case 'permanent':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'dawn':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getMarketTypeBadge = () => {
    if (market.marketType === '5일장') {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-900 border border-amber-300/80">
          🔴 5일장 ({market.scheduleDays.join('·')}일)
        </span>
      );
    }
    if (market.marketType === '상설시장') {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-900 border border-emerald-300/80">
          🏛️ 상설시장 (매일)
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-900 border border-sky-300/80">
        🌅 새벽시장
      </span>
    );
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-2xl p-4 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {market.region} · {market.subRegion}
              </span>
              {getMarketTypeBadge()}
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getBadgeStyle()}`}>
              {status.badgeText}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
            <span>🛒</span>
            <span>{market.name}</span>
          </h4>
          
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
            {market.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {market.specialties.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-amber-100">
          <span className="truncate max-w-[180px]">{market.address}</span>
          <a
            href={`https://map.naver.com/p/search/${encodeURIComponent(market.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 hover:text-amber-900 font-bold shrink-0 hover:underline flex items-center gap-0.5"
          >
            <span>길찾기</span>
            <span>→</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white rounded-3xl p-5 sm:p-7 border border-amber-200/90 shadow-sm relative overflow-hidden">
      {/* 장식용 배경 아이콘 */}
      <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.06] select-none pointer-events-none">
        🧺
      </div>

      {/* 헤더 섹션 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
            <span>🛒</span>
            <span>{market.region} {market.subRegion}</span>
          </span>
          {getMarketTypeBadge()}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-amber-200">
            {market.scheduleDescription}
          </span>
        </div>

        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${getBadgeStyle()}`}>
          {status.badgeText}
        </span>
      </div>

      {/* 시장 이름 및 설명 */}
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <span>{market.name}</span>
          {status.isToday && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
              오늘 활기 가득!
            </span>
          )}
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {market.description}
        </p>
      </div>

      {/* 대표 먹거리 & 특산물 */}
      <div className="mb-4 bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 sm:p-4 border border-amber-100">
        <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
          <span>🍜</span>
          <span>놓치면 아쉬운 대표 장터 먹거리 & 특산품</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {market.specialties.map((item, idx) => (
            <span
              key={idx}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50/80 text-amber-950 border border-amber-200/70 hover:bg-amber-100 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 도슨트 꿀팁 */}
      <div className="mb-5 bg-amber-100/60 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-start gap-2.5">
        <span className="text-base shrink-0 mt-0.5">💡</span>
        <div>
          <strong className="font-bold block text-amber-900 mb-0.5">AI 도슨트의 장터 나들이 꿀팁:</strong>
          <span>{market.tips}</span>
        </div>
      </div>

      {/* 하단 주소 및 네이버 지도 연동 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t border-amber-200/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="font-semibold text-slate-800">위치:</span>
          <span className="text-slate-700">{market.address}</span>
          <button
            onClick={handleCopyAddress}
            type="button"
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline ml-1 cursor-pointer"
          >
            {copied ? '✅ 복사완료' : '주소복사'}
          </button>
        </div>

        <a
          href={`https://map.naver.com/p/search/${encodeURIComponent(market.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-amber-900 transition-colors shadow-xs"
        >
          <span>네이버 지도로 보기</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
