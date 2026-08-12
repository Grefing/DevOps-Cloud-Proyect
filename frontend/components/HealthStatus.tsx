"use client";

import { HealthResponse } from "@/lib/types";

interface HealthStatusProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
}

export function HealthStatus({ health, loading, error }: HealthStatusProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
        Checking API…
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        API unreachable
      </div>
    );
  }

  const apiOk = health.status === "ok";
  const dbOk = health.database === "connected";

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${apiOk ? "bg-emerald-400" : "bg-amber-400"}`}
        />
        <span className="text-slate-300">
          API: <span className="font-medium text-white">{health.status}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${dbOk ? "bg-emerald-400" : "bg-red-400"}`}
        />
        <span className="text-slate-300">
          DB: <span className="font-medium text-white">{health.database}</span>
        </span>
      </div>
      <span className="text-slate-500">
        Uptime: {health.uptime_seconds}s
      </span>
    </div>
  );
}
