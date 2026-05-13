import axios from "axios";
import * as cheerio from "cheerio";
import { callSeoModel } from "../ai/llmClient";

export const auditMetaTags = async (url: string, targetKeyword?: string) => {
  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" },
      timeout: 7000,
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const current = {
      title: $("title").text() || "No Title Found",
      description: $('meta[name="description"]').attr("content") || "No Description Found",
      h1: $("h1").first().text() || "No H1 Found",
    };

    const prompt = `
      You are an On-Page SEO expert. Audit the following meta tags and suggest improvements.
      ${targetKeyword ? `The target keyword to optimize for is: "${targetKeyword}".` : ""}
      
      Current Data:
      - URL: ${url}
      - Title: ${current.title} (Length: ${current.title.length})
      - Description: ${current.description} (Length: ${current.description.length})
      - H1: ${current.h1}

      Tasks:
      1. Audit: Check if Title (50-60 chars) and Description (150-160 chars) follow best practices.
      ${targetKeyword ? `2. Keyword Check: Verify if "${targetKeyword}" is present in the title and description.` : ""}
      3. Suggest: Provide 3 optimized variations for both Title and Description. ${targetKeyword ? `Ensure "${targetKeyword}" is included naturally in the suggestions.` : ""}
      
      Return ONLY a strict JSON object:
      {
        "audit": {
          "titleScore": number (0-100),
          "descriptionScore": number (0-100),
          "issues": ["string", "..."],
          "pros": ["string", "..."]
        },
        "suggestions": [
          { "title": "string", "description": "string", "benefit": "string" }
        ]
      }
    `;

    const aiResponse = await callSeoModel({
      systemPrompt: "You are a specialized On-Page SEO optimization AI.",
      userPrompt: prompt,
    });

    const parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());

    return {
      current,
      analysis: parsed
    };
  } catch (error: any) {
    throw new Error("Failed to audit meta tags: " + error.message);
  }
};

export const checkHeaderStructure = async (url: string, targetKeyword?: string) => {
  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 7000,
    });
    const $ = cheerio.load(response.data);
    
    const headings: { tag: string; text: string; level: number }[] = [];
    $(':header').each((_, el) => {
      const tag = el.tagName.toLowerCase(); // h1, h2, etc.
      const level = parseInt(tag.substring(1));
      headings.push({
        tag,
        text: $(el).text().trim(),
        level
      });
    });

    // Validation Logic
    const h1s = headings.filter(h => h.tag === 'h1');
    const h1Count = h1s.length;
    const issues: string[] = [];
    
    if (h1Count === 0) issues.push("Critical: No H1 tag found.");
    if (h1Count > 1) issues.push(`Warning: Multiple H1 tags found (${h1Count}). There should only be one.`);

    // Keyword Check (Optional)
    let keywordFoundInH1 = false;
    if (targetKeyword) {
      keywordFoundInH1 = h1s.some(h => h.text.toLowerCase().includes(targetKeyword.toLowerCase()));
      if (h1Count > 0 && !keywordFoundInH1) {
        issues.push(`SEO Warning: Target keyword "${targetKeyword}" not found in H1 tag.`);
      }
    }

    let lastLevel = 0;
    headings.forEach((h, i) => {
      if (i > 0 && h.level > lastLevel + 1) {
        issues.push(`Hierarchy Gap: Jumped from <h${lastLevel}> to <h${h.level}> at "${h.text.substring(0, 30)}..."`);
      }
      lastLevel = h.level;
    });

    return {
      headings,
      summary: {
        total: headings.length,
        h1Count,
        isValid: issues.length === 0,
        issues,
        keywordFoundInH1: targetKeyword ? keywordFoundInH1 : null
      }
    };
  } catch (error: any) {
    throw new Error("Failed to check header structure: " + error.message);
  }
};

export const checkImageAlts = async (url: string, targetKeyword?: string) => {
  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 7000,
    });
    const $ = cheerio.load(response.data);
    const baseUrl = new URL(url).origin;

    const images: { src: string; alt: string; hasAlt: boolean; keywordMatch: boolean }[] = [];
    
    $("img").each((_, el) => {
      const src = $(el).attr("src");
      if (!src) return;

      const fullSrc = src.startsWith("http") ? src : new URL(src, baseUrl).href;
      const alt = $(el).attr("alt") || "";
      const hasAlt = alt.trim().length > 0;
      const keywordMatch = targetKeyword ? alt.toLowerCase().includes(targetKeyword.toLowerCase()) : false;

      images.push({
        src: fullSrc,
        alt,
        hasAlt,
        keywordMatch
      });
    });

    const missingAltCount = images.filter(img => !img.hasAlt).length;
    
    return {
      images,
      summary: {
        total: images.length,
        missingAltCount,
        keywordMatchCount: images.filter(img => img.keywordMatch).length,
        score: images.length > 0 ? Math.round(((images.length - missingAltCount) / images.length) * 100) : 100
      }
    };
  } catch (error: any) {
    throw new Error("Failed to check image alts: " + error.message);
  }
};

export const generateSmartAlt = async (imageUrl: string, targetKeyword?: string) => {
  const prompt = `
    Analyze this image and provide a concise, SEO-friendly Alt Text (max 125 characters).
    ${targetKeyword ? `Try to naturally include the keyword "${targetKeyword}" if it fits the image content.` : ""}
    
    Return ONLY the text for the alt attribute.
  `;

  const aiResponse = await callSeoModel({
    systemPrompt: "You are an SEO expert with Vision capabilities. Provide descriptive Alt text for images.",
    userPrompt: `${prompt}\nImage URL: ${imageUrl}`,
  });

  return aiResponse.trim();
};
