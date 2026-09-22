export const DATABASE_PATH = "sqlite.db";

// Local dev/test (and `tsx src/db/seed.ts`) fall back to a local libSQL file
// database (no Turso account needed) unless TURSO_DATABASE_URL is set, which
// is how Vercel production is expected to be configured.
export const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL ?? `file:${DATABASE_PATH}`;
export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
