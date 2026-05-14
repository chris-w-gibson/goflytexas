import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __gft_pgpool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __gft_db: NodePgDatabase<typeof schema> | undefined;
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!global.__gft_pgpool) {
    global.__gft_pgpool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? undefined
        : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global.__gft_pgpool;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (!global.__gft_db) {
    global.__gft_db = drizzle(getPool(), { schema });
  }
  return global.__gft_db;
}

// Lazy proxy — defers pool/db creation until first property access.
// This lets module imports succeed during Next.js page data collection at build time
// even when DATABASE_URL isn't set in the build environment.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as Function).bind(real) : value;
  },
});

export { schema };
