"use client";

import React, { useState } from "react";

interface KakaoSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KakaoSubscribeModal({ isOpen, onClose }: KakaoSubscribeModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      // 3초 후 초기화
    }, 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://pf.kakao.com/_artbuk");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800">
        
        {/* 상단 옐로우 헤더 */}
        <div className="bg-[#FEE500] px-6 pt-7 pb-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-900 transition-colors text-sm font-bold"
            aria-label="닫기"
          >
            ✕
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#191919] flex items-center justify-center text-[#FEE500] shadow-md mb-3">
            <svg
              className="w-8 h-8 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
            </svg>
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#191919] text-[#FEE500] mb-2 shadow-xs">
            💬 매주 월·수·금 아침 8시 발송
          </span>
          <h3 className="text-xl font-black text-[#191919] tracking-tight">
            부울경 전시·나들이 소식 받기
          </h3>
          <p className="text-xs text-[#3C1E1E]/80 mt-1 font-medium">
            부산 · 울산 · 경남의 엄선된 무료 전시 & 핫플레이스
          </p>
        </div>

        {/* 본문 내용 */}
        <div className="p-6 space-y-5">
          {isSubmitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                알림 신청이 완료되었습니다! 🎉
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                매주 월·수·금 아침 8시, 엄선된 부울경의 감성 전시와 나들이 코스를 카카오톡으로 전해드릴게요!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                확인
              </button>
            </div>
          ) : (
            <>
              {/* 1. 카카오톡 채널 바로가기 버튼 */}
              <div className="space-y-2">
                <a
                  href="https://pf.kakao.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FEE500] hover:bg-[#ebd300] active:scale-98 text-[#191919] font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200/50"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.82 1.83 5.3 4.6 6.74-.2.74-.74 2.68-.85 3.1-.14.5.18.5.38.36.26-.18 3.56-2.42 4.14-2.82.57.08 1.15.12 1.73.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                  </svg>
                  <span>카카오톡 채널 추가하고 알림받기</span>
                </a>
                <p className="text-[11px] text-center text-slate-400">
                  버튼을 누르면 카카오톡 채널 추가 페이지로 연결됩니다.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[11px] text-slate-400 font-medium">또는 휴대폰 번호로 신청</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* 2. 전화번호 간편 알림 신청 폼 */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="phone-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    휴대폰 번호
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:border-slate-400 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all"
                >
                  무료 알림 신청하기 ✉️
                </button>
              </form>

              {/* 링크 복사 & 안심 문구 */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="hover:text-slate-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <span>🔗 채널 링크 복사</span>
                  {isCopied && <span className="text-emerald-600 font-bold">✓ 복사됨</span>}
                </button>
                <span>🔒 스팸 없이 주 3회(월·수·금)만 발송</span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
