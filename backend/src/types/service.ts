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

export interface UpdateServiceInput {
  name?: string;
  url?: string;
  status?: ServiceStatus;
}

export const VALID_STATUSES: ServiceStatus[] = ["healthy", "down", "unknown"];
