import type { NotationType, UmlGenerateRequest } from "@/features/uml/api/types";
import { placeMissingNodes } from "@/features/uml/adapters/reactFlowAdapter";
import {
  DEMO_CANDIDATES,
  DEMO_DATA_ITEMS,
  DEMO_PROJECT_ID,
  DEMO_RUNS,
  demoDiagram,
  demoDiagramList,
} from "@/features/uml/demo/demoData";
import { DEMO_MODELS } from "@/features/uml/demo/demoModels";
import { useUmlEditorStore } from "@/features/uml/uml-editor-store";
import { useUmlStore } from "@/features/uml/uml-store";

// デモページ用に、本物の2つのストアへ固定データを流し込み、サーバーと通信するアクション
// (取得・生成・保存・自動レイアウト・検証)だけを差し替える。
// 編集アクション(ドラッグ・追加・削除・属性)は差し替えず、本物のまま動かす。
// 返り値の関数で元のアクションに戻す(デモページを離れた後の実画面に影響させないため)。

export type DemoRequest = { label: string; payload: unknown };

export function installDemoStores(record: (request: DemoRequest) => void): () => void {
  const originalUml = useUmlStore.getState();
  const originalEditor = useUmlEditorStore.getState();

  useUmlStore.setState({
    projectId: DEMO_PROJECT_ID,
    diagrams: demoDiagramList(),
    candidates: DEMO_CANDIDATES,
    runs: DEMO_RUNS,
    status: "success",
    error: null,
    fetchedAt: Date.now(),
    generateError: null,
    submitting: false,
    fetchAll: async () => {},
    refresh: async () => {},
    generate: async (_projectId: string, request: UmlGenerateRequest) => {
      record({ label: "POST /diagrams(生成の指示)", payload: request });
    },
  });

  const save = async () => {
    const { diagram, model, layout } = useUmlEditorStore.getState();
    if (!diagram || !model) return false;
    const payload = { version: diagram.version, semantic_model: model, layout_model: layout };
    record({ label: `PUT /diagrams/${diagram.id}(保存)`, payload });
    // サーバーが version を1つ進めて返したことにする
    useUmlEditorStore.setState({
      diagram: { ...diagram, version: diagram.version + 1, semantic_model: model, layout_model: layout },
      dirty: false,
    });
    return true;
  };

  useUmlEditorStore.setState({
    load: async () => {},
    save,
    runLayout: async () => {
      const { diagram, model, dirty } = useUmlEditorStore.getState();
      if (!diagram || !model) return;
      if (dirty) await save();
      record({ label: `POST /diagrams/${diagram.id}/layout(自動レイアウト)`, payload: null });
      // レイアウトエンジンはサーバーにあるため再計算できない。埋め込んだエンジンの配置のうち
      // 今も残っている要素・線だけを戻し、追加した要素は格子に置く。
      const engine = DEMO_MODELS[diagram.notation].layout_model;
      const ids = new Set([...model.elements.map((e) => e.id), ...model.relations.map((r) => r.id)]);
      const base = {
        ...engine,
        nodes: Object.fromEntries(Object.entries(engine.nodes).filter(([id]) => ids.has(id))),
        edges: Object.fromEntries(Object.entries(engine.edges).filter(([id]) => ids.has(id))),
      };
      useUmlEditorStore.setState({
        layout: placeMissingNodes(model, base),
        layoutNotice:
          "デモではレイアウトエンジン(サーバー)を呼べないため、最初に埋め込んだエンジンの配置に戻しました。追加した要素は格子に置いています。",
      });
    },
    validate: async () => {
      const { diagram, dirty } = useUmlEditorStore.getState();
      if (!diagram) return;
      if (dirty) await save();
      record({ label: `POST /diagrams/${diagram.id}/validate(検証)`, payload: null });
      useUmlEditorStore.setState({
        validation: {
          errors: [],
          warnings: [
            {
              code: "DEMO",
              message: "デモでは検証(サーバーの M4 検証)を実行できません。実画面で確認してください。",
              element_id: null,
            },
          ],
        },
      });
    },
  });

  return () => {
    useUmlStore.setState(originalUml, true);
    useUmlEditorStore.setState(originalEditor, true);
  };
}

// レビュー・編集画面に、指定した記法のデモ図を読み込む(実画面の load と同じ状態にする)。
export function loadDemoDiagram(notation: NotationType): void {
  const diagram = demoDiagram(notation);
  useUmlEditorStore.setState({
    projectId: DEMO_PROJECT_ID,
    diagram,
    model: diagram.semantic_model,
    layout: placeMissingNodes(diagram.semantic_model, diagram.layout_model),
    dataItems: DEMO_DATA_ITEMS,
    dirty: false,
    status: "success",
    error: null,
    saving: false,
    layingOut: false,
    conflict: false,
    layoutNotice: null,
    selection: null,
    validation: null,
    validating: false,
  });
}
