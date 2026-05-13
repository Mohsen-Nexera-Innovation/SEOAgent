"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { KeywordPage } from "../components/KeywordPage";
import { ChatPage } from "../components/ChatPage";
import { LinkAnalysisPage } from "../components/LinkAnalysisPage";
import { SiteAuditPage } from "../components/SiteAuditPage";
import { BrokenLinksPage } from "../components/BrokenLinksPage";
import { SchemaCheckerPage } from "../components/SchemaCheckerPage";
import { IndexingToolsPage } from "../components/IndexingToolsPage";
import { MetaOptimizerPage } from "../components/MetaOptimizerPage";
import { HeaderCheckerPage } from "../components/HeaderCheckerPage";
import { ImageAltCheckerPage } from "../components/ImageAltCheckerPage";
import { ContentGeneratorPage } from "../components/ContentGeneratorPage";

type Page = "keywords" | "chat" | "link-analysis" | "site-audit" | "broken-links" | "schema-checker" | "indexing-tools" | "meta-optimizer" | "content-generator" | "header-checker" | "image-checker";

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  keywords: { title: "Keyword Research", subtitle: "Discover keyword clusters, analyze competition, and build a content strategy." },
  chat: { title: "Chat with AI SEO", subtitle: "Ask the SEO agent to analyze any topic, and get instant keyword insights." },
  "link-analysis": { title: "Link Keywords Analysis", subtitle: "Enter a URL and get a full keyword breakdown of that website's content." },
  "site-audit": { title: "Site Audit", subtitle: "Analyze site performance, Core Web Vitals, and technical health." },
  "broken-links": { title: "Broken Links Checker", subtitle: "Scan any page to find broken or valid internal and external links." },
  "schema-checker": { title: "Schema Markup Checker", subtitle: "Extract and validate JSON-LD structured data with AI insights." },
  "indexing-tools": { title: "Indexing Tools", subtitle: "Generate and validate sitemaps and robots.txt files for better search visibility." },
  "meta-optimizer": { title: "Meta Tags Optimizer", subtitle: "Audit your current meta tags and generate AI-optimized titles and descriptions." },
  "header-checker": { title: "Header Structure Checker", subtitle: "Review the correct usage and hierarchy of H1-H6 headings." },
  "image-checker": { title: "Image Alt Checker", subtitle: "Ensure images have descriptive alt text and generate missing alts with AI." },
  "content-generator": { title: "AI Content Generator", subtitle: "Generate high-quality, SEO-optimized content clusters and articles." },
};

export default function HomePage() {
  const [activePage, setActivePage] = useState<Page>("keywords");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { title, subtitle } = pageTitles[activePage];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Main content area — shifts right when sidebar is open */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-60" : "ml-0"
          }`}
      >
        {/* Top header with AI Avatar */}
        <header className="relative flex items-center gap-5 px-8 py-6 border-b border-slate-800 overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
            <div className="absolute top-2 right-32 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Content */}
          <div className="flex-1 relative pl-10">
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                AI SEO Agent
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Keyword research, competitor analysis, and content planning — powered by <a href="https://reksols.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-medium">Reksols</a>.
            </p>
          </div>

          {/* AI Avatar */}
          <div className="relative flex-shrink-0">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-30 blur-md animate-pulse" />
            {/* Avatar circle */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              {/* AI Brain SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            {/* Rotating ring */}
            <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-emerald-500/30 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
        </header>

        {/* Page title bar */}
        <div className="px-8 py-4 border-b border-slate-800/60">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Page content */}
        <div className="flex-1 px-8 py-6">
          {activePage === "keywords" && <KeywordPage />}
          {activePage === "chat" && <ChatPage />}
          {activePage === "link-analysis" && <LinkAnalysisPage />}
          {activePage === "site-audit" && <SiteAuditPage />}
          {activePage === "broken-links" && <BrokenLinksPage />}
          {activePage === "schema-checker" && <SchemaCheckerPage />}
          {activePage === "indexing-tools" && <IndexingToolsPage />}
          {activePage === "meta-optimizer" && <MetaOptimizerPage />}
          {activePage === "header-checker" && <HeaderCheckerPage />}
          {activePage === "image-checker" && <ImageAltCheckerPage />}
          {activePage === "content-generator" && <ContentGeneratorPage />}
        </div>
      </main>
    </div>
  );
}
