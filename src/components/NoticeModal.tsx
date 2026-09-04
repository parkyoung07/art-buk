"use client";

import React, { useState, useEffect } from "react";

interface NoticeModalProps {
  noticeId?: string;
}

export default function NoticeModal({ noticeId = "nadri_welcome_v1" }: NoticeModalProps) {
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
    }, 250);
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

  const handleStart = () => {
    setIsOpen(false);
    // AI 나들이 플래너 섹션으로 부드럽게 스크롤
    const plannerEl = document.getElementById("ai-trip-planner-section");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* 바깥쪽 오로라 그라데이션 글로우 테두리 프레임 */}
      <div className="relative w-full max-w-lg p-[2px] rounded-[32px] bg-gradient-to-tr from-violet-600 via-indigo-500 to-emerald-400 shadow-2xl shadow-indigo-950/30 animate-in zoom-in-95 duration-200">
        {/* 내부 메인 카드 (Apple · Toss 스타일 미니멀 화이트) */}
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
            {/* 1. 상단 캡슐 뱃지 */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 text-white text-[11px] sm:text-xs font-extrabold shadow-xs">
              <span className="text-amber-300">✨</span>
              <span>부울경 대표 AI 나들이 플랫폼</span>
            </div>

            {/* 2. 핵심 헤드라인 */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight [word-break:keep-all]">
                “이번 주말, 어디 갈까?” 고민 끝!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 [word-break:keep-all]">
                나드리 AI가 부울경의 오늘과 주말 갈 곳을 1분 만에 찾아드립니다.
              </p>
            </div>

            {/* 3. 3열 라운드 미니 카드 (전시·문화 / 5일장·로컬 / AI 맞춤 코스) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-left">
              {/* 카드 1: 전시 · 문화 */}
              <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-100 flex flex-col justify-between space-y-2 hover:bg-emerald-50/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-lg">
                  🎨
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    [전시 · 문화]
                  </h3>
                  <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 mt-0.5 leading-snug line-clamp-3">
                    부산·울산·경남 실시간 전시와 무료 관람 정보
                  </p>
                </div>
              </div>

              {/* 카드 2: 5일장 · 로컬 */}
              <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-100 flex flex-col justify-between space-y-2 hover:bg-amber-50/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center text-lg">
                  🧺
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    [5일장 · 로컬]
                  </h3>
                  <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 mt-0.5 leading-snug line-clamp-3">
                    오늘 열리는 전통시장과 주말 힐링 스팟
                  </p>
                </div>
              </div>

              {/* 카드 3: AI 맞춤 코스 */}
              <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-100 flex flex-col justify-between space-y-2 hover:bg-indigo-50/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    [AI 맞춤 코스]
                  </h3>
                  <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 mt-0.5 leading-snug line-clamp-3">
                    인원과 취향만 고르면 1분 만에 완성되는 동선
                  </p>
                </div>
              </div>
            </div>

            {/* 4. 하단 액션 영역 */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100/80">
              <button
                type="button"
                onClick={handleHideToday}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer underline underline-offset-4"
              >
                오늘 하루 보지 않기
              </button>

              <button
                type="button"
                onClick={handleStart}
                className="px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 hover:from-violet-700 hover:to-emerald-600 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>나드리 AI 시작하기</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
