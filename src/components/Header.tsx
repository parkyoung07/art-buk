"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/exhibitions", label: "전시", icon: "🎨", color: "hover:text-indigo-600 hover:bg-indigo-50" },
    { href: "/markets", label: "오늘 장날", icon: "🧺", color: "hover:text-amber-600 hover:bg-amber-50" },
    { href: "/libraries", label: "도서관", icon: "📚", color: "hover:text-emerald-600 hover:bg-emerald-50" },
    { href: "/ai-trip", label: "AI 나들이", icon: "✨", color: "hover:text-indigo-600 hover:bg-indigo-50" },
    { href: "/blog", label: "블로그", icon: "📝", color: "hover:text-slate-700 hover:bg-slate-100" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
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

        {/* 데스크톱/태블릿 네비게이션 */}
        <nav className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold shrink-0 py-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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

          <Link
            href="/intro"
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs shrink-0"
            title="나드리 AI 소개"
          >
            <span>🌟</span>
            <span>소개</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
