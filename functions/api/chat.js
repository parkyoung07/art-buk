/**
 * Cloudflare Pages Function: /api/chat
 * Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct) 연동 백엔드 엔드포인트
 */

/**
 * 마크다운 기호(**, *, #, `, >, [링크] 등)를 제거/정제하는 함수
 * @param {string} text - 정제할 원본 텍스트
 * @returns {string} 마크다운이 제거된 깔끔한 텍스트
 */
function stripMarkdown(text) {
  if (!text || typeof text !== "string") return "";

  return text
    // 1. 헤더 기호 제거 (#, ##, ### 등)
    .replace(/^#{1,6}\s+/gm, "")
    // 2. 굵게 및 기울임 기호 제거 (**, *, __, _)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // 3. 코드 블록 및 인라인 코드 제거 (`코드`, ```)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // 4. 마크다운 링크 문법 제거 ([텍스트](URL) -> 텍스트)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // 5. 인용구 기호 제거 (> )
    .replace(/^>\s+/gm, "")
    // 6. 불필요한 연속 줄바꿈 및 여백 정리
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * POST /api/chat 요청 핸들러
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    // 1. 클라이언트 요청 본문(JSON) 파싱
    const body = await request.json().catch(() => ({}));
    const userMessage = body?.message?.trim();

    // 2. 입력값 유효성 검사
    if (!userMessage) {
      return new Response(
        JSON.stringify({
          error: "질문 내용(message)이 전달되지 않았습니다.",
          reply: "질문을 입력해 주시면 부울경 전시 정보를 친절하게 안내해 드릴게요! 😊",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (userMessage.length > 500) {
      return new Response(
        JSON.stringify({
          error: "질문이 너무 깁니다. 500자 이내로 입력해 주세요.",
          reply: "질문이 너무 깁니다. 500자 이내로 간결하게 입력해 주세요.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Workers AI 바인딩 확인
    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: "Cloudflare Workers AI 바인딩(env.AI)이 설정되지 않았습니다.",
          reply:
            "현재 AI 서버 연결을 확인 중입니다. Cloudflare Pages 설정에서 Workers AI 바인딩(AI)을 연결해 주세요.",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 4. AI 시스템 프롬프트 정의
    const systemPrompt = `당신은 부산, 울산, 경남(부울경) 지역의 미술관, 전시회, 갤러리 및 나들이 코스를 안내하는 친절한 AI 도슨트입니다.
- 질문에 대해 한국어로 정중하고 다정하게 존댓말로 답변하세요.
- 답변은 2~3문장 내외로 핵심만 명확하게 요약하여 설명하세요.
- 마크다운 기호(**, #, - 등)를 사용하지 말고 자연스러운 대화체로 작성하세요.`;

    // 5. Cloudflare Workers AI 호출 (@cf/meta/llama-3-8b-instruct)
    const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.6,
    });

    // 6. AI 원본 텍스트 추출
    let rawText = "";
    if (typeof aiResponse === "string") {
      rawText = aiResponse;
    } else if (aiResponse && typeof aiResponse === "object" && aiResponse.response) {
      rawText = aiResponse.response;
    } else {
      rawText = "죄송합니다. 답변을 생성하지 못했습니다. 다시 시도해 주세요.";
    }

    // 7. 마크다운 기호 정제 (stripMarkdown)
    const cleanReply = stripMarkdown(rawText);

    // 8. 성공 응답 반환
    return new Response(
      JSON.stringify({
        success: true,
        reply: cleanReply,
        model: "@cf/meta/llama-3-8b-instruct",
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // 예외 처리 및 에러 응답
    return new Response(
      JSON.stringify({
        error: error?.message || "AI 응답 처리 중 오류가 발생했습니다.",
        reply:
          "전시 안내를 처리하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 질문해 주세요! 😊",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS 요청 핸들러 (CORS Preflight 대응)
 */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
