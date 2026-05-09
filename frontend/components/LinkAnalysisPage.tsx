"use client";

import { useState } from "react";
import { useSeo, LinkKeywordRow, SiteAnalysis, AnalysisCategory } from "../context/SeoContext";

function ExportToWord({ details }: { details: SiteAnalysis }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("http://localhost:4000/api/export-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkAnalysisDetails: details }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `site-analysis-${new Date().toISOString().slice(0, 10)}.docx`;
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
      disabled={exporting}
      className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {exporting ? "Exporting..." : "Export to Word"}
    </button>
  );
}

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

function CategoryBlock({ title, icon, category }: { title: string, icon: string, category: AnalysisCategory }) {
  return (
    <div className="bg-slate-950/50 rounded-lg p-5 border border-slate-800 space-y-4">
      <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="text-emerald-500">{icon}</span> {title}
      </h4>

      <div>
        <h5 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Analysis</h5>
        <p className="text-sm text-slate-300 leading-relaxed">{category.analysis}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs uppercase tracking-wider text-emerald-500 font-bold mb-2 flex flex-row items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Pros
          </h5>
          <ul className="space-y-1.5">
            {category.pros.map((pro, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-emerald-500/50 mt-1 flex-shrink-0">•</span> <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-xs uppercase tracking-wider text-red-500 font-bold mb-2 flex flex-row items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Cons
          </h5>
          <ul className="space-y-1.5">
            {category.cons.map((con, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-red-500/50 mt-1 flex-shrink-0">•</span> <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2">
        <h5 className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-2 flex flex-row items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
          Recommended Enhancements
        </h5>
        <ul className="space-y-1.5">
          {category.enhancements.map((enh, i) => (
            <li key={i} className="text-sm text-slate-400 flex items-start gap-2 bg-blue-900/10 rounded px-3 py-2 border border-blue-900/30">
              <span className="text-blue-500/50 mt-0.5 flex-shrink-0">🚀</span>
              <span>{enh}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LinkAnalysisPage() {
  const { linkAnalysisRows, setLinkAnalysisRows, linkAnalysisDetails, setLinkAnalysisDetails } = useSeo();
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
      setLinkAnalysisDetails(data.analysis || null);
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
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${row.keywordDifficulty >= 70 ? "bg-red-500/20 text-red-400" :
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

      {/* Analysis Details */}
      {linkAnalysisDetails && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-emerald-400">Detailed Site Analysis</h3>
            <ExportToWord details={linkAnalysisDetails} />
          </div>

          <div className="space-y-6">
            <CategoryBlock title="Search Engine Optimization" icon="⚡" category={linkAnalysisDetails.seo} />
            <CategoryBlock title="Content Evaluation" icon="📝" category={linkAnalysisDetails.content} />
            <CategoryBlock title="Performance & Technical" icon="⚙️" category={linkAnalysisDetails.performance} />
          </div>
        </div>
      )}

    </div>
  );
}
