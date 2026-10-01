"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Button, H2, H3, Separator, Text, XStack, YStack } from "tamagui";
import { DEMO_LOGICS, DEMO_PROCEDURES } from "./demoData";
import {
  buildInvolvement,
  buildReverseIndex,
  mainStepCount,
  stepId,
  toHtml,
  toMarkdown,
  type LogicSpec,
  type Procedure,
  type Step,
  type StepRef,
} from "./procedureModel";
import { saveFile } from "@/lib/api/download";

// 詳細設計モードの 05 章(主要処理の手順)・06 章(処理ロジックの詳細)の見せ方を確かめるデモページ。
// 構想メモの未決事項8(手順が複数あるときの見せ方)・9(06 と 05 の手順の紐づけ)の提案を、仮データで動かす。
// バックエンドとは通信しない。

const CELL: CSSProperties = {
  padding: "4px 8px",
  borderBottom: "1px solid var(--borderColor)",
  textAlign: "left",
  verticalAlign: "top",
};
const HEAD: CSSProperties = { ...CELL, background: "var(--color3)", whiteSpace: "nowrap" };
const MONO: CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: 12 };
const TABLE: CSSProperties = { borderCollapse: "collapse", fontSize: 13, color: "var(--color)", width: "100%" };
const HIGHLIGHT = "var(--yellow4, #fdf3c4)";
const BRANCH_BG = "var(--color2)";

// 画面内の要素 id(md のアンカーとは別。画面では # を含められないため)
const stepDomId = (ref: StepRef) => `dd-step-${ref.procedureId}-${ref.no}`;
const logicDomId = (id: string) => `dd-logic-${id}`;

type Focus = { kind: "step"; ref: StepRef } | { kind: "logic"; id: string } | null;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// 05 と 06 を結ぶバッジ。押すと相手側へ移って強調する
function LinkBadge({ label, onPress, title }: { label: string; onPress: () => void; title: string }) {
  return (
    <Button size="$1" theme="blue" onPress={onPress} aria-label={title} paddingHorizontal="$2">
      <Text fontSize={11} style={MONO}>
        {label}
      </Text>
    </Button>
  );
}

