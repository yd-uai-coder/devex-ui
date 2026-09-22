"use client";

import { useState } from "react";
import { Button, Popover, XStack, YStack } from "tamagui";
import { CheckboxGroup } from "@/components/ui/form/CheckboxGroup";
import InputNumber from "@/components/ui/form/InputNumber";
import SelectGroupWithLabel from "@/components/ui/form/SelectGroupWithLabel";
import { useDraftValue } from "@/hooks/useDraftValue";

export type DataFilterFieldConfig<T> =
  | { key: keyof T; label: string; type: "range"; min?: number; max?: number; step?: number }
  | { key: keyof T; label: string; type: "select"; options: string[] }
  | { key: keyof T; label: string; type: "checkbox"; options: string[] };

// 常に1キー分の条件のみを保持する(複数条件の同時適用は現状非対応)。nullは「絞り込み無し」。
export type DataFilterValue<T> =
  | { key: keyof T; type: "range"; min?: number; max?: number }
  | { key: keyof T; type: "select"; value: string }
  | { key: keyof T; type: "checkbox"; values: string[] }
  | null;

// range: min/maxのいずれかを外れる行を除外。selectは完全一致。checkboxは選択が空なら
// フィルタ無効(全件通過)、そうでなければ選択済みの値に一致する行だけ残す。
export function applyDataFilter<T>(data: T[], value: DataFilterValue<T>): T[] {
  if (!value) return data;
  return data.filter((row) => {
    const raw = row[value.key];
    if (value.type === "range") {
      const num = Number(raw);
      if (Number.isNaN(num)) return false;
      if (value.min !== undefined && num < value.min) return false;
      if (value.max !== undefined && num > value.max) return false;
      return true;
    }
    if (value.type === "select") {
      return String(raw) === value.value;
    }
    return value.values.length === 0 || value.values.includes(String(raw));
  });
}

type DataFilterProps<T> = {
  fields: DataFilterFieldConfig<T>[];
  value: DataFilterValue<T>;
  onChange: (value: DataFilterValue<T>) => void;
  buttonLabel?: string;
};

function parseOptionalNumber(text: string): number | undefined {
  return text.trim() === "" ? undefined : Number(text);
}

