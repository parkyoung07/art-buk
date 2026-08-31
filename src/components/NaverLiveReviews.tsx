import React from "react";
import { NaverSearchItem } from "@/lib/naver";

interface NaverLiveReviewsProps {
  keyword: string;
  blogReviews: NaverSearchItem[];
  cafeReviews?: NaverSearchItem[];
}

export default function NaverLiveReviews({ keyword, blogReviews, cafeReviews = [] }: NaverLiveReviewsProps) {
  if (blogReviews.length === 0 && cafeReviews.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-[#03C75A] text-white flex items-center justify-center font-black text-sm shadow-sm">
            N
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              실시간 네이버 관람객 생생 후기
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live 연동
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              네이버 블로그와 카페에서 전하는 &apos;{keyword}&apos;의 실제 방문 리뷰입니다.
            </p>
          </div>
        </div>

        <a
          href={`https://search.naver.com/search.naver?where=view&query=${encodeURIComponent(keyword + " 후기")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#03C75A] hover:text-[#02b350] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>네이버 전체 리뷰 더보기</span>
          <span>↗</span>
        </a>
      </div>

      {/* 후기 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 블로그 후기 목록 */}
        {blogReviews.map((item, idx) => (
          <a
            key={`blog-${idx}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#03C75A]/50 hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ✍️ 블로그 후기
                </span>
                {item.postdate && (
                  <span>
                    {item.postdate.slice(0, 4)}.{item.postdate.slice(4, 6)}.{item.postdate.slice(6, 8)}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#03C75A] transition-colors line-clamp-1 leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-600 truncate max-w-[150px]">
                {item.bloggername || "네이버 블로거"}
              </span>
              <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                글 읽기 →
              </span>
            </div>
          </a>
        ))}

        {/* 카페 후기 목록 (있을 경우) */}
        {cafeReviews.map((item, idx) => (
          <a
            key={`cafe-${idx}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#03C75A]/50 hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                  ☕ 카페 이야기
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#03C75A] transition-colors line-clamp-1 leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-600 truncate max-w-[150px]">
                {item.cafename || "네이버 카페"}
              </span>
              <span className="text-teal-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                글 읽기 →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
