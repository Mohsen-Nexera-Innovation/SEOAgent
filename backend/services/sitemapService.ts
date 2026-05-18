import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

export const generateSitemap = async (targetUrl: string, maxPages = 50) => {
  const baseUrl = new URL(targetUrl).origin;
  const visited = new Set<string>();
  const queue: string[] = [targetUrl];
  const pages: string[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const response = await axios.get(currentUrl, {
        headers: { "User-Agent": "SEOAgent-SitemapGenerator/1.0" },
        timeout: 5000,
      });
      
      const $ = cheerio.load(response.data);
      pages.push(currentUrl);

      // Extract internal links
      $("a[href]").each((_, el) => {
        let href = $(el).attr("href");
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          // Check if it's internal and not visited
          if (absoluteUrl.startsWith(baseUrl) && !visited.has(absoluteUrl) && !queue.includes(absoluteUrl)) {
            // Avoid files like .pdf, .jpg, etc.
            if (!absoluteUrl.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i)) {
              queue.push(absoluteUrl);
            }
          }
        } catch (e) {
          // Invalid URL
        }
      });
    } catch (error) {
      console.error(`Failed to crawl: ${currentUrl}`);
    }
  }

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  pages.forEach((page) => {
    xml += `  <url>\n    <loc>${page}</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });
  xml += "</urlset>";

  return {
    xml,
    pagesCount: pages.length,
    pagesList: pages,
  };
};

export const checkSitemap = async (url: string) => {
  try {
    const baseUrl = new URL(url).origin;
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const response = await axios.get(sitemapUrl, { timeout: 5000 });
    
    // Basic validation: Check if it's XML and contains urlset
    const content = response.data;
    const isValid = content.includes("<urlset") && content.includes("<loc>");

    return {
      exists: true,
      url: sitemapUrl,
      isValid,
      content: isValid ? "Sitemap is valid and readable." : "Sitemap found but format seems invalid.",
    };
  } catch (error: any) {
    return {
      exists: false,
      error: "Sitemap not found or unreachable.",
    };
  }
};