// DatePickerWithLabel.tsxのPopover実装(open/onOpenChange/placement="bottom-start"、
// TriggerボタンへのsuppressHydrationWarning、Popover.Contentへのelevation・zIndex={400})を
// 踏襲している。条件入力は既存のSelectGroupWithLabel/CheckboxGroup/InputNumberを
// そのまま再利用し、新規UIを組んでいない。チェックボックス条件は、上の「絞り込み」セレクトで
// 既にフィールド名(色/サイズ等)を表示しているため、グループ自体のラベルを持たない
// CheckboxGroup(CheckboxGroupWithLabelから分離)を使い、ラベルの二重表示を避けている。
//
// 条件の編集は「draftValue」というローカルの下書きstateにのみ反映し、実際にonChange(適用済みの
// valueを親に伝える)を呼ぶのは「適用」ボタン押下時のみにしている。データ件数が多い呼び出し元
// (例: /shopの384件)では、range型の数値入力が1キー入力ごとにonChangeを呼ぶと、そのたびに
// 呼び出し元のテーブル全体が再構築され体感できる一時停止が発生することを実際に確認したため。
// select/checkbox型もクリックのたびに重くなる報告があったため、3タイプ全てに同じdraft方式を
// 一律適用している。
export function DataFilter<T>({
  fields,
  value,
  onChange,
  buttonLabel = "絞り込み",
}: DataFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>(
    value ? String(value.key) : String(fields[0]?.key ?? ""),
  );
  const { draft: draftValue, setDraft: setDraftValue, resync: resyncDraft, commit: commitDraft } =
    useDraftValue<DataFilterValue<T>>(value, onChange);

  const selectedField = fields.find((field) => String(field.key) === selectedKey);
  // ボタンのラベルは適用済みのvalueから算出する(下書き編集中にちらつかないようにするため)。
  const activeField = value ? fields.find((field) => String(field.key) === String(value.key)) : undefined;

  function updateRange(patch: { min?: number; max?: number }) {
    if (!selectedField || selectedField.type !== "range") return;
    const current =
      draftValue && draftValue.type === "range" && String(draftValue.key) === selectedKey
        ? draftValue
        : null;
    setDraftValue({
      key: selectedField.key,
      type: "range",
      min: "min" in patch ? patch.min : current?.min,
      max: "max" in patch ? patch.max : current?.max,
    });
  }

  // Popoverを開くタイミングで下書きを適用済みのvalueから再同期する。適用せずに閉じた場合、
  // 編集内容は破棄され、次に開いたときは最後に適用された状態から編集を再開できる。
  function handleOpenChange(next: boolean) {
    if (next) {
      resyncDraft();
      setSelectedKey(value ? String(value.key) : String(fields[0]?.key ?? ""));
    }
    setOpen(next);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} placement="bottom-start">
      <Popover.Trigger asChild>
        <Button borderColor="$color7" alignSelf="flex-end" marginBottom="$3" {...{ suppressHydrationWarning: true }}>
          {value && activeField ? `絞り込み: ${activeField.label}` : buttonLabel}
        </Button>
      </Popover.Trigger>
      {/* Popover.Contentは既定でbackgroundColorを持たず、ページ背景色($background)と
          同化して視認性が低くなる(borderとelevationの影だけでは弱い)。$color2(テーブル
          ヘッダー等、既存箇所で「背景から浮かせたい面」に使っているのと同じトークン)を
          明示指定して背景から視覚的に分離させている。 */}
      <Popover.Content
        zIndex={400}
        padding="$3"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$color2"
        elevation="$4"
      >
        <YStack gap="$3" width={280}>
          <SelectGroupWithLabel
            label="絞り込み"
            items={fields.map((field) => ({ value: String(field.key), label: field.label }))}
            value={selectedKey}
            onValueChange={setSelectedKey}
            renderValue={(v) => fields.find((field) => String(field.key) === v)?.label}
            width="100%"
            zIndex={500}
          />

          {selectedField?.type === "range" && (
            <YStack gap="$2">
              <InputNumber
                label="下限"
                width="100%"
                value={
                  draftValue &&
                  draftValue.type === "range" &&
                  String(draftValue.key) === selectedKey &&
                  draftValue.min !== undefined
                    ? String(draftValue.min)
                    : ""
                }
                onChangeText={(text) => updateRange({ min: parseOptionalNumber(text) })}
              />
              <InputNumber
                label="上限"
                width="100%"
                value={
                  draftValue &&
                  draftValue.type === "range" &&
                  String(draftValue.key) === selectedKey &&
                  draftValue.max !== undefined
                    ? String(draftValue.max)
                    : ""
                }
                onChangeText={(text) => updateRange({ max: parseOptionalNumber(text) })}
              />
            </YStack>
          )}

          {selectedField?.type === "select" && (
            <SelectGroupWithLabel
              label={selectedField.label}
              labelWidth="$5"
              items={selectedField.options.map((option) => ({ value: option, label: option }))}
              value={
                draftValue && draftValue.type === "select" && String(draftValue.key) === selectedKey
                  ? draftValue.value
                  : undefined
              }
              onValueChange={(nextValue) =>
                setDraftValue({ key: selectedField.key, type: "select", value: nextValue })
              }
              renderValue={(v) => selectedField.options.find((option) => option === v)}
              width="100%"
              zIndex={500}
            />
          )}

          {selectedField?.type === "checkbox" && (
            <CheckboxGroup
              items={selectedField.options.map((option) => ({ value: option, label: option }))}
              value={
                draftValue && draftValue.type === "checkbox" && String(draftValue.key) === selectedKey
                  ? draftValue.values
                  : []
              }
              onValueChange={(values) =>
                setDraftValue({ key: selectedField.key, type: "checkbox", values })
              }
              width="100%"
            />
          )}

          <XStack justifyContent="flex-end" gap="$2">
            <Button
              size="$2"
              chromeless
              disabled={!value}
              onPress={() => commitDraft(null)}
            >
              クリア
            </Button>
            <Button
              size="$2"
              onPress={() => {
                commitDraft();
                setOpen(false);
              }}
            >
              適用
            </Button>
          </XStack>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
