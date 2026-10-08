// devex-api側はE2E_FAKE_LLM=true(docker-compose.e2e.yml、playwright.config.tsのwebServer)で
// 起動しており、app/ai/llm/fake.pyのE2eFakeLLMが応答する。ヒアリング完了はユーザー発話
// 3回目で確定する設計(_TURNS_UNTIL_SUFFICIENT)のため、このテストも3回発話する。
// 登録・プロジェクト作成・ヒアリングは helpers.ts を使う(詳細設計モードの spec と共有)。
import { expect, test } from "@playwright/test";

import { completeHearing, createProject, generateProcedureDocs, registerAndLogin } from "./helpers";

test("ログイン→プロジェクト作成→チャットヒアリング→設計書生成→ダウンロードの一連フロー", async ({
  page,
}) => {
  await registerAndLogin(page, "e2e-flow");
  await createProject(page, "simple", {
    name: "在庫管理",
    overview: "在庫管理システムを作りたい",
    goal: "在庫数をリアルタイムに可視化したい",
  });
  await completeHearing(page, [
    "利用者は倉庫の担当者を想定しています",
    "MVPでは在庫の入出庫記録と一覧表示のみ作ります",
    "特に技術的な制約はありません",
  ]);

  // 4種のドキュメントタブがすべて生成され、E2E Fake由来の内容が表示されていることを確認する
  for (const label of ["要件定義", "外部設計", "内部設計", "実装計画"]) {
    await page.getByRole("tab", { name: label }).click();
    await expect(page.getByText("E2E Fake", { exact: false })).toBeVisible();
  }

  // ダウンロード(.md)
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ダウンロード(.md)" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("implementation_plan.md");

  // 簡易モードは、同じ詳細設計画面を段階8(実装手順書)だけで開く。作業単位は実装計画書の WBS から読む
  await page.getByRole("link", { name: "実装手順書へ進む →" }).click();
  // 見出しは画面の「実装手順書」と、作業領域の「段階8 実装手順書」の2つ
  await expect(page.getByRole("heading", { name: "実装手順書", exact: true })).toBeVisible();
  const units = page.getByRole("table", { name: "単位の一覧" });
  await expect(units).toContainText("M-01-T01");
  await expect(units).toContainText("M-01-T02");

  // 全単位の手順書を生成する(承認と zip は devex-api の test_fake_llm_simple_procedure.py が通す)
  await generateProcedureDocs(page, ["M-01-T01", "M-01-T02"]);
});

test("ドキュメントプレビュー画面から再生成すると、再度生成完了まで待って表示を更新する", async ({
  page,
}) => {
  await registerAndLogin(page, "e2e-regenerate", "E2E Regenerator");
  await createProject(page, "simple", {
    name: "勤怠管理",
    overview: "勤怠管理システムを作りたい",
    goal: "打刻を簡略化したい",
  });
  await completeHearing(page, [
    "利用者は正社員とアルバイトの両方です",
    "MVPでは打刻と月次集計のみ作ります",
    "特にありません",
  ]);

  // 再生成(revisingへの遷移を経由し、完了後に同じドキュメント画面へポーリングで戻ってくる)。
  // 再生成にも確認ダイアログがある
  await page.getByRole("button", { name: "再生成する" }).click();
  await page.getByRole("button", { name: "再生成する" }).last().click();
  await expect(page.getByText("再生成しています")).toBeVisible();
  await expect(page.getByText("再生成しています")).toBeHidden({ timeout: 30 * 1000 });
  await expect(page.getByRole("tab", { name: "要件定義" })).toBeVisible();
});
