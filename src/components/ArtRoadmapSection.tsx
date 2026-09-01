"use client";

import { useState } from "react";
import Link from "next/link";

interface ArtCourse {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeColor: string;
  theme: string;
  targetAudience: string;
  estimatedTime: string;
  transportTip: string;
  stops: {
    order: number;
    name: string;
    type: "전시" | "명소" | "카페/맛집";
    location: string;
    desc: string;
    linkUrl?: string;
  }[];
}

const ART_COURSES: ArtCourse[] = [
  {
    id: "busan-ocean-road",
    title: "해운대 & 수영 오션 아트 로드",
    subtitle: "바다와 현대미술, 시네마와 대나무숲이 어우러진 부산 낭만 코스",
    tag: "🌊 부산 도심 & 바다",
    badgeColor: "from-blue-600 to-indigo-600",
    theme: "현대미술 · 시네마 · 복합문화",
    targetAudience: "연인 데이트 & 감성 나들이",
    estimatedTime: "약 5~6시간 (당일치기)",
    transportTip: "부산 지하철 2호선(센텀시티역~수영역) 및 시내버스 편리",
    stops: [
      {
        order: 1,
        name: "부산시립미술관 (센텀시티)",
        type: "전시",
        location: "부산 해운대구",
        desc: "시공간의 경계를 허무는 가을 특별 기획전 무료 관람",
        linkUrl: "/events/busan-museum-of-art-modern"
      },
      {
        order: 2,
        name: "영화의전당 비프힐",
        type: "전시",
        location: "부산 해운대구",
        desc: "시네마틱 미디어아트전 & 세계적 빅루프 건축미 감상",
        linkUrl: "/events/busan-cinema-center-media-art"
      },
      {
        order: 3,
        name: "F1963 석천홀 & 테라로사",
        type: "카페/맛집",
        location: "부산 수영구 망미동",
        desc: "소리길 대나무숲 산책과 스페셜티 드립 커피 여유",
        linkUrl: "/events/busan-f1963-art-exhibition"
      },
      {
        order: 4,
        name: "광안리 해변 & 밀락더마켓",
        type: "명소",
        location: "부산 수영구 민락동",
        desc: "광안대교 노을 뷰와 오션뷰 복합문화 스트리트 야경",
        linkUrl: "/blog"
      }
    ]
  },
  {
    id: "jirisan-healing-road",
    title: "지리산 & 선비 힐링 예술 로드",
    subtitle: "섬진강 물길과 천년 상림숲, 명승 수승대를 잇는 경남 슬로트래블",
    tag: "⛰️ 지리산 힐링 드라이브",
    badgeColor: "from-emerald-600 to-teal-600",
    theme: "대지예술 · 한의학 웰니스 · 명승",
    targetAudience: "가족 힐링 & 부모님 동반 투어",
    estimatedTime: "1박 2일 추천 (당일 가능)",
    transportTip: "자가용 드라이브 권장 (지리산 둘레길 국도 코스)",
    stops: [
      {
        order: 1,
        name: "하동 지리산아트팜",
        type: "전시",
        location: "경남 하동군",
        desc: "섬진강 서정과 지리산 자락의 대지예술 복합문화 공간",
        linkUrl: "/events/hadong-jirisan-art-farm"
      },
      {
        order: 2,
        name: "산청 동의보감촌 한의학박물관",
        type: "전시",
        location: "경남 산청군",
        desc: "지리산 약초 향기와 유네스코 동의보감 힐링 체험",
        linkUrl: "/events/sancheong-donguibogam-museum"
      },
      {
        order: 3,
        name: "함양문화예술회관 & 상림공원",
        type: "전시",
        location: "경남 함양군",
        desc: "천년의 상림숲 붉은 단풍 산책과 가을 무료 기획전",
        linkUrl: "/events/hamyang-sangrim-art-center"
      },
      {
        order: 4,
        name: "거창 수승대 & 요수정",
        type: "명소",
        location: "경남 거창군",
        desc: "거북바위와 맑은 계곡, 영남 선비들의 풍류 미학",
        linkUrl: "/events/geochang-suseungdae-museum"
      }
    ]
  },
  {
    id: "ulsan-sunrise-road",
    title: "태화강 & 동해바다 해맞이 로드",
    subtitle: "울산 도심 미디어아트에서 대왕암 출렁다리, 간절곶 일출까지",
    tag: "🌅 울산 오션 & 도심",
    badgeColor: "from-amber-600 to-rose-600",
    theme: "실감 미디어 · 해양 조형 · 옹기공예",
    targetAudience: "가족 나들이 & 주말 당일 드라이브",
    estimatedTime: "약 6~7시간",
    transportTip: "울산 시내 및 해안도로(동해안로) 연계 드라이브",
    stops: [
      {
        order: 1,
        name: "울산시립미술관 (성남동)",
        type: "전시",
        location: "울산 중구",
        desc: "1천 원으로 즐기는 세계 정상급 인터랙티브 미디어아트",
        linkUrl: "/events/ulsan-media-art-2026"
      },
      {
        order: 2,
        name: "태화강 국가정원 십리대숲",
        type: "명소",
        location: "울산 중구",
        desc: "초록빛 대나무 숲길 산책과 은하수길 포토존",
        linkUrl: "/blog"
      },
      {
        order: 3,
        name: "대왕암공원 해맞이 예술존",
        type: "전시",
        location: "울산 동구",
        desc: "기암괴석 해송 숲과 동해 위를 걷는 대왕암 출렁다리",
        linkUrl: "/events/ulsan-donggu-daewangam-art"
      },
      {
        order: 4,
        name: "외고산 옹기마을 & 간절곶",
        type: "전시",
        location: "울산 울주군",
        desc: "숨 쉬는 천년 옹기마을과 한반도 일출 1번지 소망우체통",
        linkUrl: "/events/ulsan-uljugun-onggi-museum"
      }
    ]
  },
  {
    id: "gaya-unesco-road",
    title: "유네스코 가야고분군 & 도예 생태 로드",
    subtitle: "흙과 도자 건축, 찬란한 1500년 가야 왕국의 유산을 잇는 역사 투어",
    tag: "🏺 유네스코 세계유산",
    badgeColor: "from-purple-600 to-violet-600",
    theme: "건축도자 · 세계문화유산 · 생태",
    targetAudience: "초중고 역사 체험 & 가을 나들이",
    estimatedTime: "약 5~6시간",
    transportTip: "남해고속도로 및 중부내륙고속도로 연계 편리",
    stops: [
      {
        order: 1,
        name: "클레이아크김해미술관",
        type: "전시",
        location: "경남 김해시",
        desc: "세계 유일의 흙과 건축도자 돔하우스 기획전",
        linkUrl: "/events/gimhae-clayarch-autumn"
      },
      {
        order: 2,
        name: "함안박물관 & 말이산고분군",
        type: "전시",
        location: "경남 함안군",
        desc: "아라가야 불꽃무늬 토기와 유네스코 고분군 능선 산책",
        linkUrl: "/events/haman-marisan-tumuli-museum"
      },
      {
        order: 3,
        name: "창녕박물관 & 우포늪",
        type: "전시",
        location: "경남 창녕군",
        desc: "비화가야 황금 유물과 대한민국 최대 자연 늪지 우포늪",
        linkUrl: "/events/changnyeong-gaya-tumuli-museum"
      },
      {
        order: 4,
        name: "합천박물관 & 옥전고분군",
        type: "전시",
        location: "경남 합천군",
        desc: "다라국 황금 장신구 유물전 & 황매산 억새평원 연계",
        linkUrl: "/events/hapcheon-okjeon-tumuli-museum"
      }
    ]
  }
];

