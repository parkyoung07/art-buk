"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface RoomMeta {
  userId: string;
  lastMessage: string;
  lastSender: string;
  lastUpdated: string;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: string;
}

interface VisitorStats {
  todayUV: number;
  todayPV: number;
  totalVisitors: number;
  topPages: { path: string; title: string; count: number }[];
  weeklyHistory: { date: string; uv: number; pv: number }[];
  recentLogs: { time: string; path: string; title?: string; referrer?: string; device?: string }[];
}

const VALID_PASSWORDS = ["artbuk2026", "admin1234", "artbuk"];

export default function AdminPage() {
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

  // 탭 상태: "analytics" (방문자 통계) | "chat" (1:1 실시간 상담)
  const [activeTab, setActiveTab] = useState<"analytics" | "chat">("analytics");

  // 방문자 통계 상태
  const [stats, setStats] = useState<VisitorStats>({
    todayUV: 0,
    todayPV: 0,
    totalVisitors: 0,
    topPages: [],
    weeklyHistory: [],
    recentLogs: [],
  });
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  // 채팅방 상태
  const [rooms, setRooms] = useState<RoomMeta[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyInput, setReplyInput] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // 1. 방문자 통계 데이터 조회 (API)
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (_err) {
      console.warn("방문자 통계 조회 실패:", _err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // 2. 특정 사용자의 메시지 내역 조회 (API)
  const fetchMessages = async (userId: string, shouldScroll = false) => {
    try {
      const res = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (shouldScroll) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    } catch (_err) {
      console.warn("메시지 조회 실패:", _err);
    }
  };

  // 3. 대화방 목록 조회 (API)
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
        const now = new Date();
        setLastSyncTime(now.toTimeString().split(" ")[0]);
      }
    } catch (_err) {
      console.warn("대화방 목록 조회 실패:", _err);
    }
  };

  // 4. 로그인 완료 시 초기 로드 및 5초 주기 실시간 폴링 (Polling)
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const pollData = async () => {
      if (!isMounted) return;
      await Promise.all([fetchStats(), fetchRooms()]);
      if (selectedUserId) {
        fetchMessages(selectedUserId, false);
      }
    };

    pollData();
    const interval = setInterval(pollData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, selectedUserId]);

  // 5. 로그인 처리
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(passwordInput.trim())) {
      setIsAuthenticated(true);
      sessionStorage.setItem("artbuk_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("비밀번호가 올바르지 않습니다.");
    }
  };

  // 6. 로그아웃 처리
  const handleLogout = () => {
    sessionStorage.removeItem("artbuk_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // 7. 대화방 선택
  const handleSelectRoom = (userId: string) => {
    setSelectedUserId(userId);
    setShowMobileChat(true);
    fetchMessages(userId, true);
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 150);
  };

  // 8. 관리자 답장 전송
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = replyInput.trim();
    if (!text || !selectedUserId || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          message: text,
          sender: "admin",
        }),
      });

      if (res.ok) {
        setReplyInput("");
        await fetchMessages(selectedUserId, true);
        await fetchRooms();
      } else {
        alert("메시지 전송에 실패했습니다.");
      }
    } catch {
      alert("전송 중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
      replyInputRef.current?.focus();
    }
  };

  // 9. 대화방 삭제 / 비우기
  const handleClearRoom = async () => {
    if (!selectedUserId) return;
    if (!confirm(`[${selectedUserId}] 대화방을 완전히 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/messages?userId=${encodeURIComponent(selectedUserId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedUserId(null);
        setMessages([]);
        fetchRooms();
      }
    } catch {
      alert("삭제 실패");
    }
  };

  // 10. 빠른 템플릿 입력
  const insertTemplate = (text: string) => {
    setReplyInput(text);
    replyInputRef.current?.focus();
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.userId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (r.lastMessage && r.lastMessage.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  // =========================================================================
  // 화면 1: 로그인 인증 모달
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-indigo-500/30">
            📊
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">관리자 통합 센터</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
            실시간 방문자 수 분석 및 1:1 상담 관리 포털입니다.<br />보안 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="관리자 비밀번호 입력 (기본: artbuk2026)"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center font-mono placeholder-slate-400 transition-all"
              required
              autoFocus
            />
            {authError && <p className="text-xs text-rose-500 font-semibold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              대시보드 입장하기 →
            </button>
          </form>
          <p className="text-[11px] text-slate-400 mt-4">
            초기 비밀번호: <code className="text-indigo-600 font-semibold">artbuk2026</code> 또는{" "}
            <code className="text-indigo-600 font-semibold">admin1234</code>
          </p>
        </div>
      </div>
    );
  }

  // 주간 차트 최대치 계산용
  const maxWeeklyUV = Math.max(...(stats.weeklyHistory.map((h) => h.uv) || [1]), 10);

  // =========================================================================
  // 화면 2: 관리자 메인 대시보드
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col antialiased select-none">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                부울경 나드리AI 관리자 센터
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold hidden sm:inline-block">
                통합 관제실
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              실시간 방문자 수 분석 & 1:1 상담 통합 대시보드
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* 탭 전환 버튼 그룹 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📊</span>
              <span>방문자 통계</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>💬</span>
              <span>실시간 상담</span>
              {rooms.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                  {rooms.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>실시간 자동 갱신 중 (5초)</span>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchRooms();
            }}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
            title="즉시 새로고침"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="hidden md:inline">새로고침</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl transition-colors text-xs font-bold border border-slate-200"
          >
            <span>🌐 사이트 바로가기</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-colors text-xs font-bold border border-slate-200 cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 탭 1: 방문자 수 통계 대시보드 (신규 탑재) */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* A. 4대 핵심 지표 요약 카드 */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* 카드 1: 오늘 순 방문자 (UV) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span>🌟</span>
                  <span>오늘 순 방문자 (UV)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  실시간 집계
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                  <span>{stats.todayUV.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">명</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  오늘 사이트를 직접 방문한 실제 사람 수
                </p>
              </div>
            </div>

            {/* 카드 2: 오늘 총 페이지뷰 (PV) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span>👁️</span>
                  <span>오늘 페이지뷰 (PV)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  총 열람 횟수
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-2xl sm:text-4xl font-black text-amber-600 tracking-tight flex items-baseline gap-1">
                  <span>{stats.todayPV.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">회</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  방문자당 평균 {(stats.todayUV > 0 ? (stats.todayPV / stats.todayUV).toFixed(1) : "0")}개 화면 조회
                </p>
              </div>
            </div>

            {/* 카드 3: 전체 누적 방문자 수 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span>👥</span>
                  <span>전체 누적 방문자</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  총 누적
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-2xl sm:text-4xl font-black text-violet-700 tracking-tight flex items-baseline gap-1">
                  <span>{stats.totalVisitors.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">명</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  오픈 이후 지금까지 방문한 총 누적 인원
                </p>
              </div>
            </div>

            {/* 카드 4: 1:1 상담 문의 세션 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span>💬</span>
                  <span>실시간 문의 세션</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  상담창 연동
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-2xl sm:text-4xl font-black text-rose-600 tracking-tight flex items-baseline gap-1">
                  <span>{rooms.length}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">개 대화방</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  상담 요청 시 [실시간 상담] 탭에서 즉시 응대 가능
                </p>
              </div>
            </div>
          </section>

          {/* B. 중간 2개 영역: 최근 7일간 추이 차트 & 오늘 인기 전시/페이지 TOP 순위 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. 최근 7일간 일별 방문자 추이 차트 (7컬럼) */}
            <section className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📈</span>
                    <span>최근 7일간 방문자 수 추이</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    일자별 순 방문자(UV) 및 페이지뷰(PV) 흐름
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>순방문자(UV)</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span>페이지뷰(PV)</span>
                  </span>
                </div>
              </div>

              {/* 막대 그래프 시각화 */}
              <div className="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
                {stats.weeklyHistory.map((day, idx) => {
                  const uvHeightPercent = Math.min(100, Math.max(15, (day.uv / maxWeeklyUV) * 100));
                  const isToday = idx === stats.weeklyHistory.length - 1;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* 툴팁 수치 */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md mb-1.5 whitespace-nowrap shadow-xs pointer-events-none">
                        {day.uv}명 ({day.pv}PV)
                      </div>

                      {/* 바 막대 */}
                      <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-full">
                        <div
                          style={{ height: `${uvHeightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-700 ${
                            isToday
                              ? "bg-gradient-to-t from-indigo-600 to-violet-500 shadow-sm shadow-indigo-500/30 animate-pulse"
                              : "bg-indigo-400/80 group-hover:bg-indigo-600"
                          }`}
                        ></div>
                      </div>

                      {/* 날짜 라벨 */}
                      <span
                        className={`text-[10px] sm:text-xs mt-2 font-medium ${
                          isToday ? "font-bold text-indigo-700" : "text-slate-500"
                        }`}
                      >
                        {isToday ? "오늘" : day.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                <span className="flex items-center gap-1">
                  <span>💡</span>
                  <span>매일 자정 기준으로 일별 통계가 누적 보존됩니다.</span>
                </span>
                <span className="font-semibold text-indigo-600 font-mono">
                  최고 {maxWeeklyUV}명/일
                </span>
              </div>
            </section>

            {/* 2. 오늘 가장 많이 본 인기 전시 & 페이지 순위 (5컬럼) */}
            <section className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>🏆</span>
                      <span>오늘 실시간 인기 페이지 순위</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      가장 관심이 높은 전시 및 콘텐츠 순위
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    TOP {stats.topPages.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stats.topPages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      아직 오늘 집계된 페이지가 없습니다.
                    </div>
                  ) : (
                    stats.topPages.map((page, pIdx) => {
                      const maxCount = stats.topPages[0]?.count || 1;
                      const percent = Math.min(100, Math.round((page.count / maxCount) * 100));

                      const rankBadges = [
                        "bg-amber-500 text-white font-black",
                        "bg-slate-400 text-white font-black",
                        "bg-amber-700 text-white font-black",
                        "bg-slate-200 text-slate-700 font-bold",
                        "bg-slate-200 text-slate-700 font-bold",
                        "bg-slate-200 text-slate-700 font-bold",
                      ];

                      return (
                        <div key={page.path} className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2 truncate mr-2">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 ${rankBadges[pIdx] || "bg-slate-200"}`}>
                                {pIdx + 1}
                              </span>
                              <span className="font-bold text-slate-900 truncate">
                                {page.title || page.path}
                              </span>
                            </div>
                            <span className="font-mono font-black text-indigo-700 shrink-0">
                              {page.count}회
                            </span>
                          </div>
                          {/* 프로그레스 바 */}
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percent}%` }}
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                💡 상세 전시 및 블로그 글의 유입 비율을 실시간으로 분석합니다.
              </p>
            </section>
          </div>

          {/* C. 하단: 실시간 방문자 유입 타임라인 로그 */}
          <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>실시간 방문자 접속 로그</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  최근 접속한 방문자의 접속 시각, 페이지, 유입 경로(네이버/구글/카톡 등)
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                최근 {stats.recentLogs.length}건 기록
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase border-y border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-3">접속 시각</th>
                    <th className="py-2.5 px-3">접속 페이지</th>
                    <th className="py-2.5 px-3">유입 출처 (Referrer)</th>
                    <th className="py-2.5 px-3">기기 환경</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats.recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        기록된 최근 접속 로그가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    stats.recentLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {log.time}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <span className="truncate max-w-[220px] inline-block">
                            {log.title || log.path}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {log.referrer || "직접 접속"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] text-slate-500">
                            {log.device === "Mobile" ? "📱 모바일" : "💻 데스크톱"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 탭 2: 1:1 실시간 상담 대화방 관리 */}
      {/* ========================================================================= */}
      {activeTab === "chat" && (
        <main className="flex-1 flex overflow-hidden h-[calc(100vh-65px)]">
          {/* 좌측: 대화방 목록 사이드바 */}
          <aside
            className={`${
              showMobileChat ? "hidden md:flex" : "flex"
            } w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex-col shrink-0 h-full`}
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>💬 상담 대화방 목록</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
                    {rooms.length}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lastSyncTime || "--:--:--"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="사용자 ID 또는 메시지 검색..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
                <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="text-2xl mb-2">📭</div>
                  {searchKeyword ? "일치하는 대화방이 없습니다." : "현재 상담 중인 대화방이 없습니다."}
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = selectedUserId === room.userId;
                  const isLastSenderAdmin = room.lastSender === "admin";

                  return (
                    <div
                      key={room.userId}
                      onClick={() => handleSelectRoom(room.userId)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "hover:bg-slate-100 bg-white border border-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg ${
                              isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                            } flex items-center justify-center text-xs font-bold`}
                          >
                            👤
                          </span>
                          <span className="font-bold text-xs truncate max-w-[130px] sm:max-w-[160px]">
                            {room.userId}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] ${
                            isSelected ? "text-indigo-200" : "text-slate-400"
                          } font-mono`}
                        >
                          {new Date(room.lastUpdated).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p
                        className={`text-[11px] ${
                          isSelected ? "text-indigo-100" : "text-slate-500"
                        } line-clamp-1 break-all mb-1`}
                      >
                        {isLastSenderAdmin && (
                          <span className="font-semibold text-emerald-300">나: </span>
                        )}
                        {room.lastMessage || "대화 시작"}
                      </p>

                      <div
                        className={`flex items-center justify-between text-[10px] ${
                          isSelected ? "text-indigo-200" : "text-slate-400"
                        } pt-1`}
                      >
                        <span>총 {room.messageCount || 0}개 메시지</span>
                        {!isLastSenderAdmin ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[9px]">
                            답변 대기
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">답변 완료</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* 우측: 1:1 실시간 대화창 */}
          <section
            className={`${
              showMobileChat ? "flex" : "hidden md:flex"
            } flex-1 flex-col h-full bg-slate-50 relative`}
          >
            {selectedUserId ? (
              <>
                {/* 대화창 헤더 */}
                <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                    >
                      ← 목록
                    </button>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {selectedUserId}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          상담 진행 중
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Session: room:{selectedUserId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearRoom}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer font-medium"
                      title="이 대화방 데이터 삭제"
                    >
                      대화방 비우기
                    </button>
                  </div>
                </div>

                {/* 메시지 타임라인 */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      아직 주고받은 메시지가 없습니다. 첫 답변을 보내보세요! 😊
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAdmin = msg.sender === "admin";
                      const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span
                              className={`text-[10px] font-bold ${
                                isAdmin ? "text-indigo-600" : "text-slate-600"
                              }`}
                            >
                              {isAdmin ? "🛡️ 상담원 (관리자)" : "👤 사용자"}
                            </span>
                          </div>
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm whitespace-pre-wrap break-words shadow-xs ${
                              isAdmin
                                ? "bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-xs"
                                : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                            {formattedTime}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 빠른 답변 템플릿 */}
                <div className="px-4 py-2 bg-white/70 border-t border-slate-200/60 overflow-x-auto flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">빠른 답변:</span>
                  <button
                    onClick={() =>
                      insertTemplate("안녕하세요! 나드리 AI 문화·나들이 상담원입니다. 어떤 점이 궁금하신가요? 😊")
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 whitespace-nowrap transition-colors"
                  >
                    👋 인사말
                  </button>
                  <button
                    onClick={() =>
                      insertTemplate("문의해주신 전시의 관람 시간 및 예매 관련 안내를 확인하여 답변드립니다.")
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 whitespace-nowrap transition-colors"
                  >
                    🎟️ 예매/시간 안내
                  </button>
                  <button
                    onClick={() =>
                      insertTemplate("확인 후 1분 이내로 신속히 안내해 드리겠습니다. 잠시만 기다려주세요!")
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 whitespace-nowrap transition-colors"
                  >
                    ⏳ 잠시 대기 안내
                  </button>
                  <button
                    onClick={() =>
                      insertTemplate("추가로 더 궁금하신 미술관이나 나들이 정보가 있으시면 편하게 말씀해 주세요! ✨")
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 whitespace-nowrap transition-colors"
                  >
                    🙏 마무리 인사
                  </button>
                </div>

                {/* 답변 입력 폼 */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0"
                >
                  <textarea
                    ref={replyInputRef}
                    rows={2}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="상담원 답변을 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
                    className="flex-1 px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none placeholder-slate-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyInput.trim()}
                    className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>{isSending ? "전송 중..." : "전송"}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-200/70 flex items-center justify-center text-3xl mb-3">
                  💬
                </div>
                <h4 className="font-bold text-slate-700 text-sm">선택된 대화방이 없습니다</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  좌측 목록에서 실시간 상담을 요청한 사용자를 클릭하시면 1:1 대화 내역이 표시됩니다.
                </p>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
