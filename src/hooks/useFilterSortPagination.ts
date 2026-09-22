"use client";

import { useMemo, useState } from "react";

export type UseFilterSortPaginationOptions<T, FilterValue, SortValue> = {
  filterValue: FilterValue;
  sortValue: SortValue;
  applyFilter: (data: T[], filterValue: FilterValue) => T[];
  applySort: (data: T[], sortValue: SortValue) => T[];
  pageSize: number;
};

/**
 * 生データにフィルタ→ソートを適用した結果をページ単位に切り出す。フィルタ/ソートの値は
 * 呼び出し側が所有し、変更時は resetPage() を呼んでページを1に戻す(状態が変わっていない
 * 再レンダリングでは processedData/items の参照が安定するようメモ化している)。
 */
export function useFilterSortPagination<T, FilterValue, SortValue>(
  data: T[],
  { filterValue, sortValue, applyFilter, applySort, pageSize }: UseFilterSortPaginationOptions<
    T,
    FilterValue,
    SortValue
  >
) {
  const [page, setPage] = useState(1);

  const processedData = useMemo(
    () => applySort(applyFilter(data, filterValue), sortValue),
    [data, filterValue, sortValue, applyFilter, applySort]
  );

  const pageCount = Math.max(1, Math.ceil(processedData.length / pageSize));
  // resetPage()はprocessedDataの変化と同一コミットでバッチされるため通常は意識不要だが、
  // pageの生stateが一時的にpageCountを超えている場合の安全弁としてクランプしておく。
  const currentPage = Math.min(page, pageCount);
  const items = useMemo(
    () => processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [processedData, currentPage, pageSize]
  );

  function resetPage() {
    setPage(1);
  }

  return {
    page: currentPage,
    setPage,
    resetPage,
    pageCount,
    totalCount: processedData.length,
    items,
  };
}
