"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/exhibitions", label: "전시", icon: "🎨" },
    { href: "/markets", label: "장날", icon: "🧺" },
    { href: "/libraries", label: "도서관", icon: "📚" },
    { href: "/ai-trip", label: "AI 추천", icon: "✨" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 py-1.5 safe-area-pb">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-indigo-600 font-extrabold scale-105"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <span className="text-lg leading-none mb-1">{tab.icon}</span>
              <span className={`text-[10.5px] leading-none ${isActive ? "text-indigo-600 font-bold" : "text-slate-500"}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