export default function ArtRoadmapSection() {
  const [activeCourseId, setActiveCourseId] = useState<string>("busan-ocean-road");

  const activeCourse = ART_COURSES.find((c) => c.id === activeCourseId) || ART_COURSES[0];

  return (
    <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
      {/* 배경 장식 원형 블러 */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* 상단 타이틀 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <span>🗺️</span>
              <span>부울경 39개 지역 갤러리 호핑 (Gallery Hopping) 가이드</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              당일치기 & 1박2일 추천 아트 로드맵
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              전시와 주변 카페, 필수 명소를 한 번에 엮은 검증된 큐레이터 추천 여행 코스입니다.
            </p>
          </div>
        </div>

        {/* 4대 코스 선택 탭 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {ART_COURSES.map((course) => {
            const isActive = course.id === activeCourseId;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setActiveCourseId(course.id)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  isActive
                    ? "bg-white/15 border-indigo-400 text-white shadow-lg backdrop-blur-md"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-[11px] font-bold text-indigo-300 block mb-1">
                  {course.tag}
                </span>
                <span className="text-xs sm:text-sm font-extrabold block line-clamp-1">
                  {course.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* 선택된 코스 상세 카드 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          {/* 코스 헤더 정보 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${activeCourse.badgeColor} text-white shadow-xs`}>
                  {activeCourse.tag}
                </span>
                <h3 className="text-lg font-black text-white">
                  {activeCourse.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                {activeCourse.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 text-slate-200 border border-white/10">
                ⏱️ {activeCourse.estimatedTime}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 text-slate-200 border border-white/10">
                👥 {activeCourse.targetAudience}
              </span>
            </div>
          </div>

          {/* 4단계 스텝 타임라인 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            {activeCourse.stops.map((stop, index) => (
              <div
                key={stop.order}
                className="relative p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {stop.order}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      stop.type === "전시"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                        : stop.type === "카페/맛집"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    }`}>
                      {stop.type}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 block">
                    📍 {stop.location}
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-0.5 line-clamp-1">
                    {stop.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {stop.desc}
                  </p>
                </div>

                {stop.linkUrl && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <Link
                      href={stop.linkUrl}
                      className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center justify-between"
                    >
                      <span>전시 상세 보기</span>
                      <span>➔</span>
                    </Link>
                  </div>
                )}

                {/* 화살표 구분자 (모바일/데스크톱) */}
                {index < activeCourse.stops.length - 1 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-indigo-400 text-sm font-black">
                    ▶
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 하단 이동 팁 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span>🚗</span>
              <b className="text-white">교통 팁:</b> {activeCourse.transportTip}
            </span>
            <Link
              href="/blog"
              className="font-bold text-indigo-300 hover:text-white underline underline-offset-2 shrink-0"
            >
              네이버 맛집 & 생생 후기 블로그 둘러보기 ➔
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
