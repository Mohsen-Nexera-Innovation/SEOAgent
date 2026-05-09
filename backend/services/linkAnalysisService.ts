import axios from "axios";
import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";
import { getDataForSeoMetrics } from "./dataForSeoService";

export interface LinkKeywordRow {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
}

export interface AnalysisCategory {
  analysis: string;
  pros: string[];
  cons: string[];
  enhancements: string[];
}

export interface SiteAnalysis {
  seo: AnalysisCategory;
  content: AnalysisCategory;
  performance: AnalysisCategory;
}

export interface AnalyzeLinkResult {
  keywords: LinkKeywordRow[];
  analysis: SiteAnalysis | null;
}

/**
 * Fetches the given URL, strips HTML, extracts SEO keywords via AI,
 * performs an SEO expert analysis, and enriches keywords with DataForSEO metrics.
 */
export async function analyzeLink(url: string): Promise<AnalyzeLinkResult> {
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

  // 3. Ask the AI to extract keywords and analyze the site
  const keywordPrompt = `You are an SEO expert analyzing a website's content.
Extract 10 to 20 highly relevant SEO keywords from the provided page text.
Focus on keywords a user might search for to find this website.
Respond with STRICT JSON only — no markdown, no explanation.
Schema: { "keywords": ["string", "..."] }`;

  const analysisPrompt = `You are an expert SEO and Quality Assurance tester.
Analyse the following website content. Provide a comprehensive, highly-detailed analysis divided strictly into three categories: SEO, Content, and Performance.
For EVERY category, you MUST provide:
1. "analysis": A detailed paragraph explaining the current state.
2. "pros": A list of positive aspects.
3. "cons": A list of negative aspects or missing features.
4. "enhancements": A list of specific recommended improvements.
Respond with STRICT JSON only — no markdown, no explanation.
Schema: {
  "seo": {
    "analysis": "string",
    "pros": ["string", "..."],
    "cons": ["string", "..."],
    "enhancements": ["string", "..."]
  },
  "content": {
    "analysis": "string",
    "pros": ["string", "..."],
    "cons": ["string", "..."],
    "enhancements": ["string", "..."]
  },
  "performance": {
    "analysis": "string",
    "pros": ["string", "..."],
    "cons": ["string", "..."],
    "enhancements": ["string", "..."]
  }
}`;

  const [rawKeywords, rawAnalysis] = await Promise.all([
    callSeoModel({ systemPrompt: keywordPrompt, userPrompt: plainText }),
    callSeoModel({ systemPrompt: analysisPrompt, userPrompt: plainText })
  ]);

  let extractedKeywords: string[] = [];
  try {
    const parsed = JSON.parse(sanitizeJsonResponse(rawKeywords));
    extractedKeywords = Array.isArray(parsed?.keywords) ? parsed.keywords : [];
  } catch {
    extractedKeywords = [];
  }
  
  let analysis: SiteAnalysis | null = null;
  try {
    const parsed = JSON.parse(sanitizeJsonResponse(rawAnalysis));
    
    const parseCategory = (cat: any): AnalysisCategory => ({
      analysis: cat?.analysis || "",
      pros: Array.isArray(cat?.pros) ? cat.pros : [],
      cons: Array.isArray(cat?.cons) ? cat.cons : [],
      enhancements: Array.isArray(cat?.enhancements) ? cat.enhancements : []
    });

    analysis = {
      seo: parseCategory(parsed?.seo),
      content: parseCategory(parsed?.content),
      performance: parseCategory(parsed?.performance)
    };
  } catch {
    analysis = null;
  }

  // 4. Enrich keywords with DataForSEO metrics
  let rows: LinkKeywordRow[] = [];
  if (extractedKeywords.length > 0) {
    const metrics = await getDataForSeoMetrics(extractedKeywords);
    rows = extractedKeywords.map((kw) => ({
      keyword: kw,
      searchVolume: metrics[kw]?.searchVolume ?? 0,
      keywordDifficulty: metrics[kw]?.keywordDifficulty ?? 0,
      cpc: metrics[kw]?.cpc ?? 0,
    }));
  }

  // 5. Return enriched rows and analysis
  return {
    keywords: rows,
    analysis
  };
}
