"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createService,
  deleteService,
  getHealth,
  getServices,
  updateServiceStatus,
} from "@/lib/api";
import { CreateServiceInput, HealthResponse, Service, ServiceStatus } from "@/lib/types";
import { HealthStatus } from "@/components/HealthStatus";
import { ServiceForm } from "@/components/ServiceForm";
import { ServiceList } from "@/components/ServiceList";

export function OpsWatchDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      setServicesError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      setHealth(null);
      setHealthError(err instanceof Error ? err.message : "Failed to reach API");
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadServices();
    loadHealth();

    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, [loadServices, loadHealth]);

  async function handleCreate(input: CreateServiceInput) {
    const created = await createService(input);
    setServices((prev) => [...prev, created]);
  }

  async function handleStatusChange(id: number, status: ServiceStatus) {
    const updated = await updateServiceStatus(id, status);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );
  }

  async function handleDelete(id: number) {
    await deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-slate-700/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-500">
              DevOps · Monitoring
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              OpsWatch
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-md">
              Service health dashboard — monitor endpoints and track status across your stack.
            </p>
          </div>
          <HealthStatus
            health={health}
            loading={healthLoading}
            error={healthError}
          />
        </div>
      </header>

      {servicesError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {servicesError}
          <button
            type="button"
            onClick={loadServices}
            className="ml-3 underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <ServiceForm onSubmit={handleCreate} />
        <ServiceList
          services={services}
          loading={servicesLoading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
