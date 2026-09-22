import type { ShopCategory, ShopColor, ShopProductVariant, ShopSize } from "@/db/schema";
import categoriesData from "@/data/shop-categories.json";
import colorsData from "@/data/shop-colors.json";
import sizesData from "@/data/shop-sizes.json";
import variantsData from "@/data/shop-product-variants.json";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { DataViewer } from "@/components/ui/data/DataViewer";

// src/db/db:export-jsonで生成した静的スナップショット(DB/Turso不要で動作する)。
const categoryRows = categoriesData as unknown as ShopCategory[];
const colorRows = colorsData as unknown as ShopColor[];
const sizeRows = sizesData as unknown as ShopSize[];
const variantRows = variantsData as unknown as ShopProductVariant[];

export default function DataFilterSortPage() {
  return (
    <>
      <Breadcrumb
        pageTitle="絞り込み・ソート"
        description="商品バリエーションデータを、値段・カテゴリ・色・サイズで絞り込み・並び替えできるサンプルです。"
      />
      <DataViewer
        categories={categoryRows}
        colors={colorRows}
        sizes={sizeRows}
        variants={variantRows}
      />
    </>
  );
}
