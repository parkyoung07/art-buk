"use client";

import Link from "next/link";
import { Exhibition } from "@/types/art";
import { calculateDDay } from "@/utils/date";

interface EditorPickSectionProps {
  exhibitions: Exhibition[];
}

export default function EditorPickSection({ exhibitions }: EditorPickSectionProps) {
  // 에디터스 픽 3곳 선정: 부산비엔날레, 울산시립미술관, 경남도립미술관
  const pickIds = [
    "busan-biennale-2026",
    "ulsan-media-art-2026",
    "gyeongnam-autumn-masterpiece"
  ];

  const editorPicks = exhibitions.filter((item) => pickIds.includes(item.id));

  if (editorPicks.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold border border-amber-500/20 mb-2">
            <span>🌟</span>
            <span>2026 가을 시즌 큐레이터 추천</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            이번 주 에디터스 픽 (Editor&apos;s Pick TOP 3)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            부울경 39개 지역 전시 중 이번 주말 절대 놓쳐선 안 될 대표 명품전을 소개합니다.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:block">
          매주 월요일 업데이트
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {editorPicks.map((item, index) => {
          const dDayInfo = calculateDDay(item.endDate, item.startDate);
          return (
            <div
              key={item.id}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* 상단 랭킹 뱃지 */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                  0{index + 1}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-black/70 backdrop-blur-md text-white border border-white/20">
                  {item.region} · {item.subRegion}
                </span>
              </div>

              {/* D-Day 뱃지 */}
              <div className="absolute top-3 right-3 z-20">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-md ${
                    dDayInfo.badgeType === "urgent"
                      ? "bg-rose-600 text-white animate-pulse"
                      : dDayInfo.badgeType === "soon"
                      ? "bg-amber-500 text-slate-950 font-extrabold"
                      : "bg-emerald-600 text-white font-extrabold"
                  }`}
                >
                  {dDayInfo.badgeText}
                </span>
              </div>

              {/* 이미지 영역 */}
              <Link
                href={`/events/${item.id}`}
                className="relative h-52 w-full overflow-hidden block bg-slate-950"
              >
                {item.thumbnailUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${item.thumbnailUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent"></div>
                  </div>
                ) : (
                  <div className={`absolute inset-0 ${item.posterTheme || "bg-gradient-to-br from-indigo-950 to-slate-900"}`}></div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <span className="text-[11px] font-bold text-amber-300 block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2 group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </Link>

              {/* 본문 정보 */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold">🏛️ 장소:</span>
                      <span className="font-bold text-slate-800 line-clamp-1">{item.venueName || item.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold">📅 기간:</span>
                      <span>{item.period}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold">🎟️ 요금:</span>
                      <span className={item.isFree ? "text-emerald-600 font-extrabold" : "text-slate-800 font-bold"}>
                        {item.price}
                      </span>
                    </div>
                  </div>

                  {item.curatorNote && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 leading-relaxed font-medium">
                      <span className="font-bold text-amber-700 mr-1">💡 큐레이터 추천:</span>
                      {item.curatorNote}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    주변 명소 {item.nearbySpots?.length || 0}곳 연계
                  </span>
                  <Link
                    href={`/events/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>상세보기 & 길찾기</span>
                    <span>➔</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
