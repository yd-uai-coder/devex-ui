import { defineConfig } from "drizzle-kit";
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "./src/db/config";

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  },
});
