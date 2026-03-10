import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";


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

  const systemPrompt = `
You are an SEO competitor analysis agent with deep knowledge of real websites that rank for various topics.

For each keyword, identify 3–5 real, well-known competitor websites that typically rank for this type of query.

For each competitor return:
- "keyword": the target keyword
- "competitor": the brand/site name (e.g. "Healthline", "WebMD", "Moz")
- "url": a FULL absolute HTTPS URL to a real page on that site that would rank for this keyword
  (e.g. "https://www.healthline.com/health/diabetes/glucose-monitoring" — must start with https://)
- "contentLength": estimated word count of a typical article on this topic (integer, e.g. 2500)
- "hasSchema": whether the page likely uses structured data markup (true/false)

IMPORTANT: URLs must be full absolute URLs starting with "https://". Use real domains like
healthline.com, webmd.com, moz.com, ahrefs.com, semrush.com, neilpatel.com, backlinko.com,
mayoclinic.org, wikipedia.org, etc. — whichever is most appropriate for the keyword topic.

Respond with STRICT JSON only, no markdown and no comments.

JSON schema:
{
  "competitors": [
    {
      "keyword": "string",
      "competitor": "string",
      "url": "string (full https:// URL)",
      "contentLength": number,
      "hasSchema": boolean
    }
  ]
}
`.trim();

  const userPrompt = `
Target keywords (dynamic at runtime):
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


