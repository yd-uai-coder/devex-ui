CREATE TABLE `shop_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_colors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`category_id`) REFERENCES `shop_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shop_sizes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE VIEW `shop_product_variants` AS 
  select
    "shop_products"."name" as "商品名",
    "shop_products"."description" as "説明",
    "shop_products"."price" as "値段",
    "shop_categories"."name" as "カテゴリ",
    "shop_colors"."name" as "色",
    "shop_sizes"."name" as "サイズ"
  from "shop_products"
  inner join "shop_categories" on "shop_products"."category_id" = "shop_categories"."id"
  cross join "shop_colors"
  cross join "shop_sizes"
;