import { pool } from "../db/pool";
import {
  CreateServiceInput,
  Service,
  ServiceStatus,
  UpdateServiceInput,
} from "../types/service";

function mapRow(row: Record<string, unknown>): Service {
  return {
    id: row.id as number,
    name: row.name as string,
    url: row.url as string,
    status: row.status as ServiceStatus,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function findAllServices(): Promise<Service[]> {
  const result = await pool.query(
    "SELECT * FROM services ORDER BY id ASC"
  );
  return result.rows.map(mapRow);
}

export async function findServiceById(id: number): Promise<Service | null> {
  const result = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return mapRow(result.rows[0]);
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  const status = input.status ?? "unknown";
  const result = await pool.query(
    `INSERT INTO services (name, url, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.name, input.url, status]
  );
  return mapRow(result.rows[0]);
}

export async function updateService(
  id: number,
  input: UpdateServiceInput
): Promise<Service | null> {
  const existing = await findServiceById(id);
  if (!existing) {
    return null;
  }

  const name = input.name ?? existing.name;
  const url = input.url ?? existing.url;
  const status = input.status ?? existing.status;

  const result = await pool.query(
    `UPDATE services
     SET name = $1, url = $2, status = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, url, status, id]
  );
  return mapRow(result.rows[0]);
}

export async function deleteService(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM services WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
