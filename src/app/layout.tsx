import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devex",
  description:
    "クライアントとの合意を、設計から実装・テストまでつなぐ。AI のヒアリングから設計書・実装手順・テストを作り、仕様変更の合意と反映までを管理します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          {/* 起動時に一度だけセッション復元を試みる(画面には何も描画しない) */}
          <AuthBootstrap />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
