"use client";

import { useState } from "react";
import { ShareIcon, CheckCircleIcon } from "@/components/Icons";

interface ShareResultProps {
  correctCount: number;
  totalQuestions: number;
  trackTitle: string;
  streak: number;
}

function buildShareText({ correctCount, totalQuestions, trackTitle, streak }: ShareResultProps) {
  const score = `${correctCount}/${totalQuestions}`;
  const emoji = correctCount === totalQuestions ? "🏆" : correctCount >= 7 ? "🔥" : "💪";
  return `${emoji} I just scored ${score} on ${trackTitle} in LearningStack!${streak > 1 ? ` ${streak}-day streak!` : ""}\n\nhttps://learningstack.dev`;
}

export function ShareResult(props: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(props);
  const encoded = encodeURIComponent(text);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-xs font-bold text-fg transition-all hover:border-fg-muted active:scale-95"
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-xs font-bold text-fg transition-all hover:border-fg-muted active:scale-95"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://learningstack.dev")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-xs font-bold text-fg transition-all hover:border-fg-muted active:scale-95"
      >
        LinkedIn
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-xs font-bold text-fg transition-all hover:border-fg-muted active:scale-95"
      >
        {copied ? (
          <>
            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
            Copied
          </>
        ) : (
          <>
            <ShareIcon className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
