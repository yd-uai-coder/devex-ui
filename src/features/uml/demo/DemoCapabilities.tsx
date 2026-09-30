"use client";

import { H3, Text, YStack } from "tamagui";

type Row = { feature: string; real: string; demo: string };

// 現時点(Phase 12 完了時点)でブラウザ上でできること・できないことの一覧。
// 「実画面」はバックエンド(devex-api)を起動した状態の /projects/[id]/uml と /projects/[id]/uml/[diagramId]。
export const CAPABILITIES: Row[] = [
  { feature: "生成対象の選択(component / ER 全体図・部分図 / DFD の個別・一括5件まで)", real: "できる", demo: "できる(送信内容を表示するだけで生成はしない)" },
  { feature: "生成中のポーリング・3分での打ち切りと再読み込み", real: "できる", demo: "できない(生成しないため)" },
  { feature: "生成履歴(止まった理由・再度の生成指示が必要なこと)の表示", real: "できる", demo: "できる(固定の履歴)" },
  { feature: "旧形式の内部設計書の警告", real: "できる", demo: "できない(候補を固定しているため)" },
  { feature: "図の一覧からレビュー画面へ移る", real: "できる", demo: "できない(下の記法ボタンで切り替える)" },
  { feature: "レビュー画面の「設計図の一覧に戻る」リンク", real: "できる", demo: "できない(リンク先は実画面で、ログインとバックエンドが要る)" },
  { feature: "3記法の表示(component・ER・DFD の形の描き分け)", real: "できる", demo: "できる" },
  { feature: "エンジンの直交辺の表示と、ノードを動かした線の smoothstep への切り替え", real: "できる", demo: "できる" },
  { feature: "ノードのドラッグ(複数選択を含む)", real: "できる", demo: "できる" },
  { feature: "要素の追加・削除(Delete / Backspace キー)", real: "できる", demo: "できる" },
  { feature: "線の追加(ノード右端 → 左端へドラッグ)と削除", real: "できる", demo: "できる" },
  { feature: "属性の編集(名前・説明・レイヤー、ER のカラム表、多重度、DFD のデータ項目)", real: "できる", demo: "できる" },
  { feature: "保存(意味モデルと座標を同じ version で PUT)", real: "できる", demo: "送信内容を表示するだけ" },
  { feature: "他で更新されたときの競合表示と再読み込み", real: "できる", demo: "できない" },
  { feature: "自動レイアウト(初回の自動実行・再実行)", real: "できる(30件超・検証エラーのときは格子配置と理由の表示)", demo: "埋め込んだエンジンの配置に戻すだけ(再計算はしない)" },
  { feature: "検証(エラー・警告の一覧と、該当要素の選択)", real: "できる", demo: "できない(案内の警告を1件出すだけ)" },
  { feature: "承認(draft / reviewing → approved)と、承認後の保存・自動レイアウトでレビュー中へ戻る状態遷移", real: "できる(配置が無い・検証エラーのときは承認できない)", demo: "できる(検証はサーバーが要るため、検証エラーによる拒否は起きない)" },
  { feature: "承認済みの図の draw.io / SVG 出力とダウンロード(出力で exported になる)", real: "できる(編集後の図を出力する)", demo: "できる(編集前の図を実エンジンで出力したファイルを保存する。編集は反映されない)" },
  { feature: "他の画面で更新された図の承認(409 で競合として再読み込みを促す)", real: "できる", demo: "できない" },
];

// まだ実装していない機能(実画面でもできない)
export const NOT_IMPLEMENTED: { feature: string; when: string }[] = [
  { feature: "内部設計書への図の差し込み・zip ダウンロード・陳腐化の検知", when: "Phase 13" },
  { feature: "図の手直しを文書へ反映する AI 修正案", when: "Phase 13b" },
  { feature: "アクティビティ図", when: "Phase 14" },
  { feature: "データ辞書の管理(項目の追加・編集・削除)。DFD の線は既存の項目から選ぶだけ", when: "未定" },
  { feature: "元に戻す・やり直し(undo / redo)", when: "未定(Should)" },
  { feature: "レーン(レイヤー)の帯の表示", when: "未定" },
  { feature: "線の端点の付け替え(削除して引き直す)", when: "未定" },
  { feature: "図そのものの削除", when: "未定" },
];

// 見つかっている不具合(実画面にも影響する)
export const KNOWN_ISSUES: string[] = [
  "レビュー画面の線のラベル(DFD のデータ項目名・ER の多重度)は折れ線の中央に置くだけなので、平行に近い線どうしでラベルが重なることがある。エンジンが重ならない位置を計算したラベル位置(Phase 12)は、draw.io / SVG の出力だけが使う",
  "手で動かしたノードにつながる線は、SVG の出力では簡易な直交経路で描くため、ノードを避けず、ラベルがノードに重なることがある。自動レイアウトを再実行すれば解消する",
];

const CELL = { padding: "4px 8px", borderBottom: "1px solid var(--borderColor)", textAlign: "left" as const, verticalAlign: "top" as const };

export function DemoCapabilities() {
  return (
    <YStack gap="$3">
      <H3>現時点でできること・できないこと</H3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--color)" }}>
          <thead>
            <tr>
              <th style={CELL}>機能</th>
              <th style={CELL}>実画面(バックエンドあり)</th>
              <th style={CELL}>このデモ</th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((row) => (
              <tr key={row.feature}>
                <td style={CELL}>{row.feature}</td>
                <td style={CELL}>{row.real}</td>
                <td style={CELL}>{row.demo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Text fontWeight="700" color="$color9">
        既知の不具合
      </Text>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--color)" }}>
        {KNOWN_ISSUES.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
      <Text fontWeight="700">未実装(実画面でもできない)</Text>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--color)" }}>
        {NOT_IMPLEMENTED.map((row) => (
          <li key={row.feature}>{`${row.feature}(${row.when})`}</li>
        ))}
      </ul>
    </YStack>
  );
}
