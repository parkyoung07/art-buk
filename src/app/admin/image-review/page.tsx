"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Candidate {
  candidate_id: string;
  place_id: string;
  place_name: string;
  category: string;
  region: string;
  search_query: string;
  image_url: string;
  thumbnail_url: string;
  original_source_url: string;
  title: string;
  source_domain: string;
  source_tier: string;
  fetched_at: string;
  status: "approved" | "pending" | "rejected";
  score: number;
  score_breakdown: {
    source_score: number;
    title_score: number;
    region_score: number;
    vision_score: number;
    quality_score: number;
  };
  vision_notes: string;
  reject_reason: string | null;
  is_cover?: boolean;
}

export default function ImageReviewPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("artbuk_admin_auth") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlace, setFilterPlace] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const VALID_PASSWORDS = [
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "nadri2026!master#leo",
      "nadri2026!master#leo"
    ];
    if (VALID_PASSWORDS.includes(passwordInput.trim())) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem("artbuk_admin_auth", "true");
      } catch {}
      setAuthError("");
    } else {
      setAuthError("비밀번호가 일치하지 않습니다.");
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let data: any = null;
      try {
        const params = new URLSearchParams();
        if (filterStatus !== "all") params.append("status", filterStatus);
        if (filterPlace !== "all") params.append("place_id", filterPlace);
        if (searchQuery) params.append("q", searchQuery);

        const res = await fetch(`/api/admin/image-review?${params.toString()}`);
        if (res.ok) data = await res.json();
      } catch (e) {}

      if (!data || !data.success) {
        const res = await fetch("/data/naver-image-candidates.json");
        const raw = await res.json();
        let filtered = raw;
        if (filterStatus !== "all") filtered = filtered.filter((c: any) => c.status === filterStatus);
        if (filterPlace !== "all") filtered = filtered.filter((c: any) => c.place_id === filterPlace);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (c: any) =>
              c.place_name?.toLowerCase().includes(q) ||
              c.title?.toLowerCase().includes(q) ||
              c.source_domain?.toLowerCase().includes(q)
          );
        }
        data = { success: true, candidates: filtered };
      }

      if (data && data.success) {
        setCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error("후보 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filterStatus, filterPlace]);

  const handleAction = async (candidateId: string, action: "approve" | "reject" | "set_cover") => {
    try {
      setUpdatingId(candidateId);
      const res = await fetch("/api/admin/image-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidateId,
          action
        })
      });
      if (res.ok) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.candidate_id === candidateId
              ? {
                  ...c,
                  status: action === "reject" ? "rejected" : "approved",
                  is_cover: action === "set_cover" ? true : c.is_cover
                }
              : c
          )
        );
      }
    } catch (e) {
      console.error("액션 실행 실패:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const uniquePlaces = Array.from(new Set(candidates.map((c) => c.place_name)));

  const stats = {
    total: candidates.length,
    approved: candidates.filter((c) => c.status === "approved").length,
    pending: candidates.filter((c) => c.status === "pending").length,
    rejected: candidates.filter((c) => c.status === "rejected").length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-emerald-500/30">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">관리자 인증</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
            네이버 이미지 후보 검수 대시보드입니다.<br />보안 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="관리자 보안 비밀번호 입력"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-center font-mono placeholder-slate-400 transition-all text-slate-900"
              required
              autoFocus
            />
            {authError && <p className="text-xs text-rose-500 font-semibold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              인증 확인 →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      {/* 상단 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-slate-400 hover:text-white text-sm transition-colors">
                ← 관리자 홈
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-emerald-400 text-sm font-medium">네이버 API 안전 선별</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
              🔍 네이버 이미지 후보 정밀 검수 센터
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              네이버 API 다중 쿼리 후보를 출처 도메인 + 제목 일치도 + AI Vision 시각 분석으로 100점 채점하여 선별합니다.
            </p>
          </div>

          {/* 통계 배지 */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400">전체 후보</div>
              <div className="text-lg font-bold text-white">{stats.total}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-emerald-400">승인 후보</div>
              <div className="text-lg font-bold text-emerald-400">{stats.approved}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-amber-400">관리자 검토</div>
              <div className="text-lg font-bold text-amber-400">{stats.pending}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-rose-400">부적격 탈락</div>
              <div className="text-lg font-bold text-rose-400">{stats.rejected}</div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 바 */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">상태:</span>
            {["all", "approved", "pending", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {s === "all" ? "전체 보기" : s === "approved" ? "승인 (80점+)" : s === "pending" ? "검토 대기 (60-79점)" : "탈락 (<60점)"}
              </button>
            ))}

            <span className="text-xs font-semibold text-slate-400 ml-4 mr-1">장소:</span>
            <select
              value={filterPlace}
              onChange={(e) => setFilterPlace(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">전체 장소 (20곳)</option>
              {uniquePlaces.map((name) => (
                <option key={name} value={candidates.find((c) => c.place_name === name)?.place_id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCandidates();
            }}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <input
              type="text"
              placeholder="장소명, 도메인, 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full md:w-60"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      {/* 카드 그리드 목록 */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-3"></div>
            네이버 API 검수 후보를 불러오는 중입니다...
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">해당 조건의 후보 이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((c) => (
              <div
                key={c.candidate_id}
                className={`bg-slate-900 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  c.status === "approved"
                    ? "border-emerald-900/50 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                    : c.status === "pending"
                    ? "border-amber-900/50 hover:border-amber-500/60"
                    : "border-rose-900/40 opacity-75"
                }`}
              >
                <div>
                  {/* 상단 이미지 미리보기 */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
                    <img
                      src={c.image_url}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => {
                        e.target.src = "/images/placeholders/placeholder-default.svg";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-950/80 text-white border border-slate-700 backdrop-blur-md">
                        {c.score}점
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded backdrop-blur-md ${
                          c.source_tier === "A"
                            ? "bg-blue-900/80 text-blue-300 border border-blue-700"
                            : c.source_tier === "B"
                            ? "bg-purple-900/80 text-purple-300 border border-purple-700"
                            : "bg-amber-900/80 text-amber-300 border border-amber-700"
                        }`}
                      >
                        Tier {c.source_tier}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full backdrop-blur-md border ${
                          c.status === "approved"
                            ? "bg-emerald-900/80 text-emerald-300 border-emerald-600"
                            : c.status === "pending"
                            ? "bg-amber-900/80 text-amber-300 border-amber-600"
                            : "bg-rose-900/80 text-rose-300 border-rose-600"
                        }`}
                      >
                        {c.status === "approved" ? "✓ 승인됨" : c.status === "pending" ? "⏳ 검토대기" : "✕ 탈락"}
                      </span>
                    </div>
                  </div>

                  {/* 장소 및 후보 정보 */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-emerald-400">{c.place_name}</span>
                        <span>{c.region}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1 leading-snug line-clamp-2" title={c.title}>
                        {c.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>🔎 "{c.search_query}"</span>
                      </div>
                    </div>

                    {/* 세부 점수 카드 */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">출처 도메인:</span>
                        <span className="font-mono text-emerald-300 truncate max-w-[180px]">{c.source_domain}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <span>출처 {c.score_breakdown?.source_score}점</span>
                        <span>제목 {c.score_breakdown?.title_score}점</span>
                        <span>지역 {c.score_breakdown?.region_score}점</span>
                        <span>비전 {c.score_breakdown?.vision_score + c.score_breakdown?.quality_score}점</span>
                      </div>
                    </div>

                    {/* Vision 판정 메모 / 탈락 사유 */}
                    <div
                      className={`p-2.5 rounded-xl text-xs border ${
                        c.reject_reason
                          ? "bg-rose-950/20 border-rose-900/30 text-rose-300"
                          : "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                      }`}
                    >
                      <div className="font-semibold mb-0.5">
                        {c.reject_reason ? `⚠️ ${c.reject_reason}` : "🔍 AI 시각 검수 적합"}
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {c.vision_notes || "장소 카테고리와 일치하는 안전 실사"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 하단 액션 버튼 그룹 */}
                <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleAction(c.candidate_id, "approve")}
                    disabled={updatingId === c.candidate_id}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    ✓ 승인
                  </button>

                  <button
                    onClick={() => handleAction(c.candidate_id, "set_cover")}
                    disabled={updatingId === c.candidate_id}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
                    title="대표 커버로 지정"
                  >
                    ⭐ 대표
                  </button>

                  <button
                    onClick={() => handleAction(c.candidate_id, "reject")}
                    disabled={updatingId === c.candidate_id}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 border border-slate-700 text-slate-400 rounded-lg text-xs transition-all"
                    title="거절/격리"
                  >
                    ✕ 거절
                  </button>

                  <a
                    href={c.original_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
                    title="원문 출처 열기"
                  >
                    🔗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
