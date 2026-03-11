import { callSeoModel, sanitizeJsonResponse } from "../ai/llmClient";

export interface ContentPlanItem {
  pillarPage: string;
  supportingArticles: string[];
  targetKeywords: string[];
}

export async function handleContentPlan(
  keywords: string[],
): Promise<{ roadmap: ContentPlanItem[] }> {
  if (!keywords || keywords.length === 0) {
    return { roadmap: [] };
  }

  const systemPrompt = `
You are an SEO content planner.
You create topical authority roadmaps based on keyword clusters and search intent.

Given a list of seed keywords:
- infer logical topics and subtopics
- define pillar pages
- define supporting articles
- assign target keywords to each item.

Respond with STRICT JSON only, no markdown and no comments.

JSON schema:
{
  "roadmap": [
    {
      "pillarPage": "string",
      "supportingArticles": ["string", "..."],
      "targetKeywords": ["string", "..."]
    }
  ]
}
`.trim();

  const userPrompt = `
Seed keywords (dynamic at runtime):
${JSON.stringify(keywords, null, 2)}

Return JSON only following the schema.
`.trim();

  const raw = await callSeoModel({ systemPrompt, userPrompt });

  let parsed: any;
  try {
    parsed = JSON.parse(sanitizeJsonResponse(raw));
  } catch (error) {
    throw new Error(
      `Failed to parse content plan JSON from model: ${(error as Error).message}\nRaw response:\n${raw}`,
    );
  }

  const roadmap = (parsed as any)?.roadmap ?? [];
  return { roadmap: roadmap as ContentPlanItem[] };
}


