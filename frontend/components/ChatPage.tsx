"use client";

import { ChatUI } from "./ChatUI";
import { ExportButton } from "./ExportButton";
import { ResultsTable } from "./ResultsTable";
import { CompetitorTable } from "./CompetitorTable";
import { ContentPlanTable } from "./ContentPlanTable";
import { useSeo } from "../context/SeoContext";

export function ChatPage() {
  const { keywordRows, competitorRows, contentPlan } = useSeo();

  const hasResults = keywordRows.length > 0 || competitorRows.length > 0 || contentPlan.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Chat input at the top */}
      <ChatUI />

      {/* Results tables appear inline after agent responds */}
      {hasResults && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-200">Analysis Results</h3>
            <ExportButton />
          </div>

          {keywordRows.length > 0 && <ResultsTable data={keywordRows} />}
          {competitorRows.length > 0 && <CompetitorTable data={competitorRows} />}
          {contentPlan.length > 0 && <ContentPlanTable data={contentPlan} />}
        </div>
      )}
    </div>
  );
}
