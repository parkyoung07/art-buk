/**
 * Cloudflare Pages Function: /api/messages
 * Cloudflare KV 저장소를 활용한 실시간 상담 메시지 저장 및 조회 API
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

/**
 * KV 인스턴스를 가져오는 헬퍼 함수
 */
function getKV(env) {
  return env.CHAT_KV || env.KV || env.MESSAGES_KV || env.MESSAGES;
}

/**
 * GET /api/messages
 * - ?userId=xxx : 특정 사용자의 대화 메시지 목록 반환
 * - 쿼리 파라미터 없을 때 : 현재 상담 중인 모든 채팅방 목록(rooms:index) 반환
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const kv = getKV(env);

  if (!kv) {
    return new Response(
      JSON.stringify({
        error: "Cloudflare KV 바인딩(CHAT_KV)이 설정되지 않았습니다.",
        notice:
          "Cloudflare Pages 설정 -> Functions -> KV namespace bindings에서 바인딩 이름(CHAT_KV)을 추가해주세요.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || url.searchParams.get("roomId");

    // 1. 특정 사용자의 대화방 메시지 내역 조회
    if (userId) {
      const roomKey = `room:${userId}`;
      const messages = (await kv.get(roomKey, { type: "json" })) || [];

      return new Response(
        JSON.stringify({
          success: true,
          userId,
          count: messages.length,
          messages,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 2. 전체 채팅방 목록 조회 (관리자 모드 및 전체 세션 뷰)
    const rooms = (await kv.get("rooms:index", { type: "json" })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        count: rooms.length,
        rooms,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err?.message || "메시지 내역을 불러오는 중 오류가 발생했습니다.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/messages
 * - 바디: { userId, message, sender ("user" | "admin"), timestamp? }
 * - 해당 사용자 세션에 새 메시지를 추가(append)하고 방 목록 최신화
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const kv = getKV(env);

  if (!kv) {
    return new Response(
      JSON.stringify({
        error: "Cloudflare KV 바인딩(CHAT_KV)이 설정되지 않았습니다.",
        notice:
          "Cloudflare Pages 설정 -> Functions -> KV namespace bindings에서 바인딩 이름(CHAT_KV)을 추가해주세요.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { userId, message, sender = "user", timestamp } = body;

    // 1. 유효성 검사
    if (!userId || typeof userId !== "string") {
      return new Response(
        JSON.stringify({ error: "사용자 ID(userId)가 필요합니다." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "메시지 내용(message)이 비어있습니다." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validSender = sender === "admin" ? "admin" : "user";
    const nowIso = timestamp || new Date().toISOString();

    // 2. 새 메시지 객체 생성
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: validSender,
      text: message.trim(),
      timestamp: nowIso,
    };

    // 3. 사용자별 대화방(room:userId)에 메시지 저장 (Append)
    const roomKey = `room:${userId}`;
    let currentMessages = (await kv.get(roomKey, { type: "json" })) || [];
    currentMessages.push(newMessage);

    // 성능 및 용량 최적화 (대화방당 최근 300개 메시지 유지)
    if (currentMessages.length > 300) {
      currentMessages = currentMessages.slice(-300);
    }

    await kv.put(roomKey, JSON.stringify(currentMessages));

    // 4. 전체 채팅방 색인(rooms:index) 최신화
    let roomsIndex = (await kv.get("rooms:index", { type: "json" })) || [];
    const existingIdx = roomsIndex.findIndex((r) => r.userId === userId);

    const roomMeta = {
      userId,
      lastMessage: newMessage.text,
      lastSender: newMessage.sender,
      lastUpdated: newMessage.timestamp,
      messageCount: currentMessages.length,
    };

    if (existingIdx >= 0) {
      roomsIndex[existingIdx] = roomMeta;
    } else {
      roomsIndex.unshift(roomMeta);
    }

    // 최근 메시지 시간 기준 내림차순 정렬
    roomsIndex.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

    // 최대 100개 채팅방 목록 유지
    if (roomsIndex.length > 100) {
      roomsIndex = roomsIndex.slice(0, 100);
    }

    await kv.put("rooms:index", JSON.stringify(roomsIndex));

    return new Response(
      JSON.stringify({
        success: true,
        message: newMessage,
        totalMessages: currentMessages.length,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err?.message || "메시지 저장 중 오류가 발생했습니다.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * DELETE /api/messages?userId=xxx
 * 특정 대화방 초기화 (선택 지원)
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  const kv = getKV(env);

  if (!kv) {
    return new Response(
      JSON.stringify({ error: "KV 바인딩이 설정되지 않았습니다." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId가 필요합니다." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 1. 방 메시지 삭제
    await kv.delete(`room:${userId}`);

    // 2. 인덱스 목록에서 삭제
    let roomsIndex = (await kv.get("rooms:index", { type: "json" })) || [];
    roomsIndex = roomsIndex.filter((r) => r.userId !== userId);
    await kv.put("rooms:index", JSON.stringify(roomsIndex));

    return new Response(
      JSON.stringify({ success: true, message: `${userId} 방이 삭제되었습니다.` }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || "삭제 중 오류가 발생했습니다." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * OPTIONS /api/messages
 * CORS Preflight 요청 처리
 */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
