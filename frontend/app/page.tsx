"use client";

import { ChatUI } from "../components/ChatUI";
import { KeywordInput } from "../components/KeywordInput";
import { ResultsTable } from "../components/ResultsTable";
import { CompetitorTable } from "../components/CompetitorTable";
import { ContentPlanTable } from "../components/ContentPlanTable";
import { ExportButton } from "../components/ExportButton";
import { useSeo } from "../context/SeoContext";

export default function HomePage() {
  const { keywordRows, competitorRows, contentPlan } = useSeo();

  return (
    <main className="min-h-screen p-6 flex flex-col gap-6 bg-slate-950 text-slate-100">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">AI SEO Agent</h1>
        <p className="text-sm text-slate-400">
          Keyword research, competitor analysis, and content planning — powered by AI.
        </p>
      </header>

      {/* Top controls row — always visible, never grows */}
      <section className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-start">
        <KeywordInput />
        <ChatUI />
        <ExportButton />
      </section>

      {/* Results sections — appear below controls as data loads */}
      {keywordRows.length > 0 && (
        <section>
          <ResultsTable data={keywordRows} />
        </section>
      )}

      {competitorRows.length > 0 && (
        <section>
          <CompetitorTable data={competitorRows} />
        </section>
      )}

      {contentPlan.length > 0 && (
        <section>
          <ContentPlanTable data={contentPlan} />
        </section>
      )}
    </main>
  );
}
