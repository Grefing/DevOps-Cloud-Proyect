export type ServiceStatus = "healthy" | "down" | "unknown";

export interface Service {
  id: number;
  name: string;
  url: string;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInput {
  name: string;
  url: string;
  status?: ServiceStatus;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  uptime_seconds: number;
  timestamp: string;
}

export const VALID_STATUSES: ServiceStatus[] = ["healthy", "down", "unknown"];

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  healthy: "Healthy",
  down: "Down",
  unknown: "Unknown",
};
