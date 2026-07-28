"use client";

import { useState } from "react";
import { signIn, signUp, resendConfirmation, saveProgressToServer } from "@/app/actions/auth";
import { loadProgress } from "@/lib/progress";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  mode: "login" | "signup";
  onClose: () => void;
}

export function AuthModal({ mode: initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { refresh } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess("Check your email to confirm your account.");
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }

        const progress = loadProgress();
        const hasProgress = progress.xp > 0 || Object.keys(progress.answeredSlugs).length > 0;
        if (hasProgress) {
          await saveProgressToServer(JSON.stringify(progress));
        }

        await refresh();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-lg font-bold text-fg">
            {mode === "login" ? "// log_in" : "// sign_up"}
          </h2>
          <button onClick={onClose} className="font-mono text-lg text-fg-muted hover:text-fg">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-fg-muted">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg-muted"
              placeholder="dev@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-fg-muted">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 font-mono text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg-muted"
              placeholder="min. 6 characters"
            />
          </div>

          {error && <p className="font-mono text-xs text-red-500">{error}</p>}
          {success && (
            <div className="space-y-2">
              <p className="font-mono text-xs text-emerald-500">{success}</p>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  const result = await resendConfirmation(email);
                  setLoading(false);
                  if (result.error) {
                    setError(result.error);
                  } else {
                    setSuccess("Confirmation email resent. Check your inbox.");
                  }
                }}
                disabled={loading}
                className="font-mono text-xs text-emerald-500 underline hover:text-emerald-400 disabled:opacity-50"
              >
                {">"} resend confirmation email
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 font-mono text-sm font-bold text-white transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "> log_in" : "> sign_up"}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-xs text-fg-muted">
          {mode === "login" ? "No account? " : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setSuccess(null);
            }}
            className="font-bold text-emerald-500 hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
