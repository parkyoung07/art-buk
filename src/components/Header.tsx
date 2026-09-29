"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import KakaoSubscribeModal from "@/components/KakaoSubscribeModal";

export default function Header() {
  const pathname = usePathname();
  const [isKakaoModalOpen, setIsKakaoModalOpen] = useState(false);

  const navItems = [
    { href: "/exhibitions", label: "전시", icon: "🎨", color: "hover:text-indigo-600 hover:bg-indigo-50" },
    { href: "/markets", label: "오늘 장날", icon: "🧺", color: "hover:text-amber-600 hover:bg-amber-50" },
    { href: "/libraries", label: "도서관", icon: "📚", color: "hover:text-emerald-600 hover:bg-emerald-50" },
    { href: "/ai-trip", label: "AI 나들이", icon: "✨", color: "hover:text-indigo-600 hover:bg-indigo-50" },
    { href: "/blog", label: "블로그", icon: "📝", color: "hover:text-slate-700 hover:bg-slate-100" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* 1. 메인 헤더 상단 바 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-2">
        {/* 브랜드 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          title="나드리 AI 홈으로"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white text-sm sm:text-base shadow-sm shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
            ✨
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-lg tracking-tight text-slate-900 leading-none">
                나드리 AI
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                부울경
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5 whitespace-nowrap hidden sm:block">
              부산 · 울산 · 경남 AI 문화·나들이 플랫폼
            </p>
          </div>
        </Link>

        {/* 모바일 상단 우측: 카톡 알림톡/구독 버튼 */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsKakaoModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-[#FEE500] hover:bg-[#FDD835] active:scale-95 text-[#191919] shadow-xs border border-amber-300 transition-all cursor-pointer"
            aria-label="카카오톡 알림받기"
          >
            <svg className="w-3.5 h-3.5 fill-[#191919]" viewBox="0 0 24 24">
              <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.85 1.864 5.352 4.675 6.723-.205.76-.74 2.76-.848 3.193-.134.542.197.534.415.39.172-.114 2.73-1.856 3.83-2.613.623.09 1.268.138 1.928.138 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
            </svg>
            <span>카톡 알림</span>
          </button>
        </div>

        {/* 데스크톱/태블릿 네비게이션 (화면 폭 >= 640px) */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5 text-xs font-semibold shrink-0 py-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 border cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : `bg-slate-50/80 text-slate-700 border-slate-200/80 ${item.color}`
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* 카톡 메뉴 버튼 (데스크톱) */}
          <button
            type="button"
            onClick={() => setIsKakaoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-[#FEE500] hover:bg-[#FDD835] active:scale-95 text-[#191919] border border-amber-300 transition-all shadow-xs shrink-0 cursor-pointer ml-1"
            title="카카오톡 알림톡 소식받기"
          >
            <svg className="w-3.5 h-3.5 fill-[#191919]" viewBox="0 0 24 24">
              <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.85 1.864 5.352 4.675 6.723-.205.76-.74 2.76-.848 3.193-.134.542.197.534.415.39.172-.114 2.73-1.856 3.83-2.613.623.09 1.268.138 1.928.138 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
            </svg>
            <span>카톡 소식받기</span>
          </button>
        </nav>
      </div>

      {/* 2. 모바일 상단 퀵 메뉴 바 (장날, 도서관, 전시, AI 나들이, 블로그) */}
      <div className="sm:hidden border-t border-slate-100 bg-slate-50/80 px-2 py-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 border cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200/90 active:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 카카오 구독 모달 */}
      <KakaoSubscribeModal
        isOpen={isKakaoModalOpen}
        onClose={() => setIsKakaoModalOpen(false)}
      />
    </header>
  );
}

