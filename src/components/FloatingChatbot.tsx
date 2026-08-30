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
    "안녕하세요! 🎨 부울경 아트·전시 나들이 AI 안내원입니다.\n전시 정보나 추천 코스가 궁금하시면 아래 질문을 눌러보세요!",
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
  ],
};

function formatCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatData, setChatData] = useState<ChatData>(DEFAULT_CHAT_DATA);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat-data.json
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
        // Fallback to default
        setChatData(DEFAULT_CHAT_DATA);
      });
  }, []);

  // Initialize welcome message when opened first time
  useEffect(() => {
    if (messages.length === 0 && chatData.welcomeMessage) {
      setMessages([
        {
          id: "welcome-msg",
          sender: "bot",
          text: chatData.welcomeMessage,
          timestamp: formatCurrentTime(),
        },
      ]);
    }
  }, [chatData, messages.length]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Handle Question Click
  const handleSelectQuestion = (qItem: QuestionItem) => {
    const userMsgId = `user-${Date.now()}`;
    const botMsgId = `bot-${Date.now() + 1}`;

    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: qItem.question,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Realistic answering delay
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

  // Handle Manual Send
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const userMsgId = `user-${Date.now()}`;
    const botMsgId = `bot-${Date.now() + 1}`;

    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setIsTyping(false);
          const botMessage: Message = {
            id: botMsgId,
            sender: "bot",
            text: data.reply,
            timestamp: formatCurrentTime(),
          };
          setMessages((prev) => [...prev, botMessage]);
          return;
        }
      }
    } catch {
      // Fallback if /api/chat is unreachable
    }

    // Local fallback matching
    const matched = chatData.questions.find(
      (q) =>
        q.question.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(q.id) ||
        (query.includes("부산") && q.question.includes("부산")) ||
        (query.includes("울산") && q.question.includes("울산")) ||
        (query.includes("경남") && q.question.includes("가을")) ||
        (query.includes("가격") && q.question.includes("가성비")) ||
        (query.includes("블로그") && q.question.includes("블로그"))
    );

    setIsTyping(false);
    const answerText = matched
      ? matched.answer
      : `"${query}"에 대한 질문을 확인했습니다! 😊\n\n부울경(부산, 울산, 경남)의 상세 전시 및 AI 도슨트 추천 코스는 아래 추천 질문 버튼을 눌러 빠르게 확인하실 수 있습니다.`;

    const botMessage: Message = {
      id: botMsgId,
      sender: "bot",
      text: answerText,
      timestamp: formatCurrentTime(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };


  // Handle Copy to Clipboard
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

  // Reset chat
  const handleResetChat = () => {
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
    <aside aria-label="부울경 전시 AI 챗봇 안내 도우미" className="fixed bottom-5 right-5 z-50 select-none">
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="부울경 AI 전시 큐레이터 채팅창"
          className="w-[92vw] sm:w-[400px] h-[580px] max-h-[82vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden mb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-inner">
                🎨
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    부울경 전시 AI 가이드
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-indigo-200">
                  부산·울산·경남 전시 & 코스 안내
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="대화 초기화"
                className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors text-xs"
                aria-label="대화 초기화"
              >
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
                    className={`relative max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-xs leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                        : "bg-indigo-600 text-white rounded-tr-xs shadow-indigo-500/10"
                    }`}
                  >
                    <div>{msg.text}</div>

                    {/* Bot Message Copy Icon Button */}
                    {isBot && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px] text-slate-400">
                          {msg.timestamp}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCopied && (
                            <span className="text-[10px] font-semibold text-emerald-600 animate-in fade-in duration-200">
                              복사됨!
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            title={isCopied ? "복사 완료" : "답변 복사하기"}
                            aria-label={isCopied ? "복사 완료" : "답변 복사하기"}
                            className="p-1 rounded-md hover:bg-slate-100 transition-colors flex items-center justify-center focus:outline-none"
                          >
                            {isCopied ? (
                              /* 성공 체크 아이콘 (초록색 체크 마크 SVG) */
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
                              /* 기본 복사 아이콘 (이중 종이 모양 SVG) */
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
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3.5 py-2.5 rounded-2xl rounded-tl-xs w-fit shadow-xs">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="text-[11px] text-slate-400 ml-1">
                  안내 작성 중...
                </span>
              </div>
            )}

            {/* Quick Questions Chips Area */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <span>💡 자주 묻는 질문</span>
                <span className="text-[10px] font-normal text-slate-400">
                  (클릭 시 자동 답변)
                </span>
              </p>
              <div className="flex flex-col gap-1.5">
                {chatData.questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestion(q)}
                    className="text-left text-xs bg-white hover:bg-indigo-50/80 active:bg-indigo-100 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200/90 hover:border-indigo-200 transition-all duration-200 shadow-2xs hover:shadow-xs flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{q.question}</span>
                    <span className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all text-xs shrink-0 ml-1">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="전시나 미술관 관련 질문을 입력하세요..."
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="질문 전송"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "AI 챗봇 닫기" : "AI 챗봇 열기"}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 text-white shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative group focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        {isOpen ? (
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
            className="transition-transform duration-200 rotate-90 group-hover:rotate-180"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            <span className="text-2xl transition-transform group-hover:scale-110">
              💬
            </span>
            {/* Ping notification dot */}
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </aside>
  );
}
