import { generateKeywordClusters } from "../agent/keywordAgent";

export async function handleKeywordResearch(keywords: string[]) {
  const clusters = await generateKeywordClusters(keywords);

  return {
    clusters: clusters.map((cluster) => ({
      topic: cluster.topic,
      keywords: cluster.keywords,
      intent: cluster.intent,
      competition: cluster.competition,
      searchVolume: cluster.searchVolume,
      keywordDifficulty: cluster.keywordDifficulty,
      cpc: cluster.cpc,
    })),
  };
}

