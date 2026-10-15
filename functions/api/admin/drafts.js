const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export async function onRequestGet() {
  return json(
    {
      success: false,
      error: "Production draft access is disabled. Use the authenticated GitHub Actions approval workflow.",
    },
    410
  );
}

export async function onRequestPost() {
  return json(
    {
      success: false,
      error: "Draft mutations are only allowed through the authenticated GitHub Actions approval workflow.",
    },
    405
  );
}
