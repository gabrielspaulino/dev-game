"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <div className="font-mono text-4xl text-red-500">!</div>
      <h1 className="mt-4 font-mono text-xl font-bold text-fg">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        The server ran into an issue. This is usually temporary.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-2xl bg-emerald-500 px-8 py-3 font-mono text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
      >
        {"> retry"}
      </button>
    </div>
  );
}
