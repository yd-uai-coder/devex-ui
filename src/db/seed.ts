import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "./config";
import {
  categories,
  keywords,
  shopCategories,
  shopColors,
  shopMonthlyOrderSummary,
  shopMonthlyTargets,
  shopOrders,
  shopProducts,
  shopSizes,
  users,
} from "./schema";

// Standalone connection (not the "server-only" client from ./index) so this
// script can run via plain Node/tsx outside of the Next.js request pipeline.
const db = drizzle({ connection: { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN } });

const userNames = Array.from({ length: 20 }, (_, i) => `sample-user${i + 1}`);

const categoryKeywords: Record<string, string[]> = {
  食べ物: ["ラーメン", "寿司", "カレー"],
  旅行: ["温泉", "海外旅行", "国内旅行"],
  スポーツ: ["サッカー", "野球"],
  音楽: ["ロック", "ポップス", "クラシック"],
  映画: ["アクション映画", "ホラー映画"],
  ファッション: ["ストリート系", "カジュアル", "フォーマル"],
  美容: ["スキンケア", "メイク"],
  健康: ["ダイエット", "筋トレ", "睡眠"],
  ビジネス: ["起業", "マーケティング"],
  テクノロジー: ["AI", "プログラミング", "スマートフォン"],
  教育: ["オンライン学習", "資格試験"],
  ゲーム: ["RPG", "eスポーツ", "パズルゲーム"],
  アニメ: ["少年アニメ", "声優"],
  書籍: ["小説", "ビジネス書", "漫画"],
  アート: ["絵画", "写真"],
  ペット: ["犬", "猫", "熱帯魚"],
  自動車: ["電気自動車", "中古車"],
  住まい: ["一人暮らし", "リフォーム", "インテリア"],
  金融: ["投資", "節約"],
  ニュース: ["経済ニュース", "スポーツニュース", "国際情勢"],
};

const categoryNames = Object.keys(categoryKeywords);
const keywordNames = Object.values(categoryKeywords).flat();

// ─────────────────────────────────────────────
// shop_* シードデータ(スプレッドシート「DB」シート準拠)
// ─────────────────────────────────────────────

const SHOP_CATEGORY_NAMES = ["tops", "bottoms", "shoes", "bag"] as const;
const SHOP_COLOR_NAMES = ["red", "blue", "green", "white", "black", "gray"];
const SHOP_SIZE_NAMES = ["S", "M", "L", "XL"];

const shopProductsByCategory: Record<
  (typeof SHOP_CATEGORY_NAMES)[number],
  { name: string; description: string; price: number }[]
> = {
  tops: [
    { name: "半袖Tシャツ", description: "シンプルなコットン素材の半袖Tシャツ。普段使いに最適です。", price: 2500 },
    { name: "プルオーバーパーカー", description: "裏起毛であたたかいプルオーバーパーカー。", price: 4800 },
    { name: "ニットセーター", description: "上質なウール混のニットセーター。", price: 6200 },
    { name: "デニムシャツ", description: "カジュアルに羽織れるデニムシャツ。", price: 5400 },
  ],
  bottoms: [
    { name: "スキニーデニムパンツ", description: "脚のラインを美しく見せるスキニーデニムパンツ。", price: 6800 },
    { name: "チノパン", description: "オフィスカジュアルにも使えるチノパン。", price: 4200 },
    { name: "スウェットパンツ", description: "リラックスできる裏毛スウェットパンツ。", price: 3600 },
    { name: "ショートパンツ", description: "夏に活躍する軽量ショートパンツ。", price: 2800 },
  ],
  shoes: [
    { name: "キャンバススニーカー", description: "定番のキャンバス地スニーカー。", price: 5200 },
    { name: "レザーローファー", description: "上質な本革を使用したローファー。", price: 8900 },
    { name: "サイドゴアブーツ", description: "履きやすいサイドゴアブーツ。", price: 9800 },
    { name: "ビーチサンダル", description: "夏に最適な軽量サンダル。", price: 2000 },
  ],
  bag: [
    { name: "キャンバストートバッグ", description: "丈夫なキャンバス地のトートバッグ。", price: 3400 },
    { name: "レザーショルダーバッグ", description: "上品なレザーショルダーバッグ。", price: 7600 },
    { name: "デイリーリュックサック", description: "通勤通学に便利なリュックサック。", price: 6400 },
    { name: "クラッチバッグ", description: "パーティーシーンに映えるクラッチバッグ。", price: 4600 },
  ],
};

// ─────────────────────────────────────────────
// shop_orders / shop_monthly_targets シードデータ
// ─────────────────────────────────────────────

const ORDER_COUNT = 108_000;
const ORDER_CHUNK_SIZE = 1000;
const TARGET_START = { year: 2023, month: 1 };
const TARGET_END = { year: 2026, month: 7 };

