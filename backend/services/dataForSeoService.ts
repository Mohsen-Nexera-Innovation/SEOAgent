import axios from "axios";

export async function getDataForSeoMetrics(keywords: string[]) {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    console.warn("DataForSEO credentials missing. Returning mock metrics.");
    // Return mock data if no credentials
    return keywords.reduce((acc, kw) => {
      acc[kw] = {
        searchVolume: Math.floor(Math.random() * 5000),
        keywordDifficulty: Math.floor(Math.random() * 80),
        cpc: Number((Math.random() * 5).toFixed(2)),
      };
      return acc;
    }, {} as Record<string, any>);
  }

  try {
    const postData = [
      {
        keywords: keywords,
      },
    ];

    const response = await axios({
      method: "post",
      url: "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      auth: {
        username: login,
        password: password,
      },
      data: postData,
      headers: {
        "content-type": "application/json",
      },
    });

    // 1. Check the task status within the response
    const task = response.data?.tasks?.[0];
    if (task && task.status_code !== 20000) {
      console.warn(`[DataForSEO] Task Error (${task.status_code}): ${task.status_message}`);
    }

    // 2. Build a normalized (lowercase) map from DataForSEO results
    const normalizedMap: Record<string, any> = {};
    const items = task?.result || [];

    items.forEach((item: any) => {
      if (item.keyword) {
        normalizedMap[item.keyword.toLowerCase().trim()] = {
          searchVolume: item.search_volume || 0,
          keywordDifficulty: item.competition_index || 0,
          cpc: item.cpc || 0,
        };
      }
    });

    // 3. Map back to the original keyword casing
    const metricsMap: Record<string, any> = {};
    keywords.forEach((kw) => {
      const normalized = kw.toLowerCase().trim();
      metricsMap[kw] = normalizedMap[normalized] ?? { searchVolume: 0, keywordDifficulty: 0, cpc: 0 };
    });

    console.log(`[DataForSEO] API: ${response.data?.status_code}, Task: ${task?.status_code}. keywords: ${keywords.length}`);
    
    return metricsMap;
  } catch (error: any) {
    console.error("[DataForSEO] API Error:", error.response?.data || error.message);
    // Fallback to zeros on error so the app doesn't crash
    return keywords.reduce((acc, kw) => {
      acc[kw] = { searchVolume: 0, keywordDifficulty: 0, cpc: 0 };
      return acc;
    }, {} as Record<string, any>);
  }
}
