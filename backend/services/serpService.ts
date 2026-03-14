import axios from "axios";

export interface SerpResult {
  keyword: string;
  title: string;
  url: string;
  snippet: string;
}

/**
 * Fetches real Google SERP results via the DataForSEO SERP API.
 * Falls back to an empty array per keyword if credentials are missing or the call fails.
 */
export async function fetchSerpResults(
  keywords: string[],
  locationCode: number = 2818, // Egypt
  languageCode: string = "ar",
): Promise<SerpResult[]> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    console.warn("[SERP] DataForSEO credentials missing. Returning empty SERP results.");
    return [];
  }

  const results: SerpResult[] = [];

  for (const keyword of keywords) {
    try {
      const postData = [
        {
          keyword,
          location_code: locationCode,
          language_code: languageCode,
          depth: 10, // top 10 organic results
        },
      ];

      const response = await axios({
        method: "post",
        url: "https://api.dataforseo.com/v3/serp/google/organic/live/advanced",
        auth: { username: login, password: password },
        data: postData,
        headers: { "content-type": "application/json" },
      });

      const task = response.data?.tasks?.[0];
      if (!task || task.status_code !== 20000) {
        console.warn(`[SERP] Task error for "${keyword}" (${task?.status_code}): ${task?.status_message}`);
        continue;
      }

      const items: any[] = task.result?.[0]?.items ?? [];
      for (const item of items) {
        if (item.type === "organic" && item.url) {
          results.push({
            keyword,
            title: item.title ?? "",
            url: item.url,
            snippet: item.description ?? "",
          });
        }
      }

      console.log(`[SERP] "${keyword}" → ${items.filter((i: any) => i.type === "organic").length} organic results`);
    } catch (err: any) {
      console.error(`[SERP] Error fetching SERP for "${keyword}":`, err.response?.data || err.message);
    }
  }

  return results;
}
