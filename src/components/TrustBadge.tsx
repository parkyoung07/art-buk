import React from "react";

interface TrustBadgeProps {
  label?: string;
  source?: string;
  className?: string;
}

export default function TrustBadge({
  label = "공식정보 실시간 검증 완료",
  source = "지자체 공공데이터 & 기관 공식정보 연동",
  className = "",
}: TrustBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11px] text-emerald-800 font-semibold shadow-2xs ${className}`}
      title="공공데이터 및 지자체 공식 정보 실시간 연동 검증"
    >
      <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold shrink-0">
        ✓
      </span>
      <span>{label}</span>
      <span className="text-emerald-300 select-none">|</span>
      <span className="text-emerald-700 font-medium hidden sm:inline">{source}</span>
    </div>
  );
}
