/**
 * Cloudflare Pages Function: /api/chat
 * Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct) + RAG 종합 검색 인덱스(전시, 5일장 전통시장, 대표&쌈지도서관, 블로그) 연동 백엔드
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
 * 사용자 질문 키워드와 search-index.json 데이터를 대조하여 가장 연관된 상위 N개 데이터를 추출하는 스마트 RAG 검색 함수
 * (전시, 5일장 전통시장, 복합도서관 & 쌈지 작은도서관, AI 도슨트 아티클 전 범위 지원)
 * @param {string} query - 사용자 질문
 * @param {number} topK - 추출할 최대 개수 (기본 4개)
 * @returns {Array} 연관 검색 결과 배열
 */
function findRelevantContexts(query, topK = 4) {
  if (!query || !Array.isArray(searchIndex) || searchIndex.length === 0) {
    return [];
  }

  // 1. 2글자 이상의 의미 있는 검색 키워드 추출
  const rawKeywords = query
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  // 2. 주요 도메인 테마 키워드 가중치 사전 정의
  const isMarketQuery = /장날|5일장|오일장|시장|재래시장|먹거리|국수|국밥|수구레|통닭|꼼장어|꿀빵|대게|호떡/i.test(query);
  const isLibraryQuery = /도서관|작은도서관|쌈지|숲속도서관|어린이도서관|북카페|지혜의바다|책|아이|가족|키즈|독서/i.test(query);
  const isExhibitionQuery = /전시|미술관|비엔날레|박물관|갤러리|무료|관람료|입장료|시간|휴관/i.test(query);
  const isDocentQuery = /도슨트|해설|블로그|후기|맛집|카페|코스|추천/i.test(query);

  if (rawKeywords.length === 0) {
    return searchIndex.slice(0, topK);
  }

  // 3. 각 인덱스 항목별 연관도 가중치 점수 계산
  const scored = searchIndex.map((entry) => {
    let score = 0;
    const type = entry.type || "";
    const titleLower = (entry.title || "").toLowerCase();
    const contentLower = (entry.content || "").toLowerCase();
    const categoryLower = (entry.category || "").toLowerCase();
    const regionLower = (entry.region || "").toLowerCase();
    const subRegionLower = (entry.subRegion || "").toLowerCase();
    const venueLower = (entry.venue || "").toLowerCase();

    // 카테고리별 테마 부스팅
    if (isMarketQuery && type === "market") score += 15;
    if (isLibraryQuery && type === "library") score += 15;
    if (isExhibitionQuery && type === "exhibition") score += 10;
    if (isDocentQuery && type === "article") score += 10;

    for (const kw of rawKeywords) {
      if (titleLower.includes(kw)) score += 8; // 제목 일치 시 최고 점수
      if (regionLower.includes(kw) || subRegionLower.includes(kw)) score += 7; // 지역/구군 일치
      if (venueLower.includes(kw)) score += 6; // 장소/미술관/시장/도서관명 일치
      if (categoryLower.includes(kw)) score += 4; // 카테고리 일치
      if (contentLower.includes(kw)) score += 2; // 본문 일치
    }

    return { entry, score };
  });

  // 4. 점수 높은 순으로 정렬 후 상위 topK개 추출
  const matched = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.entry);

  // 일치하는 항목이 없을 경우 기본 추천 항목 반환
  if (matched.length === 0) {
    return searchIndex.slice(0, 3);
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
          reply: "궁금하신 전시, 5일장 장날, 도서관, 주변 맛집을 자유롭게 질문해 주세요! 친절히 안내해 드릴게요. 😊",
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

    // 4. [RAG 종합 검색] search-index.json에서 질문과 가장 연관된 실제 데이터 상위 4건 검색
    const relevantEntries = findRelevantContexts(userMessage, 4);

    // 검색된 실제 본문 데이터 컨텍스트 텍스트 구성
    const contextText = relevantEntries
      .map((item, idx) => {
        return `[사이트 데이터 ${idx + 1}]
- 분류: ${item.type === "exhibition" ? "전시/미술관" : item.type === "market" ? "전통시장/5일장" : item.type === "library" ? "도서관/작은도서관" : "블로그/도슨트"}
- 명칭: ${item.title}
- 지역: ${item.region || ""} ${item.subRegion ? `(${item.subRegion})` : ""} ${item.venue || ""}
- 운영/기간: ${item.period || ""}
- 가격/특산물/특징: ${item.price || "정보 없음"}
- 요약/상세: ${item.summary || (item.content ? item.content.slice(0, 300) : "")}
- 바로가기 링크: ${item.url || ""}`;
      })
      .join("\n\n");

    // 5. 사실 기반 올인원 답변을 유도하는 시스템 프롬프트(System Prompt) 생성
    const systemPrompt = `당신은 부산·울산·경남 문화예술·전시·전통 5일장·도서관 통합 AI 나들이 플랫폼(나드리 AI, nadriai.com)의 전문 AI 도슨트이자 만능 문화 컨시어지 비서입니다.
반드시 아래 제공하는 [사이트 실제 검색 데이터]에 근거하여 사용자 질문에 가장 친절하고 정확하게 답변하세요.

[사이트 실제 검색 데이터]
${contextText}

[답변 지침]
1. 정중하고 따뜻한 한국어 존댓말(해요체)로 다정하게 답변하세요.
2. 질문 유형별 핵심 안내:
   - [전시/미술관 문의]: 전시명, 미술관 위치, 관람료(무료 여부), 기간, 핵심 감상 포인트를 명쾌하게 안내하세요.
   - [5일장/전통시장 문의]: 시장 이름, 5일장 장날 주기(예: 3·8일, 2·7일 등), 대표 장터 먹거리(국밥, 국수 등)를 콕 짚어 안내하세요.
   - [도서관/쌈지 작은도서관 문의]: 도서관명, 위치, 어린이 북플레이존/숲속 쉼표 등 가족 힐링 포인트를 안내하세요.
   - [맛집/나들이 코스 문의]: 전시 관람 후 연계하기 좋은 인근 장터나 도서관, 카페 코스를 함께 추천하세요.
3. 2~4문장 내외로 사용자가 한눈에 읽기 쉽게 깔끔하게 작성하세요.
4. 마크다운 기호(**, #, - 등)는 지양하고 자연스러운 대화체 문장으로 작성하세요.
5. 검색 데이터에 없는 내용은 지어내지 말고, 메인 홈페이지에서 더 다양한 정보를 확인하실 수 있다고 안내하세요.`;

    // 6. Cloudflare Workers AI 호출 (@cf/meta/llama-3-8b-instruct)
    const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
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

    // 9. 성공 응답 반환 (추천 바로가기 레퍼런스 포함)
    return new Response(
      JSON.stringify({
        success: true,
        reply: cleanReply,
        model: "@cf/meta/llama-3-8b-instruct",
        references: relevantEntries.map((r) => ({
          id: r.id,
          title: r.title,
          url: r.url,
          type: r.type,
          category: r.category,
          region: r.region,
          subRegion: r.subRegion
        })),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error?.message || "AI 응답 처리 중 오류가 발생했습니다.",
        reply:
          "전시 및 문화 안내를 처리하는 중 일시적인 지연이 발생했습니다. 잠시 후 다시 질문해 주세요! 😊",
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
