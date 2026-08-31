"use client";

import React, { useState } from "react";
import KakaoSubscribeModal from "./KakaoSubscribeModal";

interface KakaoSubscribeBannerProps {
  variant?: "hero" | "card" | "inline";
}

export default function KakaoSubscribeBanner({ variant = "hero" }: KakaoSubscribeBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inlinePhone, setInlinePhone] = useState("");
  const [inlineSubmitted, setInlineSubmitted] = useState(false);

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlinePhone.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem("artbuk_subscribers") || "[]");
      existing.push({ phone: inlinePhone, date: new Date().toISOString() });
      localStorage.setItem("artbuk_subscribers", JSON.stringify(existing));
    } catch {
      // ignore
    }

    setInlineSubmitted(true);
  };

  return (
    <>
      {variant === "hero" ? (
        /* 메인 및 블로그 목록 Hero 아래용 대형 프리미엄 배너 */
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-30">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FEE500] via-[#ffeb3b] to-[#ffe082] p-6 sm:p-8 shadow-xl border border-amber-300/60 transition-all hover:shadow-2xl">
            {/* 배경 은은한 데코 */}
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
                    <span>🔔 매주 월·수·금 아침 8시 발송 · 100% 무료</span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#191919] leading-snug">
                    이번 주 어디 갈까? <span className="underline decoration-[#191919]/30 underline-offset-4">카톡으로 전시·나들이 소식 받기</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#3C1E1E]/90 font-medium max-w-xl leading-relaxed">
                    부산 · 울산 · 경남의 숨은 무료 전시와 AI 도슨트 추천 데이트 코스를,<br className="hidden sm:inline" />
                    카카오톡으로 편하게 받아보세요.
                  </p>
                </div>
              </div>

              {/* 우측 CTA 액션 버튼 그룹 */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                <a
                  href="https://pf.kakao.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#191919] hover:bg-[#333333] active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <span className="text-[#FEE500] group-hover:rotate-12 transition-transform">💬</span>
                  <span>카카오톡 채널 바로 추가</span>
                  <span className="text-amber-300">↗</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/80 hover:bg-white active:scale-95 text-slate-900 font-bold text-xs sm:text-sm transition-all border border-amber-400/80 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>✉️ 번호로 신청</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* 블로그 글 하단 및 전시 상세용 인라인 알림 신청 카드 */
        <div className="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FEE500] via-[#FFF9C4] to-[#FFF59D] border-2 border-amber-300 shadow-lg text-[#191919] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#191919] text-[#FEE500] flex items-center justify-center shrink-0 shadow-md">
                <svg
                  className="w-7 h-7 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                </svg>
              </div>
              <div>
                <span className="inline-block text-[11px] font-extrabold text-[#191919] bg-amber-300/90 border border-amber-400 px-2.5 py-0.5 rounded-full mb-1">
                  💬 매주 월·수·금 아침 8시 발송 · 100% 무료
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#191919] tracking-tight">
                  부울경 전시 & 주말 나들이 소식 카톡으로 받기
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#3C1E1E]/90 leading-relaxed font-medium">
            매주 새롭게 열리는 미술관 특별전과 핫한 갤러리 나들이 코스를,<br className="hidden sm:inline" />
            카카오톡으로 가장 먼저 만나보세요!
          </p>

          {/* 1. 카카오톡 채널 바로가기 버튼 (외부 새 창 다이렉트 연결) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="https://pf.kakao.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#191919] hover:bg-[#333333] active:scale-98 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-center"
            >
              <svg
                className="w-5 h-5 fill-[#FEE500]"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
              </svg>
              <span>카카오톡 채널 친구 추가하기 ↗</span>
            </a>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 active:scale-98 text-slate-900 font-extrabold text-xs sm:text-sm transition-all border border-amber-400 shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <span>✉️ 휴대폰 번호로 알림 신청하기</span>
            </button>
          </div>

          {/* 간편 인라인 신청 폼 (모달 없이도 바로 입력 가능) */}
          {inlineSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
              <span>✓ 알림 신청이 완료되었습니다! 매주 월·수·금 아침 8시에 찾아뵐게요.</span>
            </div>
          ) : (
            <form onSubmit={handleInlineSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="tel"
                placeholder="휴대폰 번호 입력 (예: 010-1234-5678)"
                value={inlinePhone}
                onChange={(e) => setInlinePhone(e.target.value)}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-amber-300/80 bg-white/90 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#191919]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
              >
                간편 등록
              </button>
            </form>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#3C1E1E]/70 pt-1 border-t border-amber-300/60">
            <span>🔒 개인정보는 알림 발송 외 용도로 사용되지 않습니다.</span>
            <span className="font-semibold">스팸 없이 주 3회만 발송</span>
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
