"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  time: string;
  tag: string;
  title: string;
  subTitle: string;
  description: string;
  bgImage: string;
  emoji: string;
  accent: string;
}

const SHORTS_SLIDES: Slide[] = [
  {
    id: 1,
    time: "0:00 ~ 0:08",
    tag: "🔥 오늘(9/3) 개막!",
    title: "영화의전당 무료 야외 영화제?",
    subTitle: "오늘 저녁 18:30 야외극장 무료 상영!",
    description: "부산 센텀 영화의전당에서 5일간 펼쳐지는 아시아 최대 환경 영상 축제!",
    bgImage: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    emoji: "🎬",
    accent: "from-rose-600 to-amber-500",
  },
  {
    id: 2,
    time: "0:08 ~ 0:17",
    tag: "🌳 오늘 개막작 <나무의 노래>",
    title: "거목들의 웅장한 사운드",
    subTitle: "진재운 감독의 화제작 대형 스크린 상영",
    description: "시원한 가을밤, 빅루프 아래서 만나는 자연의 경이로운 울림!",
    bgImage: "https://images.pexels.com/photos/142497/pexels-photo-142497.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    emoji: "🌿",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    id: 3,
    time: "0:17 ~ 0:26",
    tag: "🧺 주말 에코 플리마켓",
    title: "아이와 함께 무료 체험!",
    subTitle: "재생화분 심기 & 제로웨이스트 굿즈",
    description: "야외 광장 전체가 친환경 놀이터로 변신! 주말 가족 나들이 필수 코스",
    bgImage: "https://images.pexels.com/photos/28167315/pexels-photo-28167315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    emoji: "👶",
    accent: "from-amber-500 to-orange-600",
  },
  {
    id: 4,
    time: "0:26 ~ 0:35",
    tag: "🗺️ 하루 완성 나들이 동선",
    title: "APEC 나루공원 & 수영시장",
    subTitle: "수영강변 돗자리 산책 + 정겨운 장터 먹거리",
    description: "영화 보고 바로 앞 강변 산책 후 떡볶이·닭강정 먹방까지!",
    bgImage: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    emoji: "📍",
    accent: "from-blue-600 to-indigo-600",
  },
  {
    id: 5,
    time: "0:35 ~ 0:45",
    tag: "👉 무료 주차 & 일정표 보기",
    title: "나드리 AI에서 지금 확인!",
    subTitle: "댓글 링크 클릭 또는 nadriai.com",
    description: "부울경 40+개 무료 전시 & 5일장 일정표를 한눈에 만나보세요!",
    bgImage: "https://images.pexels.com/photos/15138865/pexels-photo-15138865.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    emoji: "✨",
    accent: "from-purple-600 to-pink-600",
  },
];

