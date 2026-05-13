"use client";

import { useState } from "react";
import axios from "axios";

export const IndexingToolsPage = () => {
  const [activeTab, setActiveTab] = useState<"sitemap" | "robots">("sitemap");
  
  // Robots State
  const [robotsUrl, setRobotsUrl] = useState("");
  const [robotsDesc, setRobotsDesc] = useState("");
  const [robotsResult, setRobotsResult] = useState<any>(null);
  const [robotsLoading, setRobotsLoading] = useState(false);
  
  // Sitemap State
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [sitemapResult, setSitemapResult] = useState<any>(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);

  const handleRobotsCheck = async () => {
    setRobotsLoading(true);
    setRobotsResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/robots-check", { url: robotsUrl });
      setRobotsResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to check robots.txt");
    } finally {
      setRobotsLoading(false);
    }
  };

  const handleRobotsGenerate = async () => {
    setRobotsLoading(true);
    setRobotsResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/robots-generate", { siteDescription: robotsDesc });
      setRobotsResult({ content: res.data.generatedContent, analysis: res.data.explanation, isGenerated: true });
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to generate robots.txt");
    } finally {
      setRobotsLoading(false);
    }
  };

  const handleSitemapGenerate = async () => {
    setSitemapLoading(true);
    setSitemapResult(null);
    try {
      const res = await axios.post("http://localhost:4000/api/sitemap-generate", { url: sitemapUrl });
      setSitemapResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to generate sitemap");
    } finally {
      setSitemapLoading(false);
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Tabs Navigation */}
      <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("sitemap")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "sitemap" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
          }`}
        >
          Sitemap Generator
        </button>
        <button
          onClick={() => setActiveTab("robots")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "robots" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
          }`}
        >
          Robots.txt Tools
        </button>
      </div>

      {activeTab === "sitemap" && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Generate XML Sitemap</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="https://example.com"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <button
                onClick={handleSitemapGenerate}
                disabled={sitemapLoading || !sitemapUrl}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {sitemapLoading ? "Crawling..." : "Crawl & Generate"}
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-3 italic">
              Note: This will crawl up to 50 internal pages to build your sitemap.
            </p>
          </div>

          {sitemapResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="text-emerald-400 text-sm font-bold">Generated Sitemap ({sitemapResult.pagesCount} URLs)</span>
                <button
                  onClick={() => downloadFile(sitemapResult.xml, "sitemap.xml", "text/xml")}
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-white px-4 py-2 rounded-lg transition-all"
                >
                  Download .xml
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                <pre className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  {sitemapResult.xml}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "robots" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Validator */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white">Robots.txt Validator</h3>
              <input
                type="text"
                placeholder="Enter Site URL"
                value={robotsUrl}
                onChange={(e) => setRobotsUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={handleRobotsCheck}
                disabled={robotsLoading || !robotsUrl}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                Fetch & Analyze
              </button>
            </div>

            {/* Generator */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white">AI Robots Generator</h3>
              <textarea
                placeholder="Describe your site (e.g., E-commerce site, hide /cart and /admin)..."
                value={robotsDesc}
                onChange={(e) => setRobotsDesc(e.target.value)}
                className="w-full h-[95px] bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
              <button
                onClick={handleRobotsGenerate}
                disabled={robotsLoading || !robotsDesc}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                Generate with AI
              </button>
            </div>
          </div>

          {robotsResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="text-emerald-400 text-sm font-bold">Robots.txt Result</span>
                <button
                  onClick={() => downloadFile(robotsResult.content || robotsResult.generatedContent, "robots.txt", "text/plain")}
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-white px-4 py-2 rounded-lg transition-all"
                >
                  Download .txt
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-4 border-r border-slate-800 bg-slate-950">
                  <pre className="text-xs text-slate-300 font-mono h-[300px] overflow-y-auto">
                    {robotsResult.content || robotsResult.generatedContent}
                  </pre>
                </div>
                <div className="p-6 space-y-4 bg-slate-900/30">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">AI Analysis / Explanation</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{robotsResult.analysis}</p>
                  {robotsResult.risks?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-rose-400">Potential Risks:</p>
                      <ul className="text-xs text-slate-500 space-y-1">
                        {robotsResult.risks.map((r: string, i: number) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
