"use client";

import { useState } from "react";

type Page = "keywords" | "chat" | "link-analysis" | "site-audit" | "broken-links" | "schema-checker" | "indexing-tools" | "meta-optimizer" | "content-generator" | "header-checker" | "image-checker";

interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onToggle: () => void;
}

const categories: NavCategory[] = [
  {
    id: "keyword-research",
    label: "Keyword Research",
    icon: "🔑",
    items: [
      { id: "keywords", label: "Overview", icon: "📊" },
      { id: "chat", label: "AI SEO Chat", icon: "💬" },
      { id: "link-analysis", label: "Link Analysis", icon: "🔗" },
    ],
  },
  {
    id: "technical-seo",
    label: "Technical SEO",
    icon: "⚙️",
    items: [
      { id: "site-audit", label: "Site Audit", icon: "🔍" },
      { id: "broken-links", label: "Broken Links", icon: "🔗" },
      { id: "schema-checker", label: "Schema Checker", icon: "🧩" },
      { id: "indexing-tools", label: "Indexing Tools", icon: "🗂️" },
    ],
  },
  {
    id: "onpage",
    label: "On-Page SEO",
    icon: "📄",
    items: [
      { id: "meta-optimizer", label: "Meta Tags Optimizer", icon: "🏷️" },
      { id: "header-checker", label: "Header Structure", icon: "📑" },
      { id: "image-checker", label: "Image Alt Checker", icon: "🖼️" },
      { id: "content-generator", label: "Content Generator", icon: "✍️" },
    ],
  },
];

export function Sidebar({ activePage, onNavigate, open, onToggle }: SidebarProps) {
  const [expandedCats, setExpandedCats] = useState<string[]>(["keyword-research", "technical-seo", "onpage"]);

  const toggleCategory = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out ${open ? "w-64" : "w-0 overflow-hidden"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-900/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0 shadow-lg shadow-emerald-500/20">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white whitespace-nowrap leading-none">Reksols SEO</span>
            <span className="text-[10px] text-emerald-400 font-medium tracking-widest mt-1">AGENT v1.0</span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          {categories.map((category) => {
            const isExpanded = expandedCats.includes(category.id);
            return (
              <div key={category.id} className="space-y-2">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <span className="opacity-70">{category.icon}</span>
                    {category.label}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150 whitespace-nowrap ${activePage === item.id
                          ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                          : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                          }`}
                      >
                        <span className="text-base opacity-80">{item.icon}</span>
                        {item.label}
                        {activePage === item.id && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-slate-900/50 bg-slate-950/50">
          <a
            href="https://reksols.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group transition-opacity"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-500 group-hover:text-emerald-400 transition-colors font-medium">
              Powered by Reksols
            </span>
          </a>
        </div>
      </aside>

      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        className={`fixed top-8 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-300 shadow-2xl ${open ? "left-[13.5rem]" : "left-6"
          }`}
        aria-label="Toggle sidebar"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </>
  );
}
