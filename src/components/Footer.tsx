import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* 브랜드 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                ✨
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">나드리 AI</span>
            </div>
            <p className="text-sm text-slate-300 font-medium">
              부산·울산·경남 AI 문화·나들이 플랫폼
            </p>
            <p className="text-xs text-slate-400">
              전시 · 5일장 · 도서관 · AI 나들이 추천
            </p>
          </div>

          {/* 빠른 링크 */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <Link href="/exhibitions" className="hover:text-white transition-colors">
              🎨 전체 전시
            </Link>
            <Link href="/markets" className="hover:text-white transition-colors">
              🧺 5일장 & 상설시장
            </Link>
            <Link href="/libraries" className="hover:text-white transition-colors">
              📚 대표 & 쌈지도서관
            </Link>
            <Link href="/ai-trip" className="hover:text-white transition-colors">
              ✨ AI 나들이 플래너
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              📝 문화 블로그
            </Link>
            <Link href="/intro" className="hover:text-white transition-colors">
              🌟 소개
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© 2026 NADRI AI. All rights reserved.</p>
          <p className="text-slate-400">공공데이터포털 & NAVER OpenAPI & Cloudflare Workers AI 연동</p>
        </div>
      </div>
    </footer>
  );
}
