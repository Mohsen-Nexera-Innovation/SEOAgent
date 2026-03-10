import type { CompetitorRow } from "../context/SeoContext";

interface CompetitorTableProps {
    data: CompetitorRow[];
}

export function CompetitorTable({ data }: CompetitorTableProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-medium">Competitor Analysis</h2>
            <div className="max-h-80 overflow-auto rounded-md border border-slate-800">
                <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-950 text-[11px] uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-3 py-2">Keyword</th>
                            <th className="px-3 py-2">Competitor</th>
                            <th className="px-3 py-2">URL</th>
                            <th className="px-3 py-2">Content Length</th>
                            <th className="px-3 py-2">Schema</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                                    Run keyword research or chat to see competitor data.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, i) => (
                                <tr key={row.keyword + row.competitor + i} className="border-t border-slate-800 odd:bg-slate-950/40">
                                    <td className="px-3 py-2">{row.keyword}</td>
                                    <td className="px-3 py-2">{row.competitor}</td>
                                    <td className="px-3 py-2 max-w-[200px] truncate">
                                        <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                                            {row.url}
                                        </a>
                                    </td>
                                    <td className="px-3 py-2">{row.contentLength.toLocaleString()} words</td>
                                    <td className="px-3 py-2">
                                        <span className={row.hasSchema ? "text-emerald-400" : "text-slate-500"}>
                                            {row.hasSchema ? "✓" : "✗"}
                                        </span>
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
