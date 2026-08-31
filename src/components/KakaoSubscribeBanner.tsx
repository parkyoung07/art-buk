"use client";

import React, { useState } from "react";
import KakaoSubscribeModal from "./KakaoSubscribeModal";

interface KakaoSubscribeBannerProps {
  variant?: "hero" | "card" | "inline";
}

export default function KakaoSubscribeBanner({ variant = "hero" }: KakaoSubscribeBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {variant === "hero" ? (
        /* 메인 페이지 Hero 아래용 대형 프리미엄 배너 */
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-30">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FEE500] via-[#ffeb3b] to-[#ffe082] p-6 sm:p-8 shadow-xl border border-amber-300/60 transition-all hover:shadow-2xl">
            {/* 배경 은은한 패턴 데코 */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-amber-400/20 blur-xl pointer-events-none"></div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 text-[#191919]">
              {/* 좌측 텍스트 & 아이콘 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#191919] text-[#FEE500] flex items-center justify-center shrink-0 shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
                  <svg
                    className="w-8 h-8 sm:w-9 sm:h-9 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 text-[#FEE500] text-[11px] sm:text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>🔔 매주 금요일 아침 8시 발송 · 100% 무료</span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#191919] leading-snug">
                    이번 주말 어디 갈까? <span className="underline decoration-[#191919]/30 underline-offset-4">카톡으로 전시·나들이 소식 받기</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#3C1E1E]/90 font-medium max-w-xl">
                    부산 · 울산 · 경남의 숨은 무료 전시와 AI 도슨트 추천 데이트 코스를 카카오톡으로 편하게 받아보세요.
                  </p>
                </div>
              </div>

              {/* 우측 CTA 버튼 */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#191919] hover:bg-[#333333] active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <span className="text-amber-300 group-hover:rotate-12 transition-transform">💬</span>
                  <span>카카오톡으로 1초 만에 알림받기</span>
                  <span className="text-amber-300">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* 블로그 본문 및 사이드바용 카드형 배너 */
        <div className="my-8 p-6 rounded-3xl bg-gradient-to-br from-[#FEE500] via-[#FFF9C4] to-[#FFF59D] border border-amber-300/80 shadow-md text-[#191919] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#191919] text-[#FEE500] flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                주간 문화 알리미
              </span>
              <h3 className="text-base font-extrabold text-[#191919] mt-0.5">
                놓치기 아쉬운 다음 주 부울경 전시 소식
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#3C1E1E]/90 leading-relaxed font-medium">
            매주 새롭게 열리는 미술관 특별전과 핫한 갤러리 나들이 코스를 카카오톡으로 가장 먼저 만나보세요!
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#191919] hover:bg-[#333333] active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>💬 카카오톡 무료 알림 신청하기</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* 구독 모달 */}
      <KakaoSubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
