import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { handleKeywordResearch } from "./services/keywordService";
import { handleCompetitorAnalysis } from "./services/competitorService";
import { handleContentPlan } from "./agent/contentAgent";
import { handleChat } from "./agent/masterAgent";
import { analyzeLinkKeywords } from "./services/linkAnalysisService";


const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/keyword-research", async (req, res) => {
  try {
    const { keywords } = req.body as { keywords: string[] };
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "keywords must be a non-empty array" });
    }
    const result = await handleKeywordResearch(keywords);
    res.json(result);
  } catch (error) {
    console.error("keyword-research error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/competitor-analysis", async (req, res) => {
  try {
    const { keywords } = req.body as { keywords: string[] };
    const result = await handleCompetitorAnalysis(keywords || []);
    res.json(result);
  } catch (error) {
    console.error("competitor-analysis error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/content-plan", async (req, res) => {
  try {
    const { keywords } = req.body as { keywords: string[] };
    const result = await handleContentPlan(keywords || []);
    res.json(result);
  } catch (error) {
    console.error("content-plan error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/export", async (req, res) => {
  try {
    const { keywordData, competitorData, contentPlan } = req.body;

    // Import ExcelJS and build workbook inline for streaming
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();

    // Sheet 1 — Keyword Clusters
    const kwSheet = workbook.addWorksheet("Keyword Clusters");
    kwSheet.columns = [
      { header: "Keyword", key: "keyword" },
      { header: "Cluster", key: "cluster" },
      { header: "Intent", key: "intent" },
      { header: "Competition", key: "competition" },
      { header: "Search Volume", key: "searchVolume" },
      { header: "Keyword Difficulty", key: "keywordDifficulty" },
      { header: "CPC ($)", key: "cpc" },
    ];
    (keywordData || []).forEach((row: any) => kwSheet.addRow(row));

    // Sheet 2 — Competitor Analysis
    const compSheet = workbook.addWorksheet("Competitor Analysis");
    compSheet.columns = [
      { header: "Keyword", key: "keyword" },
      { header: "Competitor", key: "competitor" },
      { header: "URL", key: "url" },
      { header: "Content Length", key: "contentLength" },
      { header: "Has Schema", key: "hasSchema" },
    ];
    (competitorData || []).forEach((row: any) => compSheet.addRow(row));

    // Sheet 3 — Content Plan
    const contentSheet = workbook.addWorksheet("Content Plan");
    contentSheet.columns = [
      { header: "Pillar Page", key: "pillarPage" },
      { header: "Supporting Articles", key: "supportingArticles" },
      { header: "Target Keywords", key: "targetKeywords" },
    ];
    (contentPlan || []).forEach((row: any) =>
      contentSheet.addRow({
        pillarPage: row.pillarPage,
        supportingArticles: Array.isArray(row.supportingArticles) ? row.supportingArticles.join("; ") : row.supportingArticles,
        targetKeywords: Array.isArray(row.targetKeywords) ? row.targetKeywords.join(", ") : row.targetKeywords,
      })
    );

    // Stream directly to browser as a file download
    const filename = `seo-results-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("export error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body as { message: string };
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    const response = await handleChat(message);
    res.json(response);
  } catch (error) {
    console.error("chat error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/link-analysis", async (req, res) => {
  try {
    const { url } = req.body as { url: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required" });
    }
    const rows = await analyzeLinkKeywords(url);
    res.json({ keywords: rows });
  } catch (error) {
    console.error("link-analysis error", error);
    res.status(500).json({ error: (error as Error).message || "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`SEO Agent backend listening on port ${port}`);
});


