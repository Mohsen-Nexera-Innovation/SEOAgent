"use client";

import { useState } from "react";
import { useSeo } from "../context/SeoContext";

interface ChatMessage {
  role: "user" | "agent";
  content: string;
}

interface StepStatus {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "error";
}

export function ChatUI() {
  const { setKeywordRows, setCompetitorRows, setContentPlan } = useSeo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<StepStatus[]>([]);

  const updateStep = (id: string, status: StepStatus["status"]) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const initialSteps: StepStatus[] = [
      { id: "keyword-research", label: "Keyword Research", status: "running" },
      { id: "competitor-analysis", label: "Competitor Analysis", status: "pending" },
      { id: "content-plan", label: "Content Plan", status: "pending" },
    ];
    setSteps(initialSteps);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        setSteps([]);
        setMessages([...nextMessages, { role: "agent", content: "Chat API failed. Please try again." }]);
        return;
      }

      const data = await res.json();

      // Update step states from response
      if (data?.steps) {
        data.steps.forEach((step: any) => updateStep(step.id, step.status === "completed" ? "completed" : "error"));
      }

      // Push structured data into shared context
      if (data?.data?.keywordResearch?.clusters) {
        const rows = data.data.keywordResearch.clusters.flatMap((cluster: any) =>
          cluster.keywords.map((kw: string) => ({
            keyword: kw,
            cluster: cluster.topic,
            intent: cluster.intent,
            competition: cluster.competition,
          }))
        );
        setKeywordRows(rows);
      }
      if (data?.data?.competitorAnalysis?.competitors) {
        setCompetitorRows(data.data.competitorAnalysis.competitors);
      }
      if (data?.data?.contentPlan?.roadmap) {
        setContentPlan(data.data.contentPlan.roadmap);
      }

      const summaryLines = data?.steps
        ?.map((s: any) => `• ${s.label ?? s.id}: ${s.status}${s.summary ? ` — ${s.summary}` : ""}`)
        .join("\n") ?? "";

      setMessages([
        ...nextMessages,
        {
          role: "agent",
          content: (data?.message as string) ?? "SEO workflow completed.\n" + summaryLines,
        },
      ]);
    } catch {
      setSteps([]);
      setMessages([...nextMessages, { role: "agent", content: "There was an error running the SEO workflow." }]);
    } finally {
      setLoading(false);
      // Fade out steps after a moment
      setTimeout(() => setSteps([]), 3000);
    }
  };

  const stepIcon = (status: StepStatus["status"]) => {
    if (status === "running") return <svg className="animate-spin h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
    if (status === "completed") return <span className="text-emerald-400 text-xs">✓</span>;
    if (status === "error") return <span className="text-red-400 text-xs">✗</span>;
    return <span className="text-slate-600 text-xs">○</span>;
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-2 text-lg font-medium">Chat with SEO Agent</h2>

      {/* Live step progress */}
      {steps.length > 0 && (
        <div className="mb-3 space-y-1 rounded-md bg-slate-950 p-3">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              {stepIcon(s.status)}
              <span className={s.status === "pending" ? "text-slate-500" : "text-slate-200"}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-md bg-slate-950 p-3 text-xs min-h-[140px]">
        {messages.length === 0 && (
          <p className="text-slate-500">
            Ask the agent to analyze SEO opportunities, e.g.{" "}
            <span className="italic">Analyze SEO for diabetes monitoring devices</span>.
          </p>
        )}
        {messages.map((msg, index) => (
          <div key={index} className="space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">
              {msg.role === "user" ? "You" : "Agent"}
            </div>
            <pre className="whitespace-pre-wrap rounded-md bg-slate-900 p-2">{msg.content}</pre>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Analyze SEO for diabetes monitoring devices"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {loading ? "Running..." : "Send"}
        </button>
      </div>
    </div>
  );
}
