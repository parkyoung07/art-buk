'use client';

import React, { useState } from 'react';
import { LibraryItem } from '@/data/libraries';

interface LibraryInfoCardProps {
  library: LibraryItem;
  compact?: boolean;
}

export function getLibraryMapUrl(library: LibraryItem): string {
  if (library.searchQuery) {
    return `https://map.naver.com/v5/search/${encodeURIComponent(library.searchQuery)}`;
  }
  const cleanName = library.name
    .split('&')[0]
    .replace(/\(.*?\)/g, '')
    .trim();
  return `https://map.naver.com/v5/search/${encodeURIComponent(cleanName || library.address)}`;
}

export default function LibraryInfoCard({ library, compact = false }: LibraryInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const naverMapUrl = getLibraryMapUrl(library);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(library.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeBadgeStyle = () => {
    switch (library.type) {
      case '어린이·가족특화':
        return 'bg-emerald-500 text-white shadow-xs';
      case '쌈지·숲속 작은도서관':
        return 'bg-green-600 text-white shadow-xs';
      case '복합문화도서관':
        return 'bg-violet-600 text-white shadow-xs';
      case '시·도립 대표도서관':
        return 'bg-indigo-600 text-white shadow-xs';
      default:
        return 'bg-sky-600 text-white shadow-xs';
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                {library.region} · {library.subRegion}
              </span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getTypeBadgeStyle()}`}>
              {library.type}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
            <span>📚</span>
            <span>{library.name}</span>
          </h4>
          
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
            {library.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {library.features.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-950 border border-emerald-200">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-emerald-100 mt-auto">
          <span className="truncate max-w-[170px] text-slate-600" title={library.address}>
            {library.address}
          </span>
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
            title={`${library.name} 네이버 지도 길찾기`}
          >
            <span>길찾기</span>
            <span>→</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white rounded-3xl p-5 sm:p-7 border border-emerald-200/90 shadow-sm relative overflow-hidden">
      {/* 장식용 배경 아이콘 */}
      <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.06] select-none pointer-events-none">
        📖
      </div>

      {/* 헤더 섹션 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
            <span>📚</span>
            <span>{library.region} {library.subRegion} 추천 도서관</span>
          </span>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${getTypeBadgeStyle()}`}>
            {library.type}
          </span>
        </div>

        {library.openingHours && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-emerald-200">
            ⏰ {library.openingHours}
          </span>
        )}
      </div>

      {/* 도서관 이름 및 설명 */}
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <span>{library.name}</span>
          {library.type === '어린이·가족특화' && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              👶 아이동반 추천
            </span>
          )}
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {library.description}
        </p>
      </div>

      {/* 주요 시설 & 패밀리 특화 공간 */}
      <div className="mb-4 bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 sm:p-4 border border-emerald-100">
        <div className="text-xs font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
          <span>✨</span>
          <span>가족과 함께 즐기는 주요 시설 & 테마 공간</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {library.features.map((item, idx) => (
            <span
              key={idx}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 가족 나들이 꿀팁 */}
      <div className="mb-5 bg-emerald-100/60 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-emerald-950 leading-relaxed flex items-start gap-2.5">
        <span className="text-base shrink-0 mt-0.5">💡</span>
        <div>
          <strong className="font-bold block text-emerald-900 mb-0.5">아이와 함께하는 도서관 나들이 꿀팁:</strong>
          <span>{library.familyTips}</span>
        </div>
      </div>

      {/* 하단 주소, 휴관일 및 네이버 지도 연동 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t border-emerald-200/80 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-800">위치:</span>
            <span className="text-slate-700">{library.address}</span>
            <button
              onClick={handleCopyAddress}
              type="button"
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline ml-1 cursor-pointer"
            >
              {copied ? '✅ 복사완료' : '주소복사'}
            </button>
          </div>
          {library.closedDays && (
            <div className="text-[11px] text-rose-600 font-semibold">
              (휴관: {library.closedDays})
            </div>
          )}
        </div>

        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-xs px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-emerald-800 transition-colors shadow-xs shrink-0 cursor-pointer"
          title={`${library.name} 네이버 지도 길찾기`}
        >
          <span>네이버 지도로 보기</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
