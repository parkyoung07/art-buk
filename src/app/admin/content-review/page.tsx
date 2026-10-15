"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useHydrated } from "@/hooks/useHydrated";
import { ContentDraft } from "@/types/draft";
import { compareDraftsNewestFirst } from "@/utils/drafts";

const APPROVAL_WORKFLOW_URL =
  "https://github.com/parkyoung07/art-buk/actions/workflows/approve-and-deploy.yml";

export default function ContentReviewPage() {
  const hydrated = useHydrated();
  const isLocal =
    hydrated &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLocal) return;
    let active = true;
    fetch("/api/admin/drafts", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<ContentDraft[]>;
      })
      .then((items) => {
        if (active) setDrafts(items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "초안 목록 로드 실패");
      });
    return () => {
      active = false;
    };
  }, [isLocal]);

  const pendingDrafts = useMemo(
    () => drafts.filter((draft) => draft.status === "review_required").sort(compareDraftsNewestFirst),
    [drafts]
  );

  if (!hydrated) {
    return <main className="min-h-screen bg-slate-950 p-8 text-slate-300">관리 도구 확인 중</main>;
  }

  if (!isLocal) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <section className="mx-auto max-w-2xl rounded-2xl border border-amber-500/30 bg-slate-900 p-6">
          <h1 className="text-xl font-black">콘텐츠 승인은 GitHub Actions에서만 가능합니다</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Production에는 초안 원문과 관리자 비밀번호를 배포하지 않습니다. 승인 대상 ID와 검토한 SHA-256을
            확인한 뒤 승인 전용 workflow를 실행하세요.
          </p>
          <a
            className="mt-5 inline-flex rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950"
            href={APPROVAL_WORKFLOW_URL}
            rel="noreferrer"
            target="_blank"
          >
            승인 workflow 열기
          </a>
          <div className="mt-5 text-sm text-slate-400">
            <Link className="underline" href="/">홈으로 돌아가기</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Local review only</p>
            <h1 className="mt-1 text-2xl font-black">승인 대기 초안 — 최신순</h1>
            <p className="mt-2 text-sm text-slate-400">Production 승인·상태 변경은 GitHub Actions에서만 수행됩니다.</p>
          </div>
          <a className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950" href={APPROVAL_WORKFLOW_URL}>
            승인 workflow
          </a>
        </header>

        {error ? (
          <p className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-rose-200">{error}</p>
        ) : (
          <p className="mb-4 text-sm text-slate-400">남은 승인 대기: {pendingDrafts.length}건</p>
        )}

        <div className="space-y-3">
          {pendingDrafts.map((draft) => (
            <article key={draft.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-amber-300">
                  {draft.date} · {draft.slot === "pm" ? "오후" : "오전"}
                </p>
                <code className="rounded bg-slate-950 px-2 py-1 text-xs text-slate-300">{draft.id}</code>
              </div>
              <h2 className="mt-3 text-lg font-bold">{draft.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{draft.summary}</p>
              <details className="mt-4 rounded-xl bg-slate-950 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-200">본문 검수</summary>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-300">{draft.content}</pre>
              </details>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
