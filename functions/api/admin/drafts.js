// Cloudflare Pages Function for /api/admin/drafts
export async function onRequestGet(context) {
  try {
    const res = await context.env.ASSETS.fetch(new Request(new URL("/data/content-drafts.json", context.request.url)));
    if (res.ok) {
      const drafts = await res.json();
      return new Response(JSON.stringify({ success: true, drafts }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true, drafts: [] }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: true, drafts: [] }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, message: "Draft updated in session", body }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
