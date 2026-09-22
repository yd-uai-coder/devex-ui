"use client";

import { Button, Text, XStack, YStack, Card } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

// テーマカラーの編集方法(tamagui.config.ts):
// - childrenThemesは@tamagui/config/v5のdefaultChildrenThemesをそのまま使っており、
//   gray/blue/red/yellow/green/orange/pink/purple/teal/neutral/accentのいずれも
//   個別のパステル化・色相調整はしていない(素のRadixカラースケール)。
// - light/darkテーマにはbackground/listItemHover/styledHeaderColor/styledHeaderShadow/
//   cardShadow/logoGlow/headerFooterGradientの7キーのみ追加で上書きしている
//   (quaiz-frontと同じ設定。個別コンポーネントでの参照箇所はCLAUDE.md参照)。
// - 各テーマ内の段階(1〜12)を個別に参照したい場合は$color1〜$color12トークンを使う
//   (下のVIVIDS配列・カード一覧が実例)。
const SIZES = ["$1", "$2", "$3", "$4", "$5", "$6", "$7", "$8", "$9", "$10"] as const;
const THEMES = [
  "gray",
  "blue",
  "red",
  "yellow",
  "green",
  "orange",
  "pink",
  "purple",
  "teal",
  "neutral",
  "accent",  
] as const;

const VIVIDS=[
  "$color1",
  "$color2",
  "$color3",
  "$color4",
  "$color5",
  "$color6",
  "$color7",
  "$color8",
  "$color9",
  "$color10",
] as const;

export default function SizeColorSamplePage() {
  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="サイズトークン・カラーパレット確認"
        description="Buttonコンポーネントでサイズトークン($1〜$10)ごとの文字サイズと、全カラーテーマの配色を確認できるページです。"
      />

      {THEMES.map((themeName) => (
        <YStack key={themeName} gap="$2">
          <Text fontSize="$4" fontWeight="600">
            {themeName}
          </Text>
          <XStack flexWrap="wrap" gap="$3" alignItems="flex-end">
            {SIZES.map((size) => (
              <YStack key={size}>
                <Text>Button</Text>
                <Button  theme={themeName} backgroundColor="$color7" size={size}>
                  {size}
                </Button>
                <Text>StyledButton</Text>
                <StyledButton theme={themeName} size={size}>
                  {size}
                </StyledButton>
              </YStack>
            ))}
          </XStack>
          <Card backgroundColor={themeName}>
            <Text>
                {themeName}
            </Text>
          </Card>

        {VIVIDS.map((vivid)=>(
          <Card key={vivid} theme={themeName} backgroundColor={vivid}>
            <Text>
                {themeName}+{vivid}
            </Text>
          </Card>

        ))}  

        </YStack>
      ))}
    </YStack>
  );
}
