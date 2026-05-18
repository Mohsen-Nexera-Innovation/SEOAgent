import axios from "axios";
import * as cheerio from "cheerio";
import { callSeoModel } from "../ai/llmClient";

export interface SchemaResult {
  foundSchemas: any[];
  aiAnalysis: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}

export const checkStructuredData = async (url: string): Promise<SchemaResult> => {
  try {
    // 1. Fetch HTML and extract JSON-LD
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const foundSchemas: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const content = $(el).html();
        if (content) {
          foundSchemas.push(JSON.parse(content));
        }
      } catch (e) {
        // Ignore invalid JSON for now, LLM will handle analysis
      }
    });

    // 2. Extract page context (Title, Meta Description, H1) for AI suggestions
    const pageTitle = $("title").text();
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1").first().text();

    // 3. AI Analysis
    const prompt = `
      You are an SEO Structured Data expert. Analyze the following schemas found on a webpage and provide a report.
      
      Page Info:
      - URL: ${url}
      - Title: ${pageTitle}
      - Description: ${metaDescription}
      - H1: ${h1}

      Found Schemas:
      ${JSON.stringify(foundSchemas, null, 2)}

      Tasks:
      1. Validate the syntax and semantic correctness of the found schemas.
      2. Check for missing required fields based on schema.org standards.
      3. Suggest missing schemas that would be beneficial for this specific page based on its content (Title/H1).
      
      Return ONLY a strict JSON object with the following structure:
      {
        "isValid": boolean,
        "errors": ["string", "..."],
        "warnings": ["string", "..."],
        "suggestions": ["string", "..."]
      }
    `;

    const aiResponse = await callSeoModel({
      systemPrompt: "You are an SEO AI specialized in Schema Markup (JSON-LD) validation and optimization.",
      userPrompt: prompt,
    });

    const cleanResponse = aiResponse.replace(/```json|```/g, "").trim();
    const aiAnalysis = JSON.parse(cleanResponse);

    return {
      foundSchemas,
      aiAnalysis,
    };
  } catch (error: any) {
    console.error("Schema Checker Error:", error.message);
    throw new Error("Failed to analyze structured data. Please ensure the URL is correct.");
  }
};
