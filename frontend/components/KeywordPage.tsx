"use client";

import { KeywordInput } from "./KeywordInput";
import { ResultsTable } from "./ResultsTable";
import { CompetitorTable } from "./CompetitorTable";
import { ContentPlanTable } from "./ContentPlanTable";
import { ExportButton } from "./ExportButton";
import { useSeo } from "../context/SeoContext";

export function KeywordPage() {
  const { keywordRows, competitorRows, contentPlan } = useSeo();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-start">
        <KeywordInput />
        <ExportButton />
      </div>

      {keywordRows.length > 0 && <ResultsTable data={keywordRows} />}
      {competitorRows.length > 0 && <CompetitorTable data={competitorRows} />}
      {contentPlan.length > 0 && <ContentPlanTable data={contentPlan} />}
    </div>
  );
}
