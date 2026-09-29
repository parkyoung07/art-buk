"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import KakaoSubscribeModal from "@/components/KakaoSubscribeModal";

export default function Header() {
  const pathname = usePathname();
  const [isKakaoModalOpen, setIsKakaoModalOpen] = useState(false);

  const navItems = [
    { href: "/exhibitions", label: "전시", icon: "🎨" },
    { href: "/markets", label: "오늘 장날", icon: "🧺" },
    { href: "/libraries", label: "도서관", icon: "📚" },
    { href: "/ai-trip", label: "AI 플래너", icon: "✨" },
    { href: "/blog", label: "매거진", icon: "📝" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* 1. 메인 헤더 상단 바 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* 브랜드 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          title="나드리 AI 홈으로"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-base shadow-xs group-hover:scale-105 transition-transform">
            ✨
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                나드리 AI
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-indigo-600">
                부울경
              </span>
            </div>
          </div>
        </Link>

        {/* 모바일 카톡 알림 버튼 */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsKakaoModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FEE500] text-[#191919] active:scale-95 transition-all cursor-pointer"
            aria-label="카카오톡 알림받기"
          >
            <svg className="w-3 h-3 fill-[#191919]" viewBox="0 0 24 24">
              <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.85 1.864 5.352 4.675 6.723-.205.76-.74 2.76-.848 3.193-.134.542.197.534.415.39.172-.114 2.73-1.856 3.83-2.613.623.09 1.268.138 1.928.138 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
            </svg>
            <span>알림받기</span>
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden sm:flex items-center gap-2 text-xs font-semibold shrink-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setIsKakaoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold bg-[#FEE500] hover:bg-[#FDD835] active:scale-95 text-[#191919] transition-all shadow-xs shrink-0 cursor-pointer ml-1"
          >
            <svg className="w-3.5 h-3.5 fill-[#191919]" viewBox="0 0 24 24">
              <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.85 1.864 5.352 4.675 6.723-.205.76-.74 2.76-.848 3.193-.134.542.197.534.415.39.172-.114 2.73-1.856 3.83-2.613.623.09 1.268.138 1.928.138 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
            </svg>
            <span>카톡 소식</span>
          </button>
        </nav>
      </div>

      {/* 2. 모바일 하단 슬림 네비게이션 바 */}
      <div className="sm:hidden border-t border-slate-100 bg-slate-50/90 px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs font-black"
                    : "bg-white text-slate-700 border border-slate-200/60 active:bg-slate-100"
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <KakaoSubscribeModal
        isOpen={isKakaoModalOpen}
        onClose={() => setIsKakaoModalOpen(false)}
      />
    </header>
  );
}

