"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  time: string;
  tag: string;
  title: string;
  subTitle: string;
  description: string;
  narration: string; // 자연스러운 구어체 나레이션 전용 대본
  bgImage: string;
  emoji: string;
  accent: string;
}

const SHORTS_SLIDES: Slide[] = [
  {
    id: 1,
    time: "0:00 ~ 0:08",
    tag: "🌿 9.3(목) ~ 9.7(월) 5일간!",
    title: "제5회 하나뿐인 지구영상제",
    subTitle: "영화의전당 무료 야외 시네마 축제!",
    description: "'다시 지구(Earth and Us)'를 슬로건으로 영화의전당에서 5일간 펼쳐지는 아시아 최대 환경 영상 축제!",
    narration: "9월 3일부터 9월 7일까지 5일간, 센텀 영화의전당에서 거대한 무료 야외 영화제가 열린다는 사실, 알고 계셨나요?",
    bgImage: "/images/earth-festival-poster.jpg",
    emoji: "🌍",
    accent: "from-emerald-600 via-teal-600 to-blue-600",
  },
  {
    id: 2,
    time: "0:08 ~ 0:17",
    tag: "🌳 개막작 <나무의 노래>",
    title: "거목들의 웅장한 사운드",
    subTitle: "진재운 감독의 화제작 대형 스크린 상영",
    description: "시원한 가을밤, 빅루프 아래서 만나는 자연의 경이로운 울림!",
    narration: "개막작 나무의 노래를 시원한 빅루프 야외극장에서, 전액 무료로 감상할 수 있습니다.",
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
    narration: "이번 주말에는 야외 광장에서 친환경 플리마켓과, 아이들이 좋아하는 무료 화분 심기 체험까지 열려요.",
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
    narration: "영화 보고 바로 앞 나루공원 돗자리 산책과, 수영 팔도시장 떡볶이 먹방 코스로 완벽한 하루를 만들어보세요!",
    bgImage: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    emoji: "📍",
    accent: "from-blue-600 to-indigo-600",
  },
  {
    id: 5,
    time: "0:35 ~ 0:45",
    tag: "👉 9/7까지 축제 일정표 보기",
    title: "나드리 AI에서 지금 확인!",
    subTitle: "화면 아래 링크 클릭 또는 nadriai.com",
    description: "9월 7일까지 펼쳐지는 축제 상영시간표와 무료 주차 꿀팁을 지금 확인하세요!",
    narration: "9월 7일까지 펼쳐지는 축제 일정표와 무료 주차 팁은, 화면 아래 나드리 AI 링크에서 지금 바로 확인하세요!",
    bgImage: "/images/earth-festival-poster.jpg",
    emoji: "✨",
    accent: "from-purple-600 to-pink-600",
  },
];

