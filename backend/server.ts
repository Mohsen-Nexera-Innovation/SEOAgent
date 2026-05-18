import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { handleKeywordResearch } from "./services/keywordService";
import { handleCompetitorAnalysis } from "./services/competitorService";
import { handleContentPlan } from "./agent/contentAgent";
import { handleChat } from "./agent/masterAgent";
import { analyzeLink } from "./services/linkAnalysisService";
import { handleSiteAudit } from "./services/auditService";
import { checkBrokenLinks } from "./services/brokenLinksService";
import { checkStructuredData } from "./services/schemaService";
import { checkRobots, generateRobots } from "./services/robotsService";
import { checkSitemap, generateSitemap } from "./services/sitemapService";
import { auditMetaTags, checkHeaderStructure, checkImageAlts, generateSmartAlt, analyzeKeywordDensity } from "./services/onPageService";

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
    const result = await analyzeLink(url);
    res.json(result);
  } catch (error) {
    console.error("link-analysis error", error);
    res.status(500).json({ error: (error as Error).message || "Internal server error" });
  }
});

app.post("/api/site-audit", async (req, res) => {
  try {
    const { url } = req.body as { url: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required" });
    }
    const result = await handleSiteAudit(url);
    res.json(result);
  } catch (error) {
    console.error("site-audit error", error);
    res.status(500).json({ error: (error as Error).message || "Internal server error" });
  }
});

app.post("/api/broken-links", async (req, res) => {
  try {
    const { url } = req.body as { url: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required" });
    }
    const result = await checkBrokenLinks(url);
    res.json(result);
  } catch (error) {
    console.error("broken-links error", error);
    res.status(500).json({ error: (error as Error).message || "Internal server error" });
  }
});

app.post("/api/schema-check", async (req, res) => {
  try {
    const { url } = req.body as { url: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required" });
    }
    const result = await checkStructuredData(url);
    res.json(result);
  } catch (error) {
    console.error("schema-check error", error);
    res.status(500).json({ error: (error as Error).message || "Internal server error" });
  }
});

// Indexing Tools: Robots.txt
app.post("/api/robots-check", async (req, res) => {
  try {
    const { url } = req.body;
    const result = await checkRobots(url);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/robots-generate", async (req, res) => {
  try {
    const { siteDescription } = req.body;
    const result = await generateRobots(siteDescription);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Indexing Tools: Sitemap
app.post("/api/sitemap-check", async (req, res) => {
  try {
    const { url } = req.body;
    const result = await checkSitemap(url);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sitemap-generate", async (req, res) => {
  try {
    const { url } = req.body;
    const result = await generateSitemap(url);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// On-Page SEO: Meta Tags Optimizer
app.post("/api/onpage/meta-audit", async (req, res) => {
  try {
    const { url, targetKeyword } = req.body;
    const result = await auditMetaTags(url, targetKeyword);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/onpage/header-check", async (req, res) => {
  try {
    const { url, targetKeyword } = req.body;
    const result = await checkHeaderStructure(url, targetKeyword);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/onpage/image-check", async (req, res) => {
  try {
    const { url, targetKeyword } = req.body;
    const result = await checkImageAlts(url, targetKeyword);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/onpage/smart-alt", async (req, res) => {
  try {
    const { imageUrl, targetKeyword } = req.body;
    const alt = await generateSmartAlt(imageUrl, targetKeyword);
    res.json({ alt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/onpage/density-check", async (req, res) => {
  try {
    const { url, targetKeyword } = req.body;
    const result = await analyzeKeywordDensity(url, targetKeyword);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/export-word", async (req, res) => {
  try {
    const { linkAnalysisDetails } = req.body;
    if (!linkAnalysisDetails) {
      return res.status(400).json({ error: "linkAnalysisDetails is required" });
    }

    const { Document, Packer, Paragraph, TextRun } = require("docx");

    const categories = [
      { title: "SEO", data: linkAnalysisDetails.seo },
      { title: "Content", data: linkAnalysisDetails.content },
      { title: "Performance", data: linkAnalysisDetails.performance }
    ];

    const generateCategorySections = (title: string, data: any) => {
      if (!data) return [];

      const sections = [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 36 })],
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "Analysis: ", bold: true }), new TextRun({ text: data.analysis || "N/A" })],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "Pros:", bold: true })],
          spacing: { after: 100 }
        })
      ];

      (data.pros || []).forEach((pro: string) => {
        sections.push(new Paragraph({ text: `• ${pro}`, bullet: { level: 0 } }));
      });

      sections.push(new Paragraph({
        children: [new TextRun({ text: "Cons:", bold: true })],
        spacing: { before: 200, after: 100 }
      }));

      (data.cons || []).forEach((con: string) => {
        sections.push(new Paragraph({ text: `• ${con}`, bullet: { level: 0 } }));
      });

      sections.push(new Paragraph({
        children: [new TextRun({ text: "Enhancements:", bold: true })],
        spacing: { before: 200, after: 100 }
      }));

      (data.enhancements || []).forEach((enhancement: string) => {
        sections.push(new Paragraph({ text: `• ${enhancement}`, bullet: { level: 0 } }));
      });

      return sections;
    };

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Detailed Site Analysis Report", bold: true, size: 48 })],
            spacing: { after: 400 }
          }),
          ...categories.flatMap(cat => generateCategorySections(cat.title, cat.data))
        ]
      }]
    });

    const b64string = await Packer.toBase64String(doc);
    const buffer = Buffer.from(b64string, "base64");

    const filename = `site-analysis-${new Date().toISOString().slice(0, 10)}.docx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (error) {
    console.error("export-word error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`SEO Agent backend listening on port ${port}`);
});


