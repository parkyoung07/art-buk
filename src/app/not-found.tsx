"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-3xl mx-auto shadow-lg">
          🔍
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 font-black text-xs border border-red-500/20">
            페이지를 찾을 수 없습니다 (404)
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            원하시는 페이지로 바로 안내해 드릴게요!
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            주소가 잘못 입력되었거나 변경되었을 수 있습니다. 아래 바로가기 버튼을 터치해 주세요.
          </p>
        </div>

        {/* 🌟 주요 핵심 페이지 바로가기 버튼 세트 */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/events/busan-biennale-2026"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <span>🎨 2026 부산비엔날레 전시 & 코스 보기</span>
            <span>➔</span>
          </Link>

          <Link
            href="/daangn"
            className="w-full py-3 px-4 rounded-2xl bg-[#FF6F0F]/20 hover:bg-[#FF6F0F]/30 text-orange-300 border border-[#FF6F0F]/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>🥕 당근 이웃 문화 나들이 꿀팁</span>
            <span>➔</span>
          </Link>

          <Link
            href="/"
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>🏠 나드리 AI 전체 전시 홈으로 가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
