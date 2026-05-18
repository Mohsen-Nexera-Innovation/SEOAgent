"use client";

import { useState } from "react";
import axios from "axios";

interface HeaderResult {
  headings: { tag: string; text: string; level: number }[];
  summary: {
    total: number;
    h1Count: number;
    isValid: boolean;
    issues: string[];
    keywordFoundInH1: boolean | null;
  };
}

export const HeaderCheckerPage = () => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/onpage/header-check", { 
        url,
        targetKeyword: keyword 
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to analyze headers. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Input Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-[2] bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          <input
            type="text"
            placeholder="Target Keyword (Optional)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          <button
            onClick={handleCheck}
            disabled={loading || !url}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 min-w-[180px]"
          >
            {loading ? "Analyzing..." : "Check Structure"}
          </button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">Extracting and validating heading hierarchy...</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Analysis Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Audit Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Headings</p>
                  <p className="text-2xl font-bold text-white">{result.summary.total}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">H1 Count</p>
                  <p className={`text-2xl font-bold ${result.summary.h1Count === 1 ? "text-emerald-400" : "text-rose-400"}`}>
                    {result.summary.h1Count}
                  </p>
                </div>
              </div>

              {result.summary.keywordFoundInH1 !== null && (
                <div className={`p-4 rounded-2xl border ${result.summary.keywordFoundInH1 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Keyword in H1</p>
                  <p className={`text-sm font-bold ${result.summary.keywordFoundInH1 ? "text-emerald-400" : "text-rose-400"}`}>
                    {result.summary.keywordFoundInH1 ? `✓ Found: "${keyword}"` : `✕ Missing: "${keyword}"`}
                  </p>
                </div>
              )}

              <div className={`p-4 rounded-2xl border ${result.summary.isValid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                <p className={`text-sm font-bold ${result.summary.isValid ? "text-emerald-400" : "text-rose-400"}`}>
                  {result.summary.isValid ? "✓ Structure looks good" : "⚠ Issues Detected"}
                </p>
              </div>
            </div>

            {result.summary.issues.length > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6">
                <h4 className="text-rose-400 text-sm font-bold mb-3">To-Fix List</h4>
                <ul className="space-y-3">
                  {result.summary.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-slate-400 flex gap-2 leading-relaxed">
                      <span className="text-rose-500 mt-1">✕</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Heading Tree Panel */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 ml-1">
              <span className="text-emerald-400">📑</span> Heading Hierarchy Tree
            </h3>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto p-6 space-y-3 scrollbar-hide">
                {result.headings.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">No headings found on this page.</p>
                ) : (
                  result.headings.map((h, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-4 group"
                      style={{ paddingLeft: `${(h.level - 1) * 24}px` }}
                    >
                      <span className={`text-[10px] font-bold px-2 py-1 rounded min-w-[32px] text-center ${
                        h.tag === 'h1' ? 'bg-emerald-500 text-slate-950' : 
                        h.tag === 'h2' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}>
                        {h.tag.toUpperCase()}
                      </span>
                      <p className={`text-sm ${h.tag === 'h1' ? 'text-white font-bold text-lg' : 'text-slate-300'}`}>
                        {h.text}
                        {keyword && h.tag === 'h1' && h.text.toLowerCase().includes(keyword.toLowerCase()) && (
                          <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">Keyword Match</span>
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
