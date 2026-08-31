import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import KakaoSubscribeBanner from "@/components/KakaoSubscribeBanner";

export const metadata = {
  title: "전시 블로그 & AI 도슨트 | 부울경 아트·전시 나들이",
  description: "부산, 울산, 경남의 미술관 전시 리뷰, 도슨트 작품 해설, 주변 나들이 추천 코스를 매거진 형태로 전해드립니다.",
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
              A
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2">
                부울경 아트·전시
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  art-buk
                </span>
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-medium">
            <Link href="/" className="px-3 py-1.5 text-slate-700 hover:text-indigo-600 transition-colors">
              전시 둘러보기
            </Link>
            <Link
              href="/blog"
              className="px-3 py-1.5 text-indigo-600 font-bold bg-indigo-50 rounded-lg transition-colors"
            >
              전시 블로그
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. 블로그 Hero 섹션 */}
      <section className="relative overflow-hidden text-white py-14 sm:py-16">
        {/* 배경 이미지 & 은은한 오버레이 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/33317334/pexels-photo-33317334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-slate-900/90 to-slate-950/95 backdrop-blur-[2px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-medium mb-5 backdrop-blur-md shadow-sm">
            <span>✍️</span>
            <span>AI 도슨트 & 전시 큐레이션 매거진</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            부울경 전시 리뷰 & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200 bg-clip-text text-transparent">
              도슨트 나들이 이야기
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            작품 속에 담긴 숨은 이야기부터 미술관 주변 데이트·나들이 추천 코스까지, 친절한 해설을 만나보세요.
          </p>
        </div>
      </section>

      {/* 카카오톡 전시 소식 무료 알림 배너 */}
      <KakaoSubscribeBanner variant="hero" />

      {/* 3. 블로그 글 목록 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* 썸네일 이미지 (있을 경우) */}
                {post.thumbnail && (
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-indigo-700 shadow-sm">
                      {post.region} · {post.category}
                    </span>
                  </Link>
                )}

                <Link href={`/blog/${post.slug}`} className="block flex-1 flex flex-col p-6">
                  {/* 썸네일이 없을 때만 표시되는 뱃지 */}
                  {!post.thumbnail && (
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {post.region} · {post.category}
                      </span>
                      <time className="text-xs text-slate-400 font-medium">{post.date}</time>
                    </div>
                  )}

                  {post.thumbnail && (
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <time className="text-xs text-slate-400 font-medium">{post.date}</time>
                    </div>
                  )}

                  {/* 글 제목 */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {post.title}
                  </h2>

                  {/* 미리보기 본문 (summary) */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {post.summary}
                  </p>

                  {/* 태그 목록 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white text-xs font-bold transition-all text-center block"
                  >
                    글 읽어보기 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">작성된 전시 리뷰가 준비 중입니다.</h3>
            <p className="text-sm text-slate-500 mb-6">
              AI 도슨트가 새로운 전시 해설 글과 주변 나들이 코스를 작성할 예정입니다.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm inline-block"
            >
              전시 목록 둘러보기
            </Link>
          </div>
        )}
      </main>

      {/* 4. 하단 푸터 */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <p className="font-bold text-slate-200 text-sm">부울경 아트·전시 나들이 (art-buk)</p>
            <p className="mt-1 text-slate-400">
              부산광역시 · 울산광역시 · 경상남도 전시 및 미술관 공공데이터 통합 포털
            </p>
          </div>
          <div className="text-slate-500 sm:text-right">
            <p>© 2026 art-buk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
