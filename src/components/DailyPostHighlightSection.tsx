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
    <section className="space-y-6">
      {/* 섹션 상단 헤더 & 날짜 필터 탭 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 text-indigo-900 border border-indigo-200/60 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>🔥 AI 도슨트 일일 2회 정기 큐레이션</span>
            <span className="text-slate-400">|</span>
            <span className="text-indigo-600 font-extrabold">{selectedDate} 큐레이션 연동</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>오늘의 AI 추천 전시 & 매거진</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            부울경 39개 지역의 명품 전시와 로컬 맛집, 5일장, 힐링 도서관 나들이 코스를 매일 2편(오전/오후) 엄선합니다.
          </p>
        </div>

        {/* 날짜 선택 탭 (실시간 변화 체감 탭) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shrink-0">
          {availableDates.map((d, idx) => {
            const isLatest = idx === 0;
            const label = isLatest ? `오늘 (${d.slice(5)})` : idx === 1 ? `어제 (${d.slice(5)})` : d.slice(5);
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedDate === d
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {isLatest && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"></span>}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 선택된 날짜의 포스트 그리드 (1차 오전 PICK + 2차 오후 PICK) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. 메인 1차 추천 전시 (대형 와이드 카드) */}
        <div className={`relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl overflow-hidden border border-indigo-800/40 shadow-xl text-white ${secondaryPost ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div className="flex flex-col h-full justify-between">
            {/* 상단 이미지 영역 */}
            <div className="relative h-64 sm:h-76 w-full overflow-hidden group">
              {mainPost.thumbnail ? (
                <img
                  src={mainPost.thumbnail}
                  alt={mainPost.title}
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
                  <span>{selectedDate === availableDates[0] ? "TODAY 1차 PICK (오전)" : "1차 추천 PICK"}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-indigo-900 shadow-md">
                  {mainPost.region} · {mainPost.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
                  🍂 가을 예술 나들이
                </span>
              </div>

              <div className="absolute bottom-3 right-4 z-10">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-900/90 border border-indigo-500/50 text-white shadow-md">
                  📅 {mainPost.date} 정기 발행
                </span>
              </div>
            </div>

            {/* 하단 본문 소개 */}
            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <Link href={`/blog/${mainPost.slug}`} className="block group">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors leading-snug [word-break:keep-all]">
                    {mainPost.title}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 [word-break:keep-all]">
                  {mainPost.summary}
                </p>

                {/* 태그 목록 */}
                {mainPost.tags && mainPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mainPost.tags.slice(0, 5).map((tag, idx) => (
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
                  href={`/blog/${mainPost.slug}`}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>✨ 도슨트 해설 & 코스 읽기</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </Link>
                {mainPost.eventId && (
                  <Link
                    href={`/events/${mainPost.eventId}`}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all text-center"
                  >
                    전시 상세정보
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 서브 2차 추천 전시 (오후 발행 카드) */}
        {secondaryPost && (
          <div className="lg:col-span-4 bg-white rounded-3xl overflow-hidden border border-indigo-200 shadow-lg flex flex-col justify-between">
            <div>
              {/* 이미지 */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 group">
                {secondaryPost.thumbnail ? (
                  <img
                    src={secondaryPost.thumbnail}
                    alt={secondaryPost.title}
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
                    <span>2차 추천 PICK (오후)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800">
                    {secondaryPost.region}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-900 text-white shadow-xs">
                    {secondaryPost.date}
                  </span>
                </div>
              </div>

              {/* 본문 */}
              <div className="p-5 space-y-2.5">
                <Link href={`/blog/${secondaryPost.slug}`} className="block group">
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                    {secondaryPost.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {secondaryPost.summary}
                </p>
                {secondaryPost.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {secondaryPost.tags.slice(0, 3).map((t, idx) => (
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
                href={`/blog/${secondaryPost.slug}`}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all text-center block"
              >
                오후 추천 코스 읽기 →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3차 포스트가 있을 경우 (주말 등 3편 발행 시 추가 노출) */}
      {tertiaryPost && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-amber-500 text-white text-[11px] font-black shrink-0">
              주말 특별 3차 PICK
            </span>
            <span className="font-extrabold text-slate-900 text-sm truncate">
              {tertiaryPost.title}
            </span>
          </div>
          <Link
            href={`/blog/${tertiaryPost.slug}`}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-600 text-amber-900 hover:text-white font-bold text-xs border border-amber-300 transition-all shrink-0"
          >
            특별 추천글 읽기 →
          </Link>
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
