"use client";

import React, { useState, useEffect, useRef } from "react";

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
}

interface ChatData {
  welcomeMessage: string;
  questions: QuestionItem[];
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const DEFAULT_CHAT_DATA: ChatData = {
  welcomeMessage:
    "안녕하세요! 🎨 부울경 아트·전시 나들이 AI 안내원입니다.\n궁금하신 전시나 코스를 자유롭게 질문하시거나 아래 추천 질문을 눌러보세요!",
  questions: [
    {
      id: "q1",
      question: "🏛️ 이번 주말 추천 전시는 어디인가요?",
      answer:
        "이번 주말 추천 전시 4선을 안내해 드립니다:\n\n1. [부산 사하구] 2026 부산비엔날레 (부산현대미술관)\n2. [울산 중구] 빛의 서사 미디어아트 특별전 (울산시립미술관)\n3. [경남 창원] 가을 기획전: 남도의 붓길 (경남도립미술관)\n4. [경남 김해] 흙과 미래 건축 (클레이아크김해미술관)\n\n원하시는 전시 카드를 클릭하시면 상세 정보와 AI 도슨트 해설을 확인하실 수 있습니다! ✨",
    },
    {
      id: "q2",
      question: "🚗 부산현대미술관(비엔날레) 주변 나들이 코스는?",
      answer:
        "부산현대미술관 & 부산비엔날레 추천 나들이 코스입니다:\n\n📍 코스: 부산현대미술관 관람 ➔ 을숙도 생태공원 갈대숲 산책 ➔ 다대포 꿈의 낙조분수 일몰 감상\n💡 꿀팁: 비엔날레 입장권 소지 시 영도 및 초량의 야외 전시장도 함께 즐기실 수 있습니다.",
    },
    {
      id: "q3",
      question: "🎟️ 1,000~2,000원대 가성비 좋은 전시는?",
      answer:
        "부담 없는 착한 가격의 고품격 전시를 추천합니다:\n\n1. 울산시립미술관 <빛의 서사> : 관람료 1,000원 (대형 몰입형 실감 미디어아트)\n2. 경남도립미술관 <남도의 붓길> : 관람료 2,000원 (영남 근현대 회화 명작전)\n\n가벼운 마음으로 풍성한 문화 힐링을 누려보세요! 🌿",
    },
    {
      id: "q4",
      question: "🤖 AI 도슨트 해설은 어디서 보나요?",
      answer:
        "상단 메뉴의 [전시 블로그] 탭이나 각 전시 카드의 'AI 도슨트 해설 & 코스' 버튼을 누르시면, Gemini AI가 작성한 친절한 작품 해설과 감상 포인트, 인근 맛집·카페 연계 코스를 만나보실 수 있습니다. 매일 새로운 해설이 업데이트됩니다!",
    },
    {
      id: "q5",
      question: "📍 울산시립미술관 관람 시간 & 위치 안내",
      answer:
        "울산시립미술관 안내 정보:\n\n• 운영시간: 10:00 ~ 18:00 (입장 마감 17:30)\n• 휴관일: 매주 월요일\n• 위치: 울산광역시 중구 미술관길 72\n• 추천 연계: 도보 5분 거리의 '문화의거리 카페골목'과 '태화강 국가정원' 산책을 함께 추천합니다.",
    },
    {
      id: "q6",
      question: "🧺 미술관 주변 유명한 5일장 & 장날 먹거리는?",
      answer:
        "부울경 대표 미술관 옆 전통시장 & 5일장 안내입니다:\n\n1. [부산] 구포시장 (3·8일 5일장) - 70년 전통 구포국수 & 가마솥 족발\n2. [울산] 태화종합시장 (5·10일 5일장) - 태화강변 선지국밥 & 장터 도넛\n3. [울산] 언양알프스시장 (2·7일 5일장) - 언양 한우불고기 & 소머리곰탕\n4. [경남] 창녕시장 (3·8일 5일장) - 수문장 수구레국밥\n5. [경남] 밀양아리랑시장 (2·7일 5일장) - 원조 밀양돼지국밥\n\n홈 화면의 '부울경 5일장 & 전통시장' 코너에서 오늘 장 서는 곳을 실시간으로 확인하실 수 있습니다! 🍜",
    },
  ],
};


function formatCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function generateMsgId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatData, setChatData] = useState<ChatData>(DEFAULT_CHAT_DATA);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome-msg",
      sender: "bot",
      text: DEFAULT_CHAT_DATA.welcomeMessage,
      timestamp: formatCurrentTime(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        let storedId = localStorage.getItem("artbuk_chat_uid");
        if (!storedId) {
          storedId = `user_${Math.random().toString(36).substring(2, 7)}`;
          localStorage.setItem("artbuk_chat_uid", storedId);
        }
        return storedId;
      } catch {
        return "";
      }
    }
    return "";
  });
  const [isLiveMode, setIsLiveMode] = useState(false); // 상담원 1:1 실시간 모드 플래그

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Ensure userId is synced to localStorage on mount
  useEffect(() => {
    try {
      if (userId) {
        localStorage.setItem("artbuk_chat_uid", userId);
      }
    } catch {
      // ignore
    }
  }, [userId]);

  // 2. Load chat-data.json on mount
  useEffect(() => {
    fetch("/data/chat-data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chat data");
        return res.json();
      })
      .then((data: ChatData) => {
        if (data && data.questions) {
          setChatData(data);
        }
      })
      .catch(() => {
        setChatData(DEFAULT_CHAT_DATA);
      });
  }, []);

  // 3. Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // 5. Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // 6. [핵심] 상담원 모드 시 3초마다 관리자 새 메시지 실시간 폴링 (Polling)
  useEffect(() => {
    if (!isOpen || !isLiveMode || !userId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            // KV에 저장된 관리자 메시지 중 아직 표시되지 않은 신규 메시지 추가
            setMessages((prev) => {
              const existingTexts = new Set(prev.map((m) => `${m.sender}:${m.text}`));
              const newIncoming = data.messages
                .filter((m: { id: string; sender: string; text: string; timestamp: string }) => 
                  !existingTexts.has(`${m.sender === "admin" ? "bot" : "user"}:${m.text}`)
                )
                .map((m: { id: string; sender: string; text: string; timestamp: string }) => ({
                  id: m.id || generateMsgId("kv"),
                  sender: (m.sender === "admin" ? "bot" : "user") as "bot" | "user",
                  text: m.text,
                  timestamp: new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }));

              if (newIncoming.length > 0) {
                return [...prev, ...newIncoming];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn("실시간 메시지 동기화 에러:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isLiveMode, userId]);

  // 7. Handle Question Chip Click
  const handleSelectQuestion = (qItem: QuestionItem) => {
    if (isTyping) return;

    const userMsgId = generateMsgId("user");
    const botMsgId = generateMsgId("bot");

    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: qItem.question,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: botMsgId,
        sender: "bot",
        text: qItem.answer,
        timestamp: formatCurrentTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 450);
  };

  // 8. [핵심] '상담원 연결하기' 클릭 핸들러
  const handleConnectAgent = () => {
    setIsLiveMode(true);

    const botMessage: Message = {
      id: generateMsgId("sys"),
      sender: "bot",
      text: "상담원과 연결 중입니다... 👩‍💼\n궁금하신 내용을 입력창에 남겨주시면 상담원이 실시간으로 확인 후 친절히 답변해 드립니다.",
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, botMessage]);

    // Cloudflare KV에 상담 요청 메시지 등록
    if (userId) {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: "👋 안녕하세요, 1:1 실시간 상담을 요청합니다.",
          sender: "user",
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  // 9. 사용자 메시지 전송 (상담 모드 vs AI 모드 분기)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query || isTyping) return;

    const userMsgId = generateMsgId("user");
    const botMsgId = generateMsgId("bot");

    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: formatCurrentTime(),
    };

    // 1) 즉시 사용자 말풍선 표시 및 입력창 비우기
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // ==========================================
    // A. 실시간 상담원(Live) 모드인 경우
    // ==========================================
    if (isLiveMode) {
      // KV 저장소(/api/messages)에만 저장하고 상담원의 답변 대기
      if (userId) {
        fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, message: query, sender: "user" }),
        }).catch(() => {});
      }
      return;
    }

    // ==========================================
    // B. AI 챗봇 모드인 경우 (/api/chat 호출)
    // ==========================================
    setIsTyping(true);

    // 사용자 메시지 기록
    if (userId) {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: query, sender: "user" }),
      }).catch(() => {});
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.reply || data?.response;

        if (replyText) {
          setIsTyping(false);
          const botMessage: Message = {
            id: botMsgId,
            sender: "bot",
            text: replyText,
            timestamp: formatCurrentTime(),
          };
          setMessages((prev) => [...prev, botMessage]);

          if (userId) {
            fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, message: replyText, sender: "admin" }),
            }).catch(() => {});
          }
          return;
        }
      }

      throw new Error("서버 응답 오류");
    } catch (error) {
      console.warn("API 호출 실패, 로컬 데이터 매칭:", error);

      const matched = chatData.questions.find(
        (q) =>
          q.question.toLowerCase().includes(query.toLowerCase()) ||
          (query.includes("부산") && q.question.includes("부산")) ||
          (query.includes("울산") && q.question.includes("울산")) ||
          (query.includes("경남") && q.question.includes("가을")) ||
          (query.includes("가격") && q.question.includes("가성비")) ||
          (query.includes("블로그") && q.question.includes("블로그"))
      );

      setIsTyping(false);

      const botMessage: Message = {
        id: botMsgId,
        sender: "bot",
        text: matched
          ? matched.answer
          : "죄송합니다. 서버와의 연결에 실패했습니다. '상담원 연결하기'를 이용해 주시거나 잠시 후 다시 질문해 주세요.",
        timestamp: formatCurrentTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  // 10. Handle Copy to Clipboard with 1.5s Green Check Animation
  const handleCopyText = (text: string, msgId: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }

    setCopiedMessageId(msgId);
    timerRef.current = setTimeout(() => {
      setCopiedMessageId(null);
    }, 1500);
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch {
      // ignore
    }
    document.body.removeChild(textArea);
  };

  // 11. Reset Chat
  const handleResetChat = () => {
    setIsLiveMode(false);
    setMessages([
      {
        id: "welcome-msg",
        sender: "bot",
        text: chatData.welcomeMessage,
        timestamp: formatCurrentTime(),
      },
    ]);
  };

  return (
    <aside
      aria-label="부울경 전시 AI 챗봇 안내 도우미"
      className="fixed bottom-5 right-5 z-50 select-none font-sans"
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="부울경 AI 전시 큐레이터 및 실시간 상담 채팅창"
          className="w-[92vw] sm:w-[410px] h-[610px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100/90 flex flex-col overflow-hidden mb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-inner">
                {isLiveMode ? "👩‍💼" : "🎨"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm sm:text-base leading-tight tracking-tight">
                    {isLiveMode ? "1:1 실시간 상담원 연결" : "부울경 전시 AI 가이드"}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-indigo-200">
                  {isLiveMode ? "상담원이 실시간 대기 중입니다" : "부산 · 울산 · 경남 실시간 AI 질의응답"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isLiveMode && (
                <button
                  type="button"
                  onClick={() => setIsLiveMode(false)}
                  title="AI 모드로 전환"
                  className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all mr-1 flex items-center gap-1"
                >
                  <span>🤖 AI 전환</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetChat}
                title="대화 초기화"
                className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
                aria-label="대화 초기화"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="채팅창 닫기"
                className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="채팅창 닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-slate-800 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              const isCopied = copiedMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isBot ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[82%] rounded-2xl p-3.5 shadow-xs leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-slate-200/50"
                        : "bg-indigo-600 text-white rounded-tr-xs shadow-indigo-500/10"
                    }`}
                  >
                    <div className="break-words">{msg.text}</div>

                    {/* Bot Message Bottom Copy Icon */}
                    {isBot && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.timestamp}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCopied && (
                            <span className="text-[10px] font-semibold text-emerald-600 animate-in fade-in duration-200">
                              복사 완료!
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            title={isCopied ? "복사 완료" : "답변 복사하기"}
                            aria-label={isCopied ? "복사 완료" : "답변 복사하기"}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center focus:outline-none"
                          >
                            {isCopied ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#4CAF50"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="copy-success-icon"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="copy-btn-icon"
                                style={{
                                  cursor: "pointer",
                                  opacity: 0.6,
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <rect
                                  width="14"
                                  height="14"
                                  x="8"
                                  y="8"
                                  rx="2"
                                  ry="2"
                                />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Waiting / Thinking Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 bg-white border border-indigo-100 px-4 py-3 rounded-2xl rounded-tl-xs w-fit shadow-xs animate-in fade-in">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></span>
                <span className="text-xs text-indigo-700 font-medium ml-1">
                  AI가 답변을 생각하고 있어요...
                </span>
              </div>
            )}

            {/* Quick Questions & Live Agent Button Area */}
            {!isLiveMode && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
                  <span>💡 자주 묻는 추천 질문</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    (클릭 시 빠른 답변)
                  </span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {chatData.questions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      disabled={isTyping}
                      onClick={() => handleSelectQuestion(q)}
                      className="text-left text-xs bg-white hover:bg-indigo-50/80 active:bg-indigo-100 disabled:opacity-50 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200/90 hover:border-indigo-200 transition-all duration-200 shadow-2xs hover:shadow-xs flex items-center justify-between group cursor-pointer"
                    >
                      <span className="line-clamp-1">{q.question}</span>
                      <span className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all text-xs shrink-0 ml-1">
                        →
                      </span>
                    </button>
                  ))}

                  {/* 1. 실시간 상담원 연결하기 버튼 */}
                  <button
                    type="button"
                    disabled={isTyping}
                    onClick={handleConnectAgent}
                    className="mt-1 text-left text-xs bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 active:scale-98 text-indigo-900 font-bold p-3 rounded-xl border border-indigo-200/80 transition-all duration-200 shadow-xs flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">👩‍💼</span>
                      <span>실시간 상담원 1:1 연결하기</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold group-hover:bg-indigo-700 transition-colors">
                      연결 →
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shadow-inner"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              disabled={isTyping}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isLiveMode
                  ? "상담원에게 보낼 메시지를 입력하세요..."
                  : isTyping
                  ? "AI가 답변을 작성 중입니다..."
                  : "전시나 미술관 관련 질문을 입력하세요..."
              }
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white disabled:bg-slate-50 disabled:text-slate-400 text-slate-800 placeholder-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              aria-label="질문 전송"
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-1 shrink-0 font-medium text-xs sm:text-sm active:scale-95 cursor-pointer"
            >
              <span>전송</span>
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
        </div>
      )}

      {/* Dynamic Animated & Intuitive Floating Chatbot Button */}
      <div className="relative flex items-center justify-end">
        {/* Floating Tooltip Pill (열려있지 않을 때 부드럽게 둥둥 뜨며 시선 유도) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="absolute right-16 bottom-2.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-2xl shadow-xl whitespace-nowrap flex items-center gap-2 border border-slate-700/80 cursor-pointer hover:scale-105 transition-transform duration-200 animate-bounce select-none"
          >
            <span className="text-sm">💬</span>
            <span>AI 전시 가이드 질문하기</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "AI 챗봇 닫기" : "AI 전시 도슨트 챗봇 열기"}
          className="relative w-15 h-15 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-indigo-300/50 cursor-pointer"
        >
          {/* Subtle Ripple Wave Ring behind the button */}
          {!isOpen && (
            <span className="absolute -inset-1.5 rounded-full bg-indigo-500/20 animate-ping pointer-events-none"></span>
          )}

          {isOpen ? (
            /* Close (X) State with smooth rotation */
            <div className="transition-transform duration-300 rotate-0 group-hover:rotate-90 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          ) : (
            /* Intuitive Animated AI Docent Speech Bubble Icon */
            <div className="relative flex items-center justify-center">
              {/* Animated Sparkle Stars */}
              <span className="absolute -top-2.5 -right-2 text-amber-300 text-sm animate-pulse">
                ✨
              </span>

              {/* Intuitive AI Chatbot Face SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" stroke="white" />
                {/* Cute Bot Eyes & Smile */}
                <circle cx="9" cy="10" r="1.5" fill="#4f46e5" />
                <circle cx="15" cy="10" r="1.5" fill="#4f46e5" />
                <path d="M10 13.5c.8.8 3.2.8 4 0" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              {/* Active Pulse Status Dot */}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
