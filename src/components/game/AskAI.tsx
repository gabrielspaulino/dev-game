"use client";

import { useState, useRef } from "react";

interface AskAIProps {
  context: {
    prompt: string;
    code?: string;
    explanation: string;
    userAnswer: string;
    correctAnswer: string;
    wasCorrect: boolean;
  };
}

export function AskAI({ context }: AskAIProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/v1/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setAnswer(data.answer);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleAsk();
    }
  }

  return (
    <div className="mt-4 w-full rounded-xl border border-line bg-surface-raised p-3">
      <p className="mb-2 font-mono text-xs font-bold text-fg-muted">{"// ask_ai"}</p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask anything about this question..."
          maxLength={500}
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg-muted disabled:opacity-50"
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || isLoading}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "..." : ">"}
        </button>
      </div>

      {error && <p className="mt-2 font-mono text-xs text-red-500">{error}</p>}

      {answer && (
        <div className="mt-3 rounded-lg border border-line bg-surface p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-secondary">{answer}</p>
        </div>
      )}
    </div>
  );
}