export default function ShortsPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);

  const durationPerSlide = 7000; // 7초당 1슬라이드 (총 35초)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = SHORTS_SLIDES[currentSlideIndex];

  // 음성 TTS 재생 함수 (브라우저 기본 고품질 음성)
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.1; // 쇼츠에 맞게 살짝 빠른 템포
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // 슬라이드 변경 시 TTS 재생
  useEffect(() => {
    if (isPlaying && isTTSActive) {
      speakText(`${currentSlide.title}. ${currentSlide.subTitle}. ${currentSlide.description}`);
    }
  }, [currentSlideIndex, isPlaying, isTTSActive]);

  // 자동 재생 타이머 및 프로그레스 바 제어
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const intervalStep = 50;
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (intervalStep / durationPerSlide) * 100;
        if (next >= 100) {
          setCurrentSlideIndex((idx) => (idx + 1) % SHORTS_SLIDES.length);
          return 0;
        }
        return next;
      });
    }, intervalStep);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying]);

  const handleNext = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev + 1) % SHORTS_SLIDES.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev - 1 + SHORTS_SLIDES.length) % SHORTS_SLIDES.length);
  };

  const handleCopyScript = () => {
    const fullScript = `[🎬 유튜브 쇼츠 업로드용 대본 & 세부 정보]\n\n📌 영상 제목:\n오늘 개막! 부산 영화의전당 무료 야외 영화제 & 에코 플리마켓 꿀팁 🎬 #shorts #부산축제\n\n📌 나레이션 대본 (총 40초):\n(0~8초) 여러분, 오늘(9/3) 저녁 센텀 영화의전당에서 거대한 무료 야외 영화제가 개막한다는 사실, 알고 계셨나요?\n(8~17초) '제5회 하나뿐인 지구영상제'의 개막작 <나무의 노래>가 시원한 빅루프 야외극장에서 전액 무료로 상영됩니다!\n(17~26초) 이번 주말에는 야외 광장에서 친환경 플리마켓과 아이들이 좋아하는 무료 재생화분 심기 체험까지 열려요.\n(26~35초) 영화 보고 바로 앞 APEC 나루공원 돗자리 산책과 수영 팔도시장 떡볶이 먹방 코스로 완벽한 하루를 만들어보세요!\n(35~40초) 무료 주차 팁과 전체 5일장 일정표는 댓글 링크(nadriai.com/daangn)에서 지금 바로 확인하세요!\n\n📌 고정 댓글 문구:\n👉 영화제 상세 일정표 & 나들이 지도 보기: https://nadriai.com/daangn\n\n📌 추천 해시태그:\n#하나뿐인지구영상제 #부산영화의전당 #부산축제 #부산가볼만한곳 #센텀시티 #주말나들이 #부산데이트 #shorts`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullScript);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      {/* 1. 상단 바 */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs hover:bg-indigo-500 transition-colors"
          >
            A
          </Link>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
            나드리 AI 쇼츠 스튜디오
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse">
            SHORTS 9:16
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyScript}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>📋</span>
            <span>{isCopied ? "대본 복사 완료!" : "쇼츠 대본 복사"}</span>
          </button>
          <Link
            href="/daangn"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
          >
            당근 랜딩페이지
          </Link>
        </div>
      </header>

      {/* 2. 메인 컨테이너: 9:16 쇼츠 플레이어 & 우측 대본/가이드 뷰어 */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 좌측: 9:16 유튜브 쇼츠 모바일 시뮬레이터 (5열) */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-[36px] overflow-hidden border-[6px] border-slate-800 shadow-2xl bg-black flex flex-col justify-between select-none">
            {/* 배경 이미지 */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url('${currentSlide.bgImage}')` }}
            />
            {/* 어두운 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

            {/* 최상단 프로그레스 바 (인스타/쇼츠 스타일 멀티 세그먼트) */}
            <div className="relative z-20 px-3 pt-3 flex items-center gap-1">
              {SHORTS_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className="h-full bg-red-500 transition-all duration-75"
                    style={{
                      width:
                        idx < currentSlideIndex
                          ? "100%"
                          : idx === currentSlideIndex
                          ? `${progress}%`
                          : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* 상단 태그 & 컨트롤 */}
            <div className="relative z-20 px-4 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <span className="text-xs">{currentSlide.emoji}</span>
                <span className="text-[11px] font-extrabold text-amber-300">
                  {currentSlide.tag}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTTSActive(!isTTSActive)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs backdrop-blur-md transition-colors ${
                    isTTSActive ? "bg-red-600 text-white" : "bg-black/60 text-slate-300"
                  }`}
                  title="AI 음성 읽기"
                >
                  {isTTSActive ? "🗣️" : "🔇"}
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs backdrop-blur-md"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>
            </div>

            {/* 터치/클릭 영역 (좌측 클릭 시 이전, 우측 클릭 시 다음) */}
            <div className="absolute inset-y-16 inset-x-0 z-10 flex">
              <div
                onClick={handlePrev}
                className="w-1/2 h-full cursor-pointer active:bg-white/5 transition-colors"
                title="이전 슬라이드"
              />
              <div
                onClick={handleNext}
                className="w-1/2 h-full cursor-pointer active:bg-white/5 transition-colors"
                title="다음 슬라이드"
              />
            </div>

            {/* 하단 자막 & 볼드 타이포그래피 (쇼츠 스타일) */}
            <div className="relative z-20 p-5 space-y-3">
              {/* 노란색 강조 헤드라인 */}
              <div className="inline-block px-3 py-1 rounded-xl bg-amber-400 text-black font-black text-xs tracking-tight shadow-md">
                {currentSlide.subTitle}
              </div>

              {/* 볼드 메인 타이틀 */}
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {currentSlide.title}
              </h2>

              {/* 하단 설명 자막 */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                {currentSlide.description}
              </p>

              {/* 하단 프로필 & CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black">
                    나
                  </div>
                  <span className="text-xs font-bold text-white">@나드리AI · 부울경</span>
                </div>

                <Link
                  href="/daangn"
                  className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-[11px] transition-all shadow-md"
                >
                  일정표 보기 ➔
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 유튜브 업로드 가이드 & 타임라인별 대본 뷰어 (7열) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 쇼츠 정보 요약 카드 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <h3 className="font-extrabold text-base text-white">
                  유튜브 쇼츠 제작 패키지 가이드
                </h3>
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                총 길이: 약 35~40초
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400">
                <strong className="text-slate-200 block mb-1">📌 추천 영상 제목:</strong>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold select-all">
                  오늘 개막! 부산 영화의전당 무료 야외 영화제 &amp; 에코 플리마켓 꿀팁 🎬 #shorts #부산축제
                </div>
              </div>

              <div className="text-slate-400 pt-2">
                <strong className="text-slate-200 block mb-1">📌 고정 댓글 &amp; 더보기 링크:</strong>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono select-all">
                  👉 전체 상영시간표 &amp; 나들이 지도: https://nadriai.com/daangn
                </div>
              </div>
            </div>
          </div>

          {/* 타임라인별 5단계 나레이션 대본 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>🎙️</span>
                <span>초 단위 음성 나레이션 대본</span>
              </h3>
              <button
                onClick={handleCopyScript}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                {isCopied ? "복사완료!" : "전체 대본 복사"}
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {SHORTS_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setProgress(0);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? "bg-red-950/40 border-red-500/80 shadow-xs"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-extrabold text-red-400">{slide.time}</span>
                    <span className="text-slate-400">{slide.tag}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                    {slide.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    &quot;{slide.description}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
