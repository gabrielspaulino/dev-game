"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserProgress } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { loadProgress, saveProgress, mergeProgress, DEFAULT_PROGRESS } from "@/lib/progress";
import { loadProgressFromServer, saveProgressToServer } from "@/app/actions/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  progress: UserProgress | null;
  refreshProgress: () => Promise<UserProgress>;
  syncProgress: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  progress: null,
  refreshProgress: async () => DEFAULT_PROGRESS,
  syncProgress: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const progressLoaded = useRef(false);

  const loadCachedProgress = useCallback(
    async (currentUser: User | null): Promise<UserProgress> => {
      const local = loadProgress();

      if (currentUser) {
        const { data } = await loadProgressFromServer();
        if (data) {
          const server = { ...DEFAULT_PROGRESS, ...data } as UserProgress;
          const merged = mergeProgress(local, server);
          saveProgress(merged);
          saveProgressToServer(JSON.stringify(merged));
          setProgress(merged);
          return merged;
        }
        if (local.xp > 0 || Object.keys(local.answeredSlugs).length > 0) {
          saveProgressToServer(JSON.stringify(local));
        }
      }

      setProgress(local);
      return local;
    },
    [],
  );

  const refreshProgress = useCallback(async () => {
    return loadCachedProgress(user);
  }, [user, loadCachedProgress]);

  const syncProgress = useCallback(() => {
    const current = loadProgress();
    setProgress(current);
    if (user) {
      saveProgressToServer(JSON.stringify(current));
    }
  }, [user]);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();
    setUser(freshUser);
    setLoading(false);
    await loadCachedProgress(freshUser);
  }, [loadCachedProgress]);

  useEffect(() => {
    refresh();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (!loading && !progressLoaded.current) {
      progressLoaded.current = true;
      loadCachedProgress(user);
    }
  }, [loading, user, loadCachedProgress]);

  return (
    <AuthContext.Provider
      value={{ user, loading, progress, refreshProgress, syncProgress, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
