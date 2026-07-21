/**
 * Home page — Server Component.
 *
 * Fetches the health status from the API route and displays it.
 * Demonstrates that server-side functionality works end-to-end.
 *
 * Stage 0: Minimal page. Will be replaced with a proper landing page in later stages.
 */

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  version: string;
  timestamp: string;
  services: {
    database: "connected" | "disconnected" | "unknown";
  };
}

async function getHealthStatus(): Promise<HealthStatus | null> {
  try {
    // Use absolute URL for server-side fetch in Next.js
    const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as HealthStatus;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await getHealthStatus();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Logo / Brand */}
        <div className="space-y-2">
          <div className="text-6xl font-black tracking-tight text-indigo-400">
            &lt;dev<span className="text-emerald-400">game</span>&gt;
          </div>
          <p className="text-lg text-slate-400">
            Gamified learning for software developers — Stage 0 · Foundation
          </p>
        </div>

        {/* Health Status Card */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-left">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            System Status
          </h2>

          {health ? (
            <div className="space-y-3">
              <StatusRow
                label="API"
                value={health.status}
                ok={health.status === "ok"}
              />
              <StatusRow
                label="Database"
                value={health.services.database}
                ok={health.services.database === "connected"}
              />
              <div className="border-t border-slate-700 pt-3 text-xs text-slate-500">
                Version {health.version} · {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-400">
              ⚠ Could not reach the health endpoint.
            </p>
          )}
        </div>

        {/* Stage Info */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 text-left">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Implementation Roadmap
          </h2>
          <ul className="space-y-1.5 text-sm">
            <RoadmapItem stage="0" label="Foundation" done />
            <RoadmapItem stage="1" label="Identity &amp; Users" />
            <RoadmapItem stage="2" label="Learning Catalog" />
            <RoadmapItem stage="3" label="Daily Sessions" />
            <RoadmapItem stage="4" label="Gamification" />
            <RoadmapItem stage="5" label="Progress &amp; Learning Engine" />
            <RoadmapItem stage="6" label="Production Readiness" />
          </ul>
        </div>
      </div>
    </main>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          ok
            ? "bg-emerald-900/50 text-emerald-400"
            : "bg-red-900/50 text-red-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function RoadmapItem({
  stage,
  label,
  done = false,
}: {
  stage: string;
  label: string;
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-indigo-600 text-white"
            : "bg-slate-700 text-slate-500"
        }`}
      >
        {stage}
      </span>
      <span className={done ? "text-slate-200" : "text-slate-500"}>{label}</span>
      {done && (
        <span className="ml-auto text-xs text-emerald-400">✓ Current stage</span>
      )}
    </li>
  );
}
