"use client";

import Link from "next/link";
import { H2, Text, XStack, YStack } from "tamagui";
import { UmlDiagramEditor } from "@/features/uml/components/UmlDiagramEditor";
import { diagramTitle } from "@/features/uml/labels";
import { useUmlEditorStore } from "@/features/uml/uml-editor-store";

// レビュー画面(SCR-007 の後半)。見出しと一覧へ戻るリンクの下に、図のエディタを置く。
export function UmlDiagramPageContent({
  projectId,
  diagramId,
}: {
  projectId: string;
  diagramId: string;
}) {
  const diagram = useUmlEditorStore((s) => s.diagram);

  return (
    <YStack paddingVertical="$4" gap="$3">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <H2>{diagram ? diagramTitle(diagram) : "設計図"}</H2>
        <Link href={`/projects/${projectId}/uml`}>
          <Text color="$blue10">設計図の一覧に戻る</Text>
        </Link>
      </XStack>
      <UmlDiagramEditor projectId={projectId} diagramId={diagramId} />
    </YStack>
  );
}
