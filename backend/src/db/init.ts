import { pool } from "./pool";

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unknown'
      CHECK (status IN ('healthy', 'down', 'unknown')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export async function initializeDatabase(): Promise<void> {
  await pool.query(INIT_SQL);
}
