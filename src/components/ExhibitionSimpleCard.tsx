"use client";

import React from "react";
import Link from "next/link";
import { Exhibition } from "@/types/art";
import { calculateDDay } from "@/utils/date";

interface ExhibitionSimpleCardProps {
  exhibition: Exhibition;
}

export default function ExhibitionSimpleCard({ exhibition }: ExhibitionSimpleCardProps) {
  const dDayInfo = calculateDDay(exhibition.endDate || exhibition.period, exhibition.startDate);

  // AI 한 줄 추천 텍스트 추출/정제
  const aiOneLiner =
    exhibition.curatorNote ||
    exhibition.tag ||
    (exhibition.description ? exhibition.description.slice(0, 45) + "..." : "부울경 추천 명품 전시");

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 1. 이미지 영역 (16:9 또는 4:3 비율) */}
      <Link href={`/events/${exhibition.id}`} className="relative aspect-[16/10] bg-slate-100 overflow-hidden block">
        {exhibition.thumbnailUrl ? (
          <img
            src={exhibition.thumbnailUrl}
            alt={exhibition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-400 p-4 text-center">
            <span className="text-3xl mb-1">🎨</span>
            <span className="text-xs font-bold text-slate-500">{exhibition.venueName || exhibition.location}</span>
          </div>
        )}

        {/* 뱃지 오버레이 */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {/* 지역 뱃지 */}
          <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white font-bold text-[11px] shadow-xs">
            {exhibition.region} {exhibition.subRegion ? `· ${exhibition.subRegion}` : ""}
          </span>

          {/* 무료/유료 뱃지 */}
          {exhibition.isFree ? (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[11px] shadow-xs">
              무료
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-slate-800/70 backdrop-blur-md text-white font-medium text-[11px] shadow-xs">
              {exhibition.price && exhibition.price.includes("원") ? exhibition.price.split(" ")[0] : "유료"}
            </span>
          )}
        </div>

        {/* D-Day / 진행 상태 뱃지 */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-xs backdrop-blur-md ${
              dDayInfo.badgeType === "urgent"
                ? "bg-rose-600 text-white animate-pulse"
                : dDayInfo.badgeType === "soon"
                ? "bg-amber-600 text-white"
                : dDayInfo.badgeType === "upcoming"
                ? "bg-sky-600 text-white"
                : dDayInfo.badgeType === "ended"
                ? "bg-slate-600 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {dDayInfo.badgeText}
          </span>
        </div>

        {/* 오늘 관람 가능 태그 */}
        <div className="absolute bottom-2 left-2.5 z-10">
          {dDayInfo.isOpenToday ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-slate-800 text-[10.5px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              오늘 관람 가능
            </span>
          ) : dDayInfo.badgeType === "upcoming" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/80 backdrop-blur-md text-sky-200 text-[10.5px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              개막 대기
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10.5px] font-medium shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              종료
            </span>
          )}
        </div>
      </Link>

      {/* 2. 본문 정보 영역 */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* 미술관/장소명 */}
          <p className="text-xs font-bold text-indigo-600 flex items-center gap-1">
            <span>🏛️</span>
            <span className="truncate">{exhibition.venueName || exhibition.location}</span>
          </p>

          {/* 전시 제목 */}
          <h3 className="mt-1 font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
            <Link href={`/events/${exhibition.id}`}>
              {exhibition.title}
            </Link>
          </h3>

          {/* AI 추천 한줄 요약 */}
          <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-1.5">
            <span className="text-xs shrink-0 mt-0.5">✨</span>
            <p className="text-xs text-slate-600 line-clamp-1 font-medium">
              {aiOneLiner}
            </p>
          </div>
        </div>

        {/* 3. 하단 액션 바 */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
            {exhibition.period}
          </span>

          <Link
            href={`/events/${exhibition.id}`}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white font-bold text-xs transition-all flex items-center gap-1 shrink-0"
          >
            <span>상세보기</span>
            <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