function monthsRange(
  start: { year: number; month: number },
  end: { year: number; month: number },
): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  let y = start.year;
  let m = start.month;
  while (y < end.year || (y === end.year && m <= end.month)) {
    months.push({ year: y, month: m });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const TARGET_MONTHS = monthsRange(TARGET_START, TARGET_END);

// 108,000件を対象期間(43ヶ月)に、右肩上がりの成長トレンドを保ちつつ月ごとの伸び率が
// ばらつくように配分する。基準重み(1ヶ月目=1、43ヶ月目=43の線形加重)に、月ごとに
// 独立したランダムな乗数(0.6〜1.4倍、±40%程度)を掛け合わせている。
// (後日修正)当初は乗数を掛けない完全な線形加重だったため、集計すると月ごとの
// 増分がほぼ一定(等間隔)になってしまっていた。乗数を加えたことで、月によっては
// 前月から減少することも含め、伸び率が不規則になる(それでも43ヶ月全体の合計・
// 全体的な右肩上がりの傾向は維持される)。端数は最終月に寄せて合計を厳密にtotalと
// 一致させる。
function buildOrderCountsByMonth(months: { year: number; month: number }[], total: number) {
  const weights = months.map((_, i) => (i + 1) * (0.6 + Math.random() * 0.8));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((w) => Math.round((total * w) / weightSum));
  const diff = total - counts.reduce((a, b) => a + b, 0);
  counts[counts.length - 1] += diff;
  return counts;
}

async function seed() {
  await migrate(db, { migrationsFolder: "./drizzle" });

  await db.delete(keywords).run();
  await db.delete(categories).run();
  await db.delete(users).run();

  await db.insert(users)
    .values(userNames.map((name) => ({ name })))
    .run();
  await db.insert(categories)
    .values(categoryNames.map((name) => ({ name })))
    .run();
  await db.insert(keywords)
    .values(keywordNames.map((name) => ({ name })))
    .run();

  // shop_orders(shop_productsのFK子)→shop_products(FK元)→shop_categories/
  // shop_colors/shop_sizesの順で削除する。shop_monthly_targetsはFKを持たないため
  // 順序は任意だが、shop_ordersと並べて削除している。
  await db.delete(shopOrders).run();
  await db.delete(shopMonthlyTargets).run();
  await db.delete(shopProducts).run();
  await db.delete(shopCategories).run();
  await db.delete(shopColors).run();
  await db.delete(shopSizes).run();

  const insertedShopCategories = await db
    .insert(shopCategories)
    .values(SHOP_CATEGORY_NAMES.map((name) => ({ name })))
    .returning()
    .all();
  await db.insert(shopColors)
    .values(SHOP_COLOR_NAMES.map((name) => ({ name })))
    .run();
  await db.insert(shopSizes)
    .values(SHOP_SIZE_NAMES.map((name) => ({ name })))
    .run();

  const categoryIdByName = new Map(insertedShopCategories.map((c) => [c.name, c.id]));
  const shopProductRows = SHOP_CATEGORY_NAMES.flatMap((categoryName) =>
    shopProductsByCategory[categoryName].map((product) => ({
      ...product,
      categoryId: categoryIdByName.get(categoryName)!,
    })),
  );
  // shop_orders.product_idのランダム選択元にするため、実際に採番されたidを取得する
  // (shop_productsはPRIMARY KEY AUTOINCREMENTのため、再seedのたびにidが増分し続け
  // 1〜16に固定されない。ハードコードした範囲を使うと次回のseedで不正確になる)。
  const insertedShopProducts = await db.insert(shopProducts).values(shopProductRows).returning().all();

  // ─────────────────────────────────────────────
  // shop_orders(2023年1月〜2026年7月の43ヶ月に線形の成長トレンドで108,000件を配分)
  // ─────────────────────────────────────────────
  const productIds = insertedShopProducts.map((p) => p.id);
  const orderCountsByMonth = buildOrderCountsByMonth(TARGET_MONTHS, ORDER_COUNT);

  const orderRows: { productId: number; orderDate: string; createdAt: string }[] = [];
  TARGET_MONTHS.forEach(({ year, month }, index) => {
    const count = orderCountsByMonth[index];
    const dim = daysInMonth(year, month);
    for (let i = 0; i < count; i++) {
      const day = randomInt(1, dim);
      const orderDate = `${year}-${pad2(month)}-${pad2(day)}`;
      const time = `${pad2(randomInt(0, 23))}:${pad2(randomInt(0, 59))}:${pad2(randomInt(0, 59))}`;
      orderRows.push({
        productId: productIds[randomInt(0, productIds.length - 1)],
        orderDate,
        createdAt: `${orderDate} ${time}`,
      });
    }
  });

  // 108,000行を1回の.values([...])に渡すとSQLiteのバインドパラメータ上限に抵触
  // しうるため、チャンク分割し1つのトランザクションにまとめて挿入する。
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderRows.length; i += ORDER_CHUNK_SIZE) {
      await tx.insert(shopOrders)
        .values(orderRows.slice(i, i + ORDER_CHUNK_SIZE))
        .run();
    }
  });

  // ─────────────────────────────────────────────
  // shop_monthly_targets(shop_ordersの実績を集計するビューから月次売上を取得し、
  // その70%〜120%をtargetとする)
  // ─────────────────────────────────────────────
  const monthlySummary = await db.select().from(shopMonthlyOrderSummary).all();
  const revenueByMonthKey = new Map(monthlySummary.map((row) => [row.年月, row.売上額]));

  const targetRows = TARGET_MONTHS.map(({ year, month }) => {
    const monthKey = `${year}-${pad2(month)}`;
    const revenue = revenueByMonthKey.get(monthKey) ?? 0;
    const target = Math.round(revenue * (0.7 + Math.random() * 0.5));
    return {
      year,
      month,
      target,
      createdAt: `${monthKey}-01 00:00:00`,
    };
  });
  await db.insert(shopMonthlyTargets).values(targetRows).run();

  console.log(
    `Seeded ${userNames.length} users, ${categoryNames.length} categories, ${keywordNames.length} keywords, ` +
      `${insertedShopCategories.length} shop categories, ${SHOP_COLOR_NAMES.length} shop colors, ` +
      `${SHOP_SIZE_NAMES.length} shop sizes, ${insertedShopProducts.length} shop products, ` +
      `${orderRows.length} shop orders, ${targetRows.length} shop monthly targets.`,
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
