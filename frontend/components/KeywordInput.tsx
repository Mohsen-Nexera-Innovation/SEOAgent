"use client";

import { useState } from "react";
import { useSeo } from "../context/SeoContext";

export function KeywordInput() {
  const { keywords, setKeywords, setKeywordRows, setCompetitorRows, setContentPlan } = useSeo();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addKeyword = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setKeywords([...keywords, trimmed]);
    setInput("");
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (keywords.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Keyword research
      const kwRes = await fetch("http://localhost:4000/api/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      if (!kwRes.ok) { setError("Keyword research failed."); return; }
      const kwData = await kwRes.json();
      const rows = kwData?.clusters?.flatMap((cluster: any) =>
        cluster.keywords.map((kw: string) => ({
          keyword: kw,
          cluster: cluster.topic,
          intent: cluster.intent,
          competition: cluster.competition,
          searchVolume: cluster.searchVolume ?? undefined,
          keywordDifficulty: cluster.keywordDifficulty ?? undefined,
          cpc: cluster.cpc ?? undefined,
        }))
      ) ?? [];
      setKeywordRows(rows);

      // 2. Competitor analysis
      const compRes = await fetch("http://localhost:4000/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      if (compRes.ok) {
        const compData = await compRes.json();
        setCompetitorRows(compData?.competitors ?? []);
      }

      // 3. Content plan
      const contentRes = await fetch("http://localhost:4000/api/content-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContentPlan(contentData?.roadmap ?? []);
      }
    } catch {
      setError("Could not reach the SEO API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <h2 className="text-lg font-medium">Enter Keywords</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. glucose monitoring device"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
        />
        <button
          type="button"
          onClick={addKeyword}
          className="rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-white"
        >
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {keywords.map((kw, index) => (
          <span key={kw + index} className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1">
            {kw}
            <button type="button" onClick={() => removeKeyword(index)} className="text-slate-400 hover:text-red-400">×</button>
          </span>
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="button"
        disabled={loading || keywords.length === 0}
        onClick={startAnalysis}
        className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analysing...
          </span>
        ) : "Run Full SEO Analysis"}
      </button>
    </div>
  );
}
