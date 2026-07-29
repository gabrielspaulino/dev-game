"use client";

import { useState } from "react";
import { ShareIcon, CheckCircleIcon } from "@/components/Icons";
import { DIFFICULTY_LABELS } from "@/lib/types";
import type { DifficultyTier } from "@/lib/types";

interface ShareResultProps {
  correctCount: number;
  totalQuestions: number;
  trackTitle: string;
  difficulty: DifficultyTier;
  streak: number;
}

const APP_URL = "https://learningstackdev.vercel.app";

function buildShareText({
  correctCount,
  totalQuestions,
  trackTitle,
  difficulty,
  streak,
}: ShareResultProps) {
  const score = `${correctCount}/${totalQuestions}`;
  const label =
    correctCount === totalQuestions ? "Perfect" : correctCount >= 7 ? "Great" : "Scored";
  const level = DIFFICULTY_LABELS[difficulty];
  return `${label} ${score} on ${trackTitle} (${level}) in LearningStack!${streak > 1 ? ` ${streak}-day streak!` : ""}\n\n${APP_URL}`;
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
        href={`https://x.com/intent/post?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-xs font-bold text-fg transition-all hover:border-fg-muted active:scale-95"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`}
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