function StepTable({
  procedure,
  focus,
  onOpenLogic,
}: {
  procedure: Procedure;
  focus: Focus;
  onOpenLogic: (id: string) => void;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={TABLE} aria-label={`${procedure.id} の手順`}>
        <thead>
          <tr>
            {["No", "呼び出し元 → 呼び出し先", "渡すデータ", "処理内容", "結果", "DB 操作", "分岐・例外"].map((h) => (
              <th key={h} style={HEAD}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {procedure.steps.map((step: Step) => {
            const ref = { procedureId: procedure.id, no: step.no };
            const focused = focus?.kind === "step" && stepId(focus.ref) === stepId(ref);
            const bg = focused ? HIGHLIGHT : step.isBranch ? BRANCH_BG : undefined;
            if (step.isBranch) {
              return (
                <tr key={step.no} id={stepDomId(ref)} style={{ background: bg }}>
                  <td style={{ ...CELL, ...MONO, fontWeight: 700 }}>{step.no}</td>
                  <td style={CELL} colSpan={5}>
                    {step.action}
                  </td>
                  <td style={CELL}>{step.branch}</td>
                </tr>
              );
            }
            return (
              <tr key={step.no} id={stepDomId(ref)} style={{ background: bg }}>
                <td style={{ ...CELL, ...MONO }}>{step.no}</td>
                <td style={CELL}>
                  {step.from} → <span style={MONO}>{step.call ? `${step.to}.${step.call}` : step.to}</span>
                </td>
                <td style={CELL}>{step.data}</td>
                <td style={CELL}>
                  <YStack gap="$1" alignItems="flex-start">
                    <span>{step.action}</span>
                    {step.logic && (
                      <LinkBadge
                        label={`詳細 ${step.logic} ↓`}
                        title={`${stepId(ref)} の詳細 ${step.logic} へ移る`}
                        onPress={() => onOpenLogic(step.logic!)}
                      />
                    )}
                  </YStack>
                </td>
                <td style={CELL}>{step.result}</td>
                <td style={{ ...CELL, ...MONO }}>{step.db}</td>
                <td style={CELL}>{step.branch}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LogicCard({
  logic,
  refs,
  focused,
  onOpenStep,
}: {
  logic: LogicSpec;
  refs: StepRef[];
  focused: boolean;
  onOpenStep: (ref: StepRef) => void;
}) {
  const rows: [string, string][] = [
    ["シグネチャ", logic.signature],
    ["引数", logic.args],
    ["戻り値", logic.returns],
    ["例外", logic.raises],
    ["事前条件", logic.pre],
    ["事後条件", logic.post],
  ];
  return (
    <YStack
      id={logicDomId(logic.id)}
      gap="$2"
      padding="$3"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$3"
      style={{ background: focused ? HIGHLIGHT : undefined }}
    >
      <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
        <Text fontWeight="700" style={MONO}>
          {logic.id}
        </Text>
        <Text fontWeight="700">{logic.fn}</Text>
        <Text color="$color10" fontSize="$2" style={MONO}>
          {logic.module}
        </Text>
      </XStack>
      <XStack gap="$2" alignItems="center" flexWrap="wrap">
        <Text fontSize="$2">呼ばれる手順:</Text>
        {refs.map((ref) => (
          <LinkBadge
            key={stepId(ref)}
            label={`↑ ${stepId(ref)}`}
            title={`${logic.id} を呼ぶ手順 ${stepId(ref)} へ移る`}
            onPress={() => onOpenStep(ref)}
          />
        ))}
      </XStack>
      <XStack gap="$4" flexWrap="wrap">
        <div style={{ overflowX: "auto", flex: "1 1 320px", minWidth: 0 }}>
          <table style={TABLE}>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th style={{ ...HEAD, width: 80 }}>{k}</th>
                  <td style={{ ...CELL, ...(k === "シグネチャ" ? MONO : {}) }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ol style={{ flex: "1 1 280px", margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--color)" }}>
          {logic.pseudo.map((p) => (
            <li key={p.text}>
              {p.text}
              {p.sub && (
                <ol type="a" style={{ paddingLeft: 18 }}>
                  {p.sub.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </XStack>
    </YStack>
  );
}

export function DetailedDesignDemoPageContent({
  procedures = DEMO_PROCEDURES,
  logics = DEMO_LOGICS,
}: {
  procedures?: Procedure[];
  logics?: LogicSpec[];
}) {
  const [selected, setSelected] = useState(procedures[0]?.id);
  const [selectedLogic, setSelectedLogic] = useState(logics[0]?.id);
  const [focus, setFocus] = useState<Focus>(null);
  const [showMarkdown, setShowMarkdown] = useState(false);

  const reverse = useMemo(() => buildReverseIndex(procedures), [procedures]);
  const involvement = useMemo(() => buildInvolvement(procedures), [procedures]);
  const markdown = useMemo(() => toMarkdown(procedures, logics), [procedures, logics]);
  const current = procedures.find((p) => p.id === selected);
  const currentLogic = logics.find((l) => l.id === selectedLogic);

  // 相手側へ移ったら、その要素を画面の中央へ
  useEffect(() => {
    if (focus?.kind === "step") scrollToId(stepDomId(focus.ref));
    if (focus?.kind === "logic") scrollToId(logicDomId(focus.id));
  }, [focus]);

  const openStep = (ref: StepRef) => {
    setSelected(ref.procedureId);
    setFocus({ kind: "step", ref });
  };
  const openLogic = (id: string) => {
    setSelectedLogic(id);
    setFocus({ kind: "logic", id });
  };

  return (
    <YStack paddingVertical="$4" gap="$4">
      <H2>詳細設計モード 05・06 章のデモ(仮データ)</H2>
      <Text color="$color11">
        構想メモの未決事項8「主要処理の手順が複数あるときの見せ方」と、9「06 の処理ロジックの詳細が 05
        のどの手順に紐づくか」の提案を、仮データ「備品予約システム」で動かすページです。バックエンドとは通信しません。
        正本は手順の行が持つ「詳細 L-ID」の1か所だけで、索引・関与表・逆引き表・HTML・md はそこから組み立てています。
      </Text>
      <Separator />

      <H3>05 主要処理の手順</H3>
      <Text fontWeight="700">5.0 索引(提案8-①)</Text>
      <Text color="$color11" fontSize="$2">
        手順を書いた処理の一覧。処理IDを押すと、下のタブがその処理に切り替わる。「詳細(06)」は、その処理から紐づく処理ロジックの詳細。
      </Text>
      <div style={{ overflowX: "auto" }}>
        <table style={TABLE} aria-label="主要処理の索引">
          <thead>
            <tr>
              {["処理ID", "名称", "トリガー", "選定理由", "手順数", "詳細(06)"].map((h) => (
                <th key={h} style={HEAD}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {procedures.map((p) => {
              const linked = [...new Set(p.steps.flatMap((s) => (s.logic ? [s.logic] : [])))];
              return (
                <tr key={p.id} style={{ background: p.id === selected ? "var(--color3)" : undefined }}>
                  <td style={CELL}>
                    <LinkBadge label={p.id} title={`${p.id} の手順を開く`} onPress={() => setSelected(p.id)} />
                  </td>
                  <td style={CELL}>{p.name}</td>
                  <td style={{ ...CELL, ...MONO }}>{p.trigger}</td>
                  <td style={CELL}>{p.reason}</td>
                  <td style={{ ...CELL, textAlign: "right" }}>{mainStepCount(p)}</td>
                  <td style={CELL}>
                    <XStack gap="$1" flexWrap="wrap">
                      {linked.length === 0
                        ? "—"
                        : linked.map((id) => (
                            <LinkBadge key={id} label={id} title={`${id} へ移る`} onPress={() => openLogic(id)} />
                          ))}
                    </XStack>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Text fontWeight="700">5.0.1 処理 × モジュール(提案8-②)</Text>
      <Text color="$color11" fontSize="$2">
        CRUD 図と同じ格子で、どの処理がどのモジュールを通るかを一覧にする。セルの数字は、そのモジュールが呼ばれる手順番号。
        番号を押すとその手順へ移る。複数の処理で同じモジュールを通る箇所(例: repositories/reservation)が一目で分かる。
      </Text>
      <div style={{ overflowX: "auto" }}>
        <table style={TABLE} aria-label="処理 × モジュール">
          <thead>
            <tr>
              <th style={HEAD}>処理ID</th>
              {involvement.modules.map((m) => (
                <th key={m} style={{ ...HEAD, ...MONO }}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {procedures.map((p) => (
              <tr key={p.id}>
                <td style={{ ...CELL, ...MONO }}>{p.id}</td>
                {involvement.modules.map((m) => {
                  const nos = involvement.cells.get(p.id)?.get(m) ?? [];
                  return (
                    <td key={m} style={{ ...CELL, textAlign: "center" }}>
                      <XStack gap="$1" justifyContent="center" flexWrap="wrap">
                        {nos.length === 0
                          ? "—"
                          : nos.map((no) => (
                              <LinkBadge
                                key={no}
                                label={no}
                                title={`${stepId({ procedureId: p.id, no })} へ移る`}
                                onPress={() => openStep({ procedureId: p.id, no })}
                              />
                            ))}
                      </XStack>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Text fontWeight="700">5.1〜 処理ごとの手順(提案8-③: タブで切り替え。md では 5.N 節に分ける)</Text>
      <XStack gap="$2" flexWrap="wrap" role="tablist" aria-label="処理のタブ">
        {procedures.map((p) => (
          <Button
            key={p.id}
            size="$2"
            role="tab"
            aria-selected={p.id === selected}
            theme={p.id === selected ? "blue" : undefined}
            onPress={() => setSelected(p.id)}
          >
            {`${p.id} ${p.name}`}
          </Button>
        ))}
      </XStack>
      {current && (
        <YStack gap="$2" role="tabpanel">
          <Text fontWeight="700">
            {current.id} {current.name}
            <Text color="$color10" fontSize="$2" style={MONO}>
              {"  "}
              {current.trigger}
            </Text>
          </Text>
          <StepTable procedure={current} focus={focus} onOpenLogic={openLogic} />
          {current.note && (
            <Text color="$color11" fontSize="$2">
              {current.note}
            </Text>
          )}
          <Text color="$color11" fontSize="$2">
            手順ID は処理ID と手順番号の組(例: {stepId({ procedureId: current.id, no: current.steps[0]?.no ?? "1" })})で、
            文書全体で一意(提案9-①)。06 に詳細がある手順は「処理内容」の下に「詳細 L-ID ↓」のバッジを付ける(提案9-②)。
            列は合意済みの7列のまま。
          </Text>
        </YStack>
      )}
      <Separator />

      <H3>06 処理ロジックの詳細</H3>
      <Text fontWeight="700">6.0 逆引き(提案9-③)</Text>
      <Text color="$color11" fontSize="$2">
        どの関数がどの手順から呼ばれるかの一覧。1つの関数が複数の処理から呼ばれる場合(L-02)も、ここで分かる。
      </Text>
      <div style={{ overflowX: "auto" }}>
        <table style={TABLE} aria-label="関数 × 手順">
          <thead>
            <tr>
              {["L-ID", "関数", "モジュール", "呼ばれる手順"].map((h) => (
                <th key={h} style={HEAD}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logics.map((l) => (
              <tr key={l.id}>
                <td style={CELL}>
                  <LinkBadge label={l.id} title={`${l.id} へ移る`} onPress={() => openLogic(l.id)} />
                </td>
                <td style={{ ...CELL, ...MONO }}>{l.fn}</td>
                <td style={{ ...CELL, ...MONO }}>{l.module}</td>
                <td style={CELL}>
                  <XStack gap="$1" flexWrap="wrap">
                    {(reverse.get(l.id) ?? []).map((ref) => (
                      <LinkBadge
                        key={stepId(ref)}
                        label={stepId(ref)}
                        title={`手順 ${stepId(ref)} へ移る`}
                        onPress={() => openStep(ref)}
                      />
                    ))}
                  </XStack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Text fontWeight="700">6.1〜 各関数(提案9-②: タブで切り替え。見出しの下に「呼ばれる手順」を置き、05 へ戻れる)</Text>
      <XStack gap="$2" flexWrap="wrap" role="tablist" aria-label="関数のタブ">
        {logics.map((l) => (
          <Button
            key={l.id}
            size="$2"
            role="tab"
            aria-selected={l.id === selectedLogic}
            theme={l.id === selectedLogic ? "blue" : undefined}
            onPress={() => setSelectedLogic(l.id)}
          >
            {`${l.id} ${l.fn}`}
          </Button>
        ))}
      </XStack>
      {currentLogic && (
        <YStack role="tabpanel">
          <LogicCard
            logic={currentLogic}
            refs={reverse.get(currentLogic.id) ?? []}
            focused={focus?.kind === "logic" && focus.id === currentLogic.id}
            onOpenStep={openStep}
          />
        </YStack>
      )}
      <Separator />

      <H3>ファイルへの出力(HTML+md の zip を想定)</H3>
      <Text color="$color11" fontSize="$2">
        読む用は自己完結の HTML(この画面と同じタブと双方向のリンク。ブラウザで開けばリンクが必ず動く)、
        差分・AI への入力用は md(リンクを持たず、「→ 詳細: L-02」「呼ばれる手順: F-01#4」のように ID を本文に書くだけ)。
        本実装では、図のファイルと合わせて zip にする。どちらも上の表と同じ意味モデルから組み立てている。
        関与表の列は段階4のモジュール一覧のパスだけで、利用者・スケジューラは含めない。
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        <Button
          size="$2"
          theme="blue"
          onPress={() => saveFile("detailed-design-05-06.html", toHtml(procedures, logics), "text/html;charset=utf-8")}
        >
          HTML をダウンロード
        </Button>
        <Button size="$2" onPress={() => saveFile("detailed-design-05-06.md", markdown, "text/markdown;charset=utf-8")}>
          md をダウンロード
        </Button>
        <Button size="$2" onPress={() => setShowMarkdown((v) => !v)}>
          {showMarkdown ? "md を閉じる" : "md を表示する"}
        </Button>
      </XStack>
      {showMarkdown && (
        <pre
          aria-label="05・06 章の md"
          style={{ ...MONO, whiteSpace: "pre", overflowX: "auto", padding: 12, background: "var(--color2)", color: "var(--color)", margin: 0 }}
        >
          {markdown}
        </pre>
      )}
    </YStack>
  );
}
