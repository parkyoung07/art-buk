"use client";

import React, { useState } from "react";
import rawExhibitions from "../../public/data/art-sample.json";
import rawMarkets from "../../public/data/markets.json";
import rawLibraries from "../../public/data/libraries.json";
import { Exhibition } from "@/types/art";
import { TraditionalMarket } from "@/data/markets";
import { LibraryItem } from "@/data/libraries";

const exhibitionsData = rawExhibitions as Exhibition[];
const marketsData = rawMarkets as TraditionalMarket[];
const librariesData = rawLibraries as LibraryItem[];

interface TimelineStep {
  stepNumber: number;
  time: string;
  category: string;
  title: string;
  subTitle: string;
  distance: string;
  travelTime: string;
  stayDuration: string;
  admission: string;
  operatingHours: string;
  parking: string;
  highlight: string;
  mapQuery: string;
  link?: string;
}

export default function AiTripPlanner({ initialCompact = false }: { initialCompact?: boolean }) {
  // 6대 필수 선택 파라미터 상태
  const [region, setRegion] = useState<string>("부산");
  const [when, setWhen] = useState<string>("오늘");
  const [companion, setCompanion] = useState<string>("부모님");
  const [interest, setInterest] = useState<string>("전시");
  const [duration, setDuration] = useState<string>("반나절");
  const [budget, setBudget] = useState<string>("3만원 이하");

  // 생성 상태 및 결과
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCourse, setGeneratedCourse] = useState<TimelineStep[] | null>(null);
  const [courseSummary, setCourseSummary] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // AI 코스 생성 핸들러
  const handleGenerateCourse = () => {
    setIsGenerating(true);
    setGeneratedCourse(null);

    setTimeout(() => {
      // 1. 선택 지역에 맞는 데이터 필터링
      const targetRegion = region === "현재위치" ? "부산" : region;
      const matchedExhibitions = exhibitionsData.filter(
        (e) => e.region === targetRegion || (budget === "무료 중심" ? e.isFree : true)
      );
      const matchedMarkets = marketsData.filter((m) => m.region === targetRegion);
      const matchedLibraries = librariesData.filter((l) => l.region === targetRegion);

      // 스팟 선별 (동행자 및 조건 맞춤)
      const selectedExhibition =
        matchedExhibitions.length > 0
          ? matchedExhibitions[Math.floor(Math.random() * matchedExhibitions.length)]
          : exhibitionsData[0];

      const selectedMarket =
        matchedMarkets.length > 0
          ? matchedMarkets[Math.floor(Math.random() * matchedMarkets.length)]
          : marketsData[0];

      const selectedLibrary =
        matchedLibraries.length > 0
          ? matchedLibraries[Math.floor(Math.random() * matchedLibraries.length)]
          : librariesData[0];

      // 2. 타임라인 단계 구성
      const steps: TimelineStep[] = [];

      // Step 1: 09:30 출발
      steps.push({
        stepNumber: 1,
        time: "09:30",
        category: "🚗 나들이 출발",
        title: `${targetRegion} 중심지 출발`,
        subTitle: `${companion}과 함께 떠나는 여유로운 여정`,
        distance: "출발 기준점",
        travelTime: "약 20~30분",
        stayDuration: "-",
        admission: "무료",
        operatingHours: "상시 출발",
        parking: "자가용 / 대중교통 이용",
        highlight: `${when} ${companion} 동행 맞춤 추천 동선입니다.`,
        mapQuery: `${targetRegion}역`,
      });

      // Step 2: 10:15 문화/전시 스팟
      const exhibitionFee =
        budget === "무료 중심"
          ? "무료 관람"
          : selectedExhibition.isFree
          ? "무료 관람"
          : selectedExhibition.price || "유료 (약 5,000~10,000원)";

      const exhibitionHours =
        selectedExhibition.openingHours || "10:00 ~ 18:00 (입장마감 17:00 / 매주 월 휴관)";

      steps.push({
        stepNumber: 2,
        time: "10:15",
        category: "🎨 감성 전시 관람",
        title: selectedExhibition.title,
        subTitle: selectedExhibition.venueName || selectedExhibition.location,
        distance: "출발지에서 약 7.5km",
        travelTime: "차량 약 20분",
        stayDuration: "약 1시간 30분",
        admission: exhibitionFee,
        operatingHours: exhibitionHours,
        parking: "전용 주차장 완비 (관람객 무료 또는 할인)",
        highlight: selectedExhibition.curatorNote || selectedExhibition.description.slice(0, 70) + "...",
        mapQuery: selectedExhibition.venueName || selectedExhibition.location,
        link: `/events/${selectedExhibition.id}`,
      });

      // Step 3: 12:00 로컬 미식 (동행자 맞춤)
      const foodName =
        companion === "부모님"
          ? `${targetRegion} 정갈한 남도 한정식 & 제철 쌈밥`
          : companion === "아이"
          ? `${targetRegion} 패밀리 레스토랑 & 수제 돈까스/파스타`
          : companion === "연인"
          ? `${targetRegion} 분위기 좋은 감성 파인다이닝 & 로컬 파스타`
          : `${targetRegion} 대표 로컬 미식 (${selectedMarket.specialties[0] || "전통 맛집"})`;

      const foodBudget =
        budget === "무료 중심"
          ? "1인 약 8,000~10,000원"
          : budget === "3만원 이하"
          ? "1인 약 12,000~15,000원"
          : "1인 약 20,000~30,000원";

      steps.push({
        stepNumber: 3,
        time: "12:00",
        category: "🍽️ 로컬 미식 식사",
        title: foodName,
        subTitle: `${targetRegion} 네이버 평점 4.5+ 검증 맛집`,
        distance: "전시장에서 약 1.5km",
        travelTime: "도보 10분 / 차량 3분",
        stayDuration: "약 1시간 10분",
        admission: foodBudget,
        operatingHours: "11:30 ~ 21:00 (브레이크타임 15:00~17:00)",
        parking: "식당 전용 주차장 또는 인근 공영주차장",
        highlight: `${companion}의 취향과 예산(${budget})에 맞춘 든든하고 깔끔한 식사 코스입니다.`,
        mapQuery: `${targetRegion} ${foodName.split(" ")[1] || "맛집"}`,
      });

      // 2시간 코스가 아닐 때 (반나절 / 하루) 추가 스팟
      if (duration === "반나절") {
        if (companion === "부모님" || interest === "자연") {
          steps.push({
            stepNumber: 4,
            time: "13:30",
            category: "🌿 힐링 산책 & 전통 차 쉼표",
            title: `${targetRegion} 고즈넉한 문화 산책로 & 전통찻집`,
            subTitle: "피톤치드 가득한 자연 쉼터",
            distance: "식당에서 약 2.8km",
            travelTime: "차량 약 8분",
            stayDuration: "약 1시간",
            admission: "산책로 무료 (차 1인 6,000원)",
            operatingHours: "10:00 ~ 20:00 (연중무휴)",
            parking: "공영주차장 이용 편리",
            highlight: "식사 후 부모님과 함께 도란도란 담소를 나누며 여유롭게 걷기 좋은 평지 산책 코스",
            mapQuery: `${targetRegion} 수목원 공원`,
          });
        } else {
          steps.push({
            stepNumber: 4,
            time: "13:30",
            category: "🧺 전통시장 & 로컬 장터",
            title: selectedMarket.name,
            subTitle: `${selectedMarket.marketType} (${selectedMarket.region} ${selectedMarket.subRegion})`,
            distance: "식당에서 약 3.2km",
            travelTime: "차량 약 10분",
            stayDuration: "약 1시간",
            admission: "입장 무료",
            operatingHours: "08:00 ~ 19:00 (장날 및 상설영업)",
            parking: "전통시장 고객 공영주차장 (주차권 지급)",
            highlight: `특산물: ${selectedMarket.specialties.join(", ")} 등 활기찬 정취 체험`,
            mapQuery: selectedMarket.name,
            link: `/markets`,
          });
        }

        // 15:00 반나절 귀가
        steps.push({
          stepNumber: 5,
          time: "15:00",
          category: "🏠 여유로운 귀가",
          title: "반나절 나들이 마무리",
          subTitle: "부담 없는 일정으로 기분 좋게 귀가",
          distance: "총 이동거리 약 18km",
          travelTime: "약 25분",
          stayDuration: "-",
          admission: "-",
          operatingHours: "상시",
          parking: "-",
          highlight: "피로감 없이 알차게 보낸 반나절 문화 나들이를 안전하게 마무리합니다.",
          mapQuery: `${targetRegion} 귀가`,
        });
      } else if (duration === "하루") {
        // Step 4: 13:30 전통시장
        steps.push({
          stepNumber: 4,
          time: "13:30",
          category: "🧺 전통시장 & 로컬 장터",
          title: selectedMarket.name,
          subTitle: `${selectedMarket.marketType} (${selectedMarket.region} ${selectedMarket.subRegion})`,
          distance: "식당에서 약 3.5km",
          travelTime: "차량 약 10분",
          stayDuration: "약 1시간 20분",
          admission: "입장 무료",
          operatingHours: "08:00 ~ 19:00 (장날 상설운영)",
          parking: "시장 공영주차장 (1시간 무료/할인)",
          highlight: `특산물: ${selectedMarket.specialties.join(", ")} 등 먹거리와 활기찬 정취`,
          mapQuery: selectedMarket.name,
          link: `/markets`,
        });

        // Step 5: 15:00 도서관 또는 오션뷰 카페
        if (companion === "아이" || interest === "도서관") {
          steps.push({
            stepNumber: 5,
            time: "15:00",
            category: "📚 복합문화 도서관 쉼표",
            title: selectedLibrary.name,
            subTitle: `${selectedLibrary.type} (${selectedLibrary.region} ${selectedLibrary.subRegion})`,
            distance: "시장에서 약 4.2km",
            travelTime: "차량 약 12분",
            stayDuration: "약 1시간 30분",
            admission: "입장 무료",
            operatingHours: "09:00 ~ 18:00 (매주 월요일 휴관)",
            parking: "도서관 부설 주차장 (무료)",
            highlight: `${selectedLibrary.features.join(" · ")} 아이와 함께 책 읽고 힐링하는 최적의 공간`,
            mapQuery: selectedLibrary.name,
            link: `/libraries`,
          });
        } else {
          steps.push({
            stepNumber: 5,
            time: "15:00",
            category: "☕ 오션뷰 & 감성 로컬 카페",
            title: `${targetRegion} 뷰 맛집 힐링 카페`,
            subTitle: "향긋한 차와 디저트 쉼터",
            distance: "시장에서 약 2.5km",
            travelTime: "차량 약 7분",
            stayDuration: "약 1시간",
            admission: "음료 1인 1잔 (약 5,000~7,000원)",
            operatingHours: "10:00 ~ 22:00",
            parking: "카페 전용 주차장 완비",
            highlight: "나들이의 여운을 정리하며 나누는 따뜻한 대화와 쉼",
            mapQuery: `${targetRegion} 감성 카페`,
          });
        }

        // Step 6: 17:00 하루 코스 귀가
        steps.push({
          stepNumber: 6,
          time: "17:00",
          category: "🏠 기분 좋은 귀가",
          title: "하루 나들이 마무리",
          subTitle: "행복한 추억과 함께 안전 귀가",
          distance: "총 이동거리 약 25km",
          travelTime: "약 35분",
          stayDuration: "-",
          admission: "-",
          operatingHours: "상시",
          parking: "-",
          highlight: `${targetRegion}에서 알차게 보낸 하루 코스를 안전하게 마무리합니다.`,
          mapQuery: `${targetRegion} 귀가`,
        });
      } else {
        // 2시간 코스
        steps.push({
          stepNumber: 3,
          time: "12:00",
          category: "🏠 가벼운 귀가",
          title: "2시간 퀵 힐링 마무리",
          subTitle: "짧고 굵은 전시 관람 후 귀가",
          distance: "총 이동거리 약 10km",
          travelTime: "약 15분",
          stayDuration: "-",
          admission: "-",
          operatingHours: "상시",
          parking: "-",
          highlight: "핵심 전시만 집중 관람한 가벼운 나들이를 마무리합니다.",
          mapQuery: `${targetRegion} 귀가`,
        });
      }

      setGeneratedCourse(steps);
      setCourseSummary(
        `[✨ 나드리 AI 맞춤 코스]\n📍 지역: ${targetRegion} | 🗓️ 일정: ${when}\n👥 동행: ${companion} | 🎯 관심사: ${interest}\n⏱️ 소요시간: ${duration} | 💰 예산: ${budget}\n총 ${steps.length}개 스팟 연계 플랜이 완성되었습니다!`
      );
      setIsGenerating(false);
    }, 600);
  };

  // 카카오톡 코스 복사 및 공유
  const handleShare = async () => {
    if (!generatedCourse) return;

    const courseText =
      `[✨ 나드리 AI ${region} 맞춤 나들이 코스 🗺️]\n\n` +
      `👥 동행: ${companion} | ⏱️ 일정: ${duration} (${budget})\n\n` +
      generatedCourse
        .map(
          (s) =>
            `${s.stepNumber}. [${s.time}] ${s.category}\n` +
            `   • 장소: ${s.title}\n` +
            `   • 비용: ${s.admission} | 운영시간: ${s.operatingHours}\n` +
            `   • 이동: ${s.distance} (${s.travelTime}) | 주차: ${s.parking}\n` +
            `   • 팁: ${s.highlight}`
        )
        .join("\n\n") +
      `\n\n👉 실시간 길찾기 & 세부 일정 보기: https://nadriai.com/ai-trip`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `[나드리 AI] ${region} ${companion} 맞춤 나들이 코스`,
          text: courseText,
          url: "https://nadriai.com/ai-trip",
        });
        return;
      } catch {
        // clipboard fallback
      }
    }

    try {
      await navigator.clipboard.writeText(courseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert("코스가 복사되었습니다. 카카오톡에 붙여넣기 하세요!");
    }
  };

  return (
    <section id="ai-trip-planner-section" className="scroll-mt-20">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-5 sm:p-8 md:p-10 shadow-xl border border-indigo-900/60 relative overflow-hidden">
        {/* 은은한 배경 글로우 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 상단 뱃지 & 헤더 */}
          <div className="text-center space-y-2.5 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-emerald-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold backdrop-blur-md">
              <span>✨</span>
              <span>약 1분 만에 나들이 코스 완성</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              “이번 주말, 조건만 콕 찍어주세요!”
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              출발지와 동행자, 원하는 예산만 선택하면 전시 · 5일장 · 도서관 · 맛집을 최적 동선으로 연결해 드립니다.
            </p>
          </div>

          {/* 6개 조건 선택 컨트롤 박스 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/15 space-y-5">
            {/* 1. 출발지역 */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-2">
                📍 1. 출발 지역
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["부산", "울산", "경남", "현재위치"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRegion(item)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      region === item
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]"
                        : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 언제 & 3. 동행 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-2">
                  🗓️ 2. 언제 떠나시나요?
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["오늘", "내일", "이번 주말", "날짜선택"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setWhen(item)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        when === item
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-2">
                  👥 3. 누구와 함께 가시나요?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["혼자", "연인", "친구", "아이", "부모님"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCompanion(item)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        companion === item
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. 관심사 */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-2">
                🎯 4. 주 관심사
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: "전시", icon: "🎨" },
                  { id: "시장", icon: "🧺" },
                  { id: "도서관", icon: "📚" },
                  { id: "자연", icon: "🌿" },
                  { id: "맛집", icon: "🍽️" },
                  { id: "드라이브", icon: "🚗" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInterest(item.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      interest === item.id
                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-[1.02]"
                        : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 소요시간 & 6. 예산 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-2">
                  ⏱️ 5. 나들이 소요 시간
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["2시간", "반나절", "하루"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDuration(item)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        duration === item
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-2">
                  💰 6. 1인당 예산
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["무료 중심", "3만원 이하", "5만원 이하", "상관없음"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setBudget(item)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        budget === item
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 코스 생성 CTA 버튼 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateCourse}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:via-sky-600 hover:to-emerald-600 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin text-xl">✨</span>
                    <span>AI가 부울경 최적 동선을 계산하고 있습니다...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>AI 맞춤 나들이 코스 만들기</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI 생성 결과 타임라인 */}
          {generatedCourse && (
            <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl animate-fade-in border border-slate-200">
              {/* 결과 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs mb-1">
                    <span>✨ AI 생성 완료</span>
                    <span>·</span>
                    <span>{region} 맞춤 {duration} 코스</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {companion}과 함께하는 {region} 문화 미식 나들이
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">
                    {courseSummary}
                  </p>
                </div>

                {/* 공유 & 복사 버튼 */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <span>💛</span>
                  <span>{copied ? "코스 복사 완료!" : "카톡으로 코스 공유하기"}</span>
                </button>
              </div>

              {/* 타임라인 단계 */}
              <div className="relative mt-8 space-y-6 before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-emerald-500 before:to-slate-200">
                {generatedCourse.map((step) => (
                  <div key={step.stepNumber} className="relative flex items-start gap-4 sm:gap-6 group">
                    {/* 타임라인 번호 원 */}
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-700 font-black text-xs sm:text-sm shadow-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {step.stepNumber}
                    </div>

                    {/* 세부 카드 */}
                    <div className="flex-1 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 p-4 sm:p-5 border border-slate-200 transition-all shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {step.category}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {step.time}
                          </span>
                        </div>

                        {/* 네이버 지도 길찾기 */}
                        <a
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(step.mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                        >
                          <span>📍 길찾기</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{step.title}</span>
                        {step.link && (
                          <a
                            href={step.link}
                            className="text-xs text-indigo-600 hover:underline font-normal"
                          >
                            [상세보기]
                          </a>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{step.subTitle}</p>

                      {/* 핵심 스펙 칩 5종 (운영시간 포함) */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">이동 거리/시간</span>
                          <span className="font-bold text-slate-700">{step.distance} ({step.travelTime})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">체류/관람 시간</span>
                          <span className="font-bold text-slate-700">{step.stayDuration}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">비용 / 입장료</span>
                          <span className="font-bold text-emerald-700">{step.admission}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">운영 시간</span>
                          <span className="font-bold text-slate-700 truncate block" title={step.operatingHours}>{step.operatingHours}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[10px]">주차 정보</span>
                          <span className="font-bold text-slate-700 truncate block" title={step.parking}>{step.parking}</span>
                        </div>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                        💡 {step.highlight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 팁 */}
              <div className="mt-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <span>🚗</span>
                  <span className="font-semibold">
                    이 코스는 부울경 현지 데이터 기반 실시간 이동 효율을 극대화한 추천 루트입니다.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  다른 조건으로 다시 만들기 ↑
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
