import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";
import { getDataForSeoMetrics } from "../services/dataForSeoService";

export interface KeywordCluster {
  topic: string;
  keywords: string[];
  intent: "informational" | "commercial" | "transactional" | "navigational";
  competition: "low" | "medium" | "high";
  searchVolume?: number;
  keywordDifficulty?: number;
  cpc?: number;
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

  const baseClusters = (parsed as any)?.clusters ?? [];

  // Extract all generated keywords into a flat array to fetch metrics
  const allKeywords = baseClusters.flatMap((c: any) => c.keywords);

  // Fetch metrics from DataForSEO
  const metrics = await getDataForSeoMetrics(allKeywords);

  // Map the metrics back onto single cluster representations for the frontend
  // Since frontend expects one row per keyword, we'll split the clusters into individual keyword objects
  const enrichedClusters: KeywordCluster[] = [];

  for (const cluster of baseClusters) {
    for (const kw of cluster.keywords) {
      const metric = metrics[kw] || { searchVolume: 0, keywordDifficulty: 0, cpc: 0 };
      enrichedClusters.push({
        topic: cluster.topic,
        keywords: [kw], // Frontend expects a mapping later, this is easier
        intent: cluster.intent,
        competition: cluster.competition,
        searchVolume: metric.searchVolume,
        keywordDifficulty: metric.keywordDifficulty,
        cpc: metric.cpc
      });
    }
  }
  console.log("ENRICHED CLUSTERS:", JSON.stringify(enrichedClusters));
  return enrichedClusters;
}


