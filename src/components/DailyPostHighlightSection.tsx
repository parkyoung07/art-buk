"use client";

import React from "react";
import Link from "next/link";
import { PostData } from "@/lib/posts";

interface DailyPostHighlightSectionProps {
  posts: PostData[];
}

export default function DailyPostHighlightSection({ posts }: DailyPostHighlightSectionProps) {
  if (!posts || posts.length === 0) return null;

  const todayPost = posts[0];
  const recentPosts = posts.slice(1, 4);

  return (
    <section className="space-y-6">
      {/* 섹션 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 text-indigo-900 border border-indigo-200/60 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>🔥 AI 도슨트 일일 전시 큐레이션</span>
            <span className="text-slate-400">|</span>
            <span className="text-indigo-600 font-extrabold">{todayPost.date} 오늘자 업데이트</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>오늘의 AI 추천 전시 & 매거진</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            부울경 39개 시·군·구의 숨은 명품 전시와 로컬 맛집, 5일장, 힐링 도서관 나들이 코스를 매일 1편씩 엄선해 전해드립니다.
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs sm:text-sm transition-all shrink-0 group"
        >
          <span>큐레이션 매거진 전체보기 ({posts.length}편)</span>
          <span className="group-hover:translate-x-0.5 transition-transform">➔</span>
        </Link>
      </div>

      {/* 메인 피처드 카드 (오늘자 AI 추천 전시 대형 카드) */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl overflow-hidden border border-indigo-800/40 shadow-xl text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* 좌측: 고화질 썸네일 이미지 & 뱃지 */}
          <div className="lg:col-span-6 relative min-h-[260px] sm:min-h-[340px] overflow-hidden group">
            {todayPost.thumbnail ? (
              <img
                src={todayPost.thumbnail}
                alt={todayPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                <span className="text-6xl">🎨</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/80"></div>
            
            {/* 상단 뱃지 그룹 */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg flex items-center gap-1">
                <span>🌟</span>
                <span>TODAY&apos;S PICK</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-indigo-900 shadow-md">
                {todayPost.region} · {todayPost.category}
              </span>
            </div>

            {/* 하단 날짜 표시 */}
            <div className="absolute bottom-4 left-4 z-10 lg:hidden">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-300/30">
                📅 {todayPost.date} AI 큐레이션
              </span>
            </div>
          </div>

          {/* 우측: 전시 상세 소개 및 나들이 코스 안내 */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="hidden lg:flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  📅 {todayPost.date} 오늘의 신규 추천
                </span>
                <span className="text-xs text-slate-400 font-medium">부울경 문화예술 AI 도슨트 리포트</span>
              </div>

              <Link href={`/blog/${todayPost.slug}`} className="block group">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-amber-300 transition-colors leading-snug [word-break:keep-all]">
                  {todayPost.title}
                </h3>
              </Link>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 [word-break:keep-all]">
                {todayPost.summary}
              </p>

              {/* 연계 나들이 코스 특화 칩 */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <span>💡 함께 엮은 당일치기 코스 가이드</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center gap-1">
                    <span>🍽️</span>
                    <span>로컬 맛집 & 카페</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center gap-1">
                    <span>🧺</span>
                    <span>인근 전통 5일장</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center gap-1">
                    <span>📚</span>
                    <span>힐링 도서관</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center gap-1">
                    <span>🎡</span>
                    <span>주변 핫플 명소</span>
                  </span>
                </div>
              </div>

              {/* 태그 목록 */}
              {todayPost.tags && todayPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {todayPost.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA 버튼 */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/blog/${todayPost.slug}`}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all text-center flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>✨ AI 도슨트 전시 해설 & 코스 읽기</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </Link>

              {todayPost.eventId && (
                <Link
                  href={`/events/${todayPost.eventId}`}
                  className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all text-center"
                >
                  <span>전시 상세 정보 보기</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 일일 추천 전시 카드 리스트 (어제, 그저께 등) */}
      {recentPosts.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span>📅 최근 매일 연재된 AI 추천 전시</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                매일 아침 09:30 업데이트
              </span>
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">이전 날짜 추천 다시보기</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-indigo-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  {/* 썸네일 & 뱃지 */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-2xl">
                        🎨
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {post.region}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                        {post.date}
                      </span>
                    </div>
                  </div>

                  {/* 제목 & 요약 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>도슨트 리뷰 읽기</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
