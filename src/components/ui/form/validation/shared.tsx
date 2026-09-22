"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AlertDialog, Button, H4, Paragraph, XStack, YStack } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

// `/sample/validations`ページの各ルールデモで繰り返し使う「1つのZodスキーマを検証し、
// 成功/失敗をAlertDialogで見せる」という一連の処理をまとめたフック。
// 各デモブロックごとに独立したuseFormインスタンス(=独立したフォーム)を持つ。
// スキーマを汎用関数の引数として受け取る(=呼び出し箇所でスキーマを直接リテラルとして
// useFormに渡さない)構成のため、resolver側の型推論がTSchemaまで届かない。
// zodResolverの戻り値をResolver<z.infer<TSchema>>へ明示キャストして解決している
// (実行時の検証ロジック自体はキャストの影響を受けない)。
export function useRuleCheck<TSchema extends z.ZodType<FieldValues>>(
  schema: TSchema,
  defaultValues: z.infer<TSchema>,
) {
  const { control, handleSubmit } = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema as never) as unknown as Resolver<z.infer<TSchema>>,
    defaultValues: defaultValues as never,
  });
  const [dialog, setDialog] = useState<{ open: boolean; success: boolean }>({
    open: false,
    success: false,
  });

  const onConfirm = handleSubmit(
    () => setDialog({ open: true, success: true }),
    () => setDialog({ open: true, success: false }),
  );

  return {
    control,
    dialogOpen: dialog.open,
    dialogSuccess: dialog.success,
    setDialogOpen: (open: boolean) => setDialog((d) => ({ ...d, open })),
    onConfirm,
  };
}

type RuleSectionProps = {
  children: React.ReactNode;
  description: string;
  dialogOpen: boolean;
  dialogSuccess: boolean;
  onConfirm: () => void;
  setDialogOpen: (open: boolean) => void;
  title: string;
};

/** 見出し + 説明文 + 入力欄(children) + 確認ボタン + 結果ダイアログをまとめた表示用コンポーネント。 */
export function RuleSection({
  children,
  description,
  dialogOpen,
  dialogSuccess,
  onConfirm,
  setDialogOpen,
  title,
}: RuleSectionProps) {
  return (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$4"
      padding="$4"
      gap="$3"
      marginBottom="$4"
    >
      <YStack gap="$1">
        <H4>{title}</H4>
        <Paragraph color="$color10" fontSize="$2">
          {description}
        </Paragraph>
      </YStack>
      <YStack gap="$2">{children}</YStack>
      <XStack>
        <StyledButton onPress={onConfirm}>確認</StyledButton>
      </XStack>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            transition="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            key="content"
            bordered
            elevate
            gap="$4"
            padding="$5"
            maxWidth={360}
            transition="quick"
            enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
            exitStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <AlertDialog.Title>{dialogSuccess ? "成功" : "失敗"}</AlertDialog.Title>
            <AlertDialog.Description>
              {dialogSuccess
                ? "入力に成功しました！"
                : "入力に失敗しました。入力条件を確認してください。"}
            </AlertDialog.Description>
            <XStack justifyContent="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>閉じる</Button>
              </AlertDialog.Cancel>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  );
}
