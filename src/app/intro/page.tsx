'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function IntroPage() {
  const [rating, setRating] = useState<number>(5);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    '전시 큐레이션 & 필터',
    '5일장 & 전통시장 먹거리',
    '복합 & 쌈지 도서관',
  ]);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleCopyPromo = (type: 'general' | 'feedback' | 'link') => {
    let text = '';
    if (type === 'general') {
      text = `[🎨 나드리 AI - 부울경 문화·나들이 포털]\n\n"이번 주말 어디 갈까?" 고민 끝!\n부산·울산·경남 최신 미술관 전시부터 70년 전통 5일장 먹거리, 아이와 함께 가기 좋은 숲속 쌈지 도서관까지 단 하나의 사이트에서 만나보세요.\n\n✨ 매일 아침·저녁 2회 AI 도슨트 작품 해설 & 맛집 코스\n🧺 오늘 열리는 부울경 5일장 실시간 검색\n📚 아이와 힐링하는 복합&쌈지 도서관 22선\n💬 24시간 실시간 AI 문화비서 챗봇\n💌 주 3회 (월·수·금) 무료 문화 소식지\n\n👉 지금 바로 구경하기: https://nadriai.com`;
    } else if (type === 'feedback') {
      text = `[📢 나드리 AI - 지인 피드백 부탁드립니다!]\n\n안녕하세요! 이번에 부울경 전시, 전통 5일장, 쌈지 도서관을 한눈에 찾아주는 문화 나들이 포털 '나드리 AI'를 준비했습니다.\n\n직접 들어와서 둘러보시고, 좋았던 점이나 개선/보완할 점에 대해 솔직한 의견을 남겨주시면 서비스 발전에 큰 도움이 됩니다! 🙏\n\n👉 사이트 둘러보기 및 의견 남기기: https://nadriai.com/intro`;
    } else {
      text = 'https://nadriai.com';
    }

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || submitting) return;

    setSubmitting(true);
    const feedbackPayload = {
      rating,
      selectedFeatures,
      name: feedbackName.trim() || '익명의 방문객',
      feedback: feedbackText.trim(),
      createdAt: new Date().toISOString(),
    };

    const formattedMessage = `[📝 나드리AI 사용자 피드백 접수]\n- 작성자: ${feedbackPayload.name}\n- 별점: ${'⭐'.repeat(rating)} (${rating}점/5점)\n- 마음에 든 기능: ${selectedFeatures.join(', ') || '선택 없음'}\n- 의견 및 보완 제안:\n${feedbackPayload.feedback}`;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `feedback_${Date.now()}`,
          message: formattedMessage,
          sender: 'user',
        }),
      });
    } catch {
      // 로컬 스토리지 백업 저장
      try {
        const saved = JSON.parse(localStorage.getItem('artbuk_feedbacks') || '[]');
        saved.push(feedbackPayload);
        localStorage.setItem('artbuk_feedbacks', JSON.stringify(saved));
      } catch {
        // ignore
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white pb-28 font-sans antialiased">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🎨</span>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent leading-none">
                나드리 AI
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">nadriai.com</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleCopyPromo('feedback')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <span>📢</span>
              <span className="hidden sm:inline">홍보문구 복사</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <span>포털 둘러보기</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero 소개 섹션 (자간, 행간, 정렬 최적화) */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6">
        {/* 은은한 배경 오로라 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/90 border border-indigo-500/40 text-indigo-300 text-xs font-bold mb-5 shadow-inner">
            <span>✨</span>
            <span>부울경 1등 스마트 문화 나들이 포털 공식 소개서</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-snug sm:leading-tight mb-4 break-keep">
            문화와 예술이 흐르는 부울경,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              어디로 떠날지 고민이신가요?
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto mb-8 break-keep">
            <strong className="font-bold text-white">나드리 AI (nadriai.com)</strong>는 부울경 최신 미술관 전시부터 70년 전통 5일장 먹거리, 아이와 함께하는 숲속 쌈지 도서관까지 한곳에서 찾아주는 <strong className="font-bold text-indigo-300">올인원 스마트 문화 나들이 포털</strong>입니다.
          </p>

          {/* 주요 액션 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 max-w-md mx-auto">
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <span>🚀 지금 바로 포털 체험하기</span>
              <span>→</span>
            </Link>
            <a
              href="#feedback-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm sm:text-base border border-slate-700 transition-colors"
            >
              <span>📋 장·단점 피드백 남기기</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5대 핵심 가치 & 차별점 카드 그리드 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight break-keep">
            💡 왜 <span className="text-indigo-400">나드리 AI</span>를 선택해야 할까요?
          </h2>
          <p className="text-xs sm:text-base text-slate-400 leading-relaxed break-keep">
            기존의 복잡한 검색 없이, 부울경 가족과 연인들을 위한 5가지 특화 기능을 한곳에 정갈하게 담았습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 카드 1: 전시 큐레이션 */}
          <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-indigo-500/60 transition-all group hover:-translate-y-1 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                🎨
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-indigo-300 transition-colors leading-snug break-keep">
                1. 부울경 최신 전시 40선 큐레이션
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                부산비엔날레, 시·도립미술관, 갤러리 등 부울경 전역의 전시 일정, 관람료, 마감 임박, 무료 전시 필터를 원클릭으로 제공합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-indigo-300 pt-2 border-t border-slate-700/60">
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50">🎁 무료 전시</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50">⏳ 마감 임박</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50">📍 지역별 필터</span>
            </div>
          </div>

          {/* 카드 2: 5일장 & 전통시장 */}
          <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-amber-500/60 transition-all group hover:-translate-y-1 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                🧺
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors leading-snug break-keep">
                2. 70년 전통 5일장 & 먹거리 가이드
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                구포(3·8일), 언양(2·7일), 태화(5·10일), 창녕(3·8일) 등 39개 전통시장의 오늘 장서는 날을 자동 계산하고 장터 미식을 안내합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-amber-300 pt-2 border-t border-slate-700/60">
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/50">🔴 오늘 열린 장</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/50">🍜 대표 먹거리</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/50">🗺️ 길찾기 연동</span>
            </div>
          </div>

          {/* 카드 3: 대표 & 쌈지 작은도서관 */}
          <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-emerald-500/60 transition-all group hover:-translate-y-1 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-emerald-300 transition-colors leading-snug break-keep">
                3. 복합문화 & 쌈지 작은도서관 22선
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                김해 지혜의바다 북타워부터 국회부산도서관, 영도 편백숲 작은도서관까지 어린이 동반 가족을 위한 힐링 스팟을 총망라했습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-emerald-300 pt-2 border-t border-slate-700/60">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50">👶 키즈 놀이터</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50">🌿 숲속 피톤치드</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50">💡 패밀리 꿀팁</span>
            </div>
          </div>

          {/* 카드 4: AI 도슨트 리뷰 & 맛집 */}
          <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-violet-500/60 transition-all group hover:-translate-y-1 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                ✍️
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug break-keep">
                4. 매일 아침·저녁 2회 AI 도슨트 & 맛집
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                아침(07:00)과 저녁(18:00) 하루 2회, 큐레이터의 시선으로 쓴 친절한 작품 해설과 인근 네이버 인기 맛집·카페 코스를 정기 발행합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-violet-300 pt-2 border-t border-slate-700/60">
              <span className="px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/50">🤖 하루 2회 발행</span>
              <span className="px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/50">☕ 맛집·카페 연계</span>
              <span className="px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/50">📸 포토존 가이드</span>
            </div>
          </div>

          {/* 카드 5: 24시간 실시간 AI 챗봇 */}
          <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-pink-500/60 transition-all group hover:-translate-y-1 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-pink-300 transition-colors leading-snug break-keep">
                5. 전 데이터 실시간 연동 AI 비서 챗봇
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                "구포시장 장날", "아이랑 갈 만한 도서관" 등을 질문하면 123개 사이트 데이터를 0.1초 만에 찾아 바로가기 카드로 안내합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-pink-300 pt-2 border-t border-slate-700/60">
              <span className="px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-800/50">⚡ 0.1초 즉시 답변</span>
              <span className="px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-800/50">🔗 바로가기 카드</span>
              <span className="px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-800/50">👩‍💼 1:1 상담원 연결</span>
            </div>
          </div>

          {/* 카드 6: 카카오톡 알림톡 구독 */}
          <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-yellow-500/60 transition-all group hover:-translate-y-1 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                🔔
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-yellow-300 transition-colors leading-snug break-keep">
                6. 주 3회 (월·수·금) 무료 알림 소식지
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                카카오톡 및 알림 신청을 통해 매주 월·수·금 아침 8시, 엄선된 부울경의 감성 전시와 5일장 소식을 무료로 배달해 드립니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-yellow-300 pt-2 border-t border-slate-700/60">
              <span className="px-2 py-0.5 rounded-md bg-yellow-950/60 border border-yellow-800/50">💌 월·수·금 정기 브리핑</span>
              <span className="px-2 py-0.5 rounded-md bg-yellow-950/60 border border-yellow-800/50">💬 카카오톡 알림톡</span>
              <span className="px-2 py-0.5 rounded-md bg-yellow-950/60 border border-yellow-800/50">🎉 100% 무료</span>
            </div>
          </div>
        </div>
      </section>

      {/* 홍보 문구 원클릭 복사 코너 (지인 카톡/SNS 전송용) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/80 rounded-3xl p-5 sm:p-8 border border-indigo-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl sm:text-3xl shrink-0">📢</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug break-keep">
                지인들에게 1초 만에 사이트 소개해 주기
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-0.5 break-keep">
                아래 문구를 복사하여 단체 카톡방, 밴드, SNS 등에 손쉽게 공유해 보세요!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mt-5">
            {/* 문구 1: 나들이 추천형 */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold mb-2.5">
                  버전 A. 감성 나들이 추천형
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap mb-3.5 break-keep bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {`[🎨 나드리 AI - 부울경 문화 나들이]
"이번 주말 어디 갈까?" 고민 끝!
부산·울산·경남 전시회부터 70년 전통 5일장, 아이와 가기 좋은 쌈지 도서관까지 한 번에 찾아보세요! ✨

👉 https://nadriai.com`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyPromo('general')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{copiedType === 'general' ? '✅ 복사 완료!' : '📋 카톡 문구 복사하기'}</span>
              </button>
            </div>

            {/* 문구 2: 베타 피드백 요청형 */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-extrabold mb-2.5">
                  버전 B. 지인 피드백 & 의견 요청형
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap mb-3.5 break-keep bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {`[📢 나드리 AI - 피드백 부탁드립니다!]
안녕하세요! 부울경 전시, 5일장, 도서관을 찾아주는 '나드리 AI' 포털을 오픈했습니다. 둘러보시고 좋았던 점이나 보완할 점을 편하게 남겨주세요! 🙏

👉 https://nadriai.com/intro`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyPromo('feedback')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{copiedType === 'feedback' ? '✅ 복사 완료!' : '📋 피드백 요청 문구 복사'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 지인/방문객 장·단점 피드백 설문 접수 폼 */}
      <section id="feedback-section" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 scroll-mt-20">
        <div className="bg-slate-800/90 rounded-3xl p-5 sm:p-8 border border-slate-700 shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-3xl mb-1.5 inline-block">📝</span>
            <h2 className="text-xl sm:text-3xl font-black text-white mb-2 tracking-tight break-keep">
              여러분의 솔직한 피드백을 들려주세요!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto break-keep">
              둘러보시며 <strong>좋았던 점, 아쉬웠던 점, 추가되었으면 하는 기능</strong>을 남겨주시면
              더 멋진 서비스로 보완해 나가겠습니다.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 text-center animate-in fade-in">
              <span className="text-4xl sm:text-5xl mb-3 inline-block">🎉</span>
              <h3 className="text-lg sm:text-xl font-black text-white mb-2 leading-snug">
                소중한 의견을 성공적으로 전달받았습니다!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed mb-6 break-keep">
                남겨주신 의견을 꼼꼼히 검토하여 더욱 유용하고 따뜻한 부울경 문화 포털을 만들겠습니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-md text-center"
                >
                  🚀 메인 포털 구경하기
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFeedbackText('');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  추가 의견 더 남기기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-5 sm:space-y-6">
              {/* 1. 종합 만족도 별점 */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2 leading-normal break-keep">
                  1. 전반적인 사이트 만족도는 어떠신가요?
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl sm:text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer p-0.5"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="text-xs sm:text-sm font-bold text-amber-400 ml-1 sm:ml-2">
                    {rating === 5
                      ? '매우 만족 (5점)'
                      : rating === 4
                      ? '만족 (4점)'
                      : rating === 3
                      ? '보통 (3점)'
                      : rating === 2
                      ? '조금 아쉬움 (2점)'
                      : '많이 아쉬움 (1점)'}
                  </span>
                </div>
              </div>

              {/* 2. 특히 좋았던 기능 선택 */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2 leading-normal break-keep">
                  2. 가장 유용하거나 마음에 들었던 기능은 무엇인가요? (복수 선택)
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {[
                    '전시 큐레이션 & 필터',
                    '5일장 & 전통시장 먹거리',
                    '복합 & 쌈지 도서관',
                    'AI 도슨트 작품 해설',
                    '실시간 AI 비서 챗봇',
                    '네이버 맛집·카페 연계',
                    '깔끔한 모바일 디자인',
                  ].map((feature) => {
                    const isSelected = selectedFeatures.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                            : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {feature}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. 보완할 점 / 아이디어 입력 */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2 leading-normal break-keep">
                  3. 보완해야 할 점이나 추가되었으면 하는 기능이 있다면 자유롭게 적어주세요! (필수)
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="예: 특정 지역 전시가 더 추가되면 좋겠어요 / 5일장 주차장 정보도 있으면 좋겠어요 / 챗봇 답변이 매우 유용했습니다 등"
                  className="w-full px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 4. 작성자 성함/닉네임 */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2 leading-normal break-keep">
                  4. 작성자 성함 또는 닉네임 (선택)
                </label>
                <input
                  type="text"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder="예: 홍길동 / 부산토박이"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={submitting || !feedbackText.trim()}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>의견을 안전하게 전송하는 중...</span>
                ) : (
                  <>
                    <span>💌 소중한 의견 및 피드백 보내기</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 하단 고정 플로팅 바 (모바일/PC 여백 및 정렬 최적화) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2.5 sm:p-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-base">🎨</span>
            <span>부울경 문화예술과 5일장, 쌈지 도서관의 모든 것</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleCopyPromo('link')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            >
              {copiedType === 'link' ? '✅ 복사완료' : '🔗 링크 복사'}
            </button>
            <Link
              href="/"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/30 transition-all whitespace-nowrap"
            >
              <span>🚀 본 포털 바로가기</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
