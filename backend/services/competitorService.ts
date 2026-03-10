import { analyzeCompetitors } from "../agent/competitorAgent";

export async function handleCompetitorAnalysis(keywords: string[]) {
  const competitors = await analyzeCompetitors(keywords);

  return {
    competitors,
  };
}

