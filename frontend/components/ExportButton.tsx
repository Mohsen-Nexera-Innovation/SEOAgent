"use client";

import { useState } from "react";
import { useSeo } from "../context/SeoContext";

export function ExportButton() {
  const { keywordRows, competitorRows, contentPlan } = useSeo();
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setStatus(null);
    try {
      const res = await fetch("http://localhost:4000/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywordData: keywordRows,
          competitorData: competitorRows,
          contentPlan: contentPlan,
        }),
      });

      if (!res.ok) {
        setStatus("Export failed. Please try again.");
        return;
      }

      // Stream the response as a file download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-results-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Export downloaded successfully.");
    } catch {
      setStatus("Failed to export to Excel.");
    } finally {
      setExporting(false);
    }
  };

  const hasData = keywordRows.length > 0 || competitorRows.length > 0 || contentPlan.length > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
      <h2 className="text-lg font-medium">Export</h2>
      <p className="text-xs text-slate-400">
        Downloads a full Excel report with keyword clusters, competitor analysis, and content roadmap.
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting || !hasData}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        {exporting ? "Exporting..." : "Export to Excel"}
      </button>
      {!hasData && (
        <p className="text-xs text-slate-500">Run an analysis first to enable export.</p>
      )}
      {status && <p className="text-xs text-slate-400">{status}</p>}
    </div>
  );
}