export default function ShortsPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(true);

  // 자연스러운 한국어 보이스 상태
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [selectedTonePreset, setSelectedTonePreset] = useState<"natural_female" | "soft_female" | "calm_male">("natural_female");

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  const currentSlide = SHORTS_SLIDES[currentSlideIndex];

  // 보이스 로드 및 고품질 자연스러운 한국어 성우 선택
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const koreanVoices = allVoices.filter((v) => v.lang.includes("ko") || v.lang.includes("KR"));
      setVoices(koreanVoices.length > 0 ? koreanVoices : allVoices);

      const naturalVoice =
        koreanVoices.find((v) => v.name.includes("SunHi") || v.name.includes("Natural")) ||
        koreanVoices.find((v) => v.name.includes("Google")) ||
        koreanVoices.find((v) => v.name.includes("Yuna") || v.name.includes("Sora")) ||
        koreanVoices.find((v) => v.name.includes("Heami")) ||
        koreanVoices[0];

      if (naturalVoice && !selectedVoiceName) {
        setSelectedVoiceName(naturalVoice.name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceName]);

  // 성우 프리셋 변경
  const handleTonePresetChange = (preset: "natural_female" | "soft_female" | "calm_male") => {
    setSelectedTonePreset(preset);
    if (preset === "natural_female") {
      setSpeechRate(1.0);
      setSpeechPitch(1.02);
      const sunhi = voices.find((v) => v.name.includes("SunHi") || v.name.includes("Google") || v.name.includes("Yuna"));
      if (sunhi) setSelectedVoiceName(sunhi.name);
    } else if (preset === "soft_female") {
      setSpeechRate(0.95);
      setSpeechPitch(0.98);
      const heami = voices.find((v) => v.name.includes("Heami") || v.name.includes("Sora") || v.name.includes("Google"));
      if (heami) setSelectedVoiceName(heami.name);
    } else if (preset === "calm_male") {
      setSpeechRate(0.98);
      setSpeechPitch(0.92);
      const maleVoice = voices.find((v) => v.name.includes("InJoo") || v.name.includes("Male") || v.name.includes("남성"));
      if (maleVoice) setSelectedVoiceName(maleVoice.name);
    }
  };

  // 다음 슬라이드로 부드럽게 이동하는 함수
  const goToNextSlide = useCallback(() => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev + 1) % SHORTS_SLIDES.length);
  }, []);

  const goToPrevSlide = useCallback(() => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev - 1 + SHORTS_SLIDES.length) % SHORTS_SLIDES.length);
  }, []);

  // 🌟 핵심: 음성과 장면 전환을 100% 매끄럽게 동기화하는 재생 엔진
  const playSlideWithSmoothVoice = useCallback(
    (slideIdx: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
      setProgress(0);

      const targetSlide = SHORTS_SLIDES[slideIdx];

      if (!isTTSActive) {
        const duration = 6500;
        const step = 50;
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const next = prev + (step / duration) * 100;
            if (next >= 100) {
              clearInterval(progressIntervalRef.current!);
              goToNextSlide();
              return 0;
            }
            return next;
          });
        }, step);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(targetSlide.narration);
      utterance.lang = "ko-KR";
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = 1.0;

      if (selectedVoiceName) {
        const voiceObj = voices.find((v) => v.name === selectedVoiceName);
        if (voiceObj) utterance.voice = voiceObj;
      }

      const estimatedSec = Math.max((targetSlide.narration.length / (7 * speechRate)), 4.8);
      const estimatedMs = estimatedSec * 1000;
      const step = 50;

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) {
            return prev + (step / estimatedMs) * 95;
          }
          return prev;
        });
      }, step);

      utterance.onstart = () => {
        isSpeakingRef.current = true;
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setProgress(100);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        if (isPlaying) {
          speechEndTimeoutRef.current = setTimeout(() => {
            goToNextSlide();
          }, 450);
        }
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        if (isPlaying) {
          speechEndTimeoutRef.current = setTimeout(() => {
            goToNextSlide();
          }, 3000);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [goToNextSlide, isPlaying, isTTSActive, speechPitch, speechRate, selectedVoiceName, voices]
  );

  // 슬라이드 번호 변경 시 부드러운 재생 시작
  useEffect(() => {
    if (isPlaying) {
      playSlideWithSmoothVoice(currentSlideIndex);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
    };
  }, [currentSlideIndex, isPlaying, playSlideWithSmoothVoice]);

  const handleCopyScript = () => {
    const fullScript = `[🎬 유튜브 쇼츠 업로드용 대본 & 세부 정보 (9/3~9/7 축제 기간용)]\n\n📌 영상 제목:\n9.3(목)~9.7(월) 부산 영화의전당 '제5회 하나뿐인 지구영상제' 무료 야외영화 & 에코 플리마켓 꿀팁 🎬 #shorts #부산축제\n\n📌 자연스러운 나레이션 대본 (총 40초):\n(0~8초) 9월 3일부터 9월 7일까지 5일간, 센텀 영화의전당에서 거대한 무료 야외 영화제가 열린다는 사실, 알고 계셨나요?\n(8~17초) 개막작 나무의 노래를 시원한 빅루프 야외극장에서, 전액 무료로 감상할 수 있습니다.\n(17~26초) 이번 주말에는 야외 광장에서 친환경 플리마켓과, 아이들이 좋아하는 무료 화분 심기 체험까지 열려요.\n(26~35초) 영화 보고 바로 앞 나루공원 돗자리 산책과, 수영 팔도시장 떡볶이 먹방 코스로 완벽한 하루를 만들어보세요!\n(35~40초) 9월 7일까지 펼쳐지는 축제 일정표와 무료 주차 팁은, 화면 아래 나드리 AI 링크에서 지금 바로 확인하세요!\n\n📌 고정 댓글 문구:\n👉 9/3~9/7 영화제 전체 상영시간표 & 나들이 지도 보기: https://nadriai.com/daangn\n\n📌 추천 해시태그:\n#하나뿐인지구영상제 #부산영화의전당 #부산축제 #부산가볼만한곳 #센텀시티 #주말나들이 #부산데이트 #환경영화제 #shorts`;

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
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse">
            9.3 ~ 9.7 [5일간]
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

      {/* 2. 메인 컨테이너: 9:16 쇼츠 플레이어 & 우측 톤 튜닝/대본 뷰어 */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 좌측: 9:16 유튜브 쇼츠 모바일 시뮬레이터 (6열) */}
        <div className="lg:col-span-6 flex flex-col items-center w-full space-y-4">
          <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-[36px] overflow-hidden border-[6px] border-slate-800 shadow-2xl bg-black flex flex-col justify-between select-none">
            {/* 🌟 5개 배경 이미지 크로스-페이드 레이어 */}
            {SHORTS_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                  idx === currentSlideIndex
                    ? "opacity-100 scale-105"
                    : "opacity-0 scale-100 pointer-events-none"
                }`}
                style={{
                  backgroundImage: `url('${slide.bgImage}')`,
                  transitionProperty: "opacity, transform",
                  transitionDuration: "1000ms",
                }}
              />
            ))}

            {/* 어두운 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-10 pointer-events-none" />

            {/* 최상단 프로그레스 바 */}
            <div className="relative z-20 px-3 pt-3 flex items-center gap-1">
              {SHORTS_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className="h-full bg-red-500 transition-all duration-100"
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

            {/* 상단 태그 & 사운드/재생 컨트롤 */}
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
                  className={`px-2 py-1 rounded-full flex items-center gap-1 text-[11px] font-bold backdrop-blur-md transition-all ${
                    isTTSActive ? "bg-red-600 text-white shadow-xs" : "bg-black/60 text-slate-300"
                  }`}
                  title="AI 음성 온/오프"
                >
                  <span>{isTTSActive ? "🗣️ 음성 ON" : "🔇 음성 OFF"}</span>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs backdrop-blur-md cursor-pointer hover:bg-black/80"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>
            </div>

            {/* 🌟 1번 슬라이드일 때 공식 메인 포스터 부각 뱃지 & 미니 포스터 카드 */}
            {currentSlideIndex === 0 && (
              <div className="relative z-20 mx-auto px-4 mt-2 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-400/80 w-36 h-48 group">
                  <img
                    src="/images/earth-festival-poster.jpg"
                    alt="제5회 하나뿐인 지구영상제 공식 포스터"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 text-center">
                    <span className="text-[10px] font-black text-amber-300 block">
                      공식 포스터
                    </span>
                    <span className="text-[9px] text-emerald-200 font-bold block">
                      &quot;다시 지구 (Earth and Us)&quot;
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 터치/클릭 영역 (좌/우 클릭으로 슬라이드 수동 이동) */}
            <div className="absolute inset-y-16 inset-x-0 z-15 flex">
              <div
                onClick={goToPrevSlide}
                className="w-1/2 h-full cursor-pointer active:bg-white/5 transition-colors"
                title="이전 슬라이드"
              />
              <div
                onClick={goToNextSlide}
                className="w-1/2 h-full cursor-pointer active:bg-white/5 transition-colors"
                title="다음 슬라이드"
              />
            </div>

            {/* 우측 유튜브 쇼츠 플로팅 액션 아이콘 바 */}
            <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white">
              {/* 1. 나드리 AI 사이트 바로가기 아이콘 */}
              <Link
                href="/daangn"
                className="group flex flex-col items-center gap-1 cursor-pointer"
                title="나드리 AI 사이트로 이동"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-white group-hover:scale-110 group-active:scale-95 transition-all animate-bounce">
                  🌐
                </div>
                <span className="text-[10px] font-black text-amber-300 drop-shadow-md tracking-tight">
                  사이트 이동
                </span>
              </Link>

              {/* 2. 좋아요 아이콘 */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-lg border border-white/20">
                  ❤️
                </div>
                <span className="text-[10px] font-bold text-slate-200">2.8만</span>
              </div>

              {/* 3. 댓글 아이콘 */}
              <Link href="/events/busan-only-one-earth-film-festival-2026" className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-lg border border-white/20">
                  💬
                </div>
                <span className="text-[10px] font-bold text-slate-200">342</span>
              </Link>

              {/* 4. 공유 아이콘 */}
              <button
                onClick={handleCopyScript}
                className="flex flex-col items-center gap-0.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-lg border border-white/20">
                  🔗
                </div>
                <span className="text-[10px] font-bold text-slate-200">공유</span>
              </button>
            </div>

            {/* 마지막 5번 슬라이드일 때 나타나는 쇼츠 엔딩 대형 오버레이 카드 */}
            {currentSlideIndex === 4 && (
              <div className="absolute inset-x-4 top-20 bottom-36 z-25 bg-slate-900/95 backdrop-blur-lg rounded-3xl p-5 border-2 border-indigo-500/80 shadow-2xl flex flex-col justify-between text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                    📅 9.3(목) ~ 9.7(월) 5일간
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    지구영상제 상영시간표 &amp;<br />
                    <span className="text-amber-300">주차·맛집 나들이 코스</span> 보기
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    지금 바로 아래 버튼을 눌러 9월 7일까지 펼쳐지는 축제 일정표와 부울경 40+개 무료 전시를 확인하세요!
                  </p>
                </div>

                {/* 대형 원클릭 사이트 유입 버튼 */}
                <div className="space-y-2">
                  <Link
                    href="/events/busan-only-one-earth-film-festival-2026"
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 border border-white/20 active:scale-95"
                  >
                    <span>🗺️ 1일 나들이 코스 지도 열기</span>
                    <span>➔</span>
                  </Link>

                  <Link
                    href="/daangn"
                    className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🥕 당근 이웃 꿀팁 페이지</span>
                    <span>➔</span>
                  </Link>

                  <Link
                    href="/"
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-[11px] transition-all"
                  >
                    🎨 나드리 AI 메인 홈 둘러보기
                  </Link>
                </div>
              </div>
            )}

            {/* 하단 자막 & 볼드 타이포그래피 (자연스러운 전환 애니메이션) */}
            <div
              key={currentSlide.id}
              className="relative z-20 p-5 space-y-3 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-3"
            >
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

              {/* 하단 프로필 & 사이트 바로가기 버튼 */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[11px] font-black text-white shadow-xs group-hover:scale-105 transition-transform">
                    나
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-white leading-none">
                      나드리 AI
                    </span>
                    <span className="text-[9px] text-amber-300 font-bold leading-none mt-0.5">
                      클릭 시 사이트 이동 ➔
                    </span>
                  </div>
                </Link>

                <Link
                  href="/daangn"
                  className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-md flex items-center gap-1 active:scale-95"
                >
                  <span>일정표 보기</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 슬라이드 컨트롤 및 다시 듣기 바 */}
          <div className="flex items-center gap-2 w-full max-w-[360px] justify-between text-xs">
            <button
              onClick={goToPrevSlide}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              ◀ 이전 장면
            </button>
            <button
              onClick={() => playSlideWithSmoothVoice(currentSlideIndex)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>🔊 음성 다시 듣기</span>
            </button>
            <button
              onClick={goToNextSlide}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              다음 장면 ▶
            </button>
          </div>
        </div>

        {/* 우측: 성우 톤 정밀 조절기 & 대본 가이드 뷰어 (6열) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 🌟 1. AI 성우 목소리 & 자연스러운 톤 조절 컨트롤러 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎙️</span>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  AI 성우 목소리 &amp; 장면 자동 연결 설정
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                9/3 ~ 9/7 축제 기간용
              </span>
            </div>

            {/* 성우 톤 프리셋 선택 칩 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                성우 톤 프리셋 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTonePresetChange("natural_female")}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedTonePreset === "natural_female"
                      ? "bg-red-600 text-white border-red-500 shadow-md scale-102"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">👩</span>
                  <span>자연스러운 여성 (선희)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTonePresetChange("soft_female")}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedTonePreset === "soft_female"
                      ? "bg-red-600 text-white border-red-500 shadow-md scale-102"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">👩‍💼</span>
                  <span>차분한 여성 (혜미)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTonePresetChange("calm_male")}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedTonePreset === "calm_male"
                      ? "bg-red-600 text-white border-red-500 shadow-md scale-102"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">👨</span>
                  <span>신뢰감 있는 남성</span>
                </button>
              </div>
            </div>

            {/* 슬라이더: 말하기 속도 & 음높이 피치 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>속도 (Rate)</span>
                  <span className="text-amber-400">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>음높이 (Pitch)</span>
                  <span className="text-amber-400">{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.9"
                  max="1.15"
                  step="0.02"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => playSlideWithSmoothVoice(currentSlideIndex)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🔊 현재 설정으로 음성 테스트하기</span>
            </button>
          </div>

          {/* 🌟 2. 타임라인별 5단계 구어체 나레이션 대본 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>📝</span>
                <span>축제 기간(9/3~9/7) 구어체 나레이션 대본</span>
              </h3>
              <button
                onClick={handleCopyScript}
                className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                {isCopied ? "복사완료!" : "전체 대본 복사"}
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {SHORTS_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
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
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    &quot;{slide.narration}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 🌟 3. 초보자도 3분 완성! 유튜브 쇼츠 업로드 4단계 가이드 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">🚀</span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                유튜브 쇼츠 3분 업로드 4단계 가이드
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* 1단계 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-red-400 text-[11px]">1단계. 화면 녹화하기</span>
                  <span className="text-[10px] text-slate-500">약 35~40초</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  스마트폰(화면 녹화 기능) 또는 PC(<kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px]">Win+Alt+R</kbd>)에서 화면 녹화를 켠 뒤, 좌측 쇼츠 화면을 처음부터 끝까지 자동 재생 녹화합니다.
                </p>
              </div>

              {/* 2단계 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1">
                <span className="font-black text-amber-400 text-[11px] block">2단계. 유튜브 앱에서 [+] 버튼 누르기</span>
                <p className="text-slate-300 leading-relaxed">
                  스마트폰 유튜브 앱 실행 ➔ 하단 가운데 <strong>[+]</strong> 버튼 ➔ <strong>[Shorts 동영상 만들기 / 업로드]</strong>에서 방금 녹화한 영상 선택!
                </p>
              </div>

              {/* 3단계 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 text-[11px]">3단계. 제목 &amp; 태그 붙여넣기</span>
                  <button
                    onClick={handleCopyScript}
                    className="text-[10px] font-bold text-emerald-300 hover:underline cursor-pointer"
                  >
                    제목 복사
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-black/50 text-[11px] text-slate-300 font-mono select-all">
                  9.3(목)~9.7(월) 부산 영화의전당 &apos;제5회 하나뿐인 지구영상제&apos; 무료 야외영화 &amp; 에코 플리마켓 꿀팁 🎬 #shorts #부산축제
                </div>
              </div>

              {/* 4단계 */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-300 text-[11px]">4단계. 첫 댓글에 사이트 링크 고정 (유입 핵심!)</span>
                  <span className="text-[10px] text-indigo-400 font-bold">클릭 유입</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  영상이 업로드되면 본인 댓글로 아래 링크를 작성하고 <strong>[댓글 고정]</strong>을 누르세요:
                </p>
                <div className="p-2 rounded-xl bg-black/60 text-[11px] text-amber-300 font-mono select-all">
                  👉 9/3~9/7 영화제 전체 상영시간표 &amp; 나들이 지도 보기: https://nadriai.com/daangn
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
