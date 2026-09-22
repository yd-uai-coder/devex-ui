"use client";

import type { ReactNode } from "react";
import { Fragment, memo } from "react";
import type { ListItemExtraProps, SizeTokens } from "tamagui";
import { ListItem, ScrollView, Text, XStack, YStack } from "tamagui";

export type LayoutListItemConfig<T> = {
  title: (row: T) => ReactNode;
  subTitle?: (row: T) => ReactNode;
  icon?: (row: T) => ListItemExtraProps["icon"];
  iconAfter?: (row: T) => ListItemExtraProps["icon"];
};

export type LayoutListProps<T> = {
  data: T[];
  itemConfig: LayoutListItemConfig<T>;
  /** 空配列時に表示するプレースホルダー(既定"-") */
  emptyPlaceholder?: ReactNode;
  /** 指定時、リスト本体をこの高さで縦スクロール領域にする(LayoutTableのbodyMaxHeightと同じ意図) */
  bodyMaxHeight?: number | SizeTokens;
  /** 指定時、行がクリック可能になる */
  onItemClick?: (row: T, index: number) => void;
  /** 指定時、リスト全体の幅をこの値で頭打ちにし、水平中央寄せする */
  maxWidth?: number | SizeTokens;
  /** 行の背景色(ゼブラ模様の基準色。既定"white") */
  backgroundColor?: string;
  /** 指定時、各行の右端にこの関数の戻り値(メニューボタン等)を配置する */
  rowMenu?: (row: T, index: number) => ReactNode;
  /**
   * 行のReact keyを算出する関数。既定はindex(現状維持・後方互換)。
   * dataから行が削除される可能性がある(例: 削除機能付きの一覧)呼び出し元は、
   * 安定した識別子(例: row.id)を返すよう必ず指定すること。indexのままだと、
   * 削除後にReactが「該当行が消えた」ではなく「該当indexの中身が変わった」と
   * 誤認識し、その行が持つダイアログ等のコンポーネントが正しくアンマウントされない
   * (モーダルの後片付けが行われずページ全体の操作が効かなくなる等の不具合の原因になる)。
   */
  getRowKey?: (row: T, index: number) => string | number;
};

// 文字列のtitle/subTitleを折り返し可能なTextで包む
function wrapListText(value: ReactNode, variant: "title" | "subTitle") {
  // 文字列以外はそのまま返す
  if (typeof value !== "string") return value;
  return variant === "title" ? (
    <Text fontWeight="700" whiteSpace="normal">
      {value}
    </Text>
  ) : (
    <Text color="$color10" fontSize="$3" whiteSpace="normal">
      {value}
    </Text>
  );
}

// 行クリック・行メニュー付きの汎用リスト表示コンポーネント
function LayoutListImpl<T>({
  data,
  itemConfig,
  emptyPlaceholder = "-",
  bodyMaxHeight,
  onItemClick,
  maxWidth,
  backgroundColor = "$gray1",
  rowMenu,
  getRowKey,
}: LayoutListProps<T>) {
  // データが空か否かで表示内容を切替
  const items =
    data.length > 0 ? (
      // 各行を描画する
      data.map((row, index) => {
        const key = getRowKey ? getRowKey(row, index) : index;
        const listItem = (
          <ListItem
            title={wrapListText(itemConfig.title(row), "title")}
            subTitle={itemConfig.subTitle ? wrapListText(itemConfig.subTitle(row), "subTitle") : undefined}
            icon={itemConfig.icon?.(row)}
            backgroundColor={backgroundColor}
            hoverStyle={{ backgroundColor: "$listItemHover" }}
            pressStyle={{ backgroundColor: "$color8" }}
            iconAfter={itemConfig.iconAfter?.(row)}
            onPress={onItemClick ? () => onItemClick(row, index) : undefined}
            {...(onItemClick ? { cursor: "pointer" } : {})}
            {...(rowMenu
              ? { flex: 1 }
              : {
                  borderBottomWidth: index === data.length - 1 ? 0 : 1,
                })}
          />
        );

        // rowMenu未指定なら行のみ返す
        if (!rowMenu) return <Fragment key={key}>{listItem}</Fragment>;

        // rowMenuを行の右端に兄弟要素として配置
        return (
          <XStack
            key={key}
            alignItems="center"
            borderBottomWidth={index === data.length - 1 ? 0 : 1}
            borderColor="$borderColor"
          >
            {listItem}
            {rowMenu(row, index)}
          </XStack>
        );
      })
    ) : (
      <ListItem backgroundColor={backgroundColor} title={<Text color="$color9">{emptyPlaceholder}</Text>} />
    );

  return (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$2"
      overflow="hidden"
      width="100%"
      maxWidth={maxWidth}
      marginHorizontal="auto"
    >
      <ScrollView maxHeight={bodyMaxHeight}>{items}</ScrollView>
    </YStack>
  );
}

// LayoutTableと同じ理由(無関係な状態変化での再構築防止)でmemo化
// (+ジェネリクスを保つためのキャスト)。
export const LayoutList = memo(LayoutListImpl) as typeof LayoutListImpl;
