import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Production access disabled</p>
        <h1 className="mt-3 text-3xl font-extrabold">관리 작업은 GitHub Actions에서 실행합니다</h1>
        <p className="mt-4 leading-7 text-slate-300">
          클라이언트 비밀번호 방식의 관리자 기능은 비활성화했습니다. 콘텐츠 승인은 검토한 초안 ID와 해시를 입력하는 승인 전용 워크플로에서만 처리됩니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/content-review" className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950">초안 검수 안내</Link>
          <a href="https://github.com/parkyoung07/art-buk/actions/workflows/approve-and-deploy.yml" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 px-4 py-2 font-bold">승인 워크플로 열기</a>
        </div>
      </section>
    </main>
  );
}
