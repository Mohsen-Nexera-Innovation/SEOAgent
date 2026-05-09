"use client";

import { useState } from "react";

type Page = "keywords" | "chat" | "link-analysis";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onToggle: () => void;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "keywords", label: "Keywords", icon: "🔑" },
  { id: "chat", label: "Chat with AI SEO", icon: "💬" },
  { id: "link-analysis", label: "Link Analysis", icon: "🔗" },
];

export function Sidebar({ activePage, onNavigate, open, onToggle }: SidebarProps) {
  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${open ? "w-60" : "w-0 overflow-hidden"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-sm flex-shrink-0">
            R
          </div>
          <span className="text-sm font-semibold text-white whitespace-nowrap">Reksols SEO</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 whitespace-nowrap ${activePage === item.id
                ? "bg-emerald-500/15 text-emerald-400 font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800">
          <a
            href="https://reksols.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-600 hover:text-emerald-400 whitespace-nowrap transition-colors"
          >
            Powered by Reksols
          </a>
        </div>
      </aside>

      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        className={`fixed top-5 z-40 flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-300  ${open ? "left-[12rem]" : "left-4"
          }`}
        aria-label="Toggle sidebar"
      >
        {open ? (
          // X icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </>
  );
}
