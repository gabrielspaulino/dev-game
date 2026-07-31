"use client";

import { useState } from "react";
import { reportQuestion } from "@/app/actions/report";

const REASONS = [
  { value: "wrong_answer", label: "Wrong answer marked as correct" },
  { value: "poor_explanation", label: "Poor or unclear explanation" },
  { value: "ambiguous_question", label: "Ambiguous question" },
  { value: "other", label: "Other" },
];

interface ReportQuestionProps {
  questionSlug: string;
  userAnswer: string;
}

export function ReportQuestion({ questionSlug, userAnswer }: ReportQuestionProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!reason || loading) return;
    setLoading(true);
    await reportQuestion(questionSlug, reason, comment.trim() || null, userAnswer);
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-3 text-center font-mono text-xs text-fg-muted">
        Report submitted. Thank you!
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-center font-mono text-xs text-fg-faint transition-colors hover:text-fg-muted"
      >
        Report an issue with this question
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-line bg-surface-raised p-3">
      <p className="mb-2 font-mono text-xs font-bold text-fg-muted">{"// report_issue"}</p>
      <div className="space-y-2">
        {REASONS.map((r) => (
          <button
            key={r.value}
            onClick={() => setReason(r.value)}
            className={`w-full rounded-lg border px-3 py-2 text-left font-mono text-xs transition-all ${
              reason === r.value
                ? "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                : "border-line bg-surface text-fg-muted hover:border-fg-faint"
            }`}
          >
            {r.label}
          </button>
        ))}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Additional details (optional)..."
          maxLength={500}
          rows={2}
          className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs text-fg outline-none placeholder:text-fg-faint focus:border-fg-muted"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-lg border border-line py-2 font-mono text-xs text-fg-muted transition-all hover:bg-surface-inset"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className="flex-1 rounded-lg bg-amber-500 py-2 font-mono text-xs font-bold text-white transition-all hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "> submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
