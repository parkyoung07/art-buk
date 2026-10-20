/**
 * Cloudflare Pages Function: /api/messages
 *
 * Message storage is disabled until an authenticated, consent-aware
 * replacement is approved. Existing KV data is intentionally untouched.
 */

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function disabledResponse() {
  return new Response(
    JSON.stringify({
      error: "MESSAGE_SERVICE_DISABLED",
      message: "상담 및 피드백 접수는 보안 점검 중입니다.",
    }),
    { status: 410, headers: JSON_HEADERS }
  );
}

export async function onRequestGet() {
  return disabledResponse();
}

export async function onRequestPost() {
  return disabledResponse();
}

export async function onRequestDelete() {
  return disabledResponse();
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}
