"use client";

import { useState } from "react";
import { Service, ServiceStatus, STATUS_LABELS, VALID_STATUSES } from "@/lib/types";
import { StatusDot } from "@/components/StatusDot";

function statusStyles(status: ServiceStatus): string {
  switch (status) {
    case "healthy":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "down":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  onStatusChange: (id: number, status: ServiceStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function ServiceList({
  services,
  loading,
  onStatusChange,
  onDelete,
}: ServiceListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleStatusChange(id: number, status: ServiceStatus) {
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-8 text-center text-slate-400">
        Loading services…
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-8 text-center text-slate-400">
        No services yet. Add one using the form above.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 overflow-hidden shadow-lg shadow-black/20">
      <div className="border-b border-slate-700/80 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">
          Monitored services
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({services.length})
          </span>
        </h2>
      </div>

      <ul className="divide-y divide-slate-700/60">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/40 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusDot status={service.status} size="md" />
                <p className="font-medium text-white">{service.name}</p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles(service.status)}`}
                >
                  <StatusDot status={service.status} />
                  {STATUS_LABELS[service.status]}
                </span>
              </div>
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-sm text-cyan-400/90 hover:text-cyan-300 hover:underline"
              >
                {service.url}
              </a>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={service.status}
                disabled={updatingId === service.id}
                onChange={(e) =>
                  handleStatusChange(service.id, e.target.value as ServiceStatus)
                }
                className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              >
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              <button
                type="button"
                disabled={deletingId === service.id}
                onClick={() => handleDelete(service.id)}
                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {deletingId === service.id ? "…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
