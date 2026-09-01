"use client";

import React, { useState, useEffect, useRef } from "react";

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

  // 1. 특정 사용자의 메시지 내역 조회 (API)
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

  // 2. 대화방 목록 조회 (API)
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

  // 3. 로그인 완료 시 초기 로드 및 3초 주기 실시간 폴링 (Polling)
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const pollRooms = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok && isMounted) {
          const data = await res.json();
          setRooms(data.rooms || []);
          const now = new Date();
          setLastSyncTime(now.toTimeString().split(" ")[0]);
        }
      } catch (_err) {
        console.warn("대화방 목록 조회 실패:", _err);
      }
    };

    pollRooms();
    const interval = setInterval(() => {
      pollRooms();
      if (selectedUserId) {
        fetchMessages(selectedUserId, false);
      }
    }, 3000);

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
            🛡️
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">상담원 전용 포털</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
            부울경 아트·전시 실시간 1:1 상담 관리자 화면입니다.<br />접속을 위해 보안 비밀번호를 입력해 주세요.
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
              관리자 센터 입장하기 →
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

  // =========================================================================
  // 화면 2: 관리자 메인 대시보드
  // =========================================================================
  return (
    <div className="h-screen bg-slate-100 text-slate-800 flex flex-col antialiased select-none overflow-hidden">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-base shadow-sm">
            A
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              부울경 아트북{" "}
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                상담원 포털
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">Cloudflare KV 실시간 메시지 연동 허브</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>실시간 동기화 중 (3초)</span>
          </div>

          <button
            onClick={() => fetchRooms()}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
            title="새로고침"
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

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-colors text-xs font-bold border border-slate-200 cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 2. 메인 2컬럼 레이아웃 */}
      <main className="flex-1 flex overflow-hidden">
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
                    insertTemplate("안녕하세요! 부울경 아트·전시 상담원입니다. 어떤 점이 궁금하신가요? 😊")
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
    </div>
  );
}
