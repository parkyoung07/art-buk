"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface VerifiedImage {
  image_id: string;
  entity_type: "venue" | "event" | "market" | "library" | "nature";
  entity_id: string;
  entity_name: string;
  address: string;
  region: string;
  source_type: string;
  source_url: string;
  source_content_id: string;
  original_title: string;
  license: string;
  photographer: string;
  image_url: string;
  vision_checked: boolean;
  human_verified: boolean;
  verified_at: string;
  verified_by: string;
  status: "approved" | "pending" | "rejected";
  notes: string;
}

interface Stats {
  total_images: number;
  approved: number;
  pending: number;
  rejected: number;
  by_type: Record<string, number>;
}

export default function AdminImagesPage() {
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

  const [images, setImages] = useState<VerifiedImage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<VerifiedImage | null>(null);

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

  const fetchImages = async () => {
    try {
      setLoading(true);
      let data: any = null;
      try {
        const params = new URLSearchParams();
        if (filterStatus !== "all") params.append("status", filterStatus);
        if (filterType !== "all") params.append("entity_type", filterType);
        if (searchQuery) params.append("q", searchQuery);

        const res = await fetch(`/api/admin/images?${params.toString()}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      if (!data || !data.success) {
        const res = await fetch("/data/verified-image-registry.json");
        const raw = await res.json();
        let filtered = raw.images || [];
        if (filterStatus !== "all") filtered = filtered.filter((i: any) => i.status === filterStatus);
        if (filterType !== "all") filtered = filtered.filter((i: any) => i.entity_type === filterType);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (i: any) =>
              i.entity_name?.toLowerCase().includes(q) ||
              i.entity_id?.toLowerCase().includes(q) ||
              i.original_title?.toLowerCase().includes(q)
          );
        }
        data = { success: true, stats: raw.stats, images: filtered };
      }

      if (data && data.success) {
        let loaded = (data.images || []) as VerifiedImage[];
        try {
          const overrides = JSON.parse(localStorage.getItem("nadri_verified_images_overrides") || "{}");
          loaded = loaded.map((img: VerifiedImage): VerifiedImage => {
            if (overrides[img.image_id]) {
              return {
                ...img,
                status: overrides[img.image_id].status as "approved" | "pending" | "rejected",
                human_verified: true
              };
            }
            return img;
          });
        } catch (e) {}
        setImages(loaded);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("이미지 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [filterStatus, filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages();
  };

  const handleUpdateStatus = async (imageId: string, newStatus: "approved" | "rejected") => {
    setUpdatingId(imageId);
    // 1. 화면 즉시 상태 변경
    setImages((prev: VerifiedImage[]): VerifiedImage[] =>
      prev.map((img: VerifiedImage): VerifiedImage => (img.image_id === imageId ? { ...img, status: newStatus, human_verified: true } : img))
    );
    if (stats) {
      setStats((prevStats) => {
        if (!prevStats) return null;
        const currentImg = images.find((i) => i.image_id === imageId);
        const oldStatus = currentImg?.status || "pending";
        if (oldStatus === newStatus) return prevStats;
        return {
          ...prevStats,
          approved: newStatus === "approved" ? prevStats.approved + 1 : (oldStatus === "approved" ? prevStats.approved - 1 : prevStats.approved),
          rejected: newStatus === "rejected" ? prevStats.rejected + 1 : (oldStatus === "rejected" ? prevStats.rejected - 1 : prevStats.rejected),
          pending: oldStatus === "pending" ? prevStats.pending - 1 : prevStats.pending
        };
      });
    }

    // 2. localStorage에 보관
    try {
      const overrides = JSON.parse(localStorage.getItem("nadri_verified_images_overrides") || "{}");
      overrides[imageId] = { status: newStatus, updated_at: new Date().toISOString() };
      localStorage.setItem("nadri_verified_images_overrides", JSON.stringify(overrides));
    } catch (e) {}

    // 3. 백엔드 전송
    try {
      await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          image_id: imageId,
          updates: {
            status: newStatus,
            verified_by: "admin_leo"
          }
        })
      });
    } catch (e) {}

    setTimeout(() => {
      setUpdatingId(null);
    }, 150);
  };

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case "tour_api":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/60 text-blue-300 border border-blue-700">Tier A (TourAPI)</span>;
      case "official_gov":
      case "kogl_type1":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">Tier B (공공누리/기관)</span>;
      case "museum_site":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/60 text-purple-300 border border-purple-700">Tier B (미술관)</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/60 text-amber-300 border border-amber-700">Tier C (관리자 검증)</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">✓ 승인됨 (Approved)</span>;
      case "pending":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">⏳ 검수 대기 (Pending)</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">✕ 격리/반려 (Rejected)</span>;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-indigo-500/30">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">관리자 인증</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
            검증 이미지 레지스트리 관리 화면입니다.<br />보안 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="관리자 보안 비밀번호 입력"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center font-mono placeholder-slate-400 transition-all text-slate-900"
              required
              autoFocus
            />
            {authError && <p className="text-xs text-rose-500 font-semibold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
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
                ← 관리자 홈으로
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-indigo-400 text-sm font-medium">검증 자산 관리</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
              🏛️ 나드리 AI 검증 이미지 레지스트리
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              검색 기반 이미지 매칭을 원천 배제하고, Entity ID에 연결된 공공·공식 인증 자산만 승인 관리합니다.
            </p>
          </div>

          {/* 주요 통계 카드 */}
          {stats && (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-xs text-slate-400">총 자산</div>
                <div className="text-lg font-bold text-white">{stats.total_images}</div>
              </div>
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-xs text-emerald-400">승인 완료</div>
                <div className="text-lg font-bold text-emerald-400">{stats.approved}</div>
              </div>
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-xs text-amber-400">검수 대기</div>
                <div className="text-lg font-bold text-amber-400">{stats.pending}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-xs text-rose-400">격리/반려</div>
                <div className="text-lg font-bold text-rose-400">{stats.rejected}</div>
              </div>
            </div>
          )}
        </div>

        {/* 필터 및 검색 바 */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">상태:</span>
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {s === "all" ? "전체 보기" : s === "pending" ? "검수 대기" : s === "approved" ? "승인 자산" : "반려/격리"}
              </button>
            ))}

            <span className="text-xs font-semibold text-slate-400 ml-4 mr-1">분류:</span>
            {["all", "venue", "library", "market", "nature"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === t
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {t === "all" ? "전체" : t === "venue" ? "미술관/전시" : t === "library" ? "도서관" : t === "market" ? "전통시장" : "힐링명소"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="장소명, 주소, ID 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-64"
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

      {/* 이미지 그리드 목록 */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
            검증 자산 데이터를 불러오는 중입니다...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">조건에 일치하는 등록 이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item) => (
              <div
                key={item.image_id}
                className={`bg-slate-900 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  item.status === "approved"
                    ? "border-emerald-900/40 hover:border-emerald-500/50"
                    : item.status === "pending"
                    ? "border-amber-900/40 hover:border-amber-500/50"
                    : "border-rose-900/40 opacity-70"
                }`}
              >
                {/* 상단 이미지 미리보기 */}
                <div>
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
                    <img
                      src={item.image_url}
                      alt={item.original_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => {
                        e.target.src = "/images/placeholders/placeholder-default.svg";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {getSourceBadge(item.source_type)}
                    </div>
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* 장소 정보 및 메타데이터 */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                        <span>[{item.entity_type.toUpperCase()}]</span>
                        <span>{item.entity_id}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">
                        {item.entity_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">📍 {item.address || "주소 정보 없음"}</p>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">원본 제목:</span>
                        <span className="font-medium text-slate-200 truncate ml-2 max-w-[200px]" title={item.original_title}>
                          {item.original_title || "없음"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">콘텐츠 ID:</span>
                        <span className="font-mono text-indigo-300">{item.source_content_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">라이선스:</span>
                        <span className="text-emerald-400 truncate ml-2 max-w-[180px]">{item.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">제공/촬영:</span>
                        <span className="text-slate-400">{item.photographer}</span>
                      </div>
                    </div>

                    {/* AI Vision 판정 & 검증 메모 */}
                    <div className="bg-indigo-950/20 border border-indigo-900/30 p-2.5 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
                        <span>🔍 AI Vision 검사:</span>
                        <span className={item.vision_checked ? "text-emerald-400" : "text-amber-400"}>
                          {item.vision_checked ? "적합 통과 (PASS)" : "미검사"}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {item.notes || "특이사항 없음"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 하단 액션 버튼 */}
                <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center gap-2">
                  {item.status !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(item.image_id, "approved")}
                      disabled={updatingId === item.image_id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1"
                    >
                      {updatingId === item.image_id ? "처리 중..." : "✓ 사람 직접 승인 (Approve)"}
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(item.image_id, "rejected")}
                      disabled={updatingId === item.image_id}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-800 border border-slate-700 text-slate-400 rounded-xl text-xs font-medium transition-all"
                    >
                      {updatingId === item.image_id ? "..." : "✕ 격리 (Reject)"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
