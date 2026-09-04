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
      text = `[🥕 당근 이웃님들! 오늘 영화의전당에서 무료 야외 영화제 열려요 🎬]\n\n오늘(9/3 목)부터 9/7(월)까지 센텀 영화의전당에서 '제5회 하나뿐인 지구영상제'가 열린다고 하네요!\n\n✨ 핵심 꿀팁 요약:\n1. 오늘 저녁 18:30 야외극장에서 개막작 <나무의 노래> 무료 상영 (야외 빅루프 아래서 시원하게 관람!)\n2. 주말에 야외광장에서 친환경 에코 플리마켓이랑 아이들 무료 체험 부스(화분 심기, 텀블러백) 진행\n3. 영화 보고 바로 앞 APEC 나루공원 산책이나 수영 팔도시장 먹거리 코스로 딱입니다 🌿\n\n👉 세부 일정 & 주차/맛집 코스 지도 보기:\nhttps://nadriai.com/daangn`;
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
    const shareText = `[🥕 당근 이웃 특화] 오늘 개막! 영화의전당 제5회 하나뿐인 지구영상제 무료 야외영화 & 맛집 나들이 코스 총정리 🌿\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "제5회 하나뿐인 지구영상제 당근 이웃 나들이 가이드",
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
                부산 해운대·수영·센텀 이웃 소식
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
            <span>🥕 9.3(목) ~ 9.7(월) [5일간 축제]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight sm:leading-snug">
            부산 영화의전당에서 5일간!<br />
            <span className="text-amber-200 underline decoration-white/40 underline-offset-4">
              무료 야외 영화제 & 에코 플리마켓
            </span>
            이 열려요!
          </h1>

          <p className="text-xs sm:text-base text-orange-100 max-w-xl mx-auto leading-relaxed">
            2026.09.03(목)부터 9.7(월)까지 5일간! 영화의전당 빅루프 아래서 시원한 가을밤 야외 시네마와 아이 동반 무료 체험까지 모두 즐겨보세요 🌿
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
              <span>📋 무료 관람 꿀팁 보기</span>
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
        {/* 🌟 공식 메인 포스터 & 핵심 요약 통합 카드 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* 공식 포스터 이미지 */}
            <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-500/80 shrink-0 group">
              <img
                src="/images/earth-festival-poster.jpg"
                alt="제5회 하나뿐인 지구영상제 공식 포스터 (다시 지구)"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-center text-white">
                <span className="text-[11px] font-black text-amber-300 block">
                  공식 포스터
                </span>
                <span className="text-[10px] text-emerald-200 font-bold block">
                  &quot;다시 지구 (Earth and Us)&quot;
                </span>
              </div>
            </div>

            {/* 행사 정보 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">🎬</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  제5회 하나뿐인 지구영상제<br />
                  <span className="text-xs sm:text-sm text-emerald-600 font-bold">The 5th Only One Earth Film Festival</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-0.5">
                  <span className="font-bold text-[#FF6F0F] text-[10px] block">📅 축제 일정</span>
                  <p className="font-black text-slate-900">2026.09.03(목) ~ 09.07(월) [5일간]</p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-0.5">
                  <span className="font-bold text-emerald-700 text-[10px] block">📍 개최 장소</span>
                  <p className="font-black text-slate-900">부산 영화의전당 일원</p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-0.5">
                  <span className="font-bold text-indigo-700 text-[10px] block">🎟️ 관람료 혜택</span>
                  <p className="font-black text-slate-900">야외 개막식 &amp; 에코광장 무료!</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-0.5">
                  <span className="font-bold text-amber-800 text-[10px] block">🌍 주제 슬로건</span>
                  <p className="font-black text-slate-900">&quot;다시 지구 (Earth and Us)&quot;</p>
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

          {/* 꿀팁 1: 오늘 개막작 야외 무료 상영 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#FF6F0F] text-white font-black text-[11px]">
                꿀팁 01
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                오늘 저녁 18:30 야외극장 무료 개막작 &lt;나무의 노래&gt;
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              수백 년 역사를 품은 거목들의 숨결을 웅장한 사운드로 담아낸 영화입니다. 영화의전당 빅루프 아래 야외 스크린에서 늦여름 시원한 밤바람을 맞으며 무료로 관람할 수 있습니다. (얇은 겉옷 챙기시면 좋아요!)
            </p>
          </div>

          {/* 꿀팁 2: 주말 에코 플리마켓 & 아이 무료 체험 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[11px]">
                꿀팁 02
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                야외 광장 친환경 플리마켓 &amp; 어린이 체험 부스
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              업사이클링 소품, 제로웨이스트 비건 굿즈 판매 플리마켓과 함께 아이들이 좋아하는 재생종이 화분 심기, 텀블러백 만들기 등 가족 참여형 무료 체험이 가득합니다.
            </p>
          </div>

          {/* 꿀팁 3: 주차 & 대중교통 팁 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-[11px]">
                꿀팁 03
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                주차 꿀팁 &amp; 지하철 접근성
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              도시철도 2호선 <strong>센텀시티역 6번 출구</strong>에서 도보 5분 거리라 대중교통이 가장 쾌적합니다. 차량 이용 시 영화의전당 지하주차장(티켓 소지 시 4시간 할인)을 이용하실 수 있습니다.
            </p>
          </div>

          {/* 꿀팁 4: 영화 끝나고 갈 만한 연계 코스 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-2.5 hover:border-[#FF6F0F]/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px]">
                꿀팁 04
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                영화 보고 바로 앞 APEC 나루공원 산책 &amp; 수영장터 먹거리
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              영화의전당 바로 앞 수영강변 <strong>APEC 나루공원</strong>에서 돗자리 펴고 강바람 힐링 후, 인근 <strong>밀락더마켓</strong>이나 <strong>수영 팔도시장</strong> 떡볶이·닭강정 코스로 완벽한 하루를 완성해보세요.
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
              <strong className="text-white font-semibold">영화의전당 광장</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">에코 페스티벌 체험</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">2코스 (12:30)</span>
              <strong className="text-white font-semibold">센텀 미식 거리</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">로컬 점심 식사</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">3코스 (14:00)</span>
              <strong className="text-white font-semibold">APEC 나루공원</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">수영강변 힐링 산책</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-indigo-400 font-bold block mb-0.5">4코스 (18:30)</span>
              <strong className="text-white font-semibold">영화의전당 야외극장</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">무료 개막작 관람</p>
            </div>
          </div>

          {/* 메인 사이트 상세 링크 */}
          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/events/busan-only-one-earth-film-festival-2026"
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>🗺️ 나드리AI에서 전체 지도 &amp; 상세 정보 보기</span>
              <span>➔</span>
            </Link>
            <Link
              href="/blog/2026-09-03-busan-only-one-earth-film-festival"
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
          부산 영화의전당 x 당근 동네생활 문화 나들이 특별 가이드
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
