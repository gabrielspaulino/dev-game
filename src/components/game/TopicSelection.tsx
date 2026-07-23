"use client";

import { useState } from "react";
import { STUDY_TRACKS } from "@/lib/daily-quiz-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon } from "@/components/Icons";

interface TopicSelectionProps {
  onSelect: (trackId: string) => void;
}

export function TopicSelection({ onSelect }: TopicSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-2 text-center font-mono text-2xl text-emerald-500">&gt;_</div>
        <h1 className="mb-2 text-center text-3xl font-black text-fg">Choose your stack</h1>
        <p className="mb-8 text-center font-mono text-sm text-fg-muted">
          Pick a track. A fresh challenge drops every day.
        </p>

        <div className="space-y-3">
          {STUDY_TRACKS.map((track) => {
            const isSelected = selectedId === track.id;
            return (
              <button
                key={track.id}
                onClick={() => setSelectedId(track.id)}
                className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? `${track.borderClass} bg-surface-raised ring-2 ring-offset-2 ring-offset-surface ${track.borderClass.replace("border-", "ring-")}`
                    : "border-line-strong bg-surface-raised hover:border-fg-muted"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon name={track.icon} className="h-9 w-9 text-fg-secondary" />
                  <div className="flex-1">
                    <div
                      className={`text-lg font-bold ${
                        isSelected ? "text-fg" : "text-fg-secondary"
                      }`}
                    >
                      {track.title}
                    </div>
                    <div className="text-sm text-fg-muted">{track.description}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? `${track.borderClass} ${track.bgClass}` : "border-fg-faint"
                    }`}
                  >
                    {isSelected && <span className="text-xs text-white">✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          disabled={!selectedId}
          onClick={() => selectedId && onSelect(selectedId)}
          className={`mt-8 w-full rounded-2xl py-4 font-mono text-lg font-bold transition-all active:scale-[0.98] ${
            selectedId
              ? "bg-emerald-500 text-white shadow-lg hover:bg-emerald-400"
              : "cursor-not-allowed bg-surface-inset text-fg-faint"
          }`}
        >
          {selectedId ? "> run --start" : "> select a track"}
        </button>
      </div>
    </div>
  );
}
