import { blue, blueDark, green, greenDark, orange, orangeDark } from "@tamagui/colors";

// LinearGradient/backgroundImage文字列やチャートの配色配列はTamaguiの`$トークン`を
// 解決できない(生CSS/生JSの値が必要)ため、Radixの生カラースケール(@tamagui/colors)を
// 直接参照する。ヘッダー/フッターの背景は`$headerFooterGradient`テーマトークン
// (tamagui.config.ts)で足りるため、ここでは扱わない。

// 白文字を乗せる「hero」カード向けの、彩度の高いグラデーション($color9相当の鮮やかさ)。
export const BLUE_GREEN_GRADIENT_VIVID_LIGHT = `linear-gradient(120deg, ${blue.blue9} 0%, ${green.green9} 100%)`;
export const BLUE_GREEN_GRADIENT_VIVID_DARK = `linear-gradient(120deg, ${blueDark.blue9} 0%, ${greenDark.green9} 100%)`;

export function useBlueGreenGradientVivid(resolvedTheme: string | undefined) {
  return resolvedTheme === "dark"
    ? BLUE_GREEN_GRADIENT_VIVID_DARK
    : BLUE_GREEN_GRADIENT_VIVID_LIGHT;
}

// チャート配色(緑/青/オレンジの順)。PieChartは`shades[index % shades.length]`で
// 参照するため、5枠目が1枠目と被らないよう明度違いの緑・青を4/5枠目に追加している。
const CHART_PALETTE_LIGHT = [
  green.green9,
  blue.blue9,
  orange.orange9,
  green.green6,
  blue.blue6,
];
const CHART_PALETTE_DARK = [
  greenDark.green9,
  blueDark.blue9,
  orangeDark.orange9,
  greenDark.green6,
  blueDark.blue6,
];

export function useChartPalette(resolvedTheme: string | undefined) {
  return resolvedTheme === "dark" ? CHART_PALETTE_DARK : CHART_PALETTE_LIGHT;
}
