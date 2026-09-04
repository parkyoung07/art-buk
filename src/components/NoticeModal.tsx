"use client";

import React, { useState, useEffect } from "react";

interface NoticeModalProps {
  noticeId?: string; // 공지 식별자 (내용 변경 시 갱신 가능)
}

export default function NoticeModal({ noticeId = "notice_20260904" }: NoticeModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // 오늘 하루 보지 않기 체크 여부 확인
    const hideUntil = localStorage.getItem(`hide_${noticeId}`);
    if (hideUntil) {
      const expireTime = parseInt(hideUntil, 10);
      if (Date.now() < expireTime) {
        return; // 아직 만료되지 않았으면 띄우지 않음
      }
    }
    // 첫 로딩 시 부드럽게 띄우기 (300ms 딜레이)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [noticeId]);

  // 닫기
  const handleClose = () => {
    setIsOpen(false);
  };

  // 오늘 하루 보지 않기 (24시간 동안 유지)
  const handleHideToday = () => {
    const expireTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`hide_${noticeId}`, expireTime.toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* 상단 장식 바 */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

        {/* 닫기 (X) 아이콘 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          aria-label="닫기"
        >
          ✕
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          {/* 뱃지 & 아이콘 */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 flex items-center gap-1">
              <span>📢</span>
              <span>알림 소식</span>
            </span>
          </div>

          {/* 제목 */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            나드리 AI에 오신 것을 <br className="hidden sm:inline" />환영합니다! ✨
          </h2>

          {/* 알림 본문 */}
          <div className="text-sm text-slate-600 leading-relaxed space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="font-semibold text-slate-800">
              이번 주말, 어디 갈지 고민되시나요?
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              부산·울산·경남의 전시, 5일장, 도서관 정보를 AI가 매일 실시간으로 찾아드립니다.
            </p>
            <p className="text-xs text-indigo-600 font-bold pt-1">
              👉 메인 화면의 [AI 나들이 플래너]에서 인원과 취향을 선택해 맞춤 코스를 확인해 보세요!
            </p>
          </div>

          {/* 하단 버튼 2종 */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleHideToday}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium py-2 px-1 transition-colors cursor-pointer underline underline-offset-4"
            >
              오늘 하루 보지 않기
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
            >
              확인 (닫기)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
