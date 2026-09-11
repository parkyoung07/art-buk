"use client";

import React from "react";
import Link from "next/link";
import { PostData } from "@/lib/posts";

interface DailyPostHighlightSectionProps {
  posts: PostData[];
}

export default function DailyPostHighlightSection({ posts }: DailyPostHighlightSectionProps) {
  if (!posts || posts.length === 0) return null;

  // 가장 최신 날짜 찾기
  const latestDate = posts[0].date;
  
  // 오늘(최신 날짜) 발행된 글 목록 (보통 2편)
  const todayPosts = posts.filter((p) => p.date === latestDate);
  const mainTodayPost = todayPosts[0];
  const secondaryTodayPost = todayPosts[1] || null;

  // 이전 날짜 글 목록 (최근 3~4편)
  const pastPosts = posts.filter((p) => p.date !== latestDate).slice(0, 3);

  return (
    <section className="space-y-6">
      {/* 섹션 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 text-indigo-900 border border-indigo-200/60 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>🔥 AI 도슨트 일일 2회 정기 큐레이션</span>
            <span className="text-slate-400">|</span>
            <span className="text-indigo-600 font-extrabold">{latestDate} 신규 2편 완비</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>오늘의 AI 추천 전시 & 매거진</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            부울경 39개 지역의 명품 전시와 로컬 맛집, 5일장, 힐링 도서관 나들이 코스를 매일 2편(오전/오후) 엄선합니다.
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

      {/* 🌟 오늘 발행된 2편 그리드 / 메인 피처드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. 오늘의 메인 1차 추천 전시 (대형 와이드 카드) */}
        <div className={`relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl overflow-hidden border border-indigo-800/40 shadow-xl text-white ${secondaryTodayPost ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div className="flex flex-col h-full justify-between">
            {/* 상단 이미지 영역 */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden group">
              {mainTodayPost.thumbnail ? (
                <img
                  src={mainTodayPost.thumbnail}
                  alt={mainTodayPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-5xl">
                  🎨
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* 상단 뱃지 */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg flex items-center gap-1">
                  <span>🌟</span>
                  <span>TODAY 1차 PICK (오전)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-indigo-900 shadow-md">
                  {mainTodayPost.region} · {mainTodayPost.category}
                </span>
              </div>

              <div className="absolute bottom-3 right-4 z-10">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-400 text-slate-950 shadow-md">
                  📅 {mainTodayPost.date} 발행
                </span>
              </div>
            </div>

            {/* 하단 본문 소개 */}
            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <Link href={`/blog/${mainTodayPost.slug}`} className="block group">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors leading-snug [word-break:keep-all]">
                    {mainTodayPost.title}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 [word-break:keep-all]">
                  {mainTodayPost.summary}
                </p>

                {/* 태그 목록 */}
                {mainTodayPost.tags && mainTodayPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mainTodayPost.tags.slice(0, 4).map((tag, idx) => (
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
              <div className="pt-4 flex items-center gap-3">
                <Link
                  href={`/blog/${mainTodayPost.slug}`}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>✨ 도슨트 해설 & 코스 읽기</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </Link>
                {mainTodayPost.eventId && (
                  <Link
                    href={`/events/${mainTodayPost.eventId}`}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all text-center"
                  >
                    전시 정보
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 오늘의 서브 2차 추천 전시 (오후 발행 카드) */}
        {secondaryTodayPost && (
          <div className="lg:col-span-4 bg-white rounded-3xl overflow-hidden border border-indigo-200 shadow-lg flex flex-col justify-between">
            <div>
              {/* 이미지 */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 group">
                {secondaryTodayPost.thumbnail ? (
                  <img
                    src={secondaryTodayPost.thumbnail}
                    alt={secondaryTodayPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">
                    🎨
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-600 text-white shadow-md flex items-center gap-1">
                    <span>✨</span>
                    <span>TODAY 2차 PICK (오후)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800">
                    {secondaryTodayPost.region}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-900 text-white shadow-xs">
                    {secondaryTodayPost.date}
                  </span>
                </div>
              </div>

              {/* 본문 */}
              <div className="p-5 space-y-2.5">
                <Link href={`/blog/${secondaryTodayPost.slug}`} className="block group">
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                    {secondaryTodayPost.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {secondaryTodayPost.summary}
                </p>
                {secondaryTodayPost.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {secondaryTodayPost.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link
                href={`/blog/${secondaryTodayPost.slug}`}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all text-center block"
              >
                오후 추천 코스 읽기 →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. 최근 일일 추천 전시 카드 리스트 (어제 및 이전 일자 추천) */}
      {pastPosts.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span>📅 최근 매일 연재된 AI 추천 전시</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                하루 2회 정기 연재
              </span>
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">이전 날짜 추천 다시보기</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {pastPosts.map((post) => (
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
