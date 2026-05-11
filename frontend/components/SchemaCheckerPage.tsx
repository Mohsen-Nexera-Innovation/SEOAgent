"use client";

import { useState } from "react";
import axios from "axios";

interface SchemaResult {
  foundSchemas: any[];
  aiAnalysis: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}

export const SchemaCheckerPage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemaResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await axios.post("http://localhost:4000/api/schema-check", { url });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to analyze structured data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openGoogleTest = () => {
    if (!url) return;
    const googleUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
    window.open(googleUrl, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Input Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              disabled={loading || !url}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex-1 md:flex-none"
            >
              {loading ? "Analyzing..." : "AI Analysis"}
            </button>
            <button
              onClick={openGoogleTest}
              disabled={!url}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 flex-1 md:flex-none flex items-center justify-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Official Test
            </button>
          </div>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3 ml-1">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">
            Analyzing schemas with AI... please wait.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Total Schemas</p>
              <p className="text-2xl font-bold text-white">{result.foundSchemas.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Validation Status</p>
              <p className={`text-xl font-bold ${result.aiAnalysis.isValid ? "text-emerald-400" : "text-rose-400"}`}>
                {result.aiAnalysis.isValid ? "Valid" : "Needs Attention"}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Errors</p>
              <p className={`text-2xl font-bold ${result.aiAnalysis.errors.length > 0 ? "text-rose-400" : "text-slate-600"}`}>
                {result.aiAnalysis.errors.length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Warnings</p>
              <p className={`text-2xl font-bold ${result.aiAnalysis.warnings.length > 0 ? "text-amber-400" : "text-slate-600"}`}>
                {result.aiAnalysis.warnings.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Insights Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-100 ml-1 flex items-center gap-2">
                <span className="text-emerald-400 text-xl">✨</span> AI SEO Insights
              </h3>
              
              {result.aiAnalysis.suggestions.length > 0 && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
                  <h4 className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                    💡 Suggested Improvements
                  </h4>
                  <ul className="space-y-3">
                    {result.aiAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-3">
                        <span className="text-emerald-500 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(result.aiAnalysis.errors.length > 0 || result.aiAnalysis.warnings.length > 0) && (
                <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl space-y-4">
                  <h4 className="text-rose-400 text-sm font-bold flex items-center gap-2">
                    🚨 Issues to Fix
                  </h4>
                  <ul className="space-y-3">
                    {result.aiAnalysis.errors.map((e, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-3">
                        <span className="text-rose-500 mt-1">✕</span>
                        {e}
                      </li>
                    ))}
                    {result.aiAnalysis.warnings.map((w, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-3">
                        <span className="text-amber-500 mt-1">⚠</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Extracted Schemas List */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-100 ml-1">
                Detected JSON-LD
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {result.foundSchemas.length === 0 ? (
                  <div className="bg-slate-900/50 border border-dashed border-slate-800 p-10 rounded-3xl text-center">
                    <p className="text-slate-500 text-sm">No structured data found on this page.</p>
                  </div>
                ) : (
                  result.foundSchemas.map((schema, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                          {schema["@type"] || "Unknown Type"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Schema #{i+1}</span>
                      </div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="text-xs text-slate-400 font-mono">
                          {JSON.stringify(schema, null, 2)}
                        </pre>
                      </div>
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
