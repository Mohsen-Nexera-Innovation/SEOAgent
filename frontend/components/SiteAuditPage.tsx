"use client";

import { useState } from "react";
import axios from "axios";

interface AuditResult {
  score: number;
  metrics: {
    lcp: string;
    tbt: string;
    cls: string;
    fcp: string;
    speedIndex: string;
  };
  details: {
    title: string;
    description: string;
    score: number;
  }[];
}

export function SiteAuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await axios.post("http://localhost:4000/api/site-audit", { url });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
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
            onClick={handleAudit}
            disabled={loading || !url}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Analyzing..." : "Run Audit"}
          </button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3 ml-1">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">Running Lighthouse audit... this may take up to 30 seconds.</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Main Score Card */}
          <div className={`p-8 rounded-3xl border ${getScoreBg(result.score)} flex flex-col md:flex-row items-center gap-8`}>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * result.score) / 100}
                  className={getScoreColor(result.score)}
                />
              </svg>
              <span className={`absolute text-3xl font-bold ${getScoreColor(result.score)}`}>
                {Math.round(result.score)}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Performance Score</h3>
              <p className="text-slate-400 text-sm max-w-md">
                This score is based on the weighted average of the Core Web Vitals and other performance metrics calculated by Lighthouse.
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Largest Contentful Paint", value: result.metrics.lcp, desc: "Visual stability" },
              { label: "Total Blocking Time", value: result.metrics.tbt, desc: "Interactivity" },
              { label: "Cumulative Layout Shift", value: result.metrics.cls, desc: "Visual stability" },
              { label: "First Contentful Paint", value: result.metrics.fcp, desc: "First byte" },
              { label: "Speed Index", value: result.metrics.speedIndex, desc: "Loading speed" },
            ].map((metric, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors">
                <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">{metric.label}</p>
                <p className="text-xl font-bold text-emerald-400">{metric.value}</p>
                <p className="text-slate-600 text-[10px] mt-1">{metric.desc}</p>
              </div>
            ))}
          </div>

          {/* Detailed Audits */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-200 ml-1">Key Findings</h4>
            <div className="grid gap-3">
              {result.details.map((detail, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${detail.score >= 0.9 ? 'bg-emerald-500' : detail.score >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">{detail.title}</h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{detail.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
