import { sql } from "drizzle-orm";
import { integer, sqliteTable, sqliteView, text, unique } from "drizzle-orm/sqlite-core";

function commonColumns() {
  return {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  };
}

export const users = sqliteTable("users", commonColumns());
export const categories = sqliteTable("categories", commonColumns());
export const keywords = sqliteTable("keywords", commonColumns());

export type Keyword = typeof keywords.$inferSelect;

// ─────────────────────────────────────────────
// shop_* テーブル群
// ─────────────────────────────────────────────
// SQLiteには真のスキーマ概念が無いため(Drizzle公式ドキュメントで確認済み)、
// スプレッドシートの「shop」スキーマ区分は`shop_`というテーブル名プレフィックスで表現する。
// 既存のusers/categories/keywords(commonColumns()を使う一般デモ用テーブル)とは
// 完全に独立した名前空間として扱う。

// shop_categories/shop_colors/shop_sizesは(commonColumns()と違い)updated_atを
// 持たないマスタ系テーブルのため専用ヘルパーを新設。
function shopMasterColumns() {
  return {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  };
}

export const shopCategories = sqliteTable("shop_categories", shopMasterColumns());
export const shopColors = sqliteTable("shop_colors", shopMasterColumns());
export const shopSizes = sqliteTable("shop_sizes", shopMasterColumns());

export const shopProducts = sqliteTable("shop_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // 2000〜10000(100円単位)
  categoryId: integer("category_id")
    .notNull()
    .references(() => shopCategories.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  // スプレッドシート仕様によりNULL許可(NOT NULL指定なし)。ただしinsert時に
  // 明示指定しなくても自動で埋まるよう、他のタイムスタンプ列と同じdefaultは付けている。
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// products × colors × sizes の全組み合わせ(カーティジアン積)に、categoryをJOINしたVIEW。
// 列名はユーザー指定の「ビューでの表示名」(日本語)をそのままSQLカラムエイリアスとして使う。
//
// `.as((qb) => qb.select({ 商品名: ... }))`というクエリビルダー経由の書き方も試したが、
// drizzle-kitが生成するCREATE VIEW文にはselectオブジェクトのキー(商品名等)がSQLの
// カラムエイリアス(AS "商品名")として反映されず、同名列("name"が4回)が衝突する形の
// 誤ったSQLが生成されることを実際に確認した(通常のdb.select({...})実行時のエイリアス
// 付与とは別のコード経路のため起きる差異と見られる)。そのため、ここでは明示的な列定義 +
// 生SQL(`sql`テンプレート)で確実にAS句を含むCREATE VIEWを生成させている。
export const shopProductVariants = sqliteView("shop_product_variants", {
  商品名: text("商品名").notNull(),
  説明: text("説明").notNull(),
  値段: integer("値段").notNull(),
  カテゴリ: text("カテゴリ").notNull(),
  色: text("色").notNull(),
  サイズ: text("サイズ").notNull(),
}).as(sql`
  select
    ${shopProducts.name} as "商品名",
    ${shopProducts.description} as "説明",
    ${shopProducts.price} as "値段",
    ${shopCategories.name} as "カテゴリ",
    ${shopColors.name} as "色",
    ${shopSizes.name} as "サイズ"
  from ${shopProducts}
  inner join ${shopCategories} on ${shopProducts.categoryId} = ${shopCategories.id}
  cross join ${shopColors}
  cross join ${shopSizes}
`);

// ShopViewer/DataViewer等の呼び出し元が手書きで型を複製せずに済むよう、DB定義から
// 直接導出する(sqliteViewもDrizzleのViewクラスが$inferSelectを持つため導出可能)。
export type ShopCategory = typeof shopCategories.$inferSelect;
export type ShopColor = typeof shopColors.$inferSelect;
export type ShopSize = typeof shopSizes.$inferSelect;
export type ShopProduct = typeof shopProducts.$inferSelect;
export type ShopProductVariant = typeof shopProductVariants.$inferSelect;

// ─────────────────────────────────────────────
// shop_orders / shop_monthly_targets
// ─────────────────────────────────────────────
export const shopOrders = sqliteTable("shop_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => shopProducts.id),
  // "YYYY-MM-DD"文字列で保存する(DatePickerWithLabel関連の既存方針と同じく、
  // Dateオブジェクト変換によるタイムゾーンの落とし穴を避けるための意図的な設計)。
  orderDate: text("order_date").notNull(),
  // スプレッドシート仕様でVARCHAR(20)のため、他のshop_*テーブルのcreatedAt
  // (INTEGER unixepoch)とは異なりTEXTで実装する。
  createdAt: text("created_at").notNull(),
  // スプレッドシート仕様でNULL許可(shopProducts.updatedAtと同じ設計: NOT NULLを
  // 付けずdefaultだけ付ける)。
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const shopMonthlyTargets = sqliteTable(
  "shop_monthly_targets",
  {
    // スプレッドシート仕様にid/PK列の記載が無いため、他のshop_*テーブルと異なり
    // 明示的なid列を持たない(SQLiteの暗黙rowidに任せる)。
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    target: integer("target").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  },
  // ユーザー指示により、year+monthの組み合わせを一意にする(同じ年月のtargetが
  // 複数存在する状態を防ぐ)。
  (table) => [unique().on(table.year, table.month)],
);

// 月ごとの受注件数・売上額・カテゴリ別件数を集計するビュー。category_idの
// リテラル値はハードコードせず、shop_categories.nameとの比較で判定する
// (shop_categoriesはPRIMARY KEY AUTOINCREMENTのため、再seedのたびにidが
// 増分し続け1〜4に固定されないことを確認済み。nameは不変のためこちらを使う)。
export const shopMonthlyOrderSummary = sqliteView("shop_monthly_order_summary", {
  年月: text("年月").notNull(),
  受注件数: integer("受注件数").notNull(),
  売上額: integer("売上額").notNull(),
  トップス: integer("トップス").notNull(),
  ボトムス: integer("ボトムス").notNull(),
  シューズ: integer("シューズ").notNull(),
  バッグ: integer("バッグ").notNull(),
}).as(sql`
  select
    strftime('%Y-%m', ${shopOrders.orderDate}) as "年月",
    count(*) as "受注件数",
    sum(${shopProducts.price}) as "売上額",
    sum(case when ${shopCategories.name} = 'tops' then 1 else 0 end) as "トップス",
    sum(case when ${shopCategories.name} = 'bottoms' then 1 else 0 end) as "ボトムス",
    sum(case when ${shopCategories.name} = 'shoes' then 1 else 0 end) as "シューズ",
    sum(case when ${shopCategories.name} = 'bag' then 1 else 0 end) as "バッグ"
  from ${shopOrders}
  inner join ${shopProducts} on ${shopOrders.productId} = ${shopProducts.id}
  inner join ${shopCategories} on ${shopProducts.categoryId} = ${shopCategories.id}
  group by strftime('%Y-%m', ${shopOrders.orderDate})
  order by strftime('%Y-%m', ${shopOrders.orderDate})
`);

export type ShopOrder = typeof shopOrders.$inferSelect;
export type ShopMonthlyTarget = typeof shopMonthlyTargets.$inferSelect;
export type ShopMonthlyOrderSummary = typeof shopMonthlyOrderSummary.$inferSelect;
