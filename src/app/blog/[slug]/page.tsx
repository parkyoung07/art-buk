import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { getNaverBlogReviews, getNaverCafeReviews } from "@/lib/naver";
import NaverLiveReviews from "@/components/NaverLiveReviews";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";
import rawData from "../../../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

const exhibitions: Exhibition[] = rawData as Exhibition[];

export async function generateStaticParams() {
  const posts = getAllPosts();
  if (posts.length === 0) {
    return [{ slug: "_empty" }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "_empty") return { title: "글을 찾을 수 없습니다." };
  const post = getPostBySlug(slug);
  if (!post) return { title: "글을 찾을 수 없습니다." };

  const url = `https://nadriai.com/blog/${post.slug}/`;
  const image = post.thumbnail || "https://nadriai.com/og-default.jpg";

  return {
    title: `${post.title} | 부울경 전시 블로그`,
    description: post.summary || "부산, 울산, 경남 미술관 전시 리뷰 및 AI 도슨트 나들이 팁",
    keywords: [...post.tags, post.region, "부울경전시", "미술관나들이"],
    openGraph: {
      title: `${post.title} | 부울경 전시 블로그`,
      description: post.summary || "부산, 울산, 경남 미술관 전시 리뷰 및 AI 도슨트 나들이 팁",
      url,
      type: "article",
      publishedTime: post.date,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [image],
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "_empty") {
    notFound();
  }
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 네이버 실시간 블로그 및 카페 후기 조회
  const searchKeyword = post.title.split(":")[0]?.replace(/\[.*?\]/g, "").trim() || post.tags[0] || "부울경 전시";
  const [blogReviews, cafeReviews] = await Promise.all([
    getNaverBlogReviews(searchKeyword, 2),
    getNaverCafeReviews(searchKeyword, 2),
  ]);

  // BlogPosting JSON-LD 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: post.thumbnail ? [post.thumbnail] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "나드리 AI 도슨트",
      url: "https://nadriai.com",
    },
    publisher: {
      "@type": "Organization",
      name: "nadriai",
      url: "https://nadriai.com",
      logo: {
        "@type": "ImageObject",
        url: "https://nadriai.com/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nadriai.com/blog/${post.slug}/`,
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* 상단 및 전체 은은한 배경 이미지 */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1920&auto=format&fit=crop&q=80')`
        }}
      />
      {/* 상단 앰비언트 그라데이션 */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-900/10 via-slate-100/50 to-transparent pointer-events-none" />

      {/* 구조화 데이터 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
              ←
            </span>
            <span>블로그 목록으로</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 flex items-center justify-center text-white font-black text-xs">
              ✨
            </span>
            <span className="font-bold text-sm tracking-tight text-slate-900 hidden sm:inline">
              나드리 AI
            </span>
          </Link>
        </div>
      </header>

      {/* 2. 글 본문 아티클 영역 */}
      <main className="relative flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-md">
          {/* 글 헤더 */}
          <header className="pb-6 mb-8 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {post.region} · {post.category}
              </span>
              <time className="text-xs text-slate-400 font-medium">{post.date}</time>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight">
              {post.title}
            </h1>

            {post.summary && (
              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                💡 {post.summary}
              </p>
            )}
          </header>

          {/* 마크다운 본문 (독서 최적화 typography) */}
          <div className="prose prose-slate max-w-none sm:prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-img:rounded-2xl prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {/* 실시간 네이버 관람객 생생 후기 (NAVER API HUB 연동) */}
          <NaverLiveReviews
            keyword={searchKeyword}
            blogReviews={blogReviews}
            cafeReviews={cafeReviews}
          />

          {/* 카카오톡 전시 소식 구독 카드 */}
          <KakaoSubscribeBanner variant="card" />

          {/* 연계 전시 카드 */}
          {(() => {
            const relatedExhibition = exhibitions.find(
              (e) => e.id === post.eventId || e.blogSlug === post.slug
            );
            if (!relatedExhibition) return null;

            return (
              <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-md border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    🎨 이번 글에 소개된 전시
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {relatedExhibition.region} · {relatedExhibition.subRegion}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {relatedExhibition.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    📍 {relatedExhibition.venueName || relatedExhibition.location} | 📅 {relatedExhibition.period}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/events/${relatedExhibition.id}`}
                    className="py-2.5 px-5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 text-xs sm:text-sm font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    전시 상세정보 & 길찾기 안내 →
                  </Link>
                  <a
                    href={relatedExhibition.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium border border-white/20 transition-all"
                  >
                    미술관 공식 홈페이지 ↗
                  </a>
                </div>
              </div>
            );
          })()}

          {/* 태그 목록 */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">TAGS :</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 출처 및 공공데이터 명시 (E-E-A-T 신뢰도) */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
            <span>ℹ️</span>
            <span>본 정보는 한국문화정보원 공공데이터를 기반으로 작성되었습니다.</span>
          </div>

          {/* 하단 네비게이션 버튼 */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              ← 목록으로 돌아가기
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              전시 일정 보러가기 ↗
            </Link>
          </div>
        </article>
      </main>

      {/* 3. 하단 푸터 */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs text-center">
        <p>© 2026 NADRI AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
