"use client";

export interface MoodFilterOption {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  description: string;
}

export const MOOD_FILTERS: MoodFilterOption[] = [
  { id: "all", label: "전체 전시", icon: "✨", description: "부울경의 모든 전시" },
  { id: "hot", label: "지금 가장 핫한", icon: "🔥", badge: "HOT", description: "이번 주 가장 주목받는 추천 전시" },
  { id: "closing", label: "마감 임박 D-Day", icon: "⏳", badge: "마감", description: "놓치면 아쉬운 종료 임박 전시" },
  { id: "free", label: "전액 무료 관람", icon: "🎟️", description: "부담 없이 즐기는 무료 전시" },
  { id: "rainy", label: "비 오는 날 실내", icon: "☔", description: "비 와도 쾌적한 실내 대형 미술관" },
  { id: "healing", label: "감성 힐링 산책", icon: "🌿", description: "바다뷰와 자연이 어우러진 나들이" },
  { id: "kids", label: "아이와 함께 체험", icon: "👶", description: "가족 모두가 즐거운 오감 만족 코스" },
];

interface EditorialMoodFilterProps {
  selectedMood: string;
  onSelectMood: (moodId: string) => void;
  resultCount?: number;
}

export default function EditorialMoodFilter({
  selectedMood,
  onSelectMood,
  resultCount,
}: EditorialMoodFilterProps) {
  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white tracking-widest uppercase">
            29CM MOOD
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
            취향별 감성 퀵 큐레이션
          </h3>
        </div>
        {typeof resultCount === "number" && (
          <span className="text-xs text-slate-500 font-medium">
            총 <strong className="text-indigo-600 font-bold">{resultCount}</strong>개 전시
          </span>
        )}
      </div>

      {/* 가로 스크롤 가능한 29CM 스타일 무드 필터 칩 바 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {MOOD_FILTERS.map((mood) => {
          const isActive = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood.id)}
              className={`group shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer snap-start border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-[1.02]"
                  : "bg-white text-slate-600 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              }`}
            >
              <span className="text-sm">{mood.icon}</span>
              <span className="font-semibold tracking-tight">{mood.label}</span>
              {mood.badge && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}
                >
                  {mood.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
