import "server-only";
import { drizzle } from "drizzle-orm/libsql";
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "./config";
import * as schema from "./schema";

export const db = drizzle({
  connection: { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN },
  schema,
});
