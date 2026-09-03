"use client";

import { Exhibition } from "@/types/art";

interface PointOfViewCardProps {
  exhibition: Exhibition;
}

export default function PointOfViewCard({ exhibition }: PointOfViewCardProps) {
  // 전시 특성에 따른 맞춤형 팁 및 소요시간 계산
  const isFree = exhibition.isFree;
  const isLargeVenue = /미술관|박물관|비엔날레|문화회관|아트센터/i.test(exhibition.venueName || exhibition.location);
  const estTime = isLargeVenue ? "1시간 30분 ~ 2시간" : "45분 ~ 1시간";
  
  // 주차 꿀팁
  const parkingTip = /시민공원|문화플랫폼|역사|전철|지하철/i.test(exhibition.venueName || exhibition.location)
    ? "도시철도·대중교통 이용 권장 (인근 공영주차장)"
    : "전시장 전용 주차장 구비 (주차 편리)";

  // 인생샷 포인트 추출
  const photoSpot = exhibition.nearbySpots && exhibition.nearbySpots.length > 0
    ? `${exhibition.nearbySpots[0]} 및 전시장 메인 아치 로비`
    : "중앙 로비 미디어월 및 야외 조각 정원";

  // 29CM 스타일 감성 카피
  const editorNote = exhibition.curatorNote || exhibition.description;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-white/10">
      {/* 29CM 스타일 배경 액센트 */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

      {/* 헤더: 29CM's Point of View */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500 text-white font-black text-xs tracking-wider shadow-xs">
            29
          </span>
          <span className="text-xs sm:text-sm font-bold tracking-widest text-indigo-200 uppercase">
            Curator&apos;s Point of View
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10">
          ✨ 에디터 감성 3줄 요약
        </span>
      </div>

      {/* 3대 핵심 꿀팁 배지 (29CM / 트리플 융합) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg shrink-0">
            ⏱️
          </div>
          <div>
            <div className="text-[11px] text-slate-300 font-medium">추천 관람 시간</div>
            <div className="text-xs sm:text-sm font-bold text-white tracking-tight">{estTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg shrink-0">
            {isFree ? "🎟️" : "🏷️"}
          </div>
          <div>
            <div className="text-[11px] text-slate-300 font-medium">관람료 혜택</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-300 tracking-tight">
              {isFree ? "전액 무료 관람" : exhibition.price}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg shrink-0">
            🚗
          </div>
          <div>
            <div className="text-[11px] text-slate-300 font-medium">주차 & 접근성</div>
            <div className="text-xs sm:text-sm font-bold text-amber-200 tracking-tight truncate max-w-[150px]">
              {parkingTip.split("(")[0]}
            </div>
          </div>
        </div>
      </div>

      {/* 29CM 에디토리얼 3줄 요약 본문 */}
      <div className="relative z-10 space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 text-indigo-400 font-bold">01.</span>
          <p className="leading-snug">
            <strong className="text-white font-semibold">왜 지금 가야 할까?</strong> — {editorNote}
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 text-rose-400 font-bold">02.</span>
          <p className="leading-snug">
            <strong className="text-white font-semibold">인생샷 포토존</strong> — {photoSpot}에서 자연광을 머금은 감성 사진을 남겨보세요.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 text-amber-400 font-bold">03.</span>
          <p className="leading-snug">
            <strong className="text-white font-semibold">방문 꿀팁</strong> — {parkingTip}
          </p>
        </div>
      </div>
    </div>
  );
}
