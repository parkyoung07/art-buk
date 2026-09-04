import React from "react";

interface TrustBadgeProps {
  date?: string;
  source?: string;
  className?: string;
}

export default function TrustBadge({
  date = "2026.09.04",
  source = "공공데이터 / 기관 공식정보 · AI 요약",
  className = "",
}: TrustBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 font-medium ${className}`}
      title="공식 데이터 검증 및 최근 업데이트 정보"
    >
      <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
        ✓
      </span>
      <span>공식정보 확인</span>
      <span className="text-emerald-300">|</span>
      <span className="text-emerald-700">{date}</span>
      <span className="hidden sm:inline text-emerald-300">|</span>
      <span className="hidden sm:inline text-emerald-600">{source}</span>
    </div>
  );
}
