import { UmlDemoPageContent } from "@/features/uml/demo/UmlDemoPageContent";

// UML 画面の現時点の挙動を、バックエンド無しで確かめるための開発用デモページ。
// ログイン不要(サーバーと通信しないため)。Tamagui を使う実処理は Client Component に委ねる。
export default function UmlDemoPage() {
  return <UmlDemoPageContent />;
}
