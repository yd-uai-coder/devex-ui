"use client";

import type { ComponentType } from "react";
import { SizableText, Tabs } from "tamagui";

export type LayoutTabsOrientation = "horizontal" | "vertical";

export type LayoutTabsProps = {
  /** タブのラベル(表示文言)。そのままTabs.Tab/Tabs.Contentのvalue/keyとしても使う。 */
  tabLabel: string[];
  /** tabLabelと同じ順番・同じ件数で対応するコンテンツ(propsを取らない関数コンポーネント)。 */
  content: ComponentType[];
  value: string;
  onValueChange: (value: string) => void;
  /** タブの配置方向(既定"horizontal")。"vertical"時はタブ一覧が左、コンテンツが右に並ぶ。 */
  orientation?: LayoutTabsOrientation;
};

// Tabs.Tabはデフォルトで選択中かどうかを視覚的に区別するスタイルを持たないため、
// KitchenSinkCard.tsxのToggleGroup選択状態と同じパターン(選択中のみtheme="green"+
// backgroundColor="$color9"+白文字)で明示的に色付けしている。
function ThemedTab({
  value,
  active,
  children,
}: {
  value: string;
  active: string;
  children: string;
}) {
  const isActive = value === active;
  return (
    <Tabs.Tab
      value={value}
      theme={isActive ? "green" : undefined}
      backgroundColor={isActive ? "$color9" : undefined}
      hoverStyle={isActive ? { backgroundColor: "$color10" } : undefined}
    >
      <SizableText color={isActive ? "white" : undefined}>{children}</SizableText>
    </Tabs.Tab>
  );
}

// 任意のタブラベル・コンテンツの配列からTabs.List/Tabs.Contentを生成する汎用コンポーネント
// (/sample/validationsページから分離)。tabLabel/contentは同じ長さ・同じ順番で対応させ、
// tabLabelの各文字列をそのままTabs.Tab/Tabs.Contentのvalueとしても使うため、呼び出し元で
// 別途キー配列を用意する必要が無い(1ブロック内でラベルが重複しないことが前提)。
export function LayoutTabs({
  tabLabel,
  content,
  value,
  onValueChange,
  orientation = "horizontal",
}: LayoutTabsProps) {
  // Tamaguiの`orientation`propはTabs.List内部の配置(Group経由でflexDirectionが
  // 自動追従)とキーボード操作方向のみを切り替え、ルートの<Tabs>自体のflexDirectionは
  // 追従しない(既定column のまま)。そのため縦配置(タブ一覧が左・コンテンツが右)には
  // ルート側にflexDirection="row"を明示する必要がある
  // (AccordionExclusive.tsxのorientation="horizontal"+flexDirection="row"と同じ既知の癖)。
  const isVertical = orientation === "vertical";
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      flexDirection={isVertical ? "row" : "column"}
    >
      <Tabs.List
        flexShrink={0}
        width={isVertical ? 160 : undefined}
        // タブ一覧の背景を$color3(コンテンツ側の背景と実際に異なる値になることを
        // 実機で確認済み。$color2は$backgroundと見分けが付きにくいため不採用、
        // AccordionSampleと同じ理由)にする。境界線は`$borderColor`をそのまま使う。
        backgroundColor="$color3"
        borderColor="$borderColor"
        borderWidth={1}
        // タブ一覧とコンテンツが接する辺(横配置は下端、縦配置は右端)の角丸だけを
        // 潰し、そこ以外の角(外側)は既定の角丸($4)を残す。角が丸いままだと、
        // 直下/直右に隙間なく接するコンテンツの四角い角との間に不自然な切れ込みが
        // 見えるため。
        borderTopLeftRadius="$4"
        borderTopRightRadius={isVertical ? 0 : "$4"}
        borderBottomLeftRadius={isVertical ? "$4" : 0}
        borderBottomRightRadius={0}
      >
        {tabLabel.map((label) => (
          <ThemedTab key={label} value={label} active={value}>
            {label}
          </ThemedTab>
        ))}
      </Tabs.List>
      {tabLabel.map((label, index) => {
        const Content = content[index];
        return (
          <Tabs.Content
            key={label}
            value={label}
            flex={isVertical ? 1 : undefined}
            padding="$4"
            borderColor="$borderColor"
            borderWidth={1}
            // タブ一覧と接する辺(横配置は上端、縦配置は左端)は、タブ一覧側の
            // 対応する辺の枠線とそのまま隙間無く重なるため、二重線にならないよう
            // ここでは描画しない(0)。
            borderTopWidth={isVertical ? 1 : 0}
            borderLeftWidth={isVertical ? 0 : 1}
            borderTopLeftRadius={0}
            borderTopRightRadius={isVertical ? "$4" : 0}
            borderBottomLeftRadius={isVertical ? 0 : "$4"}
            borderBottomRightRadius="$4"
          >
            <Content />
          </Tabs.Content>
        );
      })}
    </Tabs>
  );
}
