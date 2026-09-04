"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiTripPlanner from "@/components/AiTripPlanner";
import TrustBadge from "@/components/TrustBadge";

export default function AiTripPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 페이지 타이틀 & 뱃지 */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
            <span>✨</span>
            <span>AI 맞춤 문화·나들이 코스 플래너</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            “이번 주말, AI와 함께 나만의 코스를 완성하세요”
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            출발지, 소요 시간, 동행자, 예산에 맞춰 부울경 최적 동선을 1분 만에 설계해 드립니다.
          </p>
          <div className="mt-4 flex justify-center">
            <TrustBadge />
          </div>
        </div>

        {/* AI 나들이 플래너 코어 */}
        <div className="mb-14">
          <AiTripPlanner />
        </div>

        {/* 사전 큐레이션 추천 대표 코스 3종 */}
        <div className="mt-12 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              🌟 나드리 AI 에디터 추천 명품 하루 코스 TOP 3
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              부울경 여행자들에게 가장 만족도가 높았던 검증된 하루 코스입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 코스 1: 부산 오션아트 & 자갈치 미식 코스 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  🌊 부산 감성 바다 코스
                </span>
                <span className="text-xs font-bold text-slate-400">약 6시간</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                송도 현대미술 & 남포동 자갈치 로컬 미식
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 border-t border-b border-slate-100 py-3">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>10:30 송도 오션뷰 갤러리 기획전 관람</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>12:30 자갈치시장 꼼장어 & 생선구이 백반</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>14:30 영도 깡깡이 예술마을 & 카페 산책</span>
                </li>
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-emerald-700">예산: 1인 약 2.5만원</span>
                <a
                  href="https://map.naver.com/v5/search/%EB%B6%80%EC%82%B0%20%EC%86%A1%EB%8F%84%ED%95%B4%EC%88%98%EC%95%84%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  지도 보기 →
                </a>
              </div>
            </div>

            {/* 코스 2: 울산 미디어아트 & 태화강 국가정원 코스 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100">
                  🌳 울산 힐링 정원 코스
                </span>
                <span className="text-xs font-bold text-slate-400">약 5시간</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                울산시립미술관 & 태화강 십리대숲 쉼표
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 border-t border-b border-slate-100 py-3">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>10:30 울산시립미술관 미디어아트 XR 관람</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>12:30 성남동 젊음의거리 언양불고기 정식</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>14:00 태화강 국가정원 & 십리대숲 산책</span>
                </li>
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-emerald-700">예산: 1인 약 2만원</span>
                <a
                  href="https://map.naver.com/v5/search/%EC%9A%B8%EC%82%B0%EC%8B%9C%EB%A6%BD%EB%AF%B8%EC%88%A0%EA%B4%80"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  지도 보기 →
                </a>
              </div>
            </div>

            {/* 코스 3: 경남 도서관 & 로컬 5일장 코스 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                  📚 경남 숲속 패밀리 코스
                </span>
                <span className="text-xs font-bold text-slate-400">약 6시간</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                마산 지혜의바다 & 전통시장 장날 탐방
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 border-t border-b border-slate-100 py-3">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>10:30 마산 지혜의바다 북타워 & 어린이존</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>13:00 마산어시장 장날 국밥 & 활어회</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>15:00 창원 편백 치유의숲 힐링 산책</span>
                </li>
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-emerald-700">예산: 1인 약 1.5만원 (가성비)</span>
                <a
                  href="https://map.naver.com/v5/search/%EB%A7%88%EC%82%B0%20%EC%A7%80%ED%98%9C%EC%9D%98%EB%B0%94%EB%8B%A4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  지도 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
