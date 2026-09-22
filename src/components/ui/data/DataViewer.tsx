"use client";

import { useMemo, useState } from "react";
import { Button, Dialog, H1, Image, Text, XStack, YStack } from "tamagui";
import { DataTable } from "@/components/ui/data/DataTable";
import type { DataFilterFieldConfig } from "@/components/ui/data/DataFilter";
import type { DataSortFieldConfig } from "@/components/ui/data/DataSort";
import type { LayoutTableColumn } from "@/components/ui/layout-blocks/LayoutTable";
import type { ShopCategory, ShopColor, ShopProductVariant, ShopSize } from "@/db/schema";

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`;
}

// DBにはimage列が無いため、全行共通の固定ダミー画像を表示する(ユーザー指定のURL)。
const DUMMY_VARIANT_IMAGE_URL = "https://dummyimage.com/400x400/b3e687/ffffff.jpg&text=Sample";

const VARIANT_COLUMNS: LayoutTableColumn<ShopProductVariant>[] = [
  { key: "商品名", header: "商品名", width: 200 },
  { key: "値段", header: "値段", width: 110, render: (value) => formatPrice(value as number) },
  { key: "カテゴリ", header: "カテゴリ", width: 140 },
  { key: "色", header: "色", width: 100 },
  { key: "サイズ", header: "サイズ", width: 100 },
];
// 上記5列の合計(650)を確保する幅。これより画面が狭い場合にLayoutTable側で
// 横スクロールが有効になる。
const VARIANT_TABLE_MIN_WIDTH = 650;

const VARIANT_SORT_FIELDS: DataSortFieldConfig<ShopProductVariant>[] = [
  { key: "商品名", label: "商品名" },
  { key: "値段", label: "値段" },
  { key: "カテゴリ", label: "カテゴリ" },
];

// 行クリックで開く商品詳細モーダル。確認/否定を問うものではなく単なる情報表示のため、
// AlertDialogではなく素のDialogを使う(shared.tsx/LayoutForm.tsxのAlertDialogと同じ
// open/onOpenChange制御・transition構成を踏襲)。
function VariantDetailDialog({
  variant,
  onOpenChange,
}: {
  variant: ShopProductVariant | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog modal open={variant !== null} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          transition="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="content"
          bordered
          elevate
          gap="$4"
          padding="$5"
          maxWidth={360}
          transition="quick"
          enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          exitStyle={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          {variant && (
            <>
              <Dialog.Title>{variant.商品名}</Dialog.Title>
              <Image
                src={DUMMY_VARIANT_IMAGE_URL}
                alt={variant.商品名}
                width={200}
                height={200}
                objectFit="cover"
                alignSelf="center"
                borderRadius="$4"
              />
              <Dialog.Description>{variant.説明}</Dialog.Description>
              <YStack gap="$1">
                <Text fontWeight="700">値段: {formatPrice(variant.値段)}</Text>
                <Text>色: {variant.色}</Text>
                <Text>サイズ: {variant.サイズ}</Text>
              </YStack>
              <XStack justifyContent="flex-end">
                <Dialog.Close asChild>
                  <Button>閉じる</Button>
                </Dialog.Close>
              </XStack>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export function DataViewer({
  categories,
  colors,
  sizes,
  variants,
}: {
  categories: ShopCategory[];
  colors: ShopColor[];
  sizes: ShopSize[];
  variants: ShopProductVariant[];
}) {
  const [selectedVariant, setSelectedVariant] = useState<ShopProductVariant | null>(null);

  // categories/colors/sizesはDBから都度渡されるがpropsとしては安定した参照であるため、
  // このuseMemoはこれらが変わらない限り同一の配列参照を返し続ける(DataViewer側の
  // memo化によるbailoutを壊さないため)。
  const filterFields = useMemo<DataFilterFieldConfig<ShopProductVariant>[]>(
    () => [
      { key: "値段", label: "値段", type: "range" },
      { key: "カテゴリ", label: "カテゴリ", type: "select", options: categories.map((c) => c.name) },
      { key: "色", label: "色", type: "checkbox", options: colors.map((c) => c.name) },
      { key: "サイズ", label: "サイズ", type: "checkbox", options: sizes.map((s) => s.name) },
    ],
    [categories, colors, sizes],
  );

  return (
    <YStack alignItems="center" gap="$6" paddingVertical="$6" width="100%">
      <DataTable
        data={variants}
        columns={VARIANT_COLUMNS}
        filterFields={filterFields}
        sortFields={VARIANT_SORT_FIELDS}
        bodyMaxHeight={480}
        minWidth={VARIANT_TABLE_MIN_WIDTH}
        onRowClick={setSelectedVariant}
      />
      <VariantDetailDialog
        variant={selectedVariant}
        onOpenChange={(open) => !open && setSelectedVariant(null)}
      />
    </YStack>
  );
}
