import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

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

  const url = `https://art-buk.pages.dev/blog/${post.slug}/`;
  const image = post.thumbnail || "https://art-buk.pages.dev/og-default.jpg";

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
      name: "부울경 아트·전시 나들이 AI 도슨트",
      url: "https://art-buk.pages.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "art-buk",
      url: "https://art-buk.pages.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://art-buk.pages.dev/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://art-buk.pages.dev/blog/${post.slug}/`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
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
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              A
            </span>
            <span className="font-bold text-sm tracking-tight text-slate-900 hidden sm:inline">
              부울경 아트·전시
            </span>
          </Link>
        </div>
      </header>

      {/* 2. 글 본문 아티클 영역 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <article className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm">
          {/* 글 헤더 */}
          <header className="pb-8 mb-8 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {post.region} · {post.category}
              </span>
              <time className="text-xs text-slate-400 font-medium">{post.date}</time>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight">
              {post.title}
            </h1>

            {post.summary && (
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                💡 {post.summary}
              </p>
            )}
          </header>

          {/* 마크다운 본문 (독서 최적화 typography) */}
          <div className="prose prose-slate max-w-none sm:prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-img:rounded-2xl prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {/* 태그 목록 */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
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
        <p>© 2026 art-buk. All rights reserved.</p>
      </footer>
    </div>
  );
}
