"use client";

import { useState } from "react";
import { STUDY_TRACKS } from "@/lib/daily-quiz-data";

interface TopicSelectionProps {
  onSelect: (trackId: string) => void;
}

export function TopicSelection({ onSelect }: TopicSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-2 text-center text-4xl">🎯</div>
        <h1 className="mb-2 text-center text-3xl font-black text-white">
          What do you want to study?
        </h1>
        <p className="mb-8 text-center text-slate-400">
          Pick a track and get a fresh quiz every day. You can change anytime.
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
                    ? `${track.borderClass} bg-slate-800 ring-2 ring-offset-2 ring-offset-slate-900 ${track.borderClass.replace("border-", "ring-")}`
                    : "border-slate-700 bg-slate-800 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{track.icon}</span>
                  <div className="flex-1">
                    <div
                      className={`text-lg font-bold ${
                        isSelected ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {track.title}
                    </div>
                    <div className="text-sm text-slate-400">{track.description}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? `${track.borderClass} ${track.bgClass}` : "border-slate-600"
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
          className={`mt-8 w-full rounded-2xl py-4 text-lg font-bold transition-all active:scale-[0.98] ${
            selectedId
              ? "bg-emerald-500 text-white shadow-lg hover:bg-emerald-400"
              : "cursor-not-allowed bg-slate-700 text-slate-500"
          }`}
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
