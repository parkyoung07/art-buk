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
        /* 메인 및 블로그 목록용 검색창 크기의 슬림하고 세련된 카카오 구독 바 */
        <section className="relative w-full max-w-4xl mx-auto px-3 sm:px-6 my-3 sm:my-4 z-30">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FEE500] via-[#ffeb3b] to-[#ffe082] py-2 px-3 sm:px-4 shadow-sm border border-amber-300 transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[#191919]">
              {/* 좌측 텍스트 & 아이콘 */}
              <div className="flex items-center gap-2 min-w-0 text-center sm:text-left">
                <div className="w-7 h-7 rounded-lg bg-[#191919] text-[#FEE500] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                  </svg>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold bg-[#191919] text-[#FEE500] px-1.5 py-0.5 rounded shrink-0">
                    알림
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#191919] tracking-tight">
                    카톡으로 부울경 무료 전시 & 주말 나들이 소식 받기
                  </span>
                  <span className="text-[10px] text-[#3C1E1E]/70 font-medium hidden md:inline">
                    (월·수·금)
                  </span>
                </div>
              </div>

              {/* 우측 액션 버튼 그룹 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href="https://pf.kakao.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-2.5 rounded-lg bg-[#191919] hover:bg-[#333333] active:scale-95 text-white font-extrabold text-[11px] sm:text-xs transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="text-[#FEE500]">💬</span>
                  <span>채널 추가</span>
                  <span className="text-amber-300 text-[10px]">↗</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-1 px-2 rounded-lg bg-white/95 hover:bg-white active:scale-95 text-slate-900 font-bold text-[11px] sm:text-xs transition-all border border-amber-400/80 shadow-2xs cursor-pointer"
                >
                  번호 신청
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* 블로그 글 하단 및 전시 상세용 콤팩트 알림 카드 */
        <div className="my-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#FEE500]/95 via-[#FFF9C4] to-[#FFF59D] border border-amber-300 shadow-sm text-[#191919]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#191919] text-[#FEE500] flex items-center justify-center shrink-0 shadow-2xs">
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                </svg>
              </div>
              <div>
                <span className="inline-block text-[10px] font-extrabold text-[#191919] bg-amber-300 px-1.5 py-0.2 rounded mb-0.5">
                  무료 알림
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#191919] tracking-tight">
                  부울경 새 전시 & 주말 나들이 소식 카톡 받기
                </h4>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex items-center gap-1.5 shrink-0 justify-end">
              <a
                href="https://pf.kakao.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-[#191919] hover:bg-[#333333] active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span className="text-[#FEE500]">💬</span>
                <span>카톡 채널 추가 ↗</span>
              </a>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-900 font-bold text-xs transition-all border border-amber-400 cursor-pointer shadow-2xs"
              >
                번호 신청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 모달 */}
      <KakaoSubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

