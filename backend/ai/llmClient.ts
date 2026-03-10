/**
 * Simple LLM client for SEO agents.
 *
 * This implementation is intentionally framework-light:
 * - Uses fetch to call OpenAI's Chat Completions API
 * - Keeps prompts and JSON schemas close to each agent
 *
 * Set OPENAI_API_KEY in your environment before running the backend.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

/**
 * Strips markdown code fences that the model sometimes wraps JSON in.
 * e.g. ```json\n{...}\n``` → {...}
 */
export function sanitizeJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

export async function callSeoModel({
  systemPrompt,
  userPrompt,
}: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please set it in your environment to enable AI agents.",
    );
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `OpenAI API error (${response.status}): ${response.statusText} ${text}`,
    );
  }

  const json = (await response.json()) as any;
  const message = json?.choices?.[0]?.message;
  const content =
    typeof message?.content === "string"
      ? message.content
      : Array.isArray(message?.content)
        ? message.content.map((c: any) => c?.text ?? "").join("")
        : null;

  if (!content || typeof content !== "string") {
    throw new Error("OpenAI API returned empty content");
  }

  return content.trim();
}
