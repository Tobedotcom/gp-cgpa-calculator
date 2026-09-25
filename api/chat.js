// Vercel serverless function: POST /api/chat
//
// Thin, server-side bridge to the Gemini API. GEMINI_API_KEY lives only in
// this function's environment (Vercel project env vars / .env.local for
// local dev via `vercel dev`) and is never sent to or bundled for the
// browser - the React app only ever talks to this same-origin endpoint.
//
// Request:  { "message": "What is a CGPA?" }
// Response: { "reply": "..." }  (200)  or  { "error": "..." }  (4xx/5xx)
//
// No CGPA/academic context is attached yet - that's Part 3. This just
// forwards the raw message to Gemini and returns its text reply.

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in the server environment.");
    return res.status(500).json({ error: "The AI assistant is not configured." });
  }

  // req.body is auto-parsed from JSON by the Vercel Node runtime when the
  // request has a JSON content-type; guard against anything else (missing
  // body, wrong content-type, non-object) instead of assuming its shape.
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { message } = body;

  if (typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json({ error: "Request body must include a non-empty 'message' string." });
  }

  let geminiResponse;

  try {
    geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message.trim() }] }],
      }),
    });
  } catch (error) {
    console.error("Network error calling Gemini API:", error);
    return res
      .status(502)
      .json({ error: "Could not reach the AI assistant. Please try again." });
  }

  let data;

  try {
    data = await geminiResponse.json();
  } catch (error) {
    console.error("Failed to parse Gemini API response:", error);
    return res
      .status(502)
      .json({ error: "The AI assistant returned an invalid response." });
  }

  if (!geminiResponse.ok) {
    console.error("Gemini API error:", geminiResponse.status, data);

    if (geminiResponse.status === 429) {
      return res.status(502).json({
        error: "GradeBot is getting a lot of requests right now. Please wait a minute and try again.",
      });
    }

    return res
      .status(502)
      .json({ error: "The AI assistant failed to respond. Please try again." });
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof reply !== "string" || !reply.trim()) {
    console.error("Gemini API returned no reply text:", data);
    return res
      .status(502)
      .json({ error: "The AI assistant returned an empty response." });
  }

  return res.status(200).json({ reply });
}
