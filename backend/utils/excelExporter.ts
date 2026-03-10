import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

interface ExportSeoResultsInput {
  keywordData: {
    keyword: string;
    cluster: string;
    intent: string;
    competition: string;
  }[];
  competitorData: {
    keyword: string;
    competitor: string;
    url: string;
    contentLength: number;
    hasSchema: boolean;
  }[];
  contentPlan: {
    pillarPage: string;
    supportingArticles: string[];
    targetKeywords: string[];
  }[];
}

export async function exportSeoResults(
  data: ExportSeoResultsInput,
): Promise<string> {
  const workbook = new ExcelJS.Workbook();

  const keywordSheet = workbook.addWorksheet("Keyword Clusters");
  keywordSheet.columns = [
    { header: "Keyword", key: "keyword" },
    { header: "Cluster", key: "cluster" },
    { header: "Intent", key: "intent" },
    { header: "Competition", key: "competition" },
  ];
  data.keywordData.forEach((row) => keywordSheet.addRow(row));

  const competitorSheet = workbook.addWorksheet("Competitor Analysis");
  competitorSheet.columns = [
    { header: "Keyword", key: "keyword" },
    { header: "Competitor", key: "competitor" },
    { header: "URL", key: "url" },
    { header: "Content Length", key: "contentLength" },
    { header: "Has Schema", key: "hasSchema" },
  ];
  data.competitorData.forEach((row) => competitorSheet.addRow(row));

  const contentSheet = workbook.addWorksheet("Content Plan");
  contentSheet.columns = [
    { header: "Pillar Page", key: "pillarPage" },
    { header: "Supporting Articles", key: "supportingArticles" },
    { header: "Target Keywords", key: "targetKeywords" },
  ];
  data.contentPlan.forEach((row) =>
    contentSheet.addRow({
      pillarPage: row.pillarPage,
      supportingArticles: row.supportingArticles.join("; "),
      targetKeywords: row.targetKeywords.join(", "),
    }),
  );

  const exportDir = path.resolve(process.cwd(), "exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, "seo-results.xlsx");
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

