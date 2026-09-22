"use client";

import { H1, styled, type GetProps } from "tamagui";

// 見出し用の装飾付き枠(labelを子要素として描画するStyledHeaderの内部実装)
const StyledHeaderFrame = styled(H1, {
  name: "StyledHeader",
  color: "$red8",
  textAlign: "center",
  padding: "$4",
  borderRadius: "$5",
  margin: "$2",
  backgroundColor: "$background",
  borderWidth: 1,
  borderColor: "$borderColor",
  boxShadow: "$styledHeaderShadow",
});

type StyledHeaderProps = Omit<GetProps<typeof StyledHeaderFrame>, "children"> & {
  label: string;
};

// styled()自体はスタイルの既定値のみを扱う仕組みのため、「labelをchildrenとして描画する」
// というAPI(見出しテキストを子要素ではなくlabel propで渡す既存の呼び出し規約)は
// styled()の外側の薄いラッパー関数で担う。
// labelを見出しテキストとして表示する装飾付きヘッダー
export function StyledHeader({ label, ...props }: StyledHeaderProps) {
  return <StyledHeaderFrame {...props}>{label}</StyledHeaderFrame>;
}
