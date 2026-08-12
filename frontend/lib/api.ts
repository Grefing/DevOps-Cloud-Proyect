import {
  CreateServiceInput,
  HealthResponse,
  Service,
  ServiceStatus,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.error === "string" ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse<HealthResponse>(response);
}

export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/api/services`);
  return handleResponse<Service[]>(response);
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  const response = await fetch(`${API_URL}/api/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Service>(response);
}

export async function updateServiceStatus(
  id: number,
  status: ServiceStatus
): Promise<Service> {
  const response = await fetch(`${API_URL}/api/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Service>(response);
}

export async function deleteService(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/services/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.error === "string" ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }
}
