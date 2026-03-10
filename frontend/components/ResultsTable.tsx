import type { KeywordRow } from "../context/SeoContext";

interface ResultsTableProps {
  data: KeywordRow[];
}

export function ResultsTable({ data }: ResultsTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-medium">Keyword Clusters</h2>
      <div className="max-h-80 overflow-auto rounded-md border border-slate-800">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-950 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">Keyword</th>
              <th className="px-3 py-2">Cluster</th>
              <th className="px-3 py-2">Intent</th>
              <th className="px-3 py-2">Competition</th>
              <th className="px-3 py-2">Volume</th>
              <th className="px-3 py-2">KD</th>
              <th className="px-3 py-2">CPC</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                  Run keyword research to see results.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.keyword + row.cluster + index}
                  className="border-t border-slate-800 odd:bg-slate-950/40"
                >
                  <td className="px-3 py-2">{row.keyword}</td>
                  <td className="px-3 py-2">{row.cluster}</td>
                  <td className="px-3 py-2 capitalize">{row.intent}</td>
                  <td className="px-3 py-2 capitalize">{row.competition}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {row.searchVolume != null ? row.searchVolume.toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {row.keywordDifficulty != null ? row.keywordDifficulty : "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
