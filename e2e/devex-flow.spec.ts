// devex-api側はE2E_FAKE_LLM=true(docker-compose.e2e.yml、playwright.config.tsのwebServer)で
// 起動しており、app/ai/llm/fake.pyのE2eFakeLLMが応答する。ヒアリング完了はユーザー発話
// 3回目で確定する設計(_TURNS_UNTIL_SUFFICIENT)のため、このテストも3回発話する。
// 登録・プロジェクト作成・ヒアリングは helpers.ts を使う(詳細設計モードの spec と共有)。
import { expect, test } from "@playwright/test";

import {
  completeHearing,
  createProject,
  generateProcedureDocs,
  promoteToSuperuser,
  registerAndLogin,
} from "./helpers";

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

  // 4種のドキュメントと、続けて作るテスト仕様書のタブがすべて生成され、E2E Fake由来の内容が
  // 表示されていることを確認する(要件定義書・外部設計書は表の行ごとに E2E Fake が出るので、先頭の1つを見る)
  for (const label of ["要件定義", "外部設計", "内部設計", "実装計画", "テスト仕様書(結合・総合)"]) {
    await page.getByRole("tab", { name: label }).click();
    await expect(page.getByText("E2E Fake", { exact: false }).first()).toBeVisible();
  }

  // ダウンロード(.md)は表示中のタブの文書(最後に開いたテスト仕様書)
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ダウンロード(.md)" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("test_spec.md");

  // 要件定義書の推測の要件を「採用にする」と、同じ版のまま出どころの件数が変わる
  await page.getByRole("tab", { name: "要件定義" }).click();
  const sources = page.getByLabel("要件の出どころ");
  await expect(sources).toContainText("ユーザー 4 / 採用 1 / 推測 1");
  await sources.getByRole("button", { name: "NFR-002 を採用にする" }).click();
  await expect(sources).toContainText("ユーザー 4 / 採用 2 / 推測 0");
  await expect(sources.getByRole("button", { name: /を採用にする$/ })).toHaveCount(0);

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

// 設計レビュー: superuser だけがパネルを見て、レビューをオンにできる。オンにして「レビューする」を押すと、
// 偽LLM の指摘2件(設計の最重要・ヒアリングの中程度)が出て、採否を付けられる。生成の後の自動のレビュー・
// 採用した指摘での再生成・「直ったか」の判定は devex-api の test_fake_llm_design_review.py が通す。
test("superuser が設計レビューをオンにして文書をレビューし、指摘を採用する", async ({ page }) => {
  const email = await registerAndLogin(page, "e2e-review", "E2E Reviewer");
  await createProject(page, "simple", {
    name: "備品予約",
    overview: "備品の予約システムを作りたい",
    goal: "備品の貸し出しの重なりを無くしたい",
  });
  await completeHearing(page, [
    "利用者は総務の担当者と社員です",
    "MVPでは予約の登録と一覧のみ作ります",
    "特にありません",
  ]);

  // 一般の利用者には、レビューのパネルが出ない
  await expect(page.getByRole("tab", { name: "要件定義" })).toBeVisible();
  await expect(page.getByText("AI 設計レビューを使う")).toHaveCount(0);

  // superuser にして読み込み直すと、パネルが出る(初期値はオフ)
  promoteToSuperuser(email);
  await page.reload();
  const panel = page.getByLabel("AI 設計レビュー", { exact: true });
  const toggle = panel.getByRole("checkbox", { name: "AI 設計レビューを使う" });
  await expect(toggle).not.toBeChecked();
  await expect(panel).toContainText("オフ(生成の後は、今の自己診断をチャットに出します)");

  // オンにすると区切りの表が出る。生成はオフのときに済んだので、文書の区切りは未レビュー
  // (チェックは設定を保存してから付くので、check() ではなく押してから待つ)
  await toggle.click();
  await expect(toggle).toBeChecked();
  const gates = panel.getByRole("table", { name: "レビューの区切り" });
  await expect(gates).toContainText("未レビュー");
  await panel.getByRole("button", { name: "文書の生成の後をレビューする" }).click();

  // レビューはバックグラウンドで流れ、パネルは5秒ごとに取り直す
  await expect(gates).toContainText("レビュー済み", { timeout: 30 * 1000 });
  await expect(panel).toContainText("文書の生成の後の指摘 2件");
  await panel.getByRole("button", { name: "文書の生成の後の指摘を開く" }).click();
  const findings = panel.getByRole("table", { name: "指摘の一覧" });
  await expect(findings).toContainText("予約の取り消しの API が無い");
  await expect(findings).toContainText("誰が誰の予約を見られるかが決まっていない");

  // 採用すると件数が変わり、ヒアリングが原因の指摘を採用すると聞き直しのボタンが出る
  await findings.getByRole("button", { name: "指摘1を採用" }).click();
  await findings.getByRole("button", { name: "指摘2を採用" }).click();
  await expect(panel).toContainText("採用 2 ・ 却下 0 ・ 保留 0 ・ 未判断 0");
  await expect(panel.getByRole("button", { name: "チャットで聞き直す(1件)" })).toBeVisible();
});
