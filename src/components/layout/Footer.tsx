import { Anchor, XStack } from "tamagui";
import { FOOTER_HEIGHT } from "./layout-constants";

const GITHUB_REPO_URL =
  "https://github.com/yd-uai-coder/next-tamagui-templates";

export function Footer() {
  return (
    <XStack
      theme="green"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height={FOOTER_HEIGHT}
      zIndex={300}
      justifyContent="center"
      alignItems="center"
      backgroundImage="$headerFooterGradient"
      borderTopWidth={1}
      borderColor="$borderColor"
    >
      <Anchor
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        color="$color11"
        textDecorationLine="underline"
      >
        github
      </Anchor>
    </XStack>
  );
}
