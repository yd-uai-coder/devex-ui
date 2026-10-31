import type { Metadata } from "next";
import { TopPageContent } from "@/features/top/components/TopPageContent";

// TOP ページ。何のアプリか・何ができるかを伝え、使い方は使い方ガイド(/guide)へ誘導する
export const metadata: Metadata = {
  title: "Devex ── クライアントとの合意を、設計から実装・テストまでつなぐ",
  description:
    "AI のヒアリングから要件定義・設計・実装手順・テストを作り、合意済みの版と変更要求で、仕様変更の影響・クライアントとの合意・反映・再検証までを管理します。",
};

export default function Home() {
  return <TopPageContent />;
}
