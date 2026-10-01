import { DetailedDesignDemoPageContent } from "@/features/detailed-design/demo/DetailedDesignDemoPageContent";

// 詳細設計モードの 05・06 章の見せ方を、仮データで確かめるための開発用デモページ。
// ログイン不要(サーバーと通信しないため)。Tamagui を使う実処理は Client Component に委ねる。
export default function DetailedDesignDemoPage() {
  return <DetailedDesignDemoPageContent />;
}
