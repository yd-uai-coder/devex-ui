"use client";

import { Button, Text, XStack } from "tamagui";

export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

type DataPaginationProps = {
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function DataPagination({ page, pageCount, totalCount, onPageChange }: DataPaginationProps) {
  return (
    <XStack gap="$3" alignItems="center" marginBottom="$10" justifyContent="flex-end" flexWrap="wrap">
      <Button size="$2" disabled={page <= 1} onPress={() => onPageChange(page - 1)}>
        前へ
      </Button>
      <Text>
        {page} / {pageCount} ページ(全{totalCount}件)
      </Text>
      <Button size="$2" disabled={page >= pageCount} onPress={() => onPageChange(page + 1)}>
        次へ
      </Button>
    </XStack>
  );
}
