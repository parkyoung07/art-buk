"use client";

import React, { useState } from "react";
import {
  getKoreanToday,
  getUpcomingWeekendDates,
  KOREAN_DAY_NAMES,
  formatDateKorean,
  formatDateFullKorean,
  formatDateISO,
} from "@/utils/date";

interface CustomCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date, label: string) => void;
}

export default function CustomCalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: CustomCalendarModalProps) {
  const today = getKoreanToday();
  const weekends = getUpcomingWeekendDates(today);

  // 현재 보고 있는 년/월 상태
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth()); // 0 ~ 11
  const [tempSelected, setTempSelected] = useState<Date>(selectedDate);

  if (!isOpen) return null;

  // 최대 6개월 후까지 이동 허용
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 6);

  // 이전 달로 이동
  const handlePrevMonth = () => {
    if (viewYear === today.getFullYear() && viewMonth <= today.getMonth()) {
      return; // 과거 달 이동 방지
    }
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    if (viewYear > maxDate.getFullYear() || (viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth())) {
      return;
    }
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // 이번 달 1일의 요일 (0 ~ 6)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // 이번 달 마지막 날짜
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 빠른 선택 핸들러
  const handleQuickSelect = (d: Date, label: string) => {
    setTempSelected(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    onSelectDate(d, label);
    onClose();
  };

  // 날짜 클릭 핸들러
  const handleDayClick = (dayNumber: number) => {
    const clicked = new Date(viewYear, viewMonth, dayNumber);
    clicked.setHours(0, 0, 0, 0);

    if (clicked.getTime() < today.getTime()) return; // 과거일 불가

    setTempSelected(clicked);
  };

  // 최종 선택 완료
  const handleConfirm = () => {
    const label = formatDateKorean(tempSelected);
    onSelectDate(tempSelected, label);
    onClose();
  };

  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth();
  const isNextDisabled = viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
              <span>📅</span>
              <span>나들이 방문일 선택</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              언제 떠나시나요?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 2. 빠른 선택 버튼 바 (모바일 친화적) */}
        <div className="px-5 pt-3 pb-2 flex flex-wrap gap-1.5 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => handleQuickSelect(today, "오늘")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center"
          >
            오늘 ({formatDateKorean(today)})
          </button>
          {(() => {
            const tmrw = new Date(today);
            tmrw.setDate(today.getDate() + 1);
            return (
              <button
                type="button"
                onClick={() => handleQuickSelect(tmrw, "내일")}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center"
              >
                내일 ({formatDateKorean(tmrw)})
              </button>
            );
          })()}
          <button
            type="button"
            onClick={() => handleQuickSelect(weekends.thisSat, formatDateKorean(weekends.thisSat))}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center"
          >
            이번 주 토 ({formatDateKorean(weekends.thisSat)})
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect(weekends.thisSun, formatDateKorean(weekends.thisSun))}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center"
          >
            이번 주 일 ({formatDateKorean(weekends.thisSun)})
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect(weekends.nextSat, formatDateKorean(weekends.nextSat))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center"
          >
            다음 주 토 ({formatDateKorean(weekends.nextSat)})
          </button>
        </div>

        {/* 3. 캘린더 네비게이션 & 그리드 */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* 년/월 컨트롤 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                isPrevDisabled
                  ? "text-slate-300 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              }`}
            >
              ◀
            </button>
            <span className="font-extrabold text-base text-slate-900">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                isNextDisabled
                  ? "text-slate-300 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              }`}
            >
              ▶
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2">
            {KOREAN_DAY_NAMES.map((name, idx) => (
              <div
                key={name}
                className={`py-1 ${
                  idx === 0 ? "text-rose-500" : idx === 6 ? "text-sky-600" : "text-slate-500"
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {/* 이전 달 빈 칸 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-11" />
            ))}

            {/* 이번 달 날짜 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(viewYear, viewMonth, dayNum);
              dateObj.setHours(0, 0, 0, 0);

              const isPast = dateObj.getTime() < today.getTime();
              const isToday = dateObj.getTime() === today.getTime();
              const isSelected = dateObj.getTime() === tempSelected.getTime();
              const dayOfWeek = dateObj.getDay();

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDayClick(dayNum)}
                  className={`relative h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all min-h-[44px] cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105 z-10"
                      : isPast
                      ? "text-slate-300 cursor-not-allowed bg-slate-50/50"
                      : isToday
                      ? "bg-indigo-50 text-indigo-700 font-black border border-indigo-200 hover:bg-indigo-100"
                      : dayOfWeek === 0
                      ? "text-rose-600 hover:bg-rose-50"
                      : dayOfWeek === 6
                      ? "text-sky-600 hover:bg-sky-50"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{dayNum}</span>
                  {isToday && !isSelected && (
                    <span className="text-[9px] font-extrabold text-indigo-600 leading-none">
                      오늘
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 하단 선택 완료 버튼 */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-400 block text-[11px]">선택한 날짜</span>
            <span className="font-extrabold text-slate-900">
              {formatDateFullKorean(tempSelected)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
          >
            <span>✓</span>
            <span>{formatDateKorean(tempSelected)} 선택</span>
          </button>
        </div>
      </div>
    </div>
  );
}
