import Link from "next/link";
import { notFound } from "next/navigation";
import { getNaverLocalPlaces } from "@/lib/naver";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";
import rawData from "../../../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

const exhibitions: Exhibition[] = rawData as Exhibition[];

// 정적 배포(Cloudflare Pages / output: export)를 위해 빌드 시점에 모든 전시 ID를 생성합니다.
export async function generateStaticParams() {
  return exhibitions.map((item) => ({
    id: item.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const exhibition = exhibitions.find((item) => item.id === id);
  if (!exhibition) return { title: "전시를 찾을 수 없습니다." };

  const url = `https://nadriai.com/events/${exhibition.id}/`;

  return {
    title: `${exhibition.title} | ${exhibition.venueName || exhibition.location}`,
    description: `${exhibition.period} | ${exhibition.location} - ${exhibition.description}`,
    keywords: [
      exhibition.region,
      exhibition.subRegion,
      exhibition.category,
      exhibition.venueName || "",
      "부울경전시",
      "미술관",
    ],
    openGraph: {
      title: `${exhibition.title} | 부울경 아트·전시 나들이`,
      description: `${exhibition.period} (${exhibition.venueName || exhibition.location}) - ${exhibition.description}`,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: exhibition.title,
      description: `${exhibition.period} | ${exhibition.venueName || exhibition.location}`,
    },
  };
}

export default async function ExhibitionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const exhibition = exhibitions.find((item) => item.id === id);

  if (!exhibition) {
    notFound();
  }

  // 네이버 실시간 주변 맛집 & 핫플레이스 조회
  const cleanVenue = (exhibition.venueName || exhibition.location).split(" 및 ")[0].split(" ")[0];
  const localQuery = `${exhibition.region} ${cleanVenue} 맛집`;
  const localPlaces = await getNaverLocalPlaces(localQuery, 4);

  // Google Event Schema (JSON-LD)
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: exhibition.title,
    startDate: exhibition.startDate || "2026-04-01",
    endDate: exhibition.endDate || "2026-06-30",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: exhibition.venueName || exhibition.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: exhibition.region,
        streetAddress: exhibition.address || exhibition.location,
        addressCountry: "KR",
      },
    },
    description: exhibition.description,
    offers: {
      "@type": "Offer",
      price: exhibition.isFree ? "0" : exhibition.price.replace(/[^0-9]/g, ""),
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
      url: exhibition.link || `https://nadriai.com/events/${exhibition.id}/`,
    },
    organizer: {
      "@type": "Organization",
      name: exhibition.venueName || "부울경 미술관",
      url: exhibition.link,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 구조화 데이터 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* 1. 상단 네비게이션 바 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
              ←
            </span>
            <span>전시 목록으로 돌아가기</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              전시 블로그
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                A
              </span>
              <span className="font-bold text-sm tracking-tight text-slate-900 hidden sm:inline">
                부울경 아트·전시
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 전시 히어로 배너 */}
      <section
        className={`relative text-white py-14 sm:py-20 overflow-hidden ${
          exhibition.posterTheme || "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"
        }`}
      >
        {/* 배경 은은한 빛 효과 */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 뱃지 영역 */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              {exhibition.region} · {exhibition.subRegion}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 backdrop-blur-md text-indigo-200 border border-indigo-400/30">
              {exhibition.category}
            </span>
            {exhibition.isFree ? (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-xs">
                무료 관람
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/60 text-slate-200 border border-white/10">
                관람료 {exhibition.price}
              </span>
            )}
            {exhibition.tag && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90">
                ✨ {exhibition.tag}
              </span>
            )}
          </div>

          {/* 전시 제목 */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug sm:leading-tight max-w-4xl">
            {exhibition.title}
          </h1>

          {/* 서브 요약 */}
          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-base">📍</span>
              <span className="font-medium text-white">{exhibition.venueName || exhibition.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-base">📅</span>
              <span className="font-medium text-white">{exhibition.period}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 본문 상세 정보 & 사이드바 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 전시 소개 및 큐레이터 노트 (2열 차지) */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI 도슨트 블로그 가이드 배너 */}
            {exhibition.blogSlug && (
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-indigo-500/30">
                <div className="space-y-2 z-10 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                    ✍️ AI 도슨트 심층 가이드
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    전시 관람 전 꼭 읽어야 할 상세 도슨트 리뷰 & 코스
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    작품 속 숨겨진 이야기부터 추천 포토존, 주변 맛집·카페 연계 코스를 확인해 보세요.
                  </p>
                </div>
                <Link
                  href={`/blog/${exhibition.blogSlug}`}
                  className="z-10 shrink-0 px-5 py-3 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-sm transition-all shadow-md inline-flex items-center gap-2 group"
                >
                  <span>도슨트 글 읽기</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            )}

            {/* 전시 상세 소개 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-indigo-600 inline-block"></span>
                전시 소개
              </h2>
              <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-4">
                <p>{exhibition.description}</p>
              </div>
            </div>

            {/* 도슨트 / 큐레이터 감상 팁 */}
            {exhibition.curatorNote && (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm sm:text-base">
                  <span className="text-xl">💡</span>
                  <span>AI 도슨트 관람 포인트 & 큐레이터 노트</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {exhibition.curatorNote}
                </p>
              </div>
            )}

            {/* 네이버 실시간 주변 핫플레이스 & 맛집 (NAVER API HUB 연동) */}
            {localPlaces && localPlaces.length > 0 && (
              <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#03C75A] text-white flex items-center justify-center font-black text-xs">
                      N
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      네이버 추천 주변 핫플 & 맛집
                    </h3>
                  </div>
                  <a
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(exhibition.venueName || exhibition.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#03C75A] hover:underline flex items-center gap-1"
                  >
                    <span>네이버 지도에서 보기</span>
                    <span>↗</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {localPlaces.map((place, pIdx) => (
                    <a
                      key={pIdx}
                      href={place.link || `https://search.naver.com/search.naver?query=${encodeURIComponent(place.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-[#03C75A]/50 hover:shadow-xs transition-all flex flex-col justify-between gap-1 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {place.category?.split(">").pop()?.trim() || "장소"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#03C75A] transition-colors line-clamp-1">
                          {place.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {place.roadAddress || place.address}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#03C75A] font-semibold pt-2 text-right">
                        상세보기 →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 카카오톡 무료 알림 구독 배너 */}
            <KakaoSubscribeBanner variant="card" />
          </div>

          {/* 우측: 기본 정보 요약 박스 & 액션 버튼 (사이드바) */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                관람 정보 안내
              </h3>

              <dl className="space-y-4 text-xs sm:text-sm">
                <div>
                  <dt className="text-slate-500 font-medium mb-1">전시 장소</dt>
                  <dd className="font-bold text-slate-900">{exhibition.venueName || exhibition.location}</dd>
                  {exhibition.address && (
                    <dd className="text-xs text-slate-500 mt-0.5">{exhibition.address}</dd>
                  )}
                </div>

                <div>
                  <dt className="text-slate-500 font-medium mb-1">전시 기간</dt>
                  <dd className="font-bold text-slate-900">{exhibition.period}</dd>
                </div>

                <div>
                  <dt className="text-slate-500 font-medium mb-1">관람 요금</dt>
                  <dd className="font-bold text-slate-900">
                    {exhibition.isFree ? (
                      <span className="text-emerald-600 font-extrabold">무료 관람</span>
                    ) : (
                      <span>{exhibition.price}</span>
                    )}
                  </dd>
                </div>

                {exhibition.openingHours && (
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">관람 시간</dt>
                    <dd className="font-bold text-slate-900">{exhibition.openingHours}</dd>
                  </div>
                )}

                {exhibition.closedDays && (
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">휴관일</dt>
                    <dd className="font-semibold text-rose-600">{exhibition.closedDays}</dd>
                  </div>
                )}

                {exhibition.tel && (
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">문의 전화</dt>
                    <dd className="font-medium text-slate-700">{exhibition.tel}</dd>
                  </div>
                )}
              </dl>

              {/* 액션 버튼 */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {exhibition.blogSlug && (
                  <Link
                    href={`/blog/${exhibition.blogSlug}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm transition-all border border-indigo-200 text-center flex items-center justify-center gap-2 group"
                  >
                    <span>✍️ AI 도슨트 추천 글 읽기</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                )}

                <a
                  href={exhibition.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 text-center flex items-center justify-center gap-2 group"
                >
                  <span>전시 공식 안내 보기</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </a>

                <Link
                  href="/"
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors text-center block"
                >
                  목록으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. 하단 푸터 */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <p className="font-bold text-slate-200 text-sm">부울경 아트·전시 나들이 (art-buk)</p>
            <p className="mt-1 text-slate-400">
              부산광역시 · 울산광역시 · 경상남도 전시 및 미술관 공공데이터 통합 포털
            </p>
          </div>
          <div className="text-slate-500 sm:text-right">
            <Link href="/" className="hover:text-white transition-colors">
              메인으로 이동
            </Link>
            <p className="mt-1">© 2026 art-buk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
