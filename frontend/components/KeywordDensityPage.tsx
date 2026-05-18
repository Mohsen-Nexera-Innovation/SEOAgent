"use client";

import { useState } from "react";
import axios from "axios";

interface WordStats {
  word: string;
  count: number;
  density: number;
}

interface DensityResult {
  totalWords: number;
  topWords: {
    oneGram: WordStats[];
    twoGram: WordStats[];
    threeGram: WordStats[];
  };
  targetAnalysis: {
    keyword: string;
    count: number;
    density: number;
    aiAdvice: string;
  } | null;
}

export const KeywordDensityPage = () => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DensityResult | null>(null);
  const [error, setError] = useState("");
  const [activeGram, setActiveGram] = useState<"oneGram" | "twoGram" | "threeGram">("oneGram");

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/onpage/density-check", { 
        url,
        targetKeyword: keyword 
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to analyze keyword density.");
    } finally {
      setLoading(false);
    }
  };

  const currentWords = result?.topWords[activeGram] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Input Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="URL (e.g., https://example.com/blog-post)"
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
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 min-w-[180px]"
          >
            {loading ? "Analyzing..." : "Analyze Density"}
          </button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">Analyzing phrases and Long-tail keywords...</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Summary & AI Advice */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Analysis Summary</h3>
              
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Word Count</p>
                <p className="text-3xl font-bold text-emerald-400">{result.totalWords}</p>
              </div>

              {result.targetAnalysis && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target Keyword Info</p>
                    <p className="text-sm text-white font-bold truncate mb-2">"{result.targetAnalysis.keyword}"</p>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-slate-300">Found {result.targetAnalysis.count} times</p>
                      <p className={`text-xl font-bold ${result.targetAnalysis.density >= 1 && result.targetAnalysis.density <= 3 ? "text-emerald-400" : "text-amber-400"}`}>
                        {result.targetAnalysis.density}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                      <span>✨</span> AI SEO Advice
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{result.targetAnalysis.aiAdvice}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phrases Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">📊</span> Phrase Frequency Analyzer
              </h3>
              
              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setActiveGram("oneGram")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeGram === "oneGram" ? "bg-emerald-500 text-slate-950" : "text-slate-500"}`}
                >
                  1 Word
                </button>
                <button
                  onClick={() => setActiveGram("twoGram")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeGram === "twoGram" ? "bg-emerald-500 text-slate-950" : "text-slate-500"}`}
                >
                  2 Words
                </button>
                <button
                  onClick={() => setActiveGram("threeGram")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeGram === "threeGram" ? "bg-emerald-500 text-slate-950" : "text-slate-500"}`}
                >
                  3 Words
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Phrase / Keyword</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Count</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Density</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {currentWords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm">No phrases found for this category.</td>
                    </tr>
                  ) : (
                    currentWords.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-200">{item.word}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400 font-mono">{item.count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-400">
                            {item.density}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 max-w-[100px]">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              style={{ width: `${Math.min(item.density * 20, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
