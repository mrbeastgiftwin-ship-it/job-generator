// Cloudflare Worker starter.
// The AI and extraction endpoints will be added after choosing the API provider.
// Keep all secret API keys in Cloudflare Worker Secrets, never in browser code.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "Seventimenews Job Generator API" });
    }
    return Response.json(
      { error: "API route not configured yet. Frontend starter is ready." },
      { status: 501 }
    );
  }
};
