"use client";

import { useEffect, useState } from "react";
import { Button, H2, H3, Separator, Text, XStack, YStack } from "tamagui";
import type { NotationType } from "@/features/uml/api/types";
import { GenerationPanel } from "@/features/uml/components/GenerationPanel";
import { GenerationRunHistory } from "@/features/uml/components/GenerationRunHistory";
import { UmlDiagramPageContent } from "@/features/uml/components/UmlDiagramPageContent";
import { DemoCapabilities } from "@/features/uml/demo/DemoCapabilities";
import { DEMO_PROJECT_ID } from "@/features/uml/demo/demoData";
import { DEMO_EXPORTS } from "@/features/uml/demo/demoExports";
import {
  installDemoStores,
  loadDemoDiagram,
  type DemoRequest,
} from "@/features/uml/demo/installDemoStores";
import { NOTATION_LABELS } from "@/features/uml/labels";

const NOTATIONS: NotationType[] = ["component", "er", "dfd"];

// バックエンド無しで UML 画面の現時点の挙動を確かめるデモページ(/uml-demo)。
// 本物の画面部品とストアを使い、サーバーと通信する部分だけを固定データと送信内容の表示に差し替える。
export function UmlDemoPageContent() {
  const [ready, setReady] = useState(false);
  const [notation, setNotation] = useState<NotationType>("component");
  const [requests, setRequests] = useState<DemoRequest[]>([]);

  useEffect(() => {
    const restore = installDemoStores((request) => setRequests((list) => [request, ...list]));
    loadDemoDiagram("component");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    return restore;
  }, []);

  if (!ready) return null;

  return (
    <YStack paddingVertical="$4" gap="$4">
      <H2>UML設計図デモ(バックエンド無し)</H2>
      <Text color="$color11">
        Phase 12 時点の UML 画面を、固定データで動かすページです。画面部品とストアは本物を使い、
        サーバーとの通信(生成・保存・自動レイアウト・検証・承認・出力)だけを、送信内容の表示に
        置き換えています。出力は、最初の図を実際の出力エンジンで書き出したファイルを埋め込んでいます。
        再読み込みすると最初の状態に戻ります。
      </Text>

      <DemoCapabilities />
      <Separator />

      <H3>1. 生成・一覧画面の部品</H3>
      <GenerationPanel projectId={DEMO_PROJECT_ID} />
      <GenerationRunHistory />
      <Separator />

      <H3>2. レビュー・編集画面</H3>
      <XStack gap="$2" alignItems="center" flexWrap="wrap">
        <Text>表示する図:</Text>
        {NOTATIONS.map((n) => (
          <Button
            key={n}
            size="$2"
            theme={n === notation ? "blue" : undefined}
            onPress={() => {
              setNotation(n);
              loadDemoDiagram(n);
            }}
          >
            {NOTATION_LABELS[n]}
          </Button>
        ))}
      </XStack>
      <Text color="$color11" fontSize="$2">
        試せる操作: ノードのドラッグ(つながる線が折れ線から滑らかな線に替わる)、要素の追加、
        ノード右端から左端へのドラッグで線の追加、選択して Delete キーで削除、右の属性パネルでの編集、
        保存・自動レイアウト・検証ボタン(送信内容が下に表示される)。承認すると出力ボタンが現れ、
        押すと 3. のファイルがダウンロードされる。承認した後に保存するとレビュー中に戻る。
        記法を切り替えると編集内容と状態は最初に戻ります。
      </Text>
      {/* key で作り直し、記法を切り替えたときにキャンバスの表示範囲(fitView)を合わせ直す */}
      <UmlDiagramPageContent
        key={notation}
        projectId={DEMO_PROJECT_ID}
        diagramId={`demo-${notation}`}
      />
      <Separator />

      <H3>3. 出力のプレビュー({NOTATION_LABELS[notation]})</H3>
      <Text color="$color11" fontSize="$2">
        最初の図(編集前)を、devex-api の出力エンジン(app/uml/export)で書き出した SVG です。
        線のラベルは、レイアウトエンジンが重ならない位置を計算したもの(label_pos)で、
        レビュー画面(線の中央に置く)とは位置が違うことがあります。レーン帯は描きません。
      </Text>
      {/* 埋め込んだ SVG 文字列の data URL なので、next/image の最適化の対象外 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={`${NOTATION_LABELS[notation]}の出力(SVG)`}
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(DEMO_EXPORTS[notation].svg.content)}`}
        style={{ maxWidth: "100%", alignSelf: "flex-start", border: "1px solid var(--borderColor)" }}
      />
      <Text color="$color11" fontSize="$2">
        {`ファイル名: ${DEMO_EXPORTS[notation].drawio.filename} / ${DEMO_EXPORTS[notation].svg.filename}`}
      </Text>
      <Separator />

      <H3>送信されるはずのリクエスト(新しい順)</H3>
      {requests.length === 0 ? (
        <Text color="$color11">まだありません。</Text>
      ) : (
        <XStack>
          <Button size="$2" onPress={() => setRequests([])}>
            クリア
          </Button>
        </XStack>
      )}
      {requests.map((request, index) => (
        <YStack key={`${requests.length - index}`} gap="$1">
          <Text fontWeight="700">{request.label}</Text>
          {request.payload !== null ? (
            <pre
              style={{
                maxHeight: 240,
                overflow: "auto",
                fontSize: 11,
                margin: 0,
                padding: 8,
                border: "1px solid var(--borderColor)",
                color: "var(--color)",
              }}
            >
              {JSON.stringify(request.payload, null, 2)}
            </pre>
          ) : null}
        </YStack>
      ))}
    </YStack>
  );
}
