import { describe, expect, it } from "vitest";
import { DEMO_LOGICS, DEMO_PROCEDURES } from "../demoData";
import {
  buildInvolvement,
  buildReverseIndex,
  escapeHtml,
  findDanglingLogicRefs,
  mainStepCount,
  stepAnchor,
  stepId,
  toHtml,
  toMarkdown,
  type Procedure,
} from "../procedureModel";

const step = (no: string, to: string, extra: Partial<Procedure["steps"][number]> = {}) => ({
  no,
  from: "a",
  to,
  data: "",
  action: `action ${no}`,
  result: "",
  db: "",
  branch: "",
  ...extra,
});

const PROCS: Procedure[] = [
  {
    id: "F-01",
    name: "one",
    trigger: "t",
    reason: "r",
    steps: [
      step("1", "routes/x"),
      step("1a", "", { isBranch: true, branch: "422" }),
      step("2", "services/x", { logic: "L-01" }),
      step("3", "services/x", { logic: "L-02" }),
      step("4", "利用者"),
    ],
  },
  { id: "F-02", name: "two", trigger: "t", reason: "r", steps: [step("1", "repositories/y", { logic: "L-02" })] },
];

describe("stepId / stepAnchor", () => {
  it("処理ID と手順番号から、文書全体で一意な ID と md のアンカーを作る", () => {
    expect(stepId({ procedureId: "F-01", no: "4a" })).toBe("F-01#4a");
    expect(stepAnchor({ procedureId: "F-01", no: "4a" })).toBe("f-01-4a");
  });
});

describe("mainStepCount", () => {
  it("分岐の行を数えない", () => {
    expect(mainStepCount(PROCS[0])).toBe(4);
  });
});

describe("buildReverseIndex", () => {
  it("L-ID ごとに、呼んでいる手順を処理・手順の順で集める", () => {
    const index = buildReverseIndex(PROCS);

    expect(index.get("L-01")).toEqual([{ procedureId: "F-01", no: "2" }]);
    expect(index.get("L-02")).toEqual([
      { procedureId: "F-01", no: "3" },
      { procedureId: "F-02", no: "1" },
    ]);
  });
});

describe("findDanglingLogicRefs", () => {
  it("06 に無い L-ID を参照している手順を返す", () => {
    expect(findDanglingLogicRefs(PROCS, [DEMO_LOGICS[0]])).toEqual([
      { procedureId: "F-01", no: "3" },
      { procedureId: "F-02", no: "1" },
    ]);
  });

  it("デモの仮データには参照切れが無い", () => {
    expect(findDanglingLogicRefs(DEMO_PROCEDURES, DEMO_LOGICS)).toEqual([]);
  });
});

describe("buildInvolvement", () => {
  it("呼び出し先のモジュールを最初に現れた順に列にし、分岐と外部の役者は除く", () => {
    const inv = buildInvolvement(PROCS);

    expect(inv.modules).toEqual(["routes/x", "services/x", "repositories/y"]);
    expect(inv.cells.get("F-01")?.get("services/x")).toEqual(["2", "3"]);
    expect(inv.cells.get("F-02")?.get("routes/x")).toBeUndefined();
  });
});

describe("toMarkdown", () => {
  const logics = [
    { ...DEMO_LOGICS[0], id: "L-01" },
    { ...DEMO_LOGICS[1], id: "L-02" },
  ];
  const md = toMarkdown(PROCS, logics);

  it("リンクと生の HTML を持たない(ビューワーによって飛ばない・消えるため)", () => {
    expect(md).not.toContain("<a");
    expect(md).not.toContain("](#");
  });

  it("処理ごとに 5.N 節を作る", () => {
    expect(md).toContain("### 5.1 F-01 one");
    expect(md).toContain("### 5.2 F-02 two");
  });

  it("手順の処理内容の末尾に 06 の ID を書き、列は7列のまま", () => {
    const row = md.split("\n").find((l) => l.startsWith("| 2 |"))!;

    expect(row).toContain("action 2 → 詳細: L-01");
    expect(row.split(" | ")).toHaveLength(7);
  });

  it("06 の逆引きと各項目に、呼ばれる手順の ID を書く", () => {
    expect(md).toContain("| L-02 | ReservationRepository.count_overlapping | app/repositories/reservation.py | F-01#3, F-02#1 |");
    expect(md).toContain("### 6.2 L-02 ReservationRepository.count_overlapping");
    expect(md).toContain("呼ばれる手順: F-01#3, F-02#1");
  });
});

describe("escapeHtml", () => {
  it("HTML の特殊文字をすべて実体参照にする", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("toHtml", () => {
  const html = toHtml(PROCS, [
    { ...DEMO_LOGICS[0], id: "L-01" },
    { ...DEMO_LOGICS[1], id: "L-02" },
  ]);

  it("手順の行・処理・関数に id を付け、バッジは要素 id へのリンクにする", () => {
    expect(html).toContain('<tr id="f-01-2">');
    expect(html).toContain('<tr class="branch" id="f-01-1a">');
    expect(html).toContain('id="f-02"');
    expect(html).toContain('data-group="logic" id="l-02"');
    expect(html).toContain('<a class="badge" href="#l-01">詳細 L-01 ↓</a>');
    expect(html).toContain('<a class="badge" href="#f-02-1">↑ F-02#1</a>');
  });

  it("外部のファイルを読み込まない自己完結の1ファイルで、スクリプトは1つだけ", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html).not.toMatch(/<link|src=/);
  });

  it("本文の文字をエスケープする", () => {
    const withTag = toHtml([{ ...PROCS[1], name: "<b>x</b>" }], []);

    expect(withTag).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(withTag).not.toContain("<b>x</b>");
  });
});
