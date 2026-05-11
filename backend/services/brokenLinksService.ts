import axios from "axios";
import * as cheerio from "cheerio";

export interface LinkStatus {
  source: string;
  link: string;
  status: number | string;
  isValid: boolean;
}

export const checkBrokenLinks = async (url: string): Promise<LinkStatus[]> => {
  try {
    // 1. Fetch HTML
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);

    // 2. Extract all <a> tags
    const links: string[] = [];
    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        try {
          // Normalize URL
          const absoluteUrl = new URL(href, url).href;
          links.push(absoluteUrl);
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    // 3. Remove duplicates
    const uniqueLinks = [...new Set(links)];

    // 4. Check each link (using HEAD request for efficiency)
    const results: LinkStatus[] = await Promise.all(
      uniqueLinks.map(async (link) => {
        try {
          const res = await axios.head(link, {
            timeout: 5000,
            validateStatus: () => true, // Don't throw on 4xx/5xx
          });
          return {
            source: url,
            link,
            status: res.status,
            isValid: res.status >= 200 && res.status < 400,
          };
        } catch (error: any) {
          return {
            source: url,
            link,
            status: error.code || "FAILED",
            isValid: false,
          };
        }
      })
    );

    return results;
  } catch (error: any) {
    console.error("Broken Links Checker Error:", error.message);
    throw new Error("Failed to fetch the source URL. Please make sure it's valid.");
  }
};
