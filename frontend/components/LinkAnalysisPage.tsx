"use client";

import { useState } from "react";
import { useSeo, LinkKeywordRow } from "../context/SeoContext";

function LinkAnalysisExport({ rows }: { rows: LinkKeywordRow[] }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("http://localhost:4000/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywordData: rows.map((r) => ({
            keyword: r.keyword,
            cluster: "Link Analysis",
            intent: "—",
            competition: "—",
            searchVolume: r.searchVolume,
            keywordDifficulty: r.keywordDifficulty,
            cpc: r.cpc,
          })),
          competitorData: [],
          contentPlan: [],
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `link-analysis-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || rows.length === 0}
      className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {exporting ? "Exporting..." : "Export to Excel"}
    </button>
  );
}

export function LinkAnalysisPage() {
  const { linkAnalysisRows, setLinkAnalysisRows } = useSeo();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/link-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed.");
        return;
      }
      setLinkAnalysisRows(data.keywords || []);
    } catch {
      setError("Failed to reach the backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold mb-1">Link Analysis</h2>
        <p className="text-sm text-slate-400 mb-5">
          Enter any website URL to extract its SEO keywords with live search volume, keyword difficulty, and CPC data.
        </p>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {/* Results */}
      {linkAnalysisRows.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Keyword Insights — <span className="text-emerald-400 text-sm font-normal">{linkAnalysisRows.length} keywords found</span>
            </h3>
            <LinkAnalysisExport rows={linkAnalysisRows} />
          </div>
          <div className="overflow-auto rounded-md border border-slate-800">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Keyword</th>
                  <th className="px-3 py-2">Volume</th>
                  <th className="px-3 py-2">KD</th>
                  <th className="px-3 py-2">CPC</th>
                </tr>
              </thead>
              <tbody>
                {linkAnalysisRows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-800 odd:bg-slate-950/40 hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2 font-medium text-white">{row.keyword}</td>
                    <td className="px-3 py-2 text-slate-300">{row.searchVolume.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                        row.keywordDifficulty >= 70 ? "bg-red-500/20 text-red-400" :
                        row.keywordDifficulty >= 40 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {row.keywordDifficulty}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300">${row.cpc.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
