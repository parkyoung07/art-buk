import Link from "next/link";

export default function AdminImagesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-extrabold">이미지 관리 기능 비활성화</h1>
        <p className="mt-4 leading-7 text-slate-300">브라우저에 포함되는 관리자 비밀번호와 비영속 API를 제거했습니다. 이미지 변경은 검증 가능한 저장소 변경과 승인된 워크플로를 통해서만 진행합니다.</p>
        <Link href="/admin" className="mt-6 inline-block rounded-xl border border-slate-700 px-4 py-2 font-bold">관리 안내로 돌아가기</Link>
      </section>
    </main>
  );
}
