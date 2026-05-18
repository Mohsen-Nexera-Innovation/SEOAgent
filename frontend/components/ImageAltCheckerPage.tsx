"use client";

import { useState } from "react";
import axios from "axios";

interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
  keywordMatch: boolean;
  isGenerating?: boolean;
}

interface ImageResult {
  images: ImageItem[];
  summary: {
    total: number;
    missingAltCount: number;
    keywordMatchCount: number;
    score: number;
  };
}

export const ImageAltCheckerPage = () => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/onpage/image-check", { 
        url,
        targetKeyword: keyword 
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to analyze images. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAlt = async (index: number) => {
    if (!result) return;
    const newImages = [...result.images];
    const img = newImages[index];
    
    img.isGenerating = true;
    setResult({ ...result, images: newImages });

    try {
      const res = await axios.post("http://localhost:4000/api/onpage/smart-alt", {
        imageUrl: img.src,
        targetKeyword: keyword
      });
      img.alt = res.data.alt;
      img.hasAlt = true;
      img.keywordMatch = keyword ? res.data.alt.toLowerCase().includes(keyword.toLowerCase()) : false;
    } catch (err) {
      console.error("Failed to generate alt:", err);
    } finally {
      img.isGenerating = false;
      setResult({ ...result, images: newImages });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Input Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="URL (e.g., https://example.com/gallery)"
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
            {loading ? "Analyzing..." : "Check Images"}
          </button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">Scanning images and checking Alt attributes...</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Total Images</p>
              <p className="text-2xl font-bold text-white">{result.summary.total}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Missing Alts</p>
              <p className={`text-2xl font-bold ${result.summary.missingAltCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {result.summary.missingAltCount}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Keyword Match</p>
              <p className="text-2xl font-bold text-white">{result.summary.keywordMatchCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Image SEO Score</p>
              <p className={`text-2xl font-bold ${result.summary.score > 70 ? "text-emerald-400" : "text-amber-400"}`}>
                {result.summary.score}%
              </p>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.images.map((img, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all flex flex-col">
                <div className="h-48 overflow-hidden bg-slate-950 relative">
                  <img src={img.src} alt="" className="w-full h-full object-contain p-2" />
                  {!img.hasAlt && (
                    <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                      MISSING ALT
                    </div>
                  )}
                  {img.keywordMatch && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                      KEYWORD MATCH
                    </div>
                  )}
                </div>
                
                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Current Alt Text</p>
                    <p className={`text-sm ${img.hasAlt ? "text-slate-300" : "text-slate-600 italic"}`}>
                      {img.hasAlt ? img.alt : "No alt text provided."}
                    </p>
                  </div>

                  <div className="pt-4 mt-auto border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 truncate max-w-[150px]">{img.src}</span>
                    <button
                      onClick={() => handleGenerateAlt(i)}
                      disabled={img.isGenerating}
                      className="bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {img.isGenerating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          AI Generating...
                        </>
                      ) : (
                        <>✨ Smart Alt</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
