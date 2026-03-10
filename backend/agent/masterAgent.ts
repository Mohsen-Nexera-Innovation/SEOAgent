import { callSeoModel } from "../ai/llmClient";
import { handleKeywordResearch } from "../services/keywordService";
import { handleCompetitorAnalysis } from "../services/competitorService";
import { handleContentPlan } from "./contentAgent";

export type ChatStep =
  | "keyword-research"
  | "competitor-analysis"
  | "content-plan";

export interface ChatResponse {
  message: string;
  steps: {
    id: ChatStep;
    label: string;
    status: "pending" | "completed";
    summary: string;
  }[];
  data?: {
    keywordResearch?: unknown;
    competitorAnalysis?: unknown;
    contentPlan?: unknown;
  };
}

/**
 * Extracts 2–5 concise SEO seed keywords from a free-text user message
 * using a lightweight LLM call instead of a naive heuristic.
 */
async function extractKeywordsFromMessage(message: string): Promise<string[]> {
  if (!message) return [];

  // Fast path: if message is already comma-separated short tokens, use them directly
  const commaTokens = message
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.split(" ").length <= 5);
  if (commaTokens.length >= 2) return commaTokens;

  // Use LLM to intelligently extract SEO seed keywords
  try {
    const raw = await callSeoModel({
      systemPrompt: `You are an SEO expert. Extract 2–5 concise, specific SEO seed keywords from the user's message.
Return ONLY strict JSON, no markdown, no explanation.
Schema: { "keywords": ["string", "..."] }`,
      userPrompt: message,
    });

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const keywords: string[] = Array.isArray(parsed?.keywords) ? parsed.keywords : [];
    if (keywords.length > 0) return keywords;
  } catch {
    // Fallback: use entire message as a single keyword
  }

  return [message.trim()];
}

export async function handleChat(userMessage: string): Promise<ChatResponse> {
  const seedKeywords = await extractKeywordsFromMessage(userMessage);

  const steps: ChatResponse["steps"] = [
    { id: "keyword-research", label: "Keyword Research", status: "pending", summary: "" },
    { id: "competitor-analysis", label: "Competitor Analysis", status: "pending", summary: "" },
    { id: "content-plan", label: "Content Plan", status: "pending", summary: "" },
  ];

  const keywordResearch = await handleKeywordResearch(seedKeywords);
  steps[0] = {
    id: "keyword-research",
    label: "Keyword Research",
    status: "completed",
    summary: `Found ${(keywordResearch as any)?.clusters?.length ?? 0} keyword clusters from ${seedKeywords.length} seed keyword(s).`,
  };

  const competitorAnalysis = await handleCompetitorAnalysis(seedKeywords);
  steps[1] = {
    id: "competitor-analysis",
    label: "Competitor Analysis",
    status: "completed",
    summary: `Identified ${(competitorAnalysis as any)?.competitors?.length ?? 0} competitor entries.`,
  };

  const contentPlan = await handleContentPlan(seedKeywords);
  steps[2] = {
    id: "content-plan",
    label: "Content Plan",
    status: "completed",
    summary: `Drafted ${(contentPlan as any)?.roadmap?.length ?? 0} pillar pages with supporting articles.`,
  };

  return {
    message: `SEO analysis complete for: ${seedKeywords.join(", ")}`,
    steps,
    data: {
      keywordResearch,
      competitorAnalysis,
      contentPlan,
    },
  };
}
