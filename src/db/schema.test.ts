// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { users } from "./schema";

describe("db", () => {
  const sqlite = new Database(":memory:");
  const db = drizzle({ client: sqlite });
  migrate(db, { migrationsFolder: "./drizzle" });

  afterAll(() => {
    sqlite.close();
  });

  it("inserts and reads a row via the generated migration", () => {
    db.insert(users).values({ name: "sample-user1" }).run();

    const rows = db.select().from(users).all();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "sample-user1" });
    expect(rows[0].createdAt).toBeInstanceOf(Date);
    expect(rows[0].updatedAt).toBeInstanceOf(Date);
  });
});
