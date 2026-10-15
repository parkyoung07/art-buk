import Link from "next/link";

export default function AdminImageReviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-extrabold">이미지 검수 기능 비활성화</h1>
        <p className="mt-4 leading-7 text-slate-300">클라이언트 저장 상태만 바꾸고 성공으로 표시하던 검수 경로를 차단했습니다. 영속 저장과 서버 인증이 마련되기 전에는 운영 변경을 허용하지 않습니다.</p>
        <Link href="/admin" className="mt-6 inline-block rounded-xl border border-slate-700 px-4 py-2 font-bold">관리 안내로 돌아가기</Link>
      </section>
    </main>
  );
}
