import { Pool } from "pg";

const globalForPool = global as unknown as { _pool?: Pool };

export const pool = globalForPool._pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

if (!globalForPool._pool) {
  globalForPool._pool = pool;
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
