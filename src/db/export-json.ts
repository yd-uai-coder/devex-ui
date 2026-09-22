import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "./config";
import {
  keywords,
  shopCategories,
  shopColors,
  shopMonthlyOrderSummary,
  shopMonthlyTargets,
  shopProductVariants,
  shopSizes,
} from "./schema";

// Standalone connection (not the "server-only" client from ./index) so this
// script can run via plain Node/tsx outside of the Next.js request pipeline.
const db = drizzle({ connection: { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN } });

const OUT_DIR = path.join(__dirname, "..", "data");

async function exportTable(fileName: string, rows: Promise<unknown[]>) {
  const data = await rows;
  writeFileSync(path.join(OUT_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${data.length} rows to src/data/${fileName}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  await exportTable("keywords.json", db.select().from(keywords).all());
  await exportTable("shop-categories.json", db.select().from(shopCategories).all());
  await exportTable("shop-colors.json", db.select().from(shopColors).all());
  await exportTable("shop-sizes.json", db.select().from(shopSizes).all());
  await exportTable("shop-product-variants.json", db.select().from(shopProductVariants).all());
  await exportTable("shop-monthly-order-summary.json", db.select().from(shopMonthlyOrderSummary).all());
  await exportTable("shop-monthly-targets.json", db.select().from(shopMonthlyTargets).all());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
