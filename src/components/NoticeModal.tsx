"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NoticeModalProps {
  noticeId?: string;
}

export default function NoticeModal({ noticeId = "busan_museum_grand_reopen_20260917" }: NoticeModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // 미리보기 강제 실행 파라미터 확인 (?preview=modal 또는 ?preview=true)
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get("preview") === "modal" || urlParams.get("preview") === "true";

    if (!isPreview) {
      // 오늘 하루 보지 않기 여부 검사
      const hideUntil = localStorage.getItem(`hide_${noticeId}`);
      if (hideUntil) {
        const expireTime = parseInt(hideUntil, 10);
        if (Date.now() < expireTime) {
          return;
        }
      }
    }

    // 부드러운 팝업 등장 딜레이
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [noticeId]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    const expireTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`hide_${noticeId}`, expireTime.toString());
    setIsOpen(false);
  };

  const handleStartPlanner = () => {
    setIsOpen(false);
    // AI 나들이 플래너 섹션으로 부드럽게 스크롤
    const plannerEl = document.getElementById("ai-trip-planner-section");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* 바깥쪽 오로라 그라데이션 글로우 테두리 프레임 */}
      <div className="relative w-full max-w-lg p-[2px] rounded-[32px] bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 shadow-2xl shadow-indigo-950/40 animate-in zoom-in-95 duration-200">
        {/* 내부 메인 카드 */}
        <div className="relative bg-white/98 backdrop-blur-2xl rounded-[30px] p-6 sm:p-8 text-slate-800">
          {/* 상단 닫기 (X) 버튼 */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>

          <div className="text-center space-y-4">
            {/* 상단 시각적 배너 이미지 영역 (부산시립미술관 재개관 기념 비주얼) */}
            <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden shadow-inner group bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=80"
                alt="2026 부산시립미술관 그랜드 재개관"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
              
              {/* 상단 뱃지 */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-extrabold border border-indigo-400/40 shadow-lg">
                  <span className="text-amber-300">🎉</span>
                  <span>2년 만의 화려한 귀환 · 오늘(9.17) 공식 재개관!</span>
                </span>
              </div>
              
              {/* 이미지 위 오버레이 타이틀 */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Grand Reopening
                </span>
                <h3 className="text-white font-black text-sm sm:text-base mt-1 drop-shadow-md line-clamp-1">
                  부산시립미술관 ‘경계 없는 오픈 플랫폼’으로 대개막
                </h3>
              </div>
            </div>

            {/* 2. 핵심 헤드라인 */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight [word-break:keep-all]">
                부산시립미술관 오늘(9월 17일) 전면 재개관!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 [word-break:keep-all] font-medium">
                총 469억 원 투입, 2년간의 리모델링 완료! 4대 특별전과 오픈 플랫폼으로 새로워진 미술관을 만나보세요.
              </p>
            </div>

            {/* 3. 3열 라운드 미니 카드 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 text-left">
              {/* 카드 1: 4대 특별전 개막 */}
              <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-100 flex flex-col justify-between space-y-2 hover:bg-sky-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center text-lg">
                  🏛️
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    4대 특별전
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-3">
                    퓨처 뮤지올로지, 1945-1953 역사전, 어린이 특별전
                  </p>
                </div>
              </div>

              {/* 카드 2: 공간 혁신 오픈 */}
              <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-100 flex flex-col justify-between space-y-2 hover:bg-emerald-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-lg">
                  ☕
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    오픈 플랫폼
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-3">
                    수직·수평 틔운 시야, 신규 조각공원 뷰 라운지 카페
                  </p>
                </div>
              </div>

              {/* 카드 3: AI 맞춤 플래너 */}
              <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-100 flex flex-col justify-between space-y-2 hover:bg-indigo-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    AI 센텀 코스
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-3">
                    미술관+영화의전당+센텀 미식 당일 코스 1분 완성
                  </p>
                </div>
              </div>
            </div>

            {/* 4. 특별전 자세히 보기 배너 버튼 */}
            <div className="pt-1">
              <Link
                href="/blog/2026-09-17-busan-museum-of-art-grand-reopening"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>🎨 [특집] 부산시립미술관 재개관 총정리 보러가기</span>
                <span>➔</span>
              </Link>
            </div>

            {/* 5. 하단 액션 영역 */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100/80">
              <button
                type="button"
                onClick={handleHideToday}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer underline underline-offset-4"
              >
                오늘 하루 보지 않기
              </button>

              <button
                type="button"
                onClick={handleStartPlanner}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>AI 플래너 둘러보기</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
