import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderGuide } from "../../test-utils/renderGuide";
import { GuidePageLayout, type GuideProcedure } from "../GuidePageLayout";

const procedure = (id: string): GuideProcedure => ({ id, title: `手順 ${id}`, steps: ["一つ目", "二つ目"] });

describe("GuidePageLayout", () => {
  it("共通の型の節を順に出し、見出しはページの定義のタイトル", () => {
    renderGuide(
      <GuidePageLayout
        slug="hearing"
        intro="AI が質問します。"
        scenes={["要件を固めたいとき"]}
        prerequisites={["API キーを登録していること"]}
        procedures={[procedure("a")]}
        screens={[{ src: "/guide/hearing.png", alt: "ヒアリングの画面", caption: "チャットと観点の表" }]}
        tips={["短く答えてよい"]}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "ヒアリング" })).toBeInTheDocument();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(headings).toEqual(["使う場面", "前提", "手順", "画面の見方", "うまく使うコツ・注意", "次に読む"]);
    expect(screen.getByRole("img", { name: "ヒアリングの画面" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "使い方の流れ" })).toBeInTheDocument();
    // 手順のまとまりが少ないときは、ページ内の目次を出さない
    expect(screen.queryByRole("navigation", { name: "手順の目次" })).toBeNull();
  });

  it("手順のまとまりが3つ以上なら、ページ内の目次を出す。空の節は出さない", () => {
    renderGuide(
      <GuidePageLayout
        slug="agreement"
        intro="合意の流れ"
        scenes={[]}
        prerequisites={[]}
        procedures={[procedure("a"), procedure("b"), procedure("c")]}
        screens={[]}
        tips={[]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "手順の目次" })).toBeInTheDocument();
    const inline = screen.getByRole("navigation", { name: "手順の目次" });
    expect(within(inline).getByRole("link", { name: "手順 b" })).toHaveAttribute("href", "#b");
    expect(screen.queryByRole("heading", { name: "使う場面" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "画面の見方" })).toBeNull();
  });

  it("画面の見方は、説明を先に、画像を後に置く", () => {
    renderGuide(
      <GuidePageLayout
        slug="hearing"
        intro="説明"
        scenes={[]}
        prerequisites={[]}
        procedures={[]}
        screens={[{ src: "/guide/a.webp", alt: "画面A", caption: "A の説明", notes: ["注記"] }]}
        tips={[]}
      />,
    );

    const figure = screen.getByRole("figure");
    const children = Array.from(figure.children).map((child) => child.tagName);
    expect(children.indexOf("FIGCAPTION")).toBe(0);
    expect(children.indexOf("UL")).toBeLessThan(children.indexOf("IMG"));
  });
});
