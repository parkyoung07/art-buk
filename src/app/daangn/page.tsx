"use client";

import React, { useState } from "react";
import Link from "next/link";
import KakaoSubscribeModal from "@/components/KakaoSubscribeModal";

export default function DaangnLandingPage() {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isKakaoModalOpen, setIsKakaoModalOpen] = useState(false);

  // 당근 동네생활 게시글 템플릿 복사 핸들러
  const handleCopyText = (type: "post" | "link") => {
    let text = "";
    if (type === "post") {
      text = `[🥕 당근 이웃님들! 부산비엔날레 & 가을 문화 나들이 꿀팁 🎨]\n\n을숙도 현대미술관과 부산 곳곳에서 '2026 부산비엔날레'가 펼쳐지고 있어요!\n\n✨ 핵심 꿀팁 요약:\n1. 을숙도 천혜 갈대숲과 어우러진 현대미술 대작 & 야외 조각 산책\n2. 아이들과 함께 을숙도 생태공원 피크닉 및 낙동강하구에코센터 연계 코스 강추 🌿\n3. 영도 흰여울마을 & 초량 야외 전시장까지 이어지는 감성 카페 투어\n\n👉 세부 일정 & 주차/맛집 코스 지도 보기:\nhttps://nadriai.com/daangn`;
    } else {
      text = "https://nadriai.com/daangn";
    }

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // 카카오톡/메시지 공유 핸들러
  const handleShare = async () => {
    const shareUrl = "https://nadriai.com/daangn";
    const shareText = `[🥕 당근 이웃 특화] 2026 부산비엔날레 & 을숙도 감성 나들이 코스 총정리 🌿\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "2026 부산비엔날레 당근 이웃 나들이 가이드",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback
      }
    }
    handleCopyText("link");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col selection:bg-[#FF6F0F] selection:text-white font-sans">
      {/* 1. 상단 당근 스타일 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#FF6F0F] text-white font-black text-sm shadow-xs">
              🥕
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight">
                당근 동네생활 x 나드리 AI
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                부산·을숙도·해운대·원도심 이웃 소식
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>전체 전시 보기</span>
            <span>➔</span>
          </Link>
        </div>
      </header>

      {/* 2. 히어로 배너: 당근 이웃 맞춤 초대 */}
      <section className="relative bg-gradient-to-br from-[#FF6F0F] via-[#FF8A3D] to-[#FF5400] text-white pt-10 pb-14 px-4 overflow-hidden">
        {/* 배경 은은한 원형 블러 */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-xs border border-white/30 shadow-xs">
            <span>🥕 가을 특별 문화 나들이 가이드</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight sm:leading-snug">
            을숙도 현대미술관 &amp; 부산 곳곳에서!<br />
            <span className="text-amber-200 underline decoration-white/40 underline-offset-4">
              2026 부산비엔날레 &amp; 가을 나들이
            </span>
            가 열려요!
          </h1>

          <p className="text-xs sm:text-base text-orange-100 max-w-xl mx-auto leading-relaxed">
            을숙도 갈대숲과 어우러진 현대미술 대작부터 아이 동반 피크닉, 감성 카페 코스까지 당근 이웃을 위한 꿀팁을 전해드립니다 🌿
          </p>

          {/* 퀵 액션 버튼 바 */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => {
                const el = document.getElementById("program-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>📋 관람 꿀팁 보기</span>
            </button>

            <button
              onClick={() => handleCopyText("post")}
              className="px-4 py-3 rounded-2xl bg-white text-[#FF6F0F] font-bold text-xs sm:text-sm shadow-md hover:bg-orange-50 transition-all cursor-pointer flex items-center gap-1.5 border border-white/80"
            >
              <span>📋 {copiedType === "post" ? "당근 복사용 글 복사완료!" : "당근 동네글 템플릿 복사"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. 본문 컨테이너 */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* 🌟 공식 메인 전시 & 핵심 요약 통합 카드 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* 전시 대표 이미지 */}
            <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-2 border-indigo-500/80 shrink-0 group">
              <img
                src="https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="2026 부산비엔날레 전시"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-center text-white">
                <span className="text-[11px] font-black text-amber-300 block">
                  부울경 대표 전시
                </span>
                <span className="text-[10px] text-indigo-200 font-bold block">
                  2026 부산비엔날레
                </span>
              </div>
            </div>

            {/* 행사 정보 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">🎨</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  2026 부산비엔날레<br />
                  <span className="text-xs sm:text-sm text-indigo-600 font-bold">Busan Biennale 2026</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-0.5">
                  <span className="font-bold text-[#FF6F0F] text-[10px] block">📅 전시 기간</span>
                  <p className="font-black text-slate-900">2026.08.17 ~ 10.20</p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-0.5">
                  <span className="font-bold text-emerald-700 text-[10px] block">📍 개최 장소</span>
                  <p className="font-black text-slate-900">부산현대미술관 및 을숙도 일원</p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-0.5">
                  <span className="font-bold text-indigo-700 text-[10px] block">🎟️ 관람 정보</span>
                  <p className="font-black text-slate-900">성인 12,000원 / 청소년 할인</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-0.5">
                  <span className="font-bold text-amber-800 text-[10px] block">🌿 주변 연계</span>
                  <p className="font-black text-slate-900">을숙도 갈대숲 &amp; 에코센터</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 4대 당근 이웃 맞춤 실속 꿀팁 섹션 */}
        <div id="program-section" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-[#FF6F0F] inline-block" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              당근 이웃을 위한 4대 실속 꿀팁
            </h2>
          </div>

          {/* 꿀팁 1 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#FF6F0F] text-white font-black text-[11px]">
                꿀팁 01
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                을숙도 현대미술관 &amp; 자연 생태 야외 조각 산책
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              부산현대미술관 외벽의 수직정원부터 실내 대형 설치미술, 을숙도 야외 광장의 조각 작품까지 자연과 예술이 하나 되는 환상적인 공간을 경험할 수 있습니다.
            </p>
          </div>

          {/* 꿀팁 2 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[11px]">
                꿀팁 02
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                아이 동반 가족 피크닉 &amp; 에코센터 코스
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              미술관 바로 옆 을숙도 생태공원 잔디밭에서 돗자리 피크닉을 즐기고, 낙동강하구에코센터에서 철새 관찰 및 생태 체험까지 하루 풀코스로 추천합니다.
            </p>
          </div>

          {/* 꿀팁 3 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-[11px]">
                꿀팁 03
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                주차 꿀팁 &amp; 대중교통 셔틀 안내
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              도시철도 1호선 <strong>하단역</strong>에서 버스로 5분 거리이며, 미술관 공영주차장 이용 시 일 주차요금이 매우 저렴하여 가족 방문에 부담이 없습니다.
            </p>
          </div>

          {/* 꿀팁 4 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px]">
                꿀팁 04
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                하단 5일장 먹거리 &amp; 다대포 일몰 연계 코스
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              미술관 관람 후 <strong>하단 5일장(2, 7일)</strong>에서 정겨운 손칼국수와 먹거리를 맛보거나, <strong>다대포 꿈의 낙조분수</strong>와 노을 해변 산책으로 낭만 가득한 하루를 완성해보세요.
            </p>
          </div>
        </div>

        {/* 🗺️ 트리플 스타일 연계 동선 안내 박스 */}
        <div className="rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white font-black text-xs">
                TRIPLE PLAN
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                하루 완성! 추천 연계 나들이 코스
              </h3>
            </div>
            <span className="text-[11px] text-indigo-300">총 4개 스팟</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">1코스 (10:30)</span>
              <strong className="text-white font-semibold">부산현대미술관</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">2026 부산비엔날레 관람</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">2코스 (12:30)</span>
              <strong className="text-white font-semibold">하단 로컬 맛집거리</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">명지 대파 갈비탕 &amp; 전통국수</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">3코스 (14:30)</span>
              <strong className="text-white font-semibold">을숙도 생태공원</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">갈대숲 산책 &amp; 피크닉</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">4코스 (17:30)</span>
              <strong className="text-white font-semibold">다대포 해변공원</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">노을 일몰 &amp; 낙조분수</p>
            </div>
          </div>

          {/* 메인 사이트 상세 링크 */}
          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/events/busan-biennale-2026"
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>🗺️ 나드리AI에서 전체 지도 &amp; 상세 정보 보기</span>
              <span>➔</span>
            </Link>
            <Link
              href="/blog/2026-08-26-busan-biennale"
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-indigo-200 font-bold text-xs sm:text-sm text-center transition-all border border-white/20"
            >
              <span>✍️ 도슨트 리뷰 읽기</span>
            </Link>
          </div>
        </div>

        {/* 🎨 나드리 AI 서비스 소개 & 전체 전시 둘러보기 유입 섹션 */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                &quot;주말에 어디 가지?&quot; 부울경 나들이 고민 끝!
              </h3>
              <p className="text-xs text-slate-500">
                나드리 AI는 부산·울산·경남의 전시, 5일장, 숲속 도서관을 한눈에 찾아주는 문화 포털입니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
            <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <span className="text-base block mb-1">🖼️</span>
              <strong className="text-slate-900 block font-bold">40+개 부울경 전시</strong>
              <span className="text-slate-500 text-[11px]">무료 전시 &amp; D-Day 마감 알림</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <span className="text-base block mb-1">🧺</span>
              <strong className="text-slate-900 block font-bold">68개 전통 5일장</strong>
              <span className="text-slate-500 text-[11px]">오늘 장 서는 날 실시간 검색</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <span className="text-base block mb-1">📚</span>
              <strong className="text-slate-900 block font-bold">22개 복합·쌈지 도서관</strong>
              <span className="text-slate-500 text-[11px]">아이와 함께하는 힐링 북카페</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-[#FF6F0F] hover:bg-[#e05e07] text-white font-extrabold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>🎨 부울경 전체 나들이 지도 둘러보기</span>
              <span>➔</span>
            </Link>

            <button
              onClick={() => setIsKakaoModalOpen(true)}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#FEE500] hover:bg-[#f2da00] text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>💬 주말 나들이 소식 무료 카톡 받기</span>
            </button>
          </div>
        </div>

        {/* 📢 당근 이웃들과 공유하기 액션 카드 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-center space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            🧡 이웃님, 좋은 정보는 동네 이웃과 함께 나눠요!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            당근 동네생활에 복사해서 올리거나, 가족·친구 카카오톡으로 바로 공유할 수 있습니다.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleCopyText("post")}
              className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6F0F] border border-orange-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <span>📋</span>
              <span>{copiedType === "post" ? "복사되었습니다! (당근에 붙여넣기)" : "당근 동네생활 글 복사"}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>🔗</span>
              <span>{copiedType === "link" ? "링크 복사완료!" : "카톡 / 링크 공유하기"}</span>
            </button>
          </div>
        </div>
      </main>

      {/* 4. 푸터 */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-700">나드리 AI | 부산·울산·경남 AI 문화·나들이 플랫폼</p>
        <p className="text-[11px] text-slate-400">
          2026 부산비엔날레 x 당근 동네생활 문화 나들이 특별 가이드
        </p>
        <div className="pt-2 flex items-center justify-center gap-4 text-slate-600 font-medium text-xs">
          <Link href="/" className="hover:text-indigo-600">
            메인 홈
          </Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-indigo-600">
            전시 블로그
          </Link>
          <span>·</span>
          <Link href="/intro" className="hover:text-indigo-600">
            서비스 소개
          </Link>
        </div>
      </footer>

      {/* 카카오 구독 모달 */}
      <KakaoSubscribeModal
        isOpen={isKakaoModalOpen}
        onClose={() => setIsKakaoModalOpen(false)}
      />
    </div>
  );
}
