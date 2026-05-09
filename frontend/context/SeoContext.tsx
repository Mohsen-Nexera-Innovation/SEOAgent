"use client";

import React, { createContext, useContext, useState } from "react";

export interface KeywordRow {
    keyword: string;
    cluster: string;
    intent: string;
    competition: string;
    searchVolume?: number;
    keywordDifficulty?: number;
    cpc?: number;
}

export interface CompetitorRow {
    keyword: string;
    competitor: string;
    url: string;
    contentLength: number;
    hasSchema: boolean;
}

export interface ContentPlanItem {
    pillarPage: string;
    supportingArticles: string[];
    targetKeywords: string[];
}

export interface AnalysisCategory {
    analysis: string;
    pros: string[];
    cons: string[];
    enhancements: string[];
}

export interface SiteAnalysis {
    seo: AnalysisCategory;
    content: AnalysisCategory;
    performance: AnalysisCategory;
}

export interface LinkKeywordRow {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
}

interface SeoContextValue {
    keywords: string[];
    setKeywords: (kw: string[]) => void;
    keywordRows: KeywordRow[];
    setKeywordRows: (rows: KeywordRow[]) => void;
    competitorRows: CompetitorRow[];
    setCompetitorRows: (rows: CompetitorRow[]) => void;
    contentPlan: ContentPlanItem[];
    setContentPlan: (plan: ContentPlanItem[]) => void;
    linkAnalysisRows: LinkKeywordRow[];
    setLinkAnalysisRows: (rows: LinkKeywordRow[]) => void;
    linkAnalysisDetails: SiteAnalysis | null;
    setLinkAnalysisDetails: (details: SiteAnalysis | null) => void;
}

const SeoContext = createContext<SeoContextValue | null>(null);

export function SeoProvider({ children }: { children: React.ReactNode }) {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordRows, setKeywordRows] = useState<KeywordRow[]>([]);
    const [competitorRows, setCompetitorRows] = useState<CompetitorRow[]>([]);
    const [contentPlan, setContentPlan] = useState<ContentPlanItem[]>([]);
    const [linkAnalysisRows, setLinkAnalysisRows] = useState<LinkKeywordRow[]>([]);
    const [linkAnalysisDetails, setLinkAnalysisDetails] = useState<SiteAnalysis | null>(null);

    return (
        <SeoContext.Provider
            value={{
                keywords,
                setKeywords,
                keywordRows,
                setKeywordRows,
                competitorRows,
                setCompetitorRows,
                contentPlan,
                setContentPlan,
                linkAnalysisRows,
                setLinkAnalysisRows,
                linkAnalysisDetails,
                setLinkAnalysisDetails,
            }}
        >
            {children}
        </SeoContext.Provider>
    );
}

export function useSeo(): SeoContextValue {
    const ctx = useContext(SeoContext);
    if (!ctx) throw new Error("useSeo must be used inside <SeoProvider>");
    return ctx;
}
