import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";


export interface KeywordCluster {
  topic: string;
  keywords: string[];
  intent: "informational" | "commercial" | "transactional" | "navigational";
  competition: "low" | "medium" | "high";
}

export async function generateKeywordClusters(
  seedKeywords: string[],
): Promise<KeywordCluster[]> {
  if (!seedKeywords || seedKeywords.length === 0) {
    return [];
  }

  const systemPrompt = `
You are an advanced SEO keyword research agent.
You must perform:
- keyword expansion
- long-tail generation
- search intent detection
- basic competition estimation
- clustering by topic

You ALWAYS respond with strict JSON only.
No explanations, no markdown, no comments.

JSON schema:
{
  "clusters": [
    {
      "topic": "string",
      "keywords": ["string", "..."],
      "intent": "informational" | "commercial" | "transactional" | "navigational",
      "competition": "low" | "medium" | "high"
    }
  ]
}
`.trim();

  const userPrompt = `
Seed keywords (user and agent derived, dynamic at runtime):
${JSON.stringify(seedKeywords, null, 2)}

Return JSON only following the schema.
`.trim();

  const raw = await callSeoModel({ systemPrompt, userPrompt });

  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitizeJsonResponse(raw));
  } catch (error) {
    throw new Error(
      `Failed to parse keyword clusters JSON from model: ${(error as Error).message}\nRaw response:\n${raw}`,
    );
  }

  const clusters = (parsed as any)?.clusters ?? [];
  return clusters as KeywordCluster[];
}


