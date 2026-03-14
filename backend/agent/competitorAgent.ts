import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";
import { fetchSerpResults } from "../services/serpService";


export interface CompetitorRecord {
  keyword: string;
  competitor: string;
  url: string;
  contentLength: number;
  hasSchema: boolean;
}

export async function analyzeCompetitors(
  keywords: string[],
): Promise<CompetitorRecord[]> {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  // ── Step 1: Fetch REAL Google organic results via DataForSEO ──────────────
  const serpResults = await fetchSerpResults(keywords);

  // Group real URLs by keyword
  const serpByKeyword: Record<string, { title: string; url: string }[]> = {};
  for (const r of serpResults) {
    if (!serpByKeyword[r.keyword]) serpByKeyword[r.keyword] = [];
    serpByKeyword[r.keyword].push({ title: r.title, url: r.url });
  }

  const hasSerpData = serpResults.length > 0;

  // ── Step 2: Ask LLM to enrich the real URLs (or fallback to root domains) ─
  const systemPrompt = hasSerpData
    ? `
You are an SEO competitor analysis agent.

You will be given a list of keywords, each with REAL Google search result URLs that actually rank for that keyword.

For each keyword, pick the top 3–5 URLs from the provided list and return:
- "keyword": the target keyword
- "competitor": the brand/site name derived from the URL (e.g. "Healthline" from healthline.com)
- "url": the EXACT URL as provided — do NOT modify, shorten, or invent any URL
- "contentLength": estimated word count of a typical article on this topic (integer)
- "hasSchema": whether the page likely uses structured data markup (true/false)

CRITICAL: Only use the URLs provided. Never invent or hallucinate any URL.

Respond with STRICT JSON only, no markdown and no comments.

JSON schema:
{
  "competitors": [
    {
      "keyword": "string",
      "competitor": "string",
      "url": "string (use the exact URL from the provided list)",
      "contentLength": number,
      "hasSchema": boolean
    }
  ]
}
`.trim()
    : `
You are an SEO competitor analysis agent with deep knowledge of real websites that rank for various topics.

For each keyword, identify 3–5 real, well-known competitor websites that typically rank for this type of query.

For each competitor return:
- "keyword": the target keyword
- "competitor": the brand/site name (e.g. "Healthline", "WebMD", "Moz")
- "url": the HTTPS root domain URL of the competitor's homepage ONLY (e.g. "https://www.healthline.com"). Do NOT guess or invent any page paths.
- "contentLength": estimated word count of a typical article on this topic (integer, e.g. 2500)
- "hasSchema": whether the page likely uses structured data markup (true/false)

IMPORTANT: URLs must be root domains only (no sub-paths). Never invent specific page URLs.

Respond with STRICT JSON only, no markdown and no comments.

JSON schema:
{
  "competitors": [
    {
      "keyword": "string",
      "competitor": "string",
      "url": "string (https:// root domain only)",
      "contentLength": number,
      "hasSchema": boolean
    }
  ]
}
`.trim();

  const userPrompt = hasSerpData
    ? `
Here are the real Google organic results per keyword. Use ONLY these URLs — do not invent any.

${keywords
  .map((kw) => {
    const hits = serpByKeyword[kw] ?? [];
    const list = hits.map((h, i) => `  ${i + 1}. ${h.url}  (${h.title})`).join("\n");
    return `Keyword: "${kw}"\nReal results:\n${list || "  (no results found)"}`;
  })
  .join("\n\n")}

Return JSON only following the schema.
`.trim()
    : `
Target keywords:
${JSON.stringify(keywords, null, 2)}

Return JSON only following the schema.
`.trim();

  const raw = await callSeoModel({ systemPrompt, userPrompt });

  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitizeJsonResponse(raw));
  } catch (error) {
    throw new Error(
      `Failed to parse competitor analysis JSON from model: ${(error as Error).message}\nRaw response:\n${raw}`,
    );
  }

  const competitors = (parsed as any)?.competitors ?? [];
  return competitors as CompetitorRecord[];
}



