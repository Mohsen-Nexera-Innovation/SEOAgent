import axios from "axios";
import { callSeoModel } from "../ai/llmClient";

export const checkRobots = async (url: string) => {
  try {
    // 1. Construct robots.txt URL
    const baseUrl = new URL(url).origin;
    const robotsUrl = `${baseUrl}/robots.txt`;

    // 2. Fetch the file
    const response = await axios.get(robotsUrl, { timeout: 5000 });
    const content = response.data;

    // 3. AI Analysis
    const prompt = `
      Analyze the following robots.txt content and provide a summary of what it allows and disallows. 
      Also, check if there are any obvious SEO risks (like blocking important directories).
      
      Content:
      ${content}

      Return ONLY a strict JSON object:
      {
        "content": "string (raw content)",
        "analysis": "string (brief summary)",
        "risks": ["string", "..."],
        "recommendations": ["string", "..."]
      }
    `;

    const aiResponse = await callSeoModel({
      systemPrompt: "You are a Technical SEO expert specialized in robots.txt analysis.",
      userPrompt: prompt,
    });

    const parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
    return parsed;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Robots.txt not found on this server.");
    }
    throw new Error("Failed to fetch or analyze robots.txt: " + error.message);
  }
};

export const generateRobots = async (siteDescription: string) => {
  const prompt = `
    Generate a professional robots.txt file based on this site description: "${siteDescription}".
    Include standard directives for common search engines (Google, Bing, etc.) and suggest paths to disallow if applicable (like /admin, /private).
    Also include a placeholder for the sitemap URL.

    Return ONLY a strict JSON object:
    {
      "generatedContent": "string (the robots.txt content)",
      "explanation": "string (why you chose these rules)"
    }
  `;

  const aiResponse = await callSeoModel({
    systemPrompt: "You are a Technical SEO expert. Generate optimized robots.txt files.",
    userPrompt: prompt,
  });

  return JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
};
