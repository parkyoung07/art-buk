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
  narration: string; // 자연스러운 구어체 나레이션 전용 대본
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
    narration: "여러분, 오늘 저녁 센텀 영화의전당에서, 거대한 무료 야외 영화제가 개막한다는 사실, 알고 계셨나요?",
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
    narration: "개막작 <나무의 노래>를 시원한 빅루프 야외극장에서, 전액 무료로 감상할 수 있습니다.",
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
    tag: "👉 무료 주차 & 일정표 보기",
    title: "나드리 AI에서 지금 확인!",
    subTitle: "화면 아래 링크 클릭 또는 nadriai.com",
    description: "부울경 40+개 무료 전시 & 5일장 일정표를 한눈에 만나보세요!",
    narration: "무료 주차 팁과 전체 일정표는, 화면 아래 나드리 AI 링크에서 지금 바로 확인하세요!",
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
  const [isTTSActive, setIsTTSActive] = useState(true); // 기본으로 음성 켜기

  // 자연스러운 한국어 보이스 선택 및 톤 조절 상태
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 1.0 (가장 자연스러운 보통 속도)
  const [speechPitch, setSpeechPitch] = useState<number>(1.0); // 1.0 (자연스러운 기본 톤)
  const [selectedTonePreset, setSelectedTonePreset] = useState<"natural_female" | "soft_female" | "calm_male">("natural_female");

  const durationPerSlide = 7000; // 7초당 1슬라이드
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = SHORTS_SLIDES[currentSlideIndex];

  // 브라우저 보이스 로드 및 고음질 자연스러운 한국어 성우 자동 선택
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const koreanVoices = allVoices.filter((v) => v.lang.includes("ko") || v.lang.includes("KR"));
      setVoices(koreanVoices.length > 0 ? koreanVoices : allVoices);

      // 자연스러운 여성 성우 우선 순위 매칭 (SunHi Natural > Google > Yuna > Heami)
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

  // 성우 톤 프리셋 변경 핸들러
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

  // 자연스러운 TTS 음성 재생 함수 (문장 간 호흡 및 부드러운 연결)
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || isMuted || !isTTSActive) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1.0;

    if (selectedVoiceName) {
      const voiceObj = voices.find((v) => v.name === selectedVoiceName);
      if (voiceObj) utterance.voice = voiceObj;
    }

    window.speechSynthesis.speak(utterance);
  };

  // 슬라이드 변경 시 자연스러운 나레이션 재생
  useEffect(() => {
    if (isPlaying && isTTSActive) {
      speakText(currentSlide.narration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlideIndex, isPlaying, isTTSActive, selectedVoiceName, speechRate, speechPitch]);

  // 프로그레스 바 및 자동 슬라이드 제어
  useEffect(() => {
    if (!isPlaying) {
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

  const handleReplayVoice = () => {
    speakText(currentSlide.narration);
  };

  const handleCopyScript = () => {
    const fullScript = `[🎬 유튜브 쇼츠 업로드용 대본 & 세부 정보]\n\n📌 영상 제목:\n오늘 개막! 부산 영화의전당 무료 야외 영화제 & 에코 플리마켓 꿀팁 🎬 #shorts #부산축제\n\n📌 자연스러운 나레이션 대본 (총 40초):\n(0~8초) 여러분, 오늘 저녁 센텀 영화의전당에서, 거대한 무료 야외 영화제가 개막한다는 사실, 알고 계셨나요?\n(8~17초) 개막작 <나무의 노래>를 시원한 빅루프 야외극장에서, 전액 무료로 감상할 수 있습니다.\n(17~26초) 이번 주말에는 야외 광장에서 친환경 플리마켓과, 아이들이 좋아하는 무료 화분 심기 체험까지 열려요.\n(26~35초) 영화 보고 바로 앞 나루공원 돗자리 산책과, 수영 팔도시장 떡볶이 먹방 코스로 완벽한 하루를 만들어보세요!\n(35~40초) 무료 주차 팁과 전체 일정표는, 화면 아래 나드리 AI 링크에서 지금 바로 확인하세요!\n\n📌 고정 댓글 문구:\n👉 영화제 상세 일정표 & 나들이 지도 보기: https://nadriai.com/daangn\n\n📌 추천 해시태그:\n#하나뿐인지구영상제 #부산영화의전당 #부산축제 #부산가볼만한곳 #센텀시티 #주말나들이 #부산데이트 #shorts`;

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

      {/* 2. 메인 컨테이너: 9:16 쇼츠 플레이어 & 우측 톤 튜닝/대본 뷰어 */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 좌측: 9:16 유튜브 쇼츠 모바일 시뮬레이터 (6열) */}
        <div className="lg:col-span-6 flex flex-col items-center w-full space-y-4">
          <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-[36px] overflow-hidden border-[6px] border-slate-800 shadow-2xl bg-black flex flex-col justify-between select-none">
            {/* 배경 이미지 */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url('${currentSlide.bgImage}')` }}
            />
            {/* 어두운 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

            {/* 최상단 프로그레스 바 */}
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
                  className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs backdrop-blur-md"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>
            </div>

            {/* 터치/클릭 영역 (좌/우 클릭으로 슬라이드 이동) */}
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

            {/* 우측 유튜브 쇼츠 플로팅 액션 아이콘 바 */}
            <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white">
              {/* 1. 나드리 AI 사이트 바로가기 아이콘 (회장님 요청 핵심) */}
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
              <div className="absolute inset-x-4 top-20 bottom-36 z-25 bg-slate-900/95 backdrop-blur-lg rounded-3xl p-5 border-2 border-indigo-500/80 shadow-2xl flex flex-col justify-between text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500 text-white font-black text-xs shadow-xs">
                    ✨ 나드리 AI 공식 포털
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    영화제 상영시간표 &amp;<br />
                    <span className="text-amber-300">주차·맛집 나들이 코스</span> 보기
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    지금 바로 아래 버튼을 눌러 부울경 40+개 무료 전시와 5일장 장날 지도를 확인하세요!
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
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              ◀ 이전 장면
            </button>
            <button
              onClick={handleReplayVoice}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xs flex items-center gap-1"
            >
              <span>🔊 음성 다시 듣기</span>
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
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
                  AI 성우 목소리 &amp; 자연스러운 톤 조절
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                실시간 튜닝
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
              onClick={handleReplayVoice}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>🔊 현재 설정으로 음성 테스트하기</span>
            </button>
          </div>

          {/* 🌟 2. 타임라인별 5단계 구어체 나레이션 대본 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>📝</span>
                <span>자연스러운 구어체 나레이션 대본</span>
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
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    &quot;{slide.narration}&quot;
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
