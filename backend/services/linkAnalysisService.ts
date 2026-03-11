import axios from "axios";
import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";
import { getDataForSeoMetrics } from "./dataForSeoService";

export interface LinkKeywordRow {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
}

/**
 * Fetches the given URL, strips HTML, extracts SEO keywords via AI,
 * then enriches them with live DataForSEO metrics.
 */
export async function analyzeLinkKeywords(url: string): Promise<LinkKeywordRow[]> {
  // 1. Fetch the page HTML
  let rawHtml = "";
  try {
    const resp = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOAgent/1.0)" },
    });
    rawHtml = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
  } catch (err) {
    throw new Error(`Failed to fetch URL "${url}": ${(err as Error).message}`);
  }

  // 2. Strip HTML tags to get plain text, cap at 4000 chars for the LLM
  const plainText = rawHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);

  // 3. Ask the AI to extract 10–20 SEO keywords from the text
  const systemPrompt = `You are an SEO expert analyzing a website's content.
Extract 10 to 20 highly relevant SEO keywords from the provided page text.
Focus on keywords a user might search for to find this website.
Respond with STRICT JSON only — no markdown, no explanation.
Schema: { "keywords": ["string", "..."] }`;

  const raw = await callSeoModel({ systemPrompt, userPrompt: plainText });
  let extractedKeywords: string[] = [];
  try {
    const parsed = JSON.parse(sanitizeJsonResponse(raw));
    extractedKeywords = Array.isArray(parsed?.keywords) ? parsed.keywords : [];
  } catch {
    extractedKeywords = [];
  }

  if (extractedKeywords.length === 0) {
    return [];
  }

  // 4. Enrich keywords with DataForSEO metrics
  const metrics = await getDataForSeoMetrics(extractedKeywords);

  // 5. Return enriched rows
  return extractedKeywords.map((kw) => ({
    keyword: kw,
    searchVolume: metrics[kw]?.searchVolume ?? 0,
    keywordDifficulty: metrics[kw]?.keywordDifficulty ?? 0,
    cpc: metrics[kw]?.cpc ?? 0,
  }));
}
