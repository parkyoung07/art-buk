/**
 * Cloudflare Pages Function: /api/chat
 * Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct) + RAG 검색 인덱스 연동 백엔드
 */

import searchIndex from "../../public/data/search-index.json";

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
 * 사용자 질문 키워드와 search-index.json 데이터를 대조하여 가장 연관된 상위 N개 데이터를 추출하는 RAG 검색 함수
 * @param {string} query - 사용자 질문
 * @param {number} topK - 추출할 최대 개수 (기본 3개)
 * @returns {Array} 연관 검색 결과 배열
 */
function findRelevantContexts(query, topK = 3) {
  if (!query || !Array.isArray(searchIndex) || searchIndex.length === 0) {
    return [];
  }

  // 2글자 이상의 의미 있는 검색 키워드 추출
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (keywords.length === 0) {
    return searchIndex.slice(0, topK);
  }

  // 각 항목별 연관도 점수 계산
  const scored = searchIndex.map((entry) => {
    let score = 0;
    const titleLower = (entry.title || "").toLowerCase();
    const contentLower = (entry.content || "").toLowerCase();
    const categoryLower = (entry.category || "").toLowerCase();
    const regionLower = (entry.region || "").toLowerCase();
    const venueLower = (entry.venue || "").toLowerCase();

    for (const kw of keywords) {
      if (titleLower.includes(kw)) score += 6; // 제목 일치 시 높은 점수
      if (regionLower.includes(kw)) score += 5; // 지역명 일치
      if (venueLower.includes(kw)) score += 4; // 미술관/장소 일치
      if (categoryLower.includes(kw)) score += 3; // 카테고리 일치
      if (contentLower.includes(kw)) score += 1; // 본문 일치
    }

    return { entry, score };
  });

  // 점수 높은 순으로 정렬 후 상위 topK개 추출
  const matched = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.entry);

  // 일치하는 항목이 없을 경우 기본 추천 2개 항목 반환
  if (matched.length === 0) {
    return searchIndex.slice(0, 2);
  }

  return matched;
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
          reply: "질문을 입력해 주시면 부울경 전시 및 도서 정보를 친절하게 안내해 드릴게요! 😊",
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

    // 4. [RAG 핵심] search-index.json에서 질문과 가장 연관된 실제 데이터 상위 2~3건 검색
    const relevantEntries = findRelevantContexts(userMessage, 3);

    // 검색된 실제 본문 데이터 컨텍스트 텍스트 구성
    const contextText = relevantEntries
      .map((item, idx) => {
        return `[자료 ${idx + 1}]
- 제목/전시명: ${item.title}
- 구분: ${item.category || "전시/도서"}
- 지역/장소: ${item.region || ""} ${item.subRegion ? `(${item.subRegion})` : ""} ${item.venue || ""}
- 관람료/가격: ${item.price || "정보 없음"}
- 기간: ${item.period || ""}
- 내용 요약: ${item.summary || (item.content ? item.content.slice(0, 250) : "")}
- 페이지 링크: ${item.url || ""}`;
      })
      .join("\n\n");

    // 5. 사실 기반 답변을 유도하는 시스템 프롬프트(System Prompt) 생성
    const systemPrompt = `당신은 부울경 아트·전시 나들이(art-buk) 웹사이트의 전문 AI 도슨트이자 큐레이터 비서입니다.
반드시 아래 제공하는 [사이트 실제 검색 데이터]의 사실에만 근거하여 사용자에게 답변하세요. 인터넷 지식으로 거짓 정보를 지어내지 마세요.

[사이트 실제 검색 데이터]
${contextText}

[답변 가이드라인]
1. 정중하고 따뜻한 한국어 존댓말로 답변하세요.
2. 2~3문장 내외로 사용자가 궁금한 핵심 정보(전시명, 장소, 가격, 특징 등)를 명쾌하게 전달하세요.
3. 마크다운 기호(**, #, - 등)를 일절 쓰지 말고 자연스러운 대화체로 작성하세요.
4. 검색 데이터에 없는 내용이라면 거짓으로 지어내지 말고 "제공된 사이트 정보에서는 확인되지 않지만, 메인 메뉴에서 더 많은 전시를 확인하실 수 있습니다."라고 정중히 안내하세요.`;

    // 6. Cloudflare Workers AI 호출 (@cf/meta/llama-3-8b-instruct)
    const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    // 7. AI 원본 텍스트 추출
    let rawText = "";
    if (typeof aiResponse === "string") {
      rawText = aiResponse;
    } else if (aiResponse && typeof aiResponse === "object" && aiResponse.response) {
      rawText = aiResponse.response;
    } else {
      rawText = "죄송합니다. 답변을 생성하지 못했습니다. 다시 시도해 주세요.";
    }

    // 8. 마크다운 기호 정제 (stripMarkdown)
    const cleanReply = stripMarkdown(rawText);

    // 9. 성공 응답 반환
    return new Response(
      JSON.stringify({
        success: true,
        reply: cleanReply,
        model: "@cf/meta/llama-3-8b-instruct",
        references: relevantEntries.map((r) => ({ title: r.title, url: r.url })),
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
