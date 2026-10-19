import { createTamagui } from "tamagui";
import {
  createV5Theme,
  defaultChildrenThemes,
} from "@tamagui/config/v5";
import { defaultConfig } from "@tamagui/config/v5";
import { animations } from "@tamagui/config/v5-css";
import { v5ComponentThemesWithInverses } from "@tamagui/themes/v5";

const generatedThemes = createV5Theme({
  childrenThemes: {
    ...defaultChildrenThemes,
  },
  componentThemes: v5ComponentThemesWithInverses,
});

const themes = {
  ...generatedThemes,
  light: {
    ...generatedThemes.light,
    background: '#F5F7FD',
    cardShadow:'1px 2px 4px rgba(50,50,50,0.2)',
    // blue9 → green9(Radixのvividな9番ステップはlight/darkで同一値のため、
    // 色自体はライト/ダーク共通。ダーク側は並び順を反転させて位置関係を入れ替える)
    headerFooterGradient: 'linear-gradient(to right, #0090ff, #30a46c)',
  },
  dark: {
    ...generatedThemes.dark,
    background: '#000000',
    cardShadow:'1px 2px 4px rgba(100,100,100,0.3)',
    headerFooterGradient: 'linear-gradient(to right, #30a46c, #0090ff)',
  },
}

export const config = createTamagui({
  ...defaultConfig,
  themes,
  animations,
});

export type Conf = typeof config;

export default config;
