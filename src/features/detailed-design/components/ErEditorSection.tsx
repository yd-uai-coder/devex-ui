"use client";

import { ER_SUBJECT } from "@/features/detailed-design/api/types";
import { StageDiagramSection } from "@/features/detailed-design/components/StageDiagramSection";

// 段階3の ER(全体1枚)。ER は uml_diagrams の行(notation=er、subject='')で、図のエディタで
// そのまま編集・自動レイアウト・承認する。テーブル定義の制約・説明も、このエディタの属性パネルで直す
// (テーブル定義の正本は ER)。中身は段階4の構成図と共通の StageDiagramSection。
export function ErEditorSection({
  projectId,
  generating,
  onDirtyChange,
}: {
  projectId: string;
  generating: boolean; // 段階3の下書きを生成中(ER が上書きされるので編集させない)
  onDirtyChange: (dirty: boolean) => void;
}) {
  return (
    <StageDiagramSection
      projectId={projectId}
      notation="er"
      subject={ER_SUBJECT}
      title="ER"
      generating={generating}
      onDirtyChange={onDirtyChange}
    />
  );
}
