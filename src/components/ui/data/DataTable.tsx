"use client";

import type { ReactNode } from "react";
import { memo, useState } from "react";
import type { SizeTokens } from "tamagui";
import { XStack, YStack } from "tamagui";
import { DataFilter, applyDataFilter } from "@/components/ui/data/DataFilter";
import type { DataFilterFieldConfig, DataFilterValue } from "@/components/ui/data/DataFilter";
import { DataSort, applyDataSort } from "@/components/ui/data/DataSort";
import type { DataSortFieldConfig, DataSortValue } from "@/components/ui/data/DataSort";
import { DataPagination } from "@/components/ui/data/DataPagination";
import { LayoutTable } from "@/components/ui/layout-blocks/LayoutTable";
import type { LayoutTableColumn } from "@/components/ui/layout-blocks/LayoutTable";
import { useFilterSortPagination } from "@/hooks/useFilterSortPagination";

export type DataTableProps<T extends Record<string, ReactNode>> = {
  data: T[];
  columns?: LayoutTableColumn<T>[];
  /** 未指定(または空配列)の場合、絞り込みUI自体を表示しない */
  filterFields?: DataFilterFieldConfig<T>[];
  /** 未指定(または空配列)の場合、ソートUI自体を表示しない */
  sortFields?: DataSortFieldConfig<T>[];
  onRowClick?: (row: T, index: number) => void;
  bodyMaxHeight?: number | SizeTokens;
  minWidth?: number;
  emptyPlaceholder?: ReactNode;
  /** 1ページあたりの表示件数(既定40件)。ページ数が1以下の場合、ページネーションUI自体を表示しない。 */
  pageSize?: number;
};

// DataFilter+DataSort+LayoutTableを合成する汎用コンポーネント。列構成・絞込/ソート対象の
// フィールド・行データは全て呼び出し元からpropsで受け取り、このファイル自体は特定の
// データ形状に依存しない。行クリック時の詳細表示(ダイアログ等)はこのコンポーネントの
// 責務に含めない(onRowClickで行データを親に返すのみ) — データソースごとに詳細表示の
// 内容は大きく異なり、無理に共通化すると過剰な抽象化になるため。
function DataTableImpl<T extends Record<string, ReactNode>>({
  data,
  columns,
  filterFields,
  sortFields,
  onRowClick,
  bodyMaxHeight,
  minWidth,
  emptyPlaceholder,
  pageSize = 40,
}: DataTableProps<T>) {
  const [filterValue, setFilterValue] = useState<DataFilterValue<T>>(null);
  const [sortValue, setSortValue] = useState<DataSortValue<T>>(null);

  const {
    page: currentPage,
    setPage,
    resetPage,
    pageCount,
    totalCount,
    items: paginatedData,
  } = useFilterSortPagination(data, {
    filterValue,
    sortValue,
    applyFilter: applyDataFilter,
    applySort: applyDataSort,
    pageSize,
  });

  // filterValue/sortValueはDataFilter/DataSortのonChangeからしか変化しないため、その
  // 呼び出し元でページを1に戻せば十分(propの変化を監視するuseEffectは使わない)。
  function handleFilterChange(next: DataFilterValue<T>) {
    setFilterValue(next);
    resetPage();
  }
  function handleSortChange(next: DataSortValue<T>) {
    setSortValue(next);
    resetPage();
  }

  const hasFilter = !!filterFields?.length;
  const hasSort = !!sortFields?.length;

  return (
    <YStack gap="$3" width="100%">
      {(hasFilter || hasSort) && (
        <XStack gap="$3" flexWrap="wrap" alignItems="flex-start">
          {hasFilter && (
            <DataFilter fields={filterFields!} value={filterValue} onChange={handleFilterChange} />
          )}
          {hasSort && <DataSort fields={sortFields!} value={sortValue} onChange={handleSortChange} />}
        </XStack>
      )}
      <LayoutTable
        data={paginatedData}
        columns={columns}
        bodyMaxHeight={bodyMaxHeight}
        minWidth={minWidth}
        emptyPlaceholder={emptyPlaceholder}
        onRowClick={onRowClick}
      />
      {pageCount > 1 && (
        <DataPagination
          page={currentPage}
          pageCount={pageCount}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      )}
    </YStack>
  );
}

// LayoutTableと同じ理由でmemo化(+ジェネリクスを保つためのキャスト)。
export const DataTable = memo(DataTableImpl) as typeof DataTableImpl;
