"use client";

import type { ReactNode } from "react";
import { YStack } from "tamagui";

export type ColumnProps = {
  children: ReactNode;
  /** PC(`$md`)幅での兄弟カラムに対する伸び率。既定1(均等分割) */
  flexGrow?: number;
};

// 3カラム(PC)/1カラム(モバイル、縦積み)のようなカラムレイアウトを構成する
// 単一カラム分のbuilding block。行方向のコンテナ(flexDirection切り替え)は
// 呼び出し側(ページ)が持ち、Column自身は「モバイルでは幅いっぱい、PC(`$md`)では
// 兄弟カラムと均等に幅を分け合う」という1カラム分の責務のみを担う。
// Hero.tsxの2分割パターン(width="100%" + $md={{flex:1,width:0}})をそのまま
// 一般化しており、何個並べても(3個でも4個でも)均等分割になる。
export function Column({ children, flexGrow = 1 }: ColumnProps) {
  return (
    <YStack gap="$3" width="100%" $md={{ flexGrow, width: 0 }}>
      {children}
    </YStack>
  );
}
