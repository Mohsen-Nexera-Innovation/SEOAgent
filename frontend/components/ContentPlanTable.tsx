import type { ContentPlanItem } from "../context/SeoContext";

interface ContentPlanTableProps {
    data: ContentPlanItem[];
}

export function ContentPlanTable({ data }: ContentPlanTableProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-medium">Content Roadmap</h2>
            {data.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                    Run keyword research or chat to generate a content roadmap.
                </p>
            ) : (
                <div className="space-y-4 max-h-96 overflow-auto">
                    {data.map((item, i) => (
                        <div key={item.pillarPage + i} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] uppercase tracking-wide text-emerald-400 font-semibold">Pillar Page</span>
                            </div>
                            <p className="text-sm font-medium mb-2">{item.pillarPage}</p>

                            <div className="mb-2">
                                <span className="text-[10px] uppercase tracking-wide text-slate-400">Target Keywords</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(item.targetKeywords || []).map((kw: any) => (
                                        <span key={typeof kw === 'string' ? kw : kw.keyword} className="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[11px]">
                                            {typeof kw === 'string' ? kw : kw.keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] uppercase tracking-wide text-slate-400">Supporting Articles</span>
                                <ul className="mt-1 space-y-0.5">
                                    {item.supportingArticles.map((article) => (
                                        <li key={article} className="text-xs text-slate-300 before:content-['›'] before:mr-1 before:text-slate-500">
                                            {article}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
