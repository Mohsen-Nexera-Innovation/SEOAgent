"use client";

import { useState } from "react";
import axios from "axios";

interface AuditResult {
  current: {
    title: string;
    description: string;
    h1: string;
  };
  analysis: {
    audit: {
      titleScore: number;
      descriptionScore: number;
      issues: string[];
      pros: string[];
    };
    suggestions: {
      title: string;
      description: string;
      benefit: string;
    }[];
  };
}

export const MetaOptimizerPage = () => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/onpage/meta-audit", { 
        url,
        targetKeyword: keyword 
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to audit meta tags. Please check the URL.");
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
            onClick={handleAudit}
            disabled={loading || !url}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 min-w-[180px]"
          >
            {loading ? "Analyzing..." : "Audit & Optimize"}
          </button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">
            {keyword ? `Optimizing meta tags for "${keyword}"...` : "Auditing meta tags and generating improvements..."}
          </p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Current State & Audit */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Current Meta Tags</h3>
                {keyword && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                    Target: {keyword}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Title Tag</p>
                  <p className="text-sm text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">{result.current.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Length: {result.current.title.length} characters</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Meta Description</p>
                  <p className="text-sm text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">{result.current.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Length: {result.current.description.length} characters</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Title Score</p>
                  <p className={`text-2xl font-bold ${result.analysis.audit.titleScore > 70 ? "text-emerald-400" : "text-amber-400"}`}>
                    {result.analysis.audit.titleScore}%
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Desc Score</p>
                  <p className={`text-2xl font-bold ${result.analysis.audit.descriptionScore > 70 ? "text-emerald-400" : "text-amber-400"}`}>
                    {result.analysis.audit.descriptionScore}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6">
              <h4 className="text-rose-400 text-sm font-bold mb-3 flex items-center gap-2">
                🚨 Issues Found
              </h4>
              <ul className="space-y-2">
                {result.analysis.audit.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-rose-500">•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 ml-1">
              ✨ AI Optimized Suggestions
            </h3>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
              {result.analysis.suggestions.map((s, i) => (
                <div key={i} className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 space-y-4 relative group hover:border-emerald-500/40 transition-all">
                  <div className="absolute top-4 right-6 text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest">Variation #{i+1}</div>
                  
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Suggested Title</p>
                    <p className="text-sm text-emerald-400 font-bold leading-snug">{s.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Suggested Description</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500"><span className="text-emerald-500 font-bold">Why:</span> {s.benefit}</p>
                  </div>

                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`Title: ${s.title}\nDescription: ${s.description}`);
                      alert("Copied to clipboard!");
                    }}
                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Copy Both
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
