"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PostData } from "@/lib/posts";

interface DailyPostHighlightSectionProps {
  posts: PostData[];
}

export default function DailyPostHighlightSection({ posts }: DailyPostHighlightSectionProps) {
  if (!posts || posts.length === 0) return null;

  // 유니크 날짜 목록 추출 (최신순 4개 날짜)
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(posts.map((p) => p.date)));
    return dates.slice(0, 4);
  }, [posts]);

  // 현재 선택된 탭 날짜 (기본값: 가장 최신 날짜)
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || posts[0].date);

  // 선택된 날짜의 포스트 목록
  const activePosts = useMemo(() => {
    return posts.filter((p) => p.date === selectedDate);
  }, [posts, selectedDate]);

  const mainPost = activePosts[0] || posts[0];
  const secondaryPost = activePosts[1] || null;
  const tertiaryPost = activePosts[2] || null;

  // 이전 일자의 다른 최신 추천 글들 (선택된 날짜 제외 상위 4편)
  const otherRecentPosts = useMemo(() => {
    return posts.filter((p) => p.date !== selectedDate).slice(0, 4);
  }, [posts, selectedDate]);

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* 섹션 상단 헤더 & 날짜 필터 탭 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5">
            <span>✨</span>
            <span>AI 추천 매거진</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            오늘의 AI 큐레이션
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            매일 엄선되는 부울경 전시와 로컬 나들이 코스
          </p>
        </div>

        {/* 날짜 선택 탭 */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0 self-start sm:self-auto">
          {availableDates.map((d, idx) => {
            const isLatest = idx === 0;
            const label = isLatest ? `오늘` : idx === 1 ? `어제` : d.slice(5);
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === d
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 선택된 날짜의 포스트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* 1. 메인 1차 추천 전시 */}
        <div className={`relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${secondaryPost ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div>
            {/* 상단 이미지 영역 */}
            <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-100 group">
              {mainPost.thumbnail ? (
                <img
                  src={mainPost.thumbnail}
                  alt={mainPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl mb-2 text-indigo-300 border border-white/10 shadow-inner">
                    🏛️
                  </div>
                  <span className="text-xs font-bold text-slate-300 tracking-wider">
                    {mainPost.region} 공식 추천 코스
                  </span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-sm">
                  1차 추천 (오전)
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
                  {mainPost.region}
                </span>
              </div>
            </div>

            {/* 본문 소개 */}
            <div className="p-4 sm:p-6 space-y-2">
              <Link href={`/blog/${mainPost.slug}`} className="block group">
                <h3 className="text-base sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug [word-break:keep-all]">
                  {mainPost.title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 [word-break:keep-all]">
                {mainPost.summary}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 pt-0 flex items-center justify-between gap-3">
            <Link
              href={`/blog/${mainPost.slug}`}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              <span>코스 읽기</span>
              <span>➔</span>
            </Link>
            {mainPost.eventId && (
              <Link
                href={`/events/${mainPost.eventId}`}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                전시 정보 보기
              </Link>
            )}
          </div>
        </div>

        {/* 2. 서브 2차 추천 전시 */}
        {secondaryPost && (
          <div className="lg:col-span-4 bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-100 group">
                {secondaryPost.thumbnail ? (
                  <img
                    src={secondaryPost.thumbnail}
                    alt={secondaryPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg mb-1.5 text-amber-300 border border-white/10">
                      🌿
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">
                      {secondaryPost.region} 로컬 나들이
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm">
                    2차 추천 (오후)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm">
                    {secondaryPost.region}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <Link href={`/blog/${secondaryPost.slug}`} className="block group">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                    {secondaryPost.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {secondaryPost.summary}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                href={`/blog/${secondaryPost.slug}`}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white text-xs font-bold transition-all text-center block"
              >
                오후 추천 읽기 →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3차 이상 추가 포스트가 있을 경우 (3편/4편 발행 시 누락 없이 전체 노출) */}
      {activePosts.length > 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activePosts.slice(2).map((extraPost, idx) => (
            <div
              key={extraPost.slug}
              className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-1 rounded-md bg-amber-500 text-white text-[11px] font-black shrink-0">
                  {idx === 0 ? "3차 추천 PICK" : "4차 추천 PICK"}
                </span>
                <span className="font-extrabold text-slate-900 text-sm truncate">
                  {extraPost.title}
                </span>
              </div>
              <Link
                href={`/blog/${extraPost.slug}`}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-600 text-amber-900 hover:text-white font-bold text-xs border border-amber-300 transition-all shrink-0"
              >
                추천글 읽기 →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 3. 다른 날짜의 AI 연재 매거진 그리드 */}
      {otherRecentPosts.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span>📅 다른 날짜의 매거진 추천 코스</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                누적 {posts.length}편 연재 중
              </span>
            </h3>
            <Link
              href="/blog"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>매거진 전체보기</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherRecentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-indigo-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  {/* 썸네일 & 뱃지 */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-xl mb-1">🏛️</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {post.region} 매거진 코스
                        </span>
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

                  {/* 제목 & 요약 소글 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>도슨트 리뷰</span>
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
