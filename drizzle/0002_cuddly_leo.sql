CREATE TABLE `shop_monthly_targets` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`target` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shop_monthly_targets_year_month_unique` ON `shop_monthly_targets` (`year`,`month`);--> statement-breakpoint
CREATE TABLE `shop_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`order_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`product_id`) REFERENCES `shop_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE VIEW `shop_monthly_order_summary` AS 
  select
    strftime('%Y-%m', "shop_orders"."order_date") as "年月",
    count(*) as "受注件数",
    sum("shop_products"."price") as "売上額",
    sum(case when "shop_categories"."name" = 'tops' then 1 else 0 end) as "トップス",
    sum(case when "shop_categories"."name" = 'bottoms' then 1 else 0 end) as "ボトムス",
    sum(case when "shop_categories"."name" = 'shoes' then 1 else 0 end) as "シューズ",
    sum(case when "shop_categories"."name" = 'bag' then 1 else 0 end) as "バッグ"
  from "shop_orders"
  inner join "shop_products" on "shop_orders"."product_id" = "shop_products"."id"
  inner join "shop_categories" on "shop_products"."category_id" = "shop_categories"."id"
  group by strftime('%Y-%m', "shop_orders"."order_date")
  order by strftime('%Y-%m', "shop_orders"."order_date")
;