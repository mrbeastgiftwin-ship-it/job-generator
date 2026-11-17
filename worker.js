
const MODEL = "@cf/meta/llama-3.1-8b-instruct";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true });
    }

    if (url.pathname === "/api/rewrite" && request.method === "POST") {
      try {
        const data = await request.json();
        let source = String(data.description || "").trim();

        // URL থেকে Job Description সংগ্রহ
        if (data.jobUrl) {
          const jobUrl = new URL(data.jobUrl);

          if (!["http:", "https:"].includes(jobUrl.protocol)) {
            return Response.json({ error: "Invalid URL." }, { status: 400 });
          }

          if (
            ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(jobUrl.hostname) ||
            jobUrl.hostname.endsWith(".local")
          ) {
            return Response.json({ error: "This URL is not allowed." }, { status: 400 });
          }

          const response = await fetch(jobUrl.href, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; SeventimenewsBot/1.0)",
              "Accept": "text/html"
            },
            signal: AbortSignal.timeout(15000)
          });

          if (!response.ok) {
            return Response.json({
              error: "Could not access this job page. Please paste the job description manually."
            }, { status: 400 });
          }

          const html = await response.text();

          source = html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
            .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
        }

        if (source.length < 100) {
          return Response.json({
            error: "Please provide a longer job description or a working job URL."
          }, { status: 400 });
        }

        source = source.slice(0, 18000);

        const prompt = `
You are a professional employment content writer.

Rewrite the supplied job advertisement into a completely original,
natural-sounding job description body.

STRICT RULES:
1. Write only the job description body.
2. Do not create a job title, category, salary summary, or separate metadata lines.
3. Do not copy sentences from the original advertisement.
4. Use fresh wording, sentence structures and paragraph organization.
5. Preserve the factual meaning of the original information.
6. Never invent salary, benefits, qualifications, experience, duties,
   employer details or other facts.
7. If a fact is missing, simply omit it.
8. Use clear professional English.
9. Use headings and bullet points where appropriate.
10. Return HTML fragments only, using headings, paragraphs,
    unordered lists and list items.
11. Do not include scripts, CSS, images, links or Apply buttons.
12. Do not claim that the text is legally guaranteed to be copyright-free.

SOURCE JOB ADVERTISEMENT:
${source}
`;

        const result = await env.AI.run(MODEL, {
          messages: [
            {
              role: "system",
              content: "You rewrite job advertisements accurately and originally."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1800
        });

        const body = String(result.response || "").trim();

        if (!body) {
          throw new Error("AI returned an empty response.");
        }

        return Response.json({ body });

      } catch (error) {
        return Response.json({
          error: error.message || "Something went wrong."
        }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
