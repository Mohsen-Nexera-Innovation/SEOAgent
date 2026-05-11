"use client";

import { useState } from "react";
import axios from "axios";

interface LinkStatus {
  source: string;
  link: string;
  status: number | string;
  isValid: boolean;
}

export const BrokenLinksPage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LinkStatus[]>([]);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const response = await axios.post("http://localhost:4000/api/broken-links", { url });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to scan links. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number | string, isValid: boolean) => {
    if (isValid) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status === 404) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
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
          <button
            onClick={handleCheck}
            disabled={loading || !url}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Scanning..." : "Check Links"}
          </button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3 ml-1">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">Scanning page and checking links status... please wait.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Source Page</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Destination Link</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {results.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400 truncate max-w-[200px]" title={item.source}>
                        {item.source}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-200 truncate max-w-[350px]" title={item.link}>
                        {item.link}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.status, item.isValid)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 hover:text-white transition-all"
                      >
                        Visit
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
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
