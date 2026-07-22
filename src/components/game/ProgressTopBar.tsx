"use client";

import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/progress";
import { TopBar } from "./TopBar";
import type { UserProgress } from "@/lib/types";
import { DEFAULT_PROGRESS } from "@/lib/progress";

export function ProgressTopBar() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return <TopBar progress={progress} />;
}
