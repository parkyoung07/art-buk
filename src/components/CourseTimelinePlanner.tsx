"use client";

import { useState } from "react";
import { Exhibition } from "@/types/art";
import { TraditionalMarket } from "@/data/markets";
import { LibraryItem } from "@/data/libraries";

interface CourseTimelinePlannerProps {
  exhibition: Exhibition;
  nearbyMarket?: TraditionalMarket;
  nearbyLibrary?: LibraryItem;
  localPlaces?: Array<{ title: string; category?: string; address?: string; roadAddress?: string; link?: string }>;
}

export default function CourseTimelinePlanner({
  exhibition,
  nearbyMarket,
  nearbyLibrary,
  localPlaces = [],
}: CourseTimelinePlannerProps) {
  const [copied, setCopied] = useState(false);

  // 1. 장소 데이터 조립
  const venueTitle = exhibition.venueName || exhibition.location;
  const foodSpot = localPlaces[0]?.title
    ? localPlaces[0].title.replace(/<[^>]*>?/gm, "")
    : `${exhibition.region} 로컬 대표 미식`;
  const foodCategory = localPlaces[0]?.category || "지역 맛집 / 먹거리";
  const foodAddress = localPlaces[0]?.address || exhibition.address || exhibition.location;

  const marketOrLib = nearbyMarket
    ? {
        name: nearbyMarket.name,
        type: nearbyMarket.marketType,
        desc: nearbyMarket.specialties.join(", ") + " 먹거리",
        tag: "🧺 전통시장 5일장",
        address: nearbyMarket.address,
      }
    : nearbyLibrary
    ? {
        name: nearbyLibrary.name,
        type: nearbyLibrary.type,
        desc: nearbyLibrary.features.slice(0, 2).join(", "),
        tag: "📚 복합문화도서관",
        address: nearbyLibrary.address,
      }
    : {
        name: `${exhibition.region} 문화예술 산책길`,
        type: "야외 산책로",
        desc: "고즈넉한 원도심 골목 & 예술 쉼터",
        tag: "🌿 힐링 산책",
        address: exhibition.address || exhibition.location,
      };

  const cafeSpot = localPlaces[1]?.title
    ? localPlaces[1].title.replace(/<[^>]*>?/gm, "")
    : exhibition.nearbySpots && exhibition.nearbySpots.length > 0
    ? exhibition.nearbySpots[0]
    : "감성 로컬 카페";

  // 4단계 코스 구성
  const steps = [
    {
      step: 1,
      time: "10:30",
      category: "🎨 감성 전시 관람",
      title: exhibition.title,
      subTitle: venueTitle,
      duration: "약 1시간 30분",
      highlight: exhibition.curatorNote || exhibition.description,
      address: exhibition.address || exhibition.location,
      mapQuery: venueTitle,
    },
    {
      step: 2,
      time: "12:30",
      category: "🍽️ 로컬 미식 탐방",
      title: foodSpot,
      subTitle: foodCategory,
      duration: "약 1시간",
      highlight: `전시장 인근 평점 높은 추천 맛집 (${foodAddress})`,
      address: foodAddress,
      mapQuery: foodSpot,
    },
    {
      step: 3,
      time: "14:00",
      category: marketOrLib.tag,
      title: marketOrLib.name,
      subTitle: marketOrLib.type,
      duration: "약 1시간",
      highlight: marketOrLib.desc,
      address: marketOrLib.address,
      mapQuery: marketOrLib.name,
    },
    {
      step: 4,
      time: "15:30",
      category: "☕ 디저트 & 뷰 카페",
      title: cafeSpot,
      subTitle: "감성 힐링 쉼표",
      duration: "약 1시간",
      highlight: "향긋한 커피와 디저트를 즐기며 하루를 마무리하는 여유",
      address: exhibition.region,
      mapQuery: `${exhibition.region} ${cafeSpot}`,
    },
  ];

  // 카카오톡 코스 공유 핸들러
  const handleShareCourse = async () => {
    const courseUrl = typeof window !== "undefined" ? window.location.href : "https://nadriai.com";
    const shareText = `[부울경 나들이 코스 추천 🗺️]\n\n📍 ${exhibition.title}\n\n1코스: ${venueTitle} (전시 관람)\n2코스: ${foodSpot} (점심 식사)\n3코스: ${marketOrLib.name} (${marketOrLib.tag})\n4코스: ${cafeSpot} (감성 카페)\n\n👉 세부 일정 & 지도 보기:\n${courseUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `[부울경 나들이 코스] ${exhibition.title}`,
          text: shareText,
          url: courseUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // 클립보드 복사
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert("코스 내용이 복사되었습니다. 카카오톡에 붙여넣기(Ctrl+V) 하세요!");
    }
  };

  return (
    <section className="my-10 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
      {/* 트리플 스타일 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[11px] tracking-wider uppercase shadow-xs">
              TRIPLE PLAN
            </span>
            <span className="text-xs font-bold text-indigo-600">
              트리플 스타일 나들이 동선 플래너
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            하루 완성! 추천 연계 코스 (총 4개 스팟)
          </h2>
        </div>

        {/* 원클릭 공유 버튼 */}
        <button
          onClick={handleShareCourse}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
        >
          <span>💛</span>
          <span>{copied ? "코스 복사 완료! (카톡에 붙여넣기)" : "카톡으로 코스 공유하기"}</span>
        </button>
      </div>

      {/* 4단계 타임라인 코스 */}
      <div className="relative mt-8 space-y-6 before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-linear-to-b before:from-indigo-500 before:via-slate-200 before:to-transparent">
        {steps.map((item) => (
          <div key={item.step} className="relative flex items-start gap-4 sm:gap-6 group">
            {/* 타임라인 번호 원 */}
            <div className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-600 font-black text-sm sm:text-base shadow-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {item.step}
            </div>

            {/* 코스 세부 카드 */}
            <div className="flex-1 rounded-2xl bg-slate-50/90 hover:bg-slate-50 p-4 sm:p-5 border border-slate-200/80 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {item.time} 출발 · 체류 {item.duration}
                  </span>
                </div>

                {/* 네이버 지도 바로 열기 */}
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(item.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                >
                  <span>📍 길찾기</span>
                </a>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {item.highlight}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 트리플 스타일 팁 */}
      <div className="mt-8 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <span>💡</span>
          <span className="font-semibold">
            이 동선은 이동 거리를 최소화한 부울경 현지 맞춤 추천 루트입니다.
          </span>
        </div>
        <a
          href={`https://map.naver.com/v5/search/${encodeURIComponent(venueTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
        >
          네이버 지도로 전체 위치 확인 ➔
        </a>
      </div>
    </section>
  );
}
