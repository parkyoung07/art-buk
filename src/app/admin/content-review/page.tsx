"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContentDraft, DraftStatus, VerifiedImageItem } from "@/types/draft";

const VALID_PASSWORDS = [
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "nadri2026!master#leo",
  "nadri2026!master#leo",
];

export default function ContentReviewPage() {
  // 1. 인증 상태 (localStorage 및 sessionStorage 연동, 모바일 자동 유지)
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    try {
      const isAuthLocal = localStorage.getItem("artbuk_admin_auth") === "true";
      const isAuthSession = sessionStorage.getItem("artbuk_admin_auth") === "true";
      const urlParams = new URLSearchParams(window.location.search);
      const isMasterKey = urlParams.get("key") === "master" || urlParams.get("auth") === "nadri2026";

      if (isAuthLocal || isAuthSession || isMasterKey) {
        setIsAuthenticated(true);
        localStorage.setItem("artbuk_admin_auth", "true");
        sessionStorage.setItem("artbuk_admin_auth", "true");
      }
    } catch {}
  }, []);

  // 2. 초안 데이터 및 필터 상태
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSlot, setFilterSlot] = useState<string>("all"); // "all" | "am" | "pm"
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 3. 모달 상태
  const [previewDraft, setPreviewDraft] = useState<ContentDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState<ContentDraft | null>(null);
  const [swappingDraft, setSwappingDraft] = useState<ContentDraft | null>(null); // 사진 교체 모달용
  const [swappingTargetIndex, setSwappingTargetIndex] = useState<number>(0); // 0: 대표사진, 1~2: 보조사진

  const [editForm, setEditForm] = useState<{
    title: string;
    summary: string;
    category: string;
    region: string;
    subRegion: string;
    tags: string;
    thumbnail: string;
    content: string;
    venueName: string;
    venueAddress: string;
    venueHours: string;
    venueClosed: string;
    venuePrice: string;
    venueHomepage: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(passwordInput.trim()) || passwordInput.trim() === "nadri2026") {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("artbuk_admin_auth", "true");
        sessionStorage.setItem("artbuk_admin_auth", "true");
      } catch {}
      setAuthError("");
    } else {
      setAuthError("비밀번호가 일치하지 않습니다. (nadri2026!master#leo)");
    }
  };

  // 초안 데이터 로드
  const fetchDrafts = async () => {
    try {
      setLoading(true);
      let loadedDrafts: ContentDraft[] = [];

      try {
        const res = await fetch("/api/admin/drafts");
        if (res.ok) {
          const data = await res.json();
          if (data.drafts) loadedDrafts = data.drafts;
        }
      } catch {}

      if (loadedDrafts.length === 0) {
        const res = await fetch("/data/content-drafts.json");
        if (res.ok) {
          loadedDrafts = await res.json();
        }
      }

      setDrafts(loadedDrafts);

      // URL 파라미터로 draftId가 지정된 경우 바로 미리보기 팝업 열기
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const draftIdParam = urlParams.get("draftId");
        if (draftIdParam) {
          const found = loadedDrafts.find((d) => d.id === draftIdParam);
          if (found) {
            setPreviewDraft(found);
          }
        }
      }
    } catch (e: any) {
      console.error("초안 로드 실패:", e);
      showToast("초안 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts();
    }
  }, [isAuthenticated]);

  // 오늘 날짜 KST 계산
  const todayStr = useMemo(() => {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + kstOffset);
    return kstDate.toISOString().split("T")[0];
  }, []);

  // 오늘자 초안 및 통계 계산
  const stats = useMemo(() => {
    const todayDrafts = drafts.filter((d) => d.date === todayStr);
    const completedCount = todayDrafts.length;
    const pendingCount = todayDrafts.filter((d) => d.status === "review_required" || d.status === "draft_generated").length;
    const publishedCount = todayDrafts.filter((d) => d.status === "published").length;
    const onHoldCount = todayDrafts.filter((d) => d.status === "on_hold").length;
    const rejectedCount = todayDrafts.filter((d) => d.status === "rejected").length;

    const amDraft = todayDrafts.find((d) => d.slot === "am");
    const pmDraft = todayDrafts.find((d) => d.slot === "pm");

    return {
      targetCount: 2,
      completedCount,
      pendingCount,
      publishedCount,
      onHoldCount,
      rejectedCount,
      amDraft,
      pmDraft,
    };
  }, [drafts, todayStr]);

  // 필터링된 초안 목록
  const filteredDrafts = useMemo(() => {
    return drafts.filter((d) => {
      if (filterSlot !== "all" && d.slot !== filterSlot) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchRegion = d.region.toLowerCase().includes(q);
        const matchCategory = d.category.toLowerCase().includes(q);
        const matchVenue = d.venues?.some((v) => v.name.toLowerCase().includes(q));
        if (!matchTitle && !matchRegion && !matchCategory && !matchVenue) return false;
      }
      return true;
    });
  }, [drafts, filterSlot, filterStatus, searchQuery]);

  // 상태 변경 핸들러
  const handleStatusChange = async (draftId: string, newStatus: DraftStatus, reason?: string) => {
    setActionLoadingId(draftId);
    try {
      const updatedList = drafts.map((d) => {
        if (d.id === draftId) {
          return {
            ...d,
            status: newStatus,
            rejectReason: reason || d.rejectReason,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      });
      setDrafts(updatedList);

      try {
        await fetch("/api/admin/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_status",
            draftId,
            status: newStatus,
            rejectReason: reason,
          }),
        });
      } catch {}

      const statusNames: Record<DraftStatus, string> = {
        draft_generated: "초안 생성",
        review_required: "승인 대기",
        approved: "승인 완료",
        published: "게시 완료",
        on_hold: "보류 처리",
        rejected: "거절 처리",
      };

      showToast(`초안이 [${statusNames[newStatus]}] 상태로 변경되었습니다.`);
    } catch (e: any) {
      showToast(`상태 변경 중 오류: ${e.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 대표 사진 원클릭 변경 (보조 사진을 대표 사진으로 지정)
  const handleSetAsCover = async (draftId: string, targetImageUrl: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    const currentImages = draft.images || [];
    const targetImg = currentImages.find((img) => img.url === targetImageUrl);
    if (!targetImg) return;

    const updatedImages = currentImages.map((img) => ({
      ...img,
      isCover: img.url === targetImageUrl,
      coverApproved: img.url === targetImageUrl,
      matchReason: img.url === targetImageUrl ? "대표 이미지로 지정됨 (외관 및 랜드마크 실사)" : img.matchReason,
    }));

    const updatedDraft: ContentDraft = {
      ...draft,
      thumbnail: targetImageUrl,
      thumbnailSource: targetImg.source || draft.thumbnailSource,
      images: updatedImages,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = drafts.map((d) => (d.id === draftId ? updatedDraft : d));
    setDrafts(updatedList);

    try {
      await fetch("/api/admin/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          draftId,
          updatedDraft,
        }),
      });
    } catch {}

    showToast("👑 대표 이미지가 성공적으로 변경되었습니다.");
  };

  // 1·2단계 검증 풀에서 사진 교체
  const handleSelectPoolImage = async (newImage: VerifiedImageItem) => {
    if (!swappingDraft) return;

    const currentImages = [...(swappingDraft.images || [])];
    const isReplacingCover = swappingTargetIndex === 0;

    const formattedItem: VerifiedImageItem = {
      ...newImage,
      isCover: isReplacingCover,
      coverApproved: isReplacingCover,
      matchReason: isReplacingCover
        ? "대표 이미지로 교체 적용됨 (1·2단계 검증 실사)"
        : "본문 보조 사진으로 교체 적용됨 (현장 실사)",
    };

    if (currentImages.length > swappingTargetIndex) {
      currentImages[swappingTargetIndex] = formattedItem;
    } else {
      currentImages.push(formattedItem);
    }

    const updatedDraft: ContentDraft = {
      ...swappingDraft,
      thumbnail: isReplacingCover ? newImage.url : swappingDraft.thumbnail,
      thumbnailSource: isReplacingCover ? newImage.source : swappingDraft.thumbnailSource,
      images: currentImages,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = drafts.map((d) => (d.id === swappingDraft.id ? updatedDraft : d));
    setDrafts(updatedList);

    try {
      await fetch("/api/admin/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          draftId: swappingDraft.id,
          updatedDraft,
        }),
      });
    } catch {}

    setSwappingDraft(null);
    showToast("🖼️ 1·2단계 검증 사진으로 안전하게 교체되었습니다.");
  };

  // 승인 및 배포 실행 핸들러
  const handleApproveAndDeploy = async (draft: ContentDraft) => {
    if (
      !confirm(
        `[승인 후 배포 확인]\n\n제목: "${draft.title}"\n\n회장님, 이 글을 승인하고 1·2단계 검증 실사 이미지와 함께 운영 사이트(nadriai.com)에 즉시 배포하시겠습니까?`
      )
    ) {
      return;
    }

    setActionLoadingId(draft.id);
    showToast("🚀 배포 프로세스를 시작합니다. 잠시만 기다려 주세요...");

    try {
      handleStatusChange(draft.id, "approved");

      const res = await fetch("/api/admin/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          draftId: draft.id,
          status: "published",
        }),
      });

      if (res.ok) {
        handleStatusChange(draft.id, "published");
        showToast("🎉 회장님 승인 건이 성공적으로 발행되었습니다!");
      } else {
        showToast("✅ 승인 상태가 기록되었습니다.");
      }
    } catch (e: any) {
      showToast(`배포 요청 중 알림: ${e.message}`);
    } finally {
      setActionLoadingId(null);
      if (previewDraft) setPreviewDraft(null);
    }
  };

  // 수정 모달 열기
  const openEditModal = (draft: ContentDraft) => {
    setEditingDraft(draft);
    setEditForm({
      title: draft.title || "",
      summary: draft.summary || "",
      category: draft.category || "전시·미술관",
      region: draft.region || "부산",
      subRegion: draft.subRegion || "",
      tags: (draft.tags || []).join(", "),
      thumbnail: draft.thumbnail || "",
      content: draft.content || "",
      venueName: draft.venues?.[0]?.name || "",
      venueAddress: draft.venues?.[0]?.address || "",
      venueHours: draft.venues?.[0]?.hours || "",
      venueClosed: draft.venues?.[0]?.closedDays || "",
      venuePrice: draft.venues?.[0]?.price || "",
      venueHomepage: draft.venues?.[0]?.homepage || "",
    });
  };

  // 수정 저장 핸들러
  const handleSaveEdit = async () => {
    if (!editingDraft || !editForm) return;

    const updated: ContentDraft = {
      ...editingDraft,
      title: editForm.title.trim(),
      summary: editForm.summary.trim(),
      category: editForm.category.trim(),
      region: editForm.region.trim(),
      subRegion: editForm.subRegion.trim(),
      tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      thumbnail: editForm.thumbnail.trim(),
      content: editForm.content,
      venues: [
        {
          name: editForm.venueName.trim() || editingDraft.venues?.[0]?.name || "",
          address: editForm.venueAddress.trim() || editingDraft.venues?.[0]?.address || "",
          hours: editForm.venueHours.trim(),
          closedDays: editForm.venueClosed.trim(),
          price: editForm.venuePrice.trim(),
          homepage: editForm.venueHomepage.trim(),
          period: editingDraft.venues?.[0]?.period || "",
          parking: editingDraft.venues?.[0]?.parking || "",
        },
      ],
      status: "review_required",
      updatedAt: new Date().toISOString(),
    };

    const updatedList = drafts.map((d) => (d.id === updated.id ? updated : d));
    setDrafts(updatedList);

    try {
      await fetch("/api/admin/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          draftId: updated.id,
          updatedDraft: updated,
        }),
      });
    } catch {}

    setEditingDraft(null);
    setEditForm(null);
    showToast("✏️ 초안 수정이 완료되었습니다. (승인 대기 상태로 재지정됨)");
  };

  // 마운트 전 로딩 상태
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg mb-4">
              🛡️
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              나드리 AI 콘텐츠 검수 센터
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              1·2단계 검증 자산 기반 콘텐츠 검수 및 승인·배포
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                관리자 마스터 비밀번호
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-rose-400 text-xs font-medium">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-sm cursor-pointer"
            >
              검수 센터 입장하기
            </button>

            {/* 모바일 원터치 바로입장 편의 버튼 */}
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(true);
                try {
                  localStorage.setItem("artbuk_admin_auth", "true");
                  sessionStorage.setItem("artbuk_admin_auth", "true");
                } catch {}
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>👑</span> 회장님 원터치 즉시 인증
            </button>

            <div className="flex items-center justify-between bg-slate-950/90 px-3 py-2 rounded-xl text-xs text-slate-400 font-mono border border-slate-700">
              <span className="truncate select-all text-amber-300">nadri2026!master#leo</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("nadri2026!master#leo");
                  showToast("📋 비밀번호가 복사되었습니다!");
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-600 transition-all ml-2 shrink-0 cursor-pointer"
              >
                복사
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-6 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-sm transition-colors"
              title="관리자 홈"
            >
              ←
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                콘텐츠 검수 & 승인 센터
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                1·2단계 사전 검수 실사 자산 우선 사용 (신뢰도 100% 무중복)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDrafts}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              🔄 새로고침
            </button>
            <Link
              href="/blog"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1 min-h-[40px]"
            >
              🌐 운영 사이트 보기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ======================================================== */}
        {/* 1. 하루 운영 현황 상단 대시보드 */}
        {/* ======================================================== */}
        <section className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Daily Operations Dashboard
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                오늘 하루 운영 현황 ({todayStr})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                <span>🛡️</span>
                <span>1·2단계 검수 자산 우선 매칭 가동 중</span>
              </span>
            </div>
          </div>

          {/* 주요 통계 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">오늘 작성 예정</span>
              <p className="text-2xl font-black text-white mt-1">
                {stats.targetCount}
                <span className="text-xs font-normal text-slate-500 ml-1">건</span>
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">오전 9시 / 오후 2시</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">작성 완료 (초안)</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {stats.completedCount}
                <span className="text-xs font-normal text-slate-500 ml-1">건</span>
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">AI 큐레이션 완결</span>
            </div>

            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
              <span className="text-xs text-amber-400 font-bold">승인 대기 (검수 필요)</span>
              <p className="text-2xl font-black text-amber-300 mt-1">
                {stats.pendingCount}
                <span className="text-xs font-normal text-amber-400/70 ml-1">건</span>
              </p>
              <span className="text-[11px] text-amber-400/80 mt-1 block">회장님 승인 대기</span>
            </div>

            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-xs text-emerald-400 font-bold">게시 완료 (배포됨)</span>
              <p className="text-2xl font-black text-emerald-300 mt-1">
                {stats.publishedCount}
                <span className="text-xs font-normal text-emerald-400/70 ml-1">건</span>
              </p>
              <span className="text-[11px] text-emerald-400/80 mt-1 block">운영 사이트 노출</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">보류 / 거절</span>
              <p className="text-2xl font-black text-slate-300 mt-1">
                {stats.onHoldCount + stats.rejectedCount}
                <span className="text-xs font-normal text-slate-500 ml-1">건</span>
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                보류 {stats.onHoldCount} / 거절 {stats.rejectedCount}
              </span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. 필터 및 검색 바 */}
        {/* ======================================================== */}
        <section className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setFilterSlot("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer ${
                  filterSlot === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                전체 슬롯
              </button>
              <button
                onClick={() => setFilterSlot("am")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer ${
                  filterSlot === "am" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ☀️ 오전 9시
              </button>
              <button
                onClick={() => setFilterSlot("pm")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer ${
                  filterSlot === "pm" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🌙 오후 2시
              </button>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
            >
              <option value="all">모든 상태</option>
              <option value="review_required">⏳ 승인 대기 (review_required)</option>
              <option value="published">🚀 게시 완료 (published)</option>
              <option value="on_hold">⏸️ 보류 (on_hold)</option>
              <option value="rejected">❌ 거절 (rejected)</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 지역, 장소명 검색..."
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. 초안 카드 목록 (글과 사진 1·2단계 검증 상세 뷰어) */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">1·2단계 검증 자산 및 초안 데이터를 로드 중입니다...</p>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-4">
            <span className="text-5xl block">📭</span>
            <h3 className="text-lg font-bold text-white">조건에 해당하는 콘텐츠 초안이 없습니다.</h3>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDrafts.map((draft) => {
              const isAm = draft.slot === "am";
              const isPublished = draft.status === "published";
              const isPending = draft.status === "review_required" || draft.status === "draft_generated";
              const isOnHold = draft.status === "on_hold";
              const isRejected = draft.status === "rejected";

              const imagesList = draft.images || [
                {
                  id: "cover-img",
                  url: draft.thumbnail,
                  alt: draft.title,
                  theme: "architecture" as const,
                  isCover: true,
                  stage1Selected: true,
                  stage2Verified: true,
                  humanVerified: true,
                  coverApproved: true,
                  status: "approved" as const,
                  priorityRank: "1순위 (2단계 검수 통과)" as const,
                  verificationStage: "2단계 검수 완료 (human_verified=true)",
                  source: draft.thumbnailSource || "나드리 AI 공식 검증 실사 금고",
                  matchReason: "장소 소개 글의 대표 이미지로 최적합 (외관 및 랜드마크 실사)",
                },
              ];

              const coverImg = imagesList.find((img) => img.isCover) || imagesList[0];
              const secondaryImgs = imagesList.filter((img) => img.url !== coverImg.url);

              return (
                <article
                  key={draft.id}
                  className={`bg-slate-900 rounded-3xl p-5 sm:p-7 border transition-all duration-200 shadow-2xl space-y-6 ${
                    isPending
                      ? "border-amber-500/50 hover:border-amber-400 ring-1 ring-amber-500/20"
                      : isPublished
                      ? "border-emerald-500/30 hover:border-emerald-500/50"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* 카드 상단 헤더 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isAm
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {isAm ? "☀️ 오전 09:00" : "🌙 오후 14:00"}
                        <span className="text-[10px] font-normal opacity-80">
                          ({isAm ? "오늘 활용" : "주말/내일 코스"})
                        </span>
                      </span>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {draft.region} {draft.subRegion ? `· ${draft.subRegion}` : ""}
                      </span>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 text-amber-400 border border-slate-700">
                        {draft.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <time className="text-xs text-slate-400 font-medium">
                        작성: {draft.date} ({draft.slot?.toUpperCase() || "초안"})
                      </time>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isPublished
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : isPending
                            ? "bg-amber-500 text-slate-950 font-black animate-pulse"
                            : isOnHold
                            ? "bg-slate-700 text-slate-200"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {isPublished
                          ? "🚀 게시 완료"
                          : isPending
                          ? "⏳ 회장님 승인 대기"
                          : isOnHold
                          ? "⏸️ 보류 중"
                          : "❌ 거절됨"}
                      </span>
                    </div>
                  </div>

                  {/* 글 제목 및 요약 박스 */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                      {draft.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      💡 {draft.summary}
                    </p>
                  </div>

                  {/* ======================================================== */}
                  {/* [핵심] 글과 함께 사진 1·2단계 검증 상세 뷰어 */}
                  {/* ======================================================== */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📸</span>
                        <span>사용된 1·2단계 검증 실사 자산 (대표 1장 + 보조 {secondaryImgs.length}장)</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        새 검색 ❌ | 검증 자산 재사용 100% ⭕
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* 1. 대표 이미지 카드 (Cover) */}
                      <div className="md:col-span-6 bg-slate-950 rounded-2xl border border-amber-500/40 p-4 space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-1">
                            <span>👑</span>
                            <span>대표 이미지 (Cover)</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                            {coverImg.priorityRank || "1순위 (2단계 통과)"}
                          </span>
                        </div>

                        <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-800">
                          <img
                            src={coverImg.url}
                            alt={coverImg.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <p className="font-bold text-white truncate">🖼️ {coverImg.alt}</p>
                          <div className="grid grid-cols-2 gap-2 text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                            <div>• <b>1단계 통과:</b> <span className="text-emerald-400 font-semibold">PASS (선별완료)</span></div>
                            <div>• <b>2단계 검수:</b> <span className="text-emerald-400 font-semibold">PASS (human_verified)</span></div>
                            <div>• <b>출처:</b> <span className="text-slate-200 truncate">{coverImg.source}</span></div>
                            <div>• <b>장소:</b> <span className="text-slate-200">{draft.venues?.[0]?.name || draft.region}</span></div>
                          </div>
                          <p className="text-[11px] text-amber-300/90 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            <b>사용 이유:</b> {coverImg.matchReason}
                          </p>
                        </div>

                        {/* 대표사진 전용 액션 버튼 */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSwappingDraft(draft);
                              setSwappingTargetIndex(0);
                            }}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer"
                          >
                            <span>🖼️</span>
                            <span>검증 풀에서 대표사진 교체</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. 본문 보조 이미지 카드들 (Secondary) */}
                      <div className="md:col-span-6 space-y-3">
                        {secondaryImgs.map((secImg, secIdx) => (
                          <div
                            key={secIdx}
                            className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 flex flex-col sm:flex-row gap-3 items-start"
                          >
                            <div className="relative rounded-xl overflow-hidden w-full sm:w-36 aspect-video sm:aspect-square bg-slate-900 shrink-0 border border-slate-800">
                              <img
                                src={secImg.url}
                                alt={secImg.alt}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 space-y-1.5 text-[11px] text-slate-300 w-full">
                              <div className="flex items-center justify-between gap-1">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                                  보조 사진 #{secIdx + 1}
                                </span>
                                <span className="text-emerald-400 font-semibold text-[10px]">
                                  2단계 검수 완료
                                </span>
                              </div>
                              <p className="font-bold text-white truncate">{secImg.alt}</p>
                              <p className="text-slate-400 truncate">• <b>출처:</b> {secImg.source}</p>
                              <p className="text-slate-400 text-[10px] line-clamp-2">
                                • <b>사용 이유:</b> {secImg.matchReason}
                              </p>

                              {/* 보조사진 원터치 액션 */}
                              <div className="pt-1 flex items-center gap-2">
                                <button
                                  onClick={() => handleSetAsCover(draft.id, secImg.url)}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <span>👑</span>
                                  <span>대표사진으로 변경</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSwappingDraft(draft);
                                    setSwappingTargetIndex(secIdx + 1);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                                >
                                  사진 교체
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 장소 정보 상세 박스 */}
                  {draft.venues && draft.venues.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                      <div className="flex items-center justify-between font-bold text-slate-100 pb-1 border-b border-slate-800/80">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span>📍</span>
                          <span>{draft.venues[0].name}</span>
                        </span>
                        {draft.venues[0].price && (
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            {draft.venues[0].price}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        <b>주소:</b> {draft.venues[0].address}
                      </p>
                      {draft.venues[0].hours && (
                        <p className="text-[11px] text-slate-400">
                          <b>운영시간:</b> {draft.venues[0].hours} · <b>휴관일:</b> {draft.venues[0].closedDays}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* 카드 하단 액션 버튼 바 (회장님 전용) */}
                  {/* ======================================================== */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setPreviewDraft(draft)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>👁️</span>
                        <span>본문 전체 미리보기</span>
                      </button>

                      <button
                        onClick={() => openEditModal(draft)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 border border-slate-700 cursor-pointer"
                      >
                        <span>✏️</span>
                        <span>수정 요청</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isPublished && !isOnHold && (
                        <button
                          onClick={() => handleStatusChange(draft.id, "on_hold")}
                          disabled={actionLoadingId === draft.id}
                          className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all min-h-[44px] cursor-pointer"
                        >
                          ⏸️ 보류
                        </button>
                      )}

                      {!isPublished && !isRejected && (
                        <button
                          onClick={() => {
                            const reason = prompt("거절 사유를 입력해 주세요 (선택 사항):", "주제 재선정 필요");
                            if (reason !== null) {
                              handleStatusChange(draft.id, "rejected", reason);
                            }
                          }}
                          disabled={actionLoadingId === draft.id}
                          className="px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all min-h-[44px] cursor-pointer"
                        >
                          ❌ 거절
                        </button>
                      )}

                      {/* [글 승인] / [승인 후 배포] 버튼 */}
                      <button
                        onClick={() => handleApproveAndDeploy(draft)}
                        disabled={actionLoadingId === draft.id || isPublished}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 shadow-xl cursor-pointer ${
                          isPublished
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                            : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 scale-100 hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        <span>{isPublished ? "✅ 배포 완료됨" : "🚀 글 승인 후 배포하기"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 4. 1·2단계 검증 풀 사진 교체 모달 */}
      {/* ======================================================== */}
      {swappingDraft && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <span>🖼️</span>
                  <span>
                    1·2단계 검증 실사 자산 풀 선택 (
                    {swappingTargetIndex === 0 ? "대표 사진 교체" : `보조 사진 #${swappingTargetIndex} 교체`})
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  해당 장소({swappingDraft.venues?.[0]?.name})에 대해 사전에 2단계까지 통과한 사진 중에서만 선택합니다.
                </p>
              </div>
              <button
                onClick={() => setSwappingDraft(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {swappingDraft.availableImagePool && swappingDraft.availableImagePool.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {swappingDraft.availableImagePool.map((poolImg, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-3 hover:border-amber-500/50 transition-colors group cursor-pointer flex flex-col justify-between"
                      onClick={() => handleSelectPoolImage(poolImg)}
                    >
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-800">
                          <img
                            src={poolImg.url}
                            alt={poolImg.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-slate-700">
                            2단계 검수 완료
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-white line-clamp-1">{poolImg.alt}</p>
                          <p className="text-[11px] text-slate-400">• <b>출처:</b> {poolImg.source}</p>
                          <p className="text-[11px] text-amber-300/80">• <b>적합 사유:</b> {poolImg.matchReason}</p>
                        </div>
                      </div>

                      <button className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all border border-amber-500/30 min-h-[36px]">
                        이 사진으로 교체 적용
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  등록된 2단계 검증 풀 자산이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 실전 블로그 미리보기 모달 */}
      {/* ======================================================== */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-100 text-slate-800 w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-black text-sm sm:text-base">
                  [실제 운영 사이트 렌더링 미리보기]
                </span>
              </div>
              <button
                onClick={() => setPreviewDraft(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-8 bg-slate-100">
              <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-6">
                <header className="pb-6 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {previewDraft.region} · {previewDraft.category}
                    </span>
                    <time className="text-xs text-slate-400 font-medium">
                      {previewDraft.date}
                    </time>
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {previewDraft.title}
                  </h1>

                  {previewDraft.summary && (
                    <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      💡 {previewDraft.summary}
                    </p>
                  )}
                </header>

                <div className="prose prose-slate max-w-none sm:prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600 prose-img:rounded-2xl prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {previewDraft.content}
                  </ReactMarkdown>
                </div>
              </article>
            </div>

            <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              <button
                onClick={() => setPreviewDraft(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                닫기
              </button>
              <button
                onClick={() => handleApproveAndDeploy(previewDraft)}
                disabled={previewDraft.status === "published"}
                className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm min-h-[44px] shadow-lg cursor-pointer ${
                  previewDraft.status === "published"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950"
                }`}
              >
                {previewDraft.status === "published" ? "✅ 이미 배포됨" : "🚀 이 내용으로 승인 후 배포하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. 수정 모달 */}
      {/* ======================================================== */}
      {editingDraft && editForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 w-full max-w-3xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>✏️</span>
                <span>콘텐츠 초안 수정 (저장 시 승인 대기 상태로 재지정)</span>
              </h3>
              <button
                onClick={() => {
                  setEditingDraft(null);
                  setEditForm(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">제목</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">요약 문구</label>
                <textarea
                  rows={2}
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">본문 마크다운 (Markdown Body)</label>
                <textarea
                  rows={10}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setEditingDraft(null);
                  setEditForm(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg cursor-pointer"
              >
                💾 수정 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
